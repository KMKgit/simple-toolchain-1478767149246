var $ = require('jquery');
var commonConst = require('../js/common-const');
module.exports = function(){
  
  
  function DropdownElement(_name, _values) {
    this.select = document.createElement('select');
    this.select.className = 'form-control';
    var option;
    for (var i = 0; i < _values.length; ++i) {
      option = document.createElement('option');
      option.value = _values[i];
      option.innerHTML = _values[i];
      this.select.appendChild(option);
    }
    
    this.getValue = function() {
      return this.select.value;
    };
    
    this.getNode = function() {
      return this.select;
    };
  }
  
  function ParameterInformation(_name, _type, _input, _label, _inputType) {
    _inputType = _inputType || 'input';
    this.name = _name;
    this.type = _type;
    this.inputElement = _input;
    this.labelElement = _label;
    this.inputType = _inputType;
    
    this.getValue = function() {
      if (this.inputType === 'input') {
        return this.inputElement.value;
      } else if (this.inputType === 'select') {
        return this.inputElement.getValue();
      }
      return null;
    };
    
    this.getNode = function() {
      if (this.inputType === 'input') {
        return this.inputElement;
      } else if (this.inputType === 'select') {
        return this.inputElement.getNode();
      }
    };
  }
  
  
  
  function mKnn(parent) {
    //k, columns, target      
    var kLabel = document.createElement('label');
    var kInput = document.createElement('input');
    kLabel.innerHTML = 'K';
    kLabel.className = 'col-sm-1 control-label';
    kInput.className = 'form-control';
    kInput.placeholder = 'enter the int K, K shall be abnormal to number of columns';
    var columnsLabel = document.createElement('label');
    var columnsInput = document.createElement('input');
    columnsLabel.innerHTML = 'columns';
    columnsLabel.className = 'col-sm-1 control-label';
    columnsInput.className = 'form-control';
    columnsInput.placeholder = 'enter the column names to use, separator = (,). (ex)sepal_width,sepal_length';
    var targetLabel = document.createElement('label');
    var targetInput = document.createElement('input');
    targetLabel.innerHTML = 'target';
    targetLabel.className = 'col-sm-1 control-label';
    targetInput.className = 'form-control';
    targetInput.placeholder = 'enter the identifier. (ex) species';
    parent.innerHTML = '';
    var paramInfo = [
      new ParameterInformation('k', 'string', kInput, kLabel),
      new ParameterInformation('columns', 'array[string]', columnsInput, columnsLabel),
      new ParameterInformation('target', 'string', targetInput, targetLabel),
    ];
      // ['k', kInput, kLabel],
      // ['columns', columnsInput, columnsLabel],
      // ['target', targetInput, targetLabel]];
    for (var i = 0; i < paramInfo.length; ++i) {
      parent.appendChild(paramInfo[i].labelElement);
      parent.appendChild(paramInfo[i].inputElement);
      parent.appendChild(document.createElement('br'));
    }
    return paramInfo;
  }
  
  function mKnnValidate(csvArr, typesArr) {
  }
  
  function mRbm(parent) {
    var learningRateLabel = document.createElement('label');  
    var nIterLabel = document.createElement('label');  
    var nComponentsLabel = document.createElement('label');
    var logisticCLabel = document.createElement('label');  
    var learningRateInput = document.createElement('input');  
    var nIterInput = document.createElement('input');  
    var nComponentsInput = document.createElement('input');
    var logisticCInput = document.createElement('input');  
    var targetLabel = document.createElement('label');
    var targetInput = document.createElement('input');
    
    learningRateLabel.innerHTML = 'learning rate';
    learningRateLabel.className = 'col-sm-10 control-label';
    learningRateInput.className = 'form-control';
    learningRateInput.placeholder = '0.06';
    
    nIterLabel.innerHTML = 'number of interations';
    nIterLabel.className = 'col-sm-10 control-label';
    nIterInput.className = 'form-control';
    nIterInput.placeholder = '20';
    
    nComponentsLabel.innerHTML = 'number of components';
    nComponentsLabel.className = 'col-sm-10 control-label';
    nComponentsInput.className = 'form-control';
    nComponentsInput.placeholder = '100';
    
    logisticCLabel.innerHTML = 'logistic c';
    logisticCLabel.className = 'col-sm-10 control-label';
    logisticCInput.className = 'form-control';
    logisticCInput.placeholder = '6000.0';
    
    targetLabel.innerHTML = 'target';
    targetLabel.className = 'col-sm-10 control-label';
    targetInput.className = 'form-control';
    targetInput.placeholder = '(ex) number';
    
    
    parent.innerHTML = '';
    var paramInfo = [
      new ParameterInformation('learning_rate', 'string', learningRateInput, learningRateLabel),
      new ParameterInformation('n_iter', 'string', nIterInput, nIterLabel),
      new ParameterInformation('n_components', 'string', nComponentsInput, nComponentsLabel),
      new ParameterInformation('logistic_c', 'string', logisticCInput, logisticCLabel),
      new ParameterInformation('target', 'string', targetInput, targetLabel)
    ];
    for (var i = 0; i < paramInfo.length; ++i) {
      parent.appendChild(paramInfo[i].labelElement);
      // parent.appendChild(paramInfo[i].inputElement);
      parent.appendChild(paramInfo[i].getNode());
      parent.appendChild(document.createElement('br'));
    }
    return paramInfo;
  }
  
  function mRbmValidate(csvArr, typesArr) {
  }
  
  function mRfr(parent) {
    var nEstimatorsLabel = document.createElement('label');  
    var criterionLabel = document.createElement('label');  
    var randomStateLabel = document.createElement('label');
    var featuresColLabel = document.createElement('label');  
    var predictColLabel = document.createElement('label');  
    var nEstimatorsInput = document.createElement('input');  
    var criterionInput = document.createElement('input');  
    var randomStateInput = document.createElement('input');
    var featuresColInput = document.createElement('input');  
    var predictColInput = document.createElement('input');  
    
    nEstimatorsLabel.innerHTML = 'number of estimators';
    nEstimatorsLabel.className = 'col-sm-1 control-label';
    nEstimatorsInput.className = 'form-control';
    nEstimatorsInput.placeholder = '';
    
    criterionLabel.innerHTML = 'criterion';
    criterionLabel.className = 'col-sm-1 control-label';
    criterionInput.className = 'form-control';
    criterionInput.placeHolder = '';
    
    randomStateLabel.innerHTML = 'random state';
    randomStateLabel.className = 'col-sm-1 control-label';
    randomStateInput.className = 'form-control';
    randomStateInput.placeHolder = '';
    
    featuresColLabel.innerHTML = 'features columns';
    featuresColLabel.className = 'col-sm-1 control-label';
    featuresColInput.className = 'form-control';
    featuresColInput.placeHolder = '';
    
    predictColLabel.innerHTML = 'predict column';
    predictColLabel.className = 'col-sm-1 control-label';
    predictColInput.className = 'form-control';
    predictColInput.placeHolder = '';
    
    parent.innerHTML = '';
    var paramInfo = [
      new ParameterInformation('n_estimators', 'string', nEstimatorsInput, nEstimatorsLabel),
      new ParameterInformation('criterion', 'string', criterionInput, criterionLabel),
      new ParameterInformation('random_state', 'string', randomStateInput, randomStateLabel),
      new ParameterInformation('features', 'array[string]', featuresColInput, featuresColLabel),
      new ParameterInformation('predict_col', 'string', predictColInput, predictColLabel)
    ];
    
    for (var i = 0; i < paramInfo.length; ++i) {
      parent.appendChild(paramInfo[i].labelElement);
      parent.appendChild(paramInfo[i].getNode());
      parent.appendChild(document.createElement('br'));
    }
    return paramInfo;
  }
  
  function mRfrValidate(csvArr, typesArr) {
    
    
  }
  
  function mMlr(parent) {
    var m_fit_interceptLabel = document.createElement('label');
    var m_fit_interceptInput = document.createElement('input');
    m_fit_interceptLabel.innerHTML = 'm_fit_intercept';
    m_fit_interceptLabel.className = 'col-sm-10 control-label';
    m_fit_interceptInput.className = 'form-control';
    m_fit_interceptInput.placeholder = '';
    var m_normalizeLabel = document.createElement('label');
    var m_normalizeInput = document.createElement('input');
    m_normalizeLabel.innerHTML = 'm_normalize';
    m_normalizeLabel.className = 'col-sm-10 control-label';
    m_normalizeInput.className = 'form-control';
    m_normalizeInput.placeholder = '';
    var m_copy_XLabel = document.createElement('label');
    var m_copy_XInput = document.createElement('input');
    m_copy_XLabel.innerHTML = 'm_copy_X';
    m_copy_XLabel.className = 'col-sm-10 control-label';
    m_copy_XInput.className = 'form-control';
    m_copy_XInput.placeholder = '';
    var m_n_jobsLabel = document.createElement('label');
    var m_n_jobsInput = document.createElement('input');
    m_n_jobsLabel.innerHTML = 'm_n_jobs';
    m_n_jobsLabel.className = 'col-sm-10 control-label';
    m_n_jobsInput.className = 'form-control';
    m_n_jobsInput.placeholder = '';
    var predict_colLabel = document.createElement('label');
    var predict_colInput = document.createElement('input');
    predict_colLabel.innerHTML = 'predict_col';
    predict_colLabel.className = 'col-sm-10 control-label';
    predict_colInput.className = 'form-control';
    predict_colInput.placeholder = '';
    var featuresLabel = document.createElement('label');
    var featuresInput = document.createElement('input');
    featuresLabel.innerHTML = 'features';
    featuresLabel.className = 'col-sm-10 control-label';
    featuresInput.className = 'form-control';
    featuresInput.placeholder = '';
    
    parent.innerHTML = '';
    var paramInfo = [
      new ParameterInformation('m_fit_intercept', 'string', m_fit_interceptInput, m_fit_interceptLabel),
      new ParameterInformation('m_normalize', 'string', m_normalizeInput, m_normalizeLabel),
      new ParameterInformation('m_copy_X', 'string', m_copy_XInput, m_copy_XLabel),
      new ParameterInformation('m_n_jobs', 'string', m_n_jobsInput, m_n_jobsLabel),
      new ParameterInformation('predict_col', 'string', predict_colInput, predict_colLabel),
      new ParameterInformation('features', 'array[string]', featuresInput, featuresLabel)
    ];
    for (var i = 0; i < paramInfo.length; ++i) {
      parent.appendChild(paramInfo[i].labelElement);
      parent.appendChild(paramInfo[i].inputElement);
      parent.appendChild(document.createElement('br'));
    }
    return paramInfo;
  }
  
  function mMlrValidate(csvArr, typesArr) {
  }
  
  function mSvr(parent) {
    var m_kernelLabel = document.createElement('label');
    var m_kernelInput = document.createElement('input');
    m_kernelLabel.innerHTML = 'm_kernel';
    m_kernelLabel.className = 'col-sm-10 control-label';
    m_kernelInput.className = 'form-control';
    m_kernelInput.placeholder = '';
    var m_CLabel = document.createElement('label');
    var m_CInput = document.createElement('input');
    m_CLabel.innerHTML = 'm_C';
    m_CLabel.className = 'col-sm-10 control-label';
    m_CInput.className = 'form-control';
    m_CInput.placeholder = '';
    var m_tolLabel = document.createElement('label');
    var m_tolInput = document.createElement('input');
    m_tolLabel.innerHTML = 'm_tol';
    m_tolLabel.className = 'col-sm-10 control-label';
    m_tolInput.className = 'form-control';
    m_tolInput.placeholder = '';
    var m_cache_sizeLabel = document.createElement('label');
    var m_cache_sizeInput = document.createElement('input');
    m_cache_sizeLabel.innerHTML = 'm_cache_size';
    m_cache_sizeLabel.className = 'col-sm-10 control-label';
    m_cache_sizeInput.className = 'form-control';
    m_cache_sizeInput.placeholder = '';
    var m_coef0Label = document.createElement('label');
    var m_coef0Input = document.createElement('input');
    m_coef0Label.innerHTML = 'm_coef0';
    m_coef0Label.className = 'col-sm-10 control-label';
    m_coef0Input.className = 'form-control';
    m_coef0Input.placeholder = '';
    var m_degreeLabel = document.createElement('label');
    var m_degreeInput = document.createElement('input');
    m_degreeLabel.innerHTML = 'm_degree';
    m_degreeLabel.className = 'col-sm-10 control-label';
    m_degreeInput.className = 'form-control';
    m_degreeInput.placeholder = '';
    var m_epsilonLabel = document.createElement('label');
    var m_epsilonInput = document.createElement('input');
    m_epsilonLabel.innerHTML = 'm_epsilon';
    m_epsilonLabel.className = 'col-sm-10 control-label';
    m_epsilonInput.className = 'form-control';
    m_epsilonInput.placeholder = '';
    var m_max_iterLabel = document.createElement('label');
    var m_max_iterInput = document.createElement('input');
    m_max_iterLabel.innerHTML = 'm_max_iter';
    m_max_iterLabel.className = 'col-sm-10 control-label';
    m_max_iterInput.className = 'form-control';
    m_max_iterInput.placeholder = '';
    var m_gammaLabel = document.createElement('label');
    var m_gammaInput = document.createElement('input');
    m_gammaLabel.innerHTML = 'm_gamma';
    m_gammaLabel.className = 'col-sm-10 control-label';
    m_gammaInput.className = 'form-control';
    m_gammaInput.placeholder = '';
    var predict_colLabel = document.createElement('label');
    var predict_colInput = document.createElement('input');
    predict_colLabel.innerHTML = 'predict_col';
    predict_colLabel.className = 'col-sm-10 control-label';
    predict_colInput.className = 'form-control';
    predict_colInput.placeholder = '';
    var featuresLabel = document.createElement('label');
    var featuresInput = document.createElement('input');
    featuresLabel.innerHTML = 'features';
    featuresLabel.className = 'col-sm-10 control-label';
    featuresInput.className = 'form-control';
    featuresInput.placeholder = '';
    
    parent.innerHTML = '';
    var paramInfo = [
      new ParameterInformation('m_kernel', 'string', m_kernelInput, m_kernelLabel),
      new ParameterInformation('m_C', 'string', m_CInput, m_CLabel),
      new ParameterInformation('m_tol', 'string', m_tolInput, m_tolLabel),
      new ParameterInformation('m_cache_size', 'string', m_cache_sizeInput, m_cache_sizeLabel),
      new ParameterInformation('m_coef0', 'string', m_coef0Input, m_coef0Label),
      new ParameterInformation('m_degree', 'string', m_degreeInput, m_degreeLabel),
      new ParameterInformation('m_epsilon', 'string', m_epsilonInput, m_epsilonLabel),
      new ParameterInformation('m_max_iter', 'string', m_max_iterInput, m_max_iterLabel),
      new ParameterInformation('m_gamma', 'string', m_gammaInput, m_gammaLabel),
      new ParameterInformation('predict_col', 'string', predict_colInput, predict_colLabel),
      new ParameterInformation('features', 'string', featuresInput, featuresLabel)
    ];
      // ['k', kInput, kLabel],
      // ['columns', columnsInput, columnsLabel],
      // ['target', targetInput, targetLabel]];
    for (var i = 0; i < paramInfo.length; ++i) {
      parent.appendChild(paramInfo[i].labelElement);
      parent.appendChild(paramInfo[i].inputElement);
      parent.appendChild(document.createElement('br'));
    }
    return paramInfo;
  }
  
  function mSvrValidate(csvArr, typesArr) {
  }
  
  function mKm(parent) {
    var kLabel = document.createElement('label');
    var kInput = document.createElement('input');
    var randomseedLabel = document.createElement('label');
    var randomseedInput = document.createElement('input');
    
    kLabel.innerHTML = 'K cluster';
    kLabel.className = 'col-sm-10 control-label';
    kInput.className = 'form-control';
    kInput.placeholder = 'number of cluster';
    
    randomseedLabel.innerHTML = 'random state';
    randomseedLabel.className = 'col-sm-10 control-label';
    randomseedInput.className = 'form-control';
    randomseedInput.placeHolder = 'for centroid, if you want randomstate input to 0';
    
    parent.innerHTML = '';
    var paramInfo = [
      new ParameterInformation('k', 'string', kInput, kLabel),
      new ParameterInformation('random_seed', 'string', randomseedInput, randomseedLabel)
    ];
    
    for (var i = 0; i < paramInfo.length; ++i) {
      parent.appendChild(paramInfo[i].labelElement);
      parent.appendChild(paramInfo[i].getNode());
      parent.appendChild(document.createElement('br'));
    }
    return paramInfo;
  }
  
  function mKmValidate(csvArr, typesArr) {
    
    
  }
  
  function mLstm(parent) {
    var nameLabel = document.createElement('label');
    var nameInput = document.createElement('input');
    var learning_rateLabel = document.createElement('label');
    var learning_rateInput = document.createElement('input');
    var batch_sizeLabel = document.createElement('label');
    var batch_sizeInput = document.createElement('input');
    var hidden_layerLabel = document.createElement('label');
    var hidden_layerInput = document.createElement('input');
    var hidden_unitLabel = document.createElement('label');
    var hidden_unitInput = document.createElement('input');
    var dropoutLabel = document.createElement('label');
    var dropoutInput = document.createElement('input');
    var epochLabel = document.createElement('label');
    var epochInput = document.createElement('input');
    var activation_functionLabel = document.createElement('label');
    var actv = ['linear', 'sigmoid', 'softmax', 'softplus', 'softsign', 'relu', 'tanh', 'hard_sigmoid'];
    var activation_functionInput = new DropdownElement('act', actv);
    var loss_functionLabel = document.createElement('label');
    var lf = ['mean_squared_error',
        'mean_absolute_error',
        'mean_absolute_percentage_error',
        'mean_squared_logarithmic_error',
        'squared_hinge',
        'hinge',
        'categorical_crossentropy',
        'sparse_categorical_crossentropy',
        'binary_crossentropy',
        'kullback_leibler_divergence',
        'poisson',
        'cosine_proximity'];
    var loss_functionInput = new DropdownElement('lf', lf);
    var data_dimensionLabel = document.createElement('label');
    var data_dimensionInput = document.createElement('input');
    var timestepsLabel = document.createElement('label');
    var timestepsInput = document.createElement('input');
    
    nameLabel.innerHTML = 'label name';
    nameLabel.className = 'col-sm-10 control-label';
    nameInput.className = 'form-control';
    nameInput.placeholder = 'Enter the label name';
    
    learning_rateLabel.innerHTML = 'learning_rate';
    learning_rateLabel.className = 'col-sm-10 control-label';
    learning_rateInput.className = 'form-control';
    learning_rateInput.placeholder = 'Enter the learning rate';
    
    batch_sizeLabel.innerHTML = 'batch size';
    batch_sizeLabel.className = 'col-sm-10 control-label';
    batch_sizeInput.className = 'form-control';
    batch_sizeInput.placeholder = 'Enter the batch size';
    
    hidden_layerLabel.innerHTML = 'hidden layer';
    hidden_layerLabel.className = 'col-sm-10 control-label';
    hidden_layerInput.className = 'form-control';
    hidden_layerInput.placeholder = 'Enter the number of hidden layer';
    
    hidden_unitLabel.innerHTML = 'hidden unit';
    hidden_unitLabel.className = 'col-sm-10 control-label';
    hidden_unitInput.className = 'form-control';
    hidden_unitInput.placeholder = 'Enter the hidden unit(array type:separator={,}) to be applied to each of layer (ex)32,64,32';
    
    dropoutLabel.innerHTML = 'dropout';
    dropoutLabel.className = 'col-sm-10 control-label';
    dropoutInput.className = 'form-control';
    dropoutInput.placeholder = 'Enter the dropout(array type:separator={,}) to be applied to each of layer (ex)0.2,0.1,0.3';
    
    epochLabel.innerHTML = 'epoch';
    epochLabel.className = 'col-sm-10 control-label';
    epochInput.className = 'form-control';
    epochInput.placeholder = 'epoch';
    
    
    activation_functionLabel.innerHTML = 'activation_function';
    activation_functionLabel.className = 'col-sm-10 control-label';
    // activation_functionInput.className = 'row';
    // activation_functionInput.placeholder = 'liner || sigmoid || softmax || softplus || softsign || relu || tanh || hard_sigmoid'; //keras loss function;
    
    
    loss_functionLabel.innerHTML = 'loss_function';
    loss_functionLabel.className = 'col-sm-10 control-label';
    // loss_functionInput.placeholder = 'categorical_crossentropy || binary_crossentropy || mse || etc.. //keras loss function';
    
    data_dimensionLabel.innerHTML = 'data_dimension';
    data_dimensionLabel.className = 'col-sm-10 control-label';
    data_dimensionInput.className = 'form-control';
    data_dimensionInput.placeholder = 'train data(features) = timesteps * data_dimension // for train_data reshape';
    
    timestepsLabel.innerHTML = 'timesteps';
    timestepsLabel.className = 'col-sm-10 control-label';
    timestepsInput.className = 'form-control';
    timestepsInput.placeholder = 'train data(features) = timesteps * data_dimension // for train_data reshape';

    parent.innerHTML = '';
    var paramInfo = [
      new ParameterInformation('label_name', 'string', nameInput, nameLabel),
      new ParameterInformation('learning_rate', 'string', learning_rateInput, learning_rateLabel),
      new ParameterInformation('batch_size', 'string', batch_sizeInput, batch_sizeLabel),
      new ParameterInformation('hidden_layer', 'string', hidden_layerInput, hidden_layerLabel),
      new ParameterInformation('hidden_unit', 'array[string]', hidden_unitInput, hidden_unitLabel),
      new ParameterInformation('dropout', 'array[string]', dropoutInput, dropoutLabel),
      new ParameterInformation('epoch', 'string', epochInput, epochLabel),
      new ParameterInformation('activation_function', 'string', activation_functionInput, activation_functionLabel, 'select'),
      new ParameterInformation('loss_function', 'string', loss_functionInput, loss_functionLabel, 'select'),
      new ParameterInformation('data_dimension', 'string', data_dimensionInput, data_dimensionLabel),
      new ParameterInformation('timesteps', 'string', timestepsInput, timestepsLabel)
    ];
    
    for (var i = 0; i < paramInfo.length; ++i) {
      parent.appendChild(paramInfo[i].labelElement);
      parent.appendChild(paramInfo[i].getNode());
      parent.appendChild(document.createElement('br'));
    }
    return paramInfo;
  }
  
  function mLstmValidate(csvArr, typesArr) {
    
    
  }
  
  var ret = {};
  ret[commonConst.KNN] = {
    process: mKnn,
    validate: mKnnValidate
  };
  
  ret[commonConst.RBM] = {
    process: mRbm,
    validate: mRbmValidate
  };
  
  ret[commonConst.RFR] = {
    process: mRfr,
    validate: mRfrValidate
  };
  
  ret[commonConst.MLR] = {
    process: mMlr,
    validate: mMlrValidate
  };
  
  ret[commonConst.SVR] = {
    process: mSvr,
    validate: mSvrValidate
  };
  
  ret[commonConst.K_means] = {
    process: mKm,
    validate: mKmValidate
  };
  
  ret[commonConst.LSTM] = {
    process: mLstm,
    validate: mLstmValidate
  };
  
  ret[commonConst.GRU] = {
    process: mLstm,
    validate: mLstmValidate
  };
  
  ret[commonConst.RNN] = {
    process: mLstm,
    validate: mLstmValidate
  };
  
  
  return ret;
}();