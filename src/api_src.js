var $ = require('jquery');
var domready = require('domready');
var csvParse = require('csv-parse');
var formMaker = require('../js/form-maker');
var zgdom = require('../js/zgDOM');

var data = '';
var columns = [];
var csvArr = [];
var method = '';
var resData = '';

var TYPES = [
  'Integer',
  'Double',
  'String',
  'Date'
];

var apiKey = '';
domready(function() {
  apiKey = $('#api-key').html();
  $.post('/api/info', {apiKey: apiKey}, function(res) {
    if (res.err) {
      return console.log(res.err);    
    }  
    method = res.doc.method;   
    infoCallback();  
  });
  
  function infoCallback() {
    var freader = new FileReader();
    freader.onloadend = function(e) {
      data = freader.result;
      csvParse(freader.result, function(err, result) {
        if (err) {
          return console.log(err);
        }
        
        csvArr = result;
        columns = result[0];
        // var tSize = Math.min(21, result.length);
        var tSize = result.length;
        
        var table = document.getElementById('table');
        table.innerHTML = '';
        table.className = 'table table-condense'
        var thead = document.createElement('thead');
        var headRow = document.createElement('tr');
        for (var i = 0; i < result[0].length; ++i) {
          var head = document.createElement('th');
          head.innerHTML = result[0][i];
          headRow.appendChild(head);
        }  
        thead.appendChild(headRow);
        var tbody = document.createElement('tbody');
        for (var i = 1; i < parseInt(Math.min(tSize, 50), 10); ++i) {
          var row = document.createElement('tr');
          for (var j = 0; j < result[i].length; ++j) {
            var cell = document.createElement('td');
            cell.innerHTML = result[i][j];
            row.appendChild(cell);
          }
          tbody.appendChild(row);
        }
        table.appendChild(thead);
        table.appendChild(tbody);
        
      }); 
    };
    
    $('#json').click(function(e) {
      $('#json-data').html(resData); 
    });
    
    $('#show').click(function() {
      var file = $('#file')[0].files[0];
      console.log(file);
      if (!file) {
        return alert('CSV 파일을 선택해주세요.');
      }
      freader.readAsText(file, 'utf-8');
    });
  
    $('#test').click(function() {
      var reqData = {};
      reqData.data = data;
      // reqData.columns = {};
      reqData.apiKey = apiKey;
      reqData.method = method;
      // reqData.columns.x = {value:$('#xselect').val(), type:$('#xtype').val()};
      // reqData.columns.y = {value:$('#yselect').val(), type:$('#ytype').val()};
      // reqData.columns.label = {value:$('#labelselect').val(), type:$('#labeltype').val()};
      
      
      console.log(reqData);
      
      var formData = new FormData(); 
      formData.append('apiKey', JSON.stringify(apiKey));
      formData.append('method', JSON.stringify(method));
      formData.append('csv', $('#file')[0].files[0]);
      $.ajax({
        url: '/test',
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
        success: function(res){
          if (res.err) {
            return console.log(res.err); 
          }
          alert("success");
          console.log(res);
          var parsedData = JSON.parse(res.data);
          resData = res.data;
          // var predict = parsedData.prediction;
          // var score = parsedData.score;
          // var accuracy = parsedData.accuracy;
          // var recall = parsedData.recall_score;
          // var precision = parsedData.precision_score;
          
          // var scoreLabel = document.createElement('label');
          // var accuracyLabel = document.createElement('label');
          // var recallLabel = document.createElement('label');
          // var precisionLabel = document.createElement('label');
          
          var result_div = document.getElementById('result_div');
          result_div.innerHTML ='';
          // scoreLabel.innerHTML = 'score:' + score;
          // scoreLabel.className = 'col-sm-10 control-label';
          // accuracyLabel.innerHTML = 'accuracy:' + accuracy;
          // accuracyLabel.className = 'col-sm-10 control-label';
          // recallLabel.innerHTML = 'recall:' + recall;
          // recallLabel.className = 'col-sm-10 control-label';
          // precisionLabel.innerHTML = 'precision:' + precision;
          // precisionLabel.className = 'col-sm-10 control-label';
          // result_div.appendChild(scoreLabel);
          // result_div.appendChild(accuracyLabel);          
          // result_div.appendChild(recallLabel); 
          // result_div.appendChild(precisionLabel);
          
          
          var ntb = parsedData['ntb'];
          for (var name in ntb) {
            var lab = document.createElement('label');
            lab.innerHTML = name + ': ' + ntb[name];
            lab.className = 'col-sm-10 control-label';
            result_div.appendChild(lab);
          }
          
          var table = document.getElementById('table');
          // var tSize = Math.min(21, csvArr.length);
          var tSize = csvArr.length;
          table.innerHTML = '';
          var thead = document.createElement('thead');
          var headRow = document.createElement('tr');
          for (var i = 0; i < csvArr[0].length; ++i) {
            var head = document.createElement('th');
            head.innerHTML = csvArr[0][i];
            headRow.appendChild(head);
          }  
          
          var names = [];
          var tb = parsedData['tb'];
          for (var name in tb) {
            names.push(name);
          }
          
          
          // var predHead = document.createElement('th');
          for (var i = 0; i < names.length; ++i) {
            var tbHead = document.createElement('th');
            tbHead.innerHTML = names[i];
            headRow.appendChild(tbHead);
          }
          thead.appendChild(headRow);
          // predHead.innerHTML = 'predict';
          // headRow.appendChild(predHead);
          // thead.appendChild(headRow);
          var tbody = document.createElement('tbody');
          for (var i = 1; i < parseInt(Math.min(tSize, 50), 10); ++i) {
            var row = document.createElement('tr');
            for (var j = 0; j < csvArr[i].length; ++j) {
              var cell = document.createElement('td');
              cell.innerHTML = csvArr[i][j];
              row.appendChild(cell);
            }
            for (var j = 0; j < names.length; ++j) {
              var tbCell = document.createElement('td');
              tbCell.innerHTML = tb[names[j]][i-1];
              row.appendChild(tbCell);
            }
            tbody.appendChild(row);
            // var predCell = document.createElement('td');
            // if (predict[i-1] == csvArr[i][csvArr[i].length - 1]) {
            //   predCell.style.color = 'green';
            // }else{
            //   predCell.style.color = 'red';
            // }
            
            // predCell.innerHTML = predict[i-1];
            // row.appendChild(predCell);
            // tbody.appendChild(row);
          }
          table.appendChild(thead);
          table.appendChild(tbody);
        }
      });
    });  
  }
});