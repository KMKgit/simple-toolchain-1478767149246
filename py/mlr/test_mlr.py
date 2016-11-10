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
from sklearn.svm import SVR
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score
from sklearn.externals import joblib

def test_svr(str_json):
    features = param["features"]
    model_rf = joblib.load(PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '.pkl')
    df = pd.read_csv(PATH + '/data/' + sys.argv[1] + '/test/' + sys.argv[2] + '.csv', header=0)
    set_train = df.loc[0::, features[0::]]
    predicted_data = model_rf.predict(set_train)
    res = [x for x in predicted_data]

    test = open(PATH + '/data/' + sys.argv[1] + '/test/' + sys.argv[2] + '.test', 'w')
    json.dump({
        'tb':
            {
                # 'samples' : samples,
                # 'score' : knn.score(data, target),
                # 'accuracy' : accuracy_score(P, target),
                # 'recall_score' : recall_score(P, target, average='weighted'),
                # 'precision_score' : precision_score(P, target, average='weighted')
            },
        'ntb': 
            {
                'prediction' : res
            }
        }, test, separators=(',',':'))
    test.close()

PATH = os.getcwd()
f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
columns = f.read().splitlines()
json_value = json.load(p)
test_svr(json_value)