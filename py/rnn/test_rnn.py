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
  label_name = str(t['label_name'])
  learning_rate = float(t['learning_rate'])
  batch_size = int(t['batch_size'])
  hidden_layer = int(t['hidden_layer'])
  hidden_unit = t['hidden_unit']
  dropout = t['dropout']
  epoch = int(t['epoch'])
  in_activation = str(t['activation_function'])
  loss_function = str(t['loss_function'])
  data_dim = int(t['data_dimension'])
  timesteps = int(t['timesteps'])
  
  f.close()
  p.close()
    
  #batch_size = 1
  #learning_rate = 0.001
  #hidden_unit = [32, 32, 32]
  #hidden_layer = 2
  #dropout = [0.2, 0.2, 0.2] #data dropout
  #epoch = 100
  #label_name = 'number'
  #in_activation = 'sigmoid'
  #loss_function = 'categorical_crossentropy'
  #data_dim = 64
  #timesteps = 1
  
  with codecs.open(join(PATH + '/data/' + sys.argv[1] + '/test/' + sys.argv[2] + '.csv'), encoding = 'utf-8-sig') as csv_file:
      reader = csv.reader(csv_file)
      csv_data = list(reader)
      label_index = csv_data[0].index(label_name)
      
      columns = len(csv_data[0])
      features = columns - 1
      samples = len(csv_data) - 1
      
      X_test = np.empty((samples, features))
      Y_test = np.empty((samples,), dtype=np.int)
      
      for i in range(samples):
        Y_test[i] = np.asarray(csv_data[i+1][label_index], dtype=np.int)
        temp = []
        for j in range(columns):
          if j != label_index:
            temp.append(csv_data[i+1][j])
        X_test[i] = np.asarray(temp, dtype=np.float)
  
  X_test = sequence.pad_sequences(X_test, maxlen=features)
  Y_test = to_categorical(Y_test)
  
  X_test = X_test.reshape(X_test.shape[0], timesteps, data_dim)
  
  model = load_model(PATH + '/data/' + sys.argv[1] + '/h5/' + sys.argv[1] + '.h5')
  test = open(PATH + '/data/' + sys.argv[1] + '/test/' + sys.argv[2] + '.test', 'w')
  P = model.predict_classes(X_test, verbose=0)
  score = model.evaluate(X_test, Y_test, verbose=0)
  
  retP = []
  for i in range(len(P)):
    retP.append(P[i])
    
  json.dump({'ntb':
              {
                'samples' : samples,
                'score' : score[0],
                'accuracy' : score[1]
              }
            ,
            'tb': 
              {
                'prediction' : retP
              }
            }, test, separators=(',',':'))
  del model
  test.close()
  
except:
  print >> sys.stderr, sys.exc_info()[0]
