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
    
def learn_svr(param):
    m_kernel = param["kernel"]
    m_kernel = byteify(m_kernel)
    m_C = float(param["C"])
    m_C = byteify(m_C)
    m_tol = int(param["tol"])
    m_tol = byteify(m_tol)
    m_cache_size = int(param["cache_size"])
    m_cache_size = byteify(m_cache_size)
    m_coef0 = float(param["coef0"])
    m_coef0 = byteify(m_coef0)
    m_degree = int(param["degree"])
    m_degree = byteify(m_degree)
    m_epsilon = float(param["epsilon"])
    m_epsilon = byteify(m_epsilon)
    m_max_iter = int(param["max_iter"])
    m_gamma = param["gamma"]
    m_gamma = byteify(m_gamma)
    predict_col = int(param["predict_col"])
    features = param["features"]
    for feature in features:
        print feature

    df = pd.read_csv(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.csv', header=0)
    set_train = df.loc[0::, features[0::]]
    sample_data = np.array(df.iloc[0::, predict_col])
    svr_rbf = SVR(C=m_C, cache_size=m_cache_size, coef0=m_coef0, degree=m_degree, epsilon=m_epsilon, gamma=m_gamma,
    kernel=m_kernel, max_iter=m_max_iter,tol=m_tol)
    svr_rbf = svr_rbf.fit(set_train, sample_data)
    if not os.path.exists(PATH + '/data/' + sys.argv[1] + '/pkl'):
      os.mkdir(PATH + '/data/' + sys.argv[1] + '/pkl')
    joblib.dump(svr_rbf, PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '.pkl')

PATH = os.getcwd()
f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
columns = f.read().splitlines()
json_value = json.load(p)
learn_svr(json_value)