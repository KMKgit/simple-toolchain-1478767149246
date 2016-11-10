from __future__ import division
import sys
import csv
import matplotlib.pylab as plt
import cPickle
import json
import numpy as np
import codecs
from os import getcwd
from os import environ
from os.path import dirname
from os.path import join
from os.path import exists
from os.path import expanduser
from os.path import isdir
from os.path import splitext
from os import listdir
from os import mkdir
from os import path
from numpy import genfromtxt
from sklearn import datasets
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score
from sklearn.externals import joblib
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
try:
  PATH = getcwd()
  f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
  p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
  columns = f.read().splitlines()
  t = json.load(p)
  k = int(t['k'])
  random_seed = int(t['random_seed'])
  if (random_seed == 0) :
    random_seed = None;
  f.close()
  p.close()
  
  with codecs.open(join(PATH + '/data/' + sys.argv[1] + '/request/' + sys.argv[2] + '.csv'), encoding = 'utf-8-sig') as csv_file:
    reader = csv.reader(csv_file)
    csv_data = list(reader)
    n_samples = len(csv_data) - 1
    n_features = len(csv_data[0])
    data = np.empty((n_samples, 2))
    
    for i in range(n_samples):
      temp = []
      for j in range(n_features):
        temp.append(csv_data[i+1][j])
      data[i] = np.asarray(temp, dtype=np.float)
      
  transformation = [[ 0.60834549, -0.63667341], [-0.40887718, 0.85253229]]
  data_aniso = np.dot(data, transformation)
  
  k_means = joblib.load(PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '.pkl')
  k_means_tf = joblib.load(PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '_tf.pkl')
  
  P = k_means.predict(data)
  AP = k_means_tf.predict(data_aniso)
  
  req = open(PATH + '/data/' + sys.argv[1] + '/request/' + sys.argv[2] + '.req', 'w')
  retP = []
  retAP = []
  for i in range(len(P)):
    retP.append(str(P[i]));
    retAP.append(str(AP[i]));
  json.dump({
              'predict' : retP,
              'aniso_predict' : retAP
            }, req, separators=(',',':'))
  req.close()
except:
  print >> sys.stderr, sys.exc_info()[0]