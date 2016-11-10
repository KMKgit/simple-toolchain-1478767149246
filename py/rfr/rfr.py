import numpy as np
import pandas as pd
import pickle
import json
import os
import sys
from sklearn.ensemble.forest import RandomForestRegressor
from sklearn.externals import joblib    

def learn_rfr(param):#str_json):
  # param = json.loads(str_json)
  m_n_estimators = int(param["n_estimators"])
  m_criterion = param["criterion"]
  m_random_state = int(param["random_state"])
  predict_col = int(param["predict_col"])
  features = param["features"]
  
  print m_n_estimators
  print m_criterion
  print m_random_state
  print features[0], features[1]
  for feature in features:
    print feature

  df = pd.read_csv(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.csv', header=0)
  print df
  
  df_ratio = int(len(df) * 0.7)
  df_train = df.iloc[0:df_ratio, 0::]
  df_test = df.iloc[df_ratio:, 0::]
  print df_train
  print df_test
  actual_data = np.array(df.iloc[df_ratio:, predict_col]).astype(float)
  sample_data = np.array(df_train.iloc[0::, predict_col]).astype(str)
  set_train = df_train.loc[0::, features].astype(str)
  set_test = df_test.loc[df_ratio::, features].astype(str)

  model_rf = RandomForestRegressor(n_estimators=m_n_estimators, criterion=m_criterion, random_state=m_random_state)
  model_rf = model_rf.fit(set_train, sample_data)
  
  if not os.path.exists(PATH + '/data/' + sys.argv[1] + '/pkl'):
    os.mkdir(PATH + '/data/' + sys.argv[1] + '/pkl')
  joblib.dump(model_rf, PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '.pkl')

try:
  PATH = os.getcwd()
  f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
  p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
  columns = f.read().splitlines()
  json_value = json.load(p)
  
  print json_value
  learn_rfr(json_value)

except:
  print >> sys.stderr, sys.exc_info()[0]
