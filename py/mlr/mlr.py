from __future__ import division
import sys
import csv
import matplotlib.pylab as plt
import cPickle
import json
import numpy as np
import codecs
import pandas as pd
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

def byteify(input):
    if isinstance(input, dict):
        return {byteify(key): byteify(value)
                for key, value in input.iteritems()}
    elif isinstance(input, list):
        return [byteify(element) for element in input]
    elif isinstance(input, unicode):
        return input.encode('utf-8')
    else:
        return input
    
def learn_linereg(param):
    m_fit_intercept = param["fit_intercept"]
    m_fit_intercept = byteify(m_fit_intercept)
    m_normalize = param["normalize"]
    m_normalize = byteify(m_normalize)
    m_copy_X = param["copy_X"]
    m_copy_X = byteify(m_copy_X)
    m_n_jobs = int(param["n_jobs"])
    m_n_jobs = byteify(m_n_jobs)
    predict_col = int(param["predict_col"])
    features = param["features"]
    for feature in features:
        print feature

    df = pd.read_csv(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.csv', header=0)
    set_train = df.loc[0::, features[0::]]
    sample_data = np.array(df.iloc[0::, predict_col])
    linereg = LinearRegression(fit_intercept=m_fit_intercept, normalize=m_normalize, copy_X=m_copy_X, n_jobs=m_n_jobs)
    model = linereg.fit(set_train, sample_data)
    if not os.path.exists(PATH + '/data/' + sys.argv[1] + '/pkl'):
      os.mkdir(PATH + '/data/' + sys.argv[1] + '/pkl')
    joblib.dump(model, PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '.pkl')

PATH = os.getcwd()
f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
columns = f.read().splitlines()
json_value = json.load(p)
learn_svr(json_value)