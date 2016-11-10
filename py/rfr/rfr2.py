import numpy as np
import pandas as pd
import json
from sklearn.ensemble.forest import RandomForestRegressor


def learn_rfr(str_json):
    param = json.loads(str_json)
    m_n_estimators = param["n_estimators"]
    m_criterion = param["criterion"]
    m_random_state = param["random_state"]
    predict_col = param["predict_col"]
    features = param["features"]
    print m_n_estimators
    print m_criterion
    print m_random_state
    for feature in features:
        print feature

    df = pd.read_csv('/home/kaka/Data/building/building.csv', header=0)

    df_ratio = int(len(df) * 0.7)
    df_train = df.iloc[0:df_ratio, 0::]
    df_test = df.iloc[df_ratio:, 0::]

    actual_data = np.array(df.iloc[df_ratio:, predict_col]).astype(float)
    sample_data = np.array(df_train.iloc[0::, predict_col]).astype(str)
    set_train = df_train.loc[0::, features[0::]].astype(str)
    set_test = df_test.loc[0::, features[0::]].astype(str)

    model_rf = RandomForestRegressor(n_estimators=3, criterion='mse', random_state=0)
    model_rf = model_rf.fit(set_train, sample_data)
    predicted_data = model_rf.predict(set_test).astype(float)

    np.savetxt("/home/kaka/Data/building/building_predicted.csv", predicted_data, delimiter=",")
    np.savetxt("/home/kaka/Data/building/building_actual.csv", actual_data, delimiter=",")


def test_rfr():
    predicted_data = pd.read_csv('/home/kaka/Data/building/building_predicted.csv', header=None)
    actual_data = pd.read_csv('/home/kaka/Data/building/building_actual.csv', header=None)

    result = np.mean(np.abs((actual_data - predicted_data) / predicted_data)) * 100
    print "result: %f" % result
    np.savetxt("/home/kaka/Data/building/building_result.csv", result, delimiter=",")


json_value = "{\"n_estimators\":3,\"criterion\":\"mse\",\"random_state\":0,\"features\":[\"Hour\",\"Day\",\"DayOfWeek\",\"Month\",\"Humidity\",\"Temp\"],\"predict_col\":0}";
learn_rfr(json_value)
test_rfr()
