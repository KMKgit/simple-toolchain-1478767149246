var $ = require('jquery');
var domready = require('domready');
var csvParse = require('csv-parse');
var d3 = require('d3');
var d3plus = require('d3plus');
var columnsValidator = require('../js/columns-validator');
var tableMaker = require('../js/table-maker');
var formMaker = require('../js/form-maker');

function check(id) {
  return $('#' + id).is(':checked');
}

domready(function() {
  var data = null;
  var apiName = '';
  var columns = [];
  var csvArr = [];
  var csvArr2 = [];
  var TYPES = [
    'Integer',
    'Double',
    'String',
    'Date'
  ];
  
  var typesArray = [];
  
  var ALGORITHMS = [
    '',
    'KNN',
    'K_means',
    'RBM',
    'RFR',
    'MLR',
    'SVR',
    'RNN',
    'GRU',
    'LSTM'
  ];
  
  $('#next1').click(function() {
    apiName = $('#api-name').val();
    if (apiName == '') {
      return alert('API이름을 입력해주세요.');
    }
    var file = $('#file')[0].files[0];
    if (!file) {
      return alert('CSV 파일을 선택해주세요.');
    }
    $('#api-name-header').html(apiName);
    $('#api-name').attr('readonly', 'readonly');
    
    var freader = new FileReader();
    freader.onloadend = function(e) {
      data = freader.result;
      csvParse(freader.result, function(err, result) {
        if (err) {
          return console.log(err);
        }
        csvArr = result;
        columns = result[0];
        if (!columnsValidator.validate(columns)) {
          $('#file')[0].files[0] = null;
          return alert('컬럼명은 모두 달라야 합니다.');
        }
        
        var typesDiv = document.getElementById('types-div');
        for (var i = 0; i < columns.length; ++i) {
          var label = document.createElement('label');
          var select = document.createElement('select');
          select.className = 'form-control';
          label.innerHTML = columns[i];
          for (var j = 0; j < TYPES.length; ++j) {
            var option = document.createElement('option');
            option.text = TYPES[j];
            select.appendChild(option);
          }  
          select.id = 'col' + i + 'type';
          typesDiv.appendChild(label);
          typesDiv.appendChild(select);
          typesDiv.appendChild(document.createElement('br'));
        }
      });
    };
    freader.readAsText(file,'utf-8');
    $('#process1').hide();
    $('#process2').show();
  });
  
  $('#next2').click(function() {
    var converter = {
      Integer: function(x) {return parseInt(x, 10);},
      Double: function(x) {return parseFloat(x);},
      String: function(x) {return String(x);},
      Date: function(x) {return new Date(x);}
    };
    
    
    typesArray = columns.map(function(x, idx) {
      return $('#col' + idx + 'type').val();
    });
    
    var csvObjArray = [];
    for (var i = 1; i < csvArr.length; ++i) {
      var obj = {};
      for (var j = 0; j < columns.length; ++j) {
        obj[columns[j]] = converter[typesArray[j]](csvArr[i][j]);
      }
      csvObjArray.push(obj);
    }
    
    var tableLen = Math.min(21, csvArr.length);
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    for (var j = 0; j < columns.length; ++j) {
      var headCell = document.createElement('th');
      headCell.innerHTML = columns[j];
      headRow.appendChild(headCell);
    }
    thead.appendChild(headRow);
    
    var tbody = document.createElement('tbody');
    for (var i = 1; i < tableLen; ++i) {
      var bodyRow = document.createElement('tr');
      for (var j = 0; j < columns.length; ++j) {
        var bodyCell = document.createElement('td');
        bodyCell.innerHTML = csvArr[i][j];
        bodyRow.appendChild(bodyCell);
      }
      tbody.appendChild(bodyRow);
    }
    table.appendChild(thead);
    table.appendChild(tbody);
    document.getElementById('data-table').appendChild(table);
    
    $('#viz').html('');
    d3plus.viz()
      .container("#viz")
      .data(csvObjArray)
      .type("bar")
      .x(columns[0])
      .y(columns[0])
      .id(columns[0])
      .ui({
        value :[{
          "label": "type",
          "method": "type",
          "type": "drop",
          "value": ["line", "scatter", "box", "bar"]
        }, {
          "label": "x",
          "method": "x",
          "type": "drop",
          "value": columns
        }, {
          "label": "y",
          "method": "y",
          "type": "drop",
          "value": columns
        }, {
          "label": "id",
          "method": "id",
          "type": "drop",
          "value": columns
        }]
      })
      .draw();
      
    $('#process2').hide();
    $('#process3').show();
    $('#graph').show();
  });
  
  $('#next3').click(function() {
    var label = document.createElement('label');
    label.innerHTML = '방법';
    label.className = 'col-sm-1 control-label';
    var select = document.createElement('select');
    select.className = 'form-control';
    //서버에서 받아올 수도 있겠다.
    for (var i = 0; i < ALGORITHMS.length; ++i) {
      var option = document.createElement('option');
      option.text = ALGORITHMS[i];
      select.appendChild(option);
    }
    
    select.onchange = function() {
      var method = select.value;
      var elem = document.getElementById('parameters');
      elem.innerHTML = '';
      if (!method) return;
      var form = formMaker[method];
      var paramInfo = form.process(elem);
      var isValidParam = form.validate(csvArr, typesArray);
      
      var btn = document.getElementById('next4');
      for (var i = 0; i < paramInfo.length; ++i) {
        console.log(paramInfo[i].name);
      }  
      
      btn.onclick = function(method) {
        return function() {
        //validate
          var params = {};
          for (var i = 0; i < paramInfo.length; ++i) {
            console.log(paramInfo[i].name, paramInfo[i].inputElement.value);
            var type = paramInfo[i].type;
            if (type == 'array[string]') {
              // params[paramInfo[i].name] = paramInfo[i].inputElement.value.split(',');
              params[paramInfo[i].name] = paramInfo[i].getValue().split(',');
            } else if (type == 'string') {
              // params[paramInfo[i].name] = paramInfo[i].inputElement.value;
              params[paramInfo[i].name] = paramInfo[i].getValue();
            }
          }  
          
          //post
          // var postData = {
          //   apiName: apiName,
          //   columns: columns,
          //   types: typesArray,
          //   params: params,
          //   method: method
          // };
          var formData = new FormData(); 
          formData.append('apiName', JSON.stringify(apiName));
          formData.append('columns', JSON.stringify(columns));
          formData.append('types', JSON.stringify(typesArray));
          formData.append('params', JSON.stringify(params));
          formData.append('method', JSON.stringify(method));
          formData.append('writeTime', JSON.stringify(Date()));
          formData.append('csv', $('#file')[0].files[0]);
          console.log(columns); 
          // postData
          $.ajax({
            url: '/test_upload',
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            xhr: function()
            {
              var xhr = new window.XMLHttpRequest();
              //Upload progress
              xhr.upload.addEventListener("progress", function(evt){
                if (evt.lengthComputable) {
                  var percentComplete = evt.loaded / evt.total;
                  //Do something with upload progress
                  console.log(percentComplete);
                }
              }, false);
              return xhr;
            },
            success: function(data){
              window.location = '/myapi';
            }
          });
        }; 
      }(method);
    };
    var alList = document.getElementById('al-list');
    alList.innerHTML;
    alList.appendChild(label);
    alList.appendChild(select);
    $('#process3').hide();
    $('#process4').show();
    $('#graph').hide();
  });
  
  // $('#next4').click(function() {
  // });
  //데이터 걸치기
  $('#next').click(function() {
    apiName = $('#api-name').val();
    if (apiName == '') {
      return alert('API이름을 입력해주세요.');
    }
    $('#api-name').attr('readonly', 'readonly');
    
    var file = $('#file')[0].files[0];
    if (!file) {
      return alert('CSV 파일을 선택해주세요.');
    }
    var freader = new FileReader();
    
    freader.onloadend = function(e) {
      data = freader.result;
      csvParse(freader.result, function(err, result) {
        if (err) {
          return console.log(err);
        }
        csvArr = result;
        columns = result[0];
        
        csvArr2 = new Array(csvArr.length - 1);
        var inputList = document.createElement('div');
        var labelSelect = document.createElement('select');
        var xSelect = document.createElement('select');
        var ySelect = document.createElement('select');
        labelSelect.id = 'label-select';
        xSelect.id = 'xselect';
        ySelect.id = 'yselect';
        labelSelect.className = 'form-control';
        xSelect.className = 'form-control';
        ySelect.className = 'form-control';
        for (var i = 0; i < columns.length; ++i) {
          var subdiv = document.createElement('div');
          var label = document.createElement('label');
          var select = document.createElement('select');
          select.className = 'form-control';
          var checkbox = document.createElement('input');
          var labelOption = document.createElement('option');
          var xlabelOption = document.createElement('option');
          var ylabelOption = document.createElement('option');
          labelOption.text = columns[i];
          xlabelOption.text = columns[i];
          ylabelOption.text = columns[i];
          labelSelect.add(labelOption);
          xSelect.add(xlabelOption);
          ySelect.add(ylabelOption);
          checkbox.type = 'checkbox';
          for (var j = 0; j < TYPES.length; ++j) {
            var option = document.createElement('option');
            option.text = TYPES[j];
            select.add(option);
          }
          label.innerHTML = columns[i];
          select.id = 'col' + i + '_type';
          checkbox.id = select.id + '_chk';
          subdiv.appendChild(label);
          subdiv.appendChild(select);
          subdiv.appendChild(checkbox);
          inputList.appendChild(subdiv);
        }
        var body = document.getElementById('upper');
        body.appendChild(inputList);
        var labelLabel = document.createElement('label');
        labelLabel.innerHTML = 'Label';
        var xLabel = document.createElement('label');
        xLabel.innerHTML = 'X';
        var yLabel = document.createElement('label');
        yLabel.innerHTML = 'Y';
        body.appendChild(labelLabel);
        body.appendChild(labelSelect);
        body.appendChild(xLabel);
        body.appendChild(xSelect);
        body.appendChild(yLabel);
        body.appendChild(ySelect);
        
        $('#next').hide();
        $('#file').attr('disabled', 'disabled');
        $('#upload').show();
        $('#train-param-label').show();
        $('#train-param').show();
        $('#visualize').show();
      });
    };
    freader.readAsText(file,'utf-8');
  });
  
  
  $('#visualize').click(function() {
    
    var converter = {
      Integer: function(x) {return parseInt(x, 10);},
      Double: function(x) {return parseFloat(x);},
      String: function(x) {return String(x);},
      Date: function(x) {return new Date(x);}
    };
    
    
    var types = columns.map(function(x, idx) {
      return $('#col' + idx + '_type').val();
    });
    
    for (var i = 1; i < csvArr.length; ++i) {
      var obj = {};
      for (var j = 0; j < columns.length; ++j) {
        obj[columns[j]] = converter[types[j]](csvArr[i][j]);
      }
      csvArr2[i - 1] = obj;
    }
    
    $('#viz').html('');
    var visualization = d3plus.viz()
      .container("#viz")
      .data(csvArr2)
      .type("bar")
      .x(columns[0])
      .y(columns[0])
      .id(columns[0])
      .ui([{
        "label": "type",
        "method": "type",
        "type": "drop",
        "value": ["line", "scatter", "box", "bar"]
      }, {
        "label": "x",
        "method": "x",
        "type": "drop",
        "value": columns
      }, {
        "label": "y",
        "method": "y",
        "type": "drop",
        "value": columns
      }, {
        "label": "id",
        "method": "id",
        "type": "drop",
        "value": columns
      }])
      .draw();
  });
  
  //전송 + 학습
  $('#upload').click(function() {
    var columnWithType =  [];
    var cnt = 0;
    var d = [];
    for (var i = 0; i < csvArr.length; ++i) {
      d.push([]);
    }
    
    var lab = $('#label-select').val();
    var labelIndex = -1;
    for (var i = 0; i < columns.length; ++i) {
      var checked = check('col' + i + '_type_chk');
      if (checked) {
        if (columns[i] == lab) {
          labelIndex = cnt;
        }
        for (var j = 0; j < csvArr.length; ++j) {
          d[j].push(csvArr[j][i]);
        }
        columnWithType.push({
          name: columns[i],
          type: $('#col' + i + '_type').val()
        });
        ++cnt;
      }
    }
    if (!check) {
      return alert('1개 이상의 column을 선택해야 합니다.');
    }
    
    if (labelIndex == -1) {
      return alert('label은 선택된 column 중 하나여야 합니다.');
    }
    
    var lineArray = [];
    d.forEach(function (infoArray, index) {
        var line = infoArray.join(",");
        // lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
        lineArray.push(line);
    });
    var csvContent = lineArray.join("\n"); 
    var trainData = {
      apiName: apiName,
      data: csvContent,
      columns: columnWithType,
      param: $('#train-param').val(),
      writeTime: Date(),
      method: 'KNN',
      labelIndex: labelIndex
    };
    
    $.post('/file_upload', trainData, function(res) {
      if (!res.success) {
        alert(res.message);
      } else {
        window.location = '/';   
      }
    });
  });
});