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

def nudge_dataset(X):
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
    return X

try:
    # Load Datad
    PATH = getcwd()
    f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
    p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
    r = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.dic', 'r')
    columns = f.read().splitlines()
    t = json.load(p)
    reverse_dic = json.load(r)
    
    in_learning_rate = float(t['learning_rate'])
    in_n_iter  = int(t['n_iter'])
    in_n_components = int(t['n_components'])
    in_logistic_c = float(t['logistic_c'])
    label_name = t['target']
    
    f.close()
    p.close()
    r.close()
      
    with codecs.open(join(PATH + '/data/' + sys.argv[1] + '/request/' + sys.argv[2] + '.csv'), encoding = 'utf-8-sig') as csv_file:
        reader = csv.reader(csv_file)
        csv_data = list(reader)
        samples = len(csv_data) - 1
        features = len(csv_data[0]) - 1
        data = np.empty((samples, features))
        temp = []
    
        for i in range(samples):
            temp = []
            temp.append(csv_data[i+1][:-1])
            data[i] = np.asarray(temp, dtype=np.float)
    
    X = nudge_dataset(data)
    X = (X - np.min(X, 0)) / (np.max(X, 0) + 0.0001)  # 0-1 scaling
    
    classifier = joblib.load(PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '_classifier.pkl')
    logistic_classifier = joblib.load(PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '_logistic_classifier.pkl')
      
    CP =  classifier.predict(X)
    LCP = logistic_classifier.predict(X)
    retCP = []
    retLCP = []
    for i in range(len(CP)):
        retCP.append(reverse_dic[str(CP[i])])
        retLCP.append(reverse_dic[str(LCP[i])])
    
    req = open(PATH + '/data/' + sys.argv[1] + '/request/' + sys.argv[2] + '.req', 'w')
    
    json.dump({
                'classifier_prediction' : retCP,
                'logistic_classifier_prediction' : retLCP
            }, req, separators=(',',':'))
                 
    req.close()
    print sys.argv[2] + 'req_success'
    
except:
  print >> sys.stderr, sys.exc_info()[0]
