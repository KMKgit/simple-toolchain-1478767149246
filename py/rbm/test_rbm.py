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
from scipy.ndimage import convolve
from sklearn import linear_model, datasets, metrics
from sklearn.cross_validation import train_test_split
from sklearn.neural_network import BernoulliRBM
from sklearn.pipeline import Pipeline
from numpy import genfromtxt
from sklearn.externals import joblib


###############################################################################
# Setting up

def nudge_dataset(X, Y):
    """
    This produces a dataset 5 times bigger than the original one,
    by moving the 8x8 images in X around by 1px to left, right, down, up
    """
    direction_vectors = [
        [[0, 1, 0],
         [0, 0, 0],
         [0, 0, 0]],

        [[0, 0, 0],
         [1, 0, 0],
         [0, 0, 0]],

        [[0, 0, 0],
         [0, 0, 1],
         [0, 0, 0]],

        [[0, 0, 0],
         [0, 0, 0],
         [0, 1, 0]]]

    shift = lambda x, w: convolve(x.reshape((8, 8)), mode='constant',
                                  weights=w).ravel()
    X = np.concatenate([X] +
                       [np.apply_along_axis(shift, 1, X, vector)
                        for vector in direction_vectors])
    Y = np.concatenate([Y for _ in range(5)], axis=0)
    return X, Y

try:
    # Load Datad
    PATH = getcwd()
    f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
    p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
    
    columns = f.read().splitlines()
    t = json.load(p)
    in_learning_rate = float(t['learning_rate'])
    in_n_iter  = int(t['n_iter'])
    in_n_components = int(t['n_components'])
    in_logistic_c = float(t['logistic_c'])
    label_name = t['target']
    
    f.close()
    p.close()
      
    with codecs.open(join(PATH + '/data/' + sys.argv[1] + '/test/' + sys.argv[2] + '.csv'), encoding = 'utf-8-sig') as csv_file:
        reader = csv.reader(csv_file)
        csv_data = list(reader)
        samples = len(csv_data) - 1
        features = len(csv_data[0]) - 1
        target = np.empty((samples,), dtype=np.int)
        data = np.empty((samples, features))
        temp = []
        label_index = csv_data[0].index(label_name)
        
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
            #target[i] = np.asarray(csv_data[i+1][label_index], dtype=np.int)
            temp = []
            temp.append(csv_data[i+1][:-1])
            data[i] = np.asarray(temp, dtype=np.float)
    
    X, Y = nudge_dataset(data, target.astype(np.int))
    X = (X - np.min(X, 0)) / (np.max(X, 0) + 0.0001)  # 0-1 scaling
    
    classifier = joblib.load(PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '_classifier.pkl')
    logistic_classifier = joblib.load(PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '_logistic_classifier.pkl')
      
    CP =  classifier.predict(X)
    LCP = logistic_classifier.predict(X)
    retCP = []
    retLCP = []
    for i in range(len(CP)):
        retCP.append(reverse_dic[CP[i]])
        retLCP.append(reverse_dic[LCP[i]])
    
    cps, crs, cfs, cs = metrics.precision_recall_fscore_support(CP, Y, average='weighted')
    lcps, lcrs, lcfs, lcs = metrics.precision_recall_fscore_support(LCP, Y, average='weighted')
    
    test = open(PATH + '/data/' + sys.argv[1] + '/test/' + sys.argv[2] + '.test', 'w')
    
    json.dump({'ntb':
              {
                'samples' : samples,
                'score' : classifier.score(X, Y),
                'classifier_recall_score' : crs,
                'classifier_precision_score' : cps,
                'classifier_f1_score' : cfs,
                'logistic_classifier_recall_score' : lcrs,
                'logistic_classifier_precision_score' : lcps,
                'logistic_classifier_f1_score' : lcfs
              }
            ,
            'tb': 
              {
                'classifier_prediction' : retCP,
                'logistic_classifier_prediction' : retLCP
              }
            }, test, separators=(',',':'))
                 
    test.close()
    print sys.argv[2] + 'test_success'

except:
  print >> sys.stderr, sys.exc_info()[0]
