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
from keras.preprocessing import sequence
from keras.utils import np_utils
from keras.models import Sequential
from keras.optimizers import rmsprop
from keras.layers import Dense, Dropout, Activation, Embedding
from keras.layers.recurrent import LSTM, SimpleRNN, GRU
from keras.datasets import imdb
from keras.utils.np_utils import to_categorical
from keras.models import load_model
try:
    PATH = getcwd()
    f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
    p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
    columns = f.read().splitlines()
    t = json.load(p)
    data_dim = int(t['data_dimension'])
    timesteps = int(t['timesteps'])
    
    f.close()
    p.close()
    
    
    with codecs.open(join(PATH + '/data/' + sys.argv[1] + '/request/' + sys.argv[2] + '.csv'), encoding = 'utf-8-sig') as csv_file:
        reader = csv.reader(csv_file)
        csv_data = list(reader)
        samples = len(csv_data)
        features = len(csv_data[0])
        
        X_req = np.empty((samples, features))
        
        for i in range(samples):
            temp = []
            for j in range(features):
                temp.append(csv_data[i][j])
            X_req[i] = np.asarray(temp, dtype=np.float)
    
    X_req = sequence.pad_sequences(X_req, maxlen=features)
    X_req = X_req.reshape(X_req.shape[0], timesteps, data_dim)
    model = load_model(PATH + '/data/' + sys.argv[1] + '/h5/' + sys.argv[1] + '.h5')
    req = open(PATH + '/data/' + sys.argv[1] + '/request/' + sys.argv[2] + '.req', 'w')
    P = model.predict_classes(X_req, verbose=0)
    
    retP = []
    for i in range(len(P)):
      retP.append(P[i])
      
    json.dump({
                'prediction' : retP
              }, req, separators=(',',':'))
    del model
    req.close()
    
except:
  print >> sys.stderr, sys.exc_info()[0]
