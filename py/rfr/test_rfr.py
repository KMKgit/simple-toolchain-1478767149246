import numpy as np
import pandas as pd
import pickle
import json
import os
import sys
from sklearn.ensemble.forest import RandomForestRegressor
from sklearn.externals import joblib    


# def learn_rfr(param):#str_json):
#   # param = json.loads(str_json)
#   m_n_estimators = int(param["n_estimators"])
#   m_criterion = param["criterion"]
#   m_random_state = int(param["random_state"])
#   predict_col = int(param["predict_col"])
#   features = param["features"]
#   print m_n_estimators
#   print m_criterion
#   print m_random_state
#   for feature in features:
#     print feature

# #   with codecs.open(join(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.csv'), encoding = 'utf-8-sig') as csv_file:
#   df = pd.read_csv(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.csv', header=0)
#   print df
#   # df = pd.read_csv('/home/kaka/Data/building/building.csv', header=0)

#   df_ratio = int(len(df) * 0.7)
#   df_train = df.iloc[0:df_ratio, 0::]
#   df_test = df.iloc[df_ratio:, 0::]
#   print df_train
#   print df_test
#   actual_data = np.array(df.iloc[df_ratio:, predict_col]).astype(float)
#   sample_data = np.array(df_train.iloc[0::, predict_col]).astype(str)
#   set_train = df_train.loc[0::, features].astype(str)
#   set_test = df_test.loc[df_ratio::, features].astype(str)

#   model_rf = RandomForestRegressor(n_estimators=m_n_estimators, criterion=m_criterion, random_state=m_random_state)
#   model_rf = model_rf.fit(set_train, sample_data)
  
#   if not os.path.exists(PATH + '/data/' + sys.argv[1] + '/pkl'):
#     os.mkdir(PATH + '/data/' + sys.argv[1] + '/pkl')
#   joblib.dump(model_rf, PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '.pkl')
  
#   predicted_data = model_rf.predict(set_test).astype(float)
#   print predicted_data
#   # out = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.out', 'w')
  
#   # out.close();
#   # np.savetxt("/home/kaka/Data/building/building_predicted.csv", predicted_data, delimiter=",")
#   # np.savetxt("/home/kaka/Data/building/building_actual.csv", actual_data, delimiter=",")
try:
  PATH = os.getcwd()
  f = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.info', 'r')
  p = open(PATH + '/data/' + sys.argv[1] + '/' + sys.argv[1] + '.param', 'r')
  columns = f.read().splitlines()
  json_value = json.load(p)
  
  print json_value
  
  features = json_value['features']
  model_rf = joblib.load(PATH + '/data/' + sys.argv[1] + '/pkl/' + sys.argv[1] + '.pkl')
  
  df = pd.read_csv(PATH + '/data/' + sys.argv[1] + '/test/' + sys.argv[2] + '.csv', header=0)
  set_test = df.loc[0::, features].astype(str)
  predicted_data = model_rf.predict(set_test).astype(float)
  res = [x for x in predicted_data]
  
  print res
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
    
except:
  print >> sys.stderr, sys.exc_info()[0]
