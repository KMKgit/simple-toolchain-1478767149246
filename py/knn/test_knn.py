from __future__ import division
import sys
import csv
import matplotlib.pylab as plt
import cPickle
import json
import numpy as np
import codecs
from os import environ
from os.path import dirname
from os.path import join
from os.path import exists
from os.path import expanduser
from os.path import isdir
from os.path import splitext
from os import listdir
from os import mkdir
from os import getcwd
from numpy import genfromtxt
from sklearn import datasets
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score
from sklearn.externals import joblib

try:
  PATH = getcwd()
  f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
  p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
  columns = f.read().splitlines()
  t = json.load(p)
  label_name = str(t['target'])
  column_names = t['columns']
  indexs = []
  k = int(t['k'])
  
  f.close()
  p.close()
  
  with codecs.open(join(PATH + '/data/' + sys.argv[1] + '/test/' + sys.argv[2] + '.csv'), encoding = 'utf-8-sig') as csv_file:
      reader = csv.reader(csv_file)
      csv_data = list(reader)
      label_index = csv_data[0].index(label_name)
  
      for j in range(len(csv_data[0])):
        if csv_data[0][j] in column_names:
          indexs.append(j)
      
      features = len(column_names)
      samples = len(csv_data) - 1
      data = np.empty((samples, features))
      target = np.empty((samples,), dtype=np.int)
      temp = []
      
      for i in range(samples):
        temp.append(csv_data[i+1][label_index])
      temp = set(temp)
      dic = {}
      reverse_dic = {}
      for i, name in enumerate(temp):
        dic[name] = i      
        reverse_dic[i] = name
        
      for i in range(samples):
        target[i] = np.asarray(dic[csv_data[i+1][label_index]], dtype=np.int)
        temp = []
        for j in enumerate(indexs):
          temp.append(csv_data[i+1][j[1]])
        data[i] = np.asarray(temp, dtype=np.float)
  
  knn = joblib.load(PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '.pkl')
  P = knn.predict(data)
  retP = []
  for i in range(len(P)):
    retP.append(reverse_dic[P[i]])
    
  test = open(PATH + '/data/' + sys.argv[1] + '/test/' + sys.argv[2] + '.test', 'w')
  json.dump({'ntb':
              {
                'samples' : samples,
                'score' : knn.score(data, target),
                'accuracy' : accuracy_score(P, target),
                'recall_score' : recall_score(P, target, average='weighted'),
                'precision_score' : precision_score(P, target, average='weighted')
              }
            ,
            'tb': 
              {
                'prediction' : retP
              }
            }, test, separators=(',',':'))
  test.close()
except:
  print >> sys.stderr, sys.exc_info()[0]