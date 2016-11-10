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
  
  with codecs.open(join(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.csv'), encoding = 'utf-8-sig') as csv_file:
  #with codecs.open(join( PATH + '/py/lstm/test.csv'), encoding = 'utf-8-sig') as csv_file:
      reader = csv.reader(csv_file)
      csv_data = list(reader)
      label_index = csv_data[0].index(label_name)
      
      columns = len(csv_data[0])
      features = columns - 1
      samples = len(csv_data) - 1
      
      X_train = np.empty((samples, features))
      Y_train = np.empty((samples,), dtype=np.int)
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
        Y_train[i] = np.asarray(dic[csv_data[i+1][label_index]], dtype=np.int)
        temp = []
        for j in range(columns):
          if j != label_index:
            temp.append(csv_data[i+1][j])
        X_train[i] = np.asarray(temp, dtype=np.float)
  
  X_train = sequence.pad_sequences(X_train, maxlen=features)
  Y_train = to_categorical(Y_train)
  
  X_train = X_train.reshape(X_train.shape[0], timesteps, data_dim)
  
  model = Sequential()
  model.add(GRU(int(hidden_unit[0]), return_sequences=True, input_shape=(timesteps, data_dim)))
  model.add(Dropout(float(dropout[0])))
  
  for i in range(hidden_layer):
    if (i == hidden_layer-1):
      model.add(GRU(int(hidden_unit[i+1])))
    else:
      model.add(GRU(int(hidden_unit[i+1]), return_sequences=True))
    model.add(Dropout(float(dropout[i+1])))
    
  model.add(Dense(len(Y_train[0]), activation=in_activation))
  
  optimizer = rmsprop(lr = learning_rate)
  model.compile(loss=loss_function, optimizer=optimizer, metrics=['accuracy'])
  
  model.fit(X_train, Y_train, batch_size=batch_size, nb_epoch=epoch, validation_data=(X_train, Y_train))
  
  dic = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.dic', 'w')
  out = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.out', 'w')
  P = model.predict_classes(X_train, verbose=0)
  score = model.evaluate(X_train, Y_train, verbose=0)
  
  retP = []
  for i in range(len(P)):
    retP.append(reverse_dic[P[i]])
  json.dump(reverse_dic, dic, separators=(',',':'))
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
            }, out, separators=(',',':'))
            
  if not path.exists(PATH + '/data/' + sys.argv[1] + '/h5'):
    mkdir(PATH + '/data/' + sys.argv[1] + '/h5')
  model.save(PATH + '/data/' + sys.argv[1] + '/h5/' + sys.argv[1] + '.h5')
  del model
  out.close()
    
except:
  print >> sys.stderr, sys.exc_info()[0]