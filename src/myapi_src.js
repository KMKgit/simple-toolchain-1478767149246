var $ = require('jquery');
var domready = require('domready');
var stableSort = require('stable');

var ENTRY_PER_PAGE = 10;
var sortPolicy = '';
var asc = true;
var colorClasses = ["active","","success","","warning","","danger","","info",""];
var currentPage = 1;
var prevWord = '';
var data;
var maxPage;

domready(function() {
  function getData(word, reset) {
    $.post('/search', {word: word}, function(res) {
      if (res.err) {
        alert(res.err);
        console.log(res.err);
        return;
      }
      
      console.log(res);
      data = res.data;
      if (sortPolicy && reset) {
        document.getElementById(sortPolicy).className = 'text-center sorting';
      }
      sortPolicy = '';
      asc = true;
      currentPage = 1;
      show(data, 1);
      addPagingEventListener();
      console.log(data);
    });
  }
  
  function addPagingEventListener() {
    $('.paginate_button > a').click(function(e) {
      var target = e.target;
      var page = parseInt(target.innerHTML, 10);  
      console.log(page);
      if (page < 1 || page > maxPage) return;
      if (currentPage != page) {
        currentPage = page;
      } 
      show(data, currentPage);
      addPagingEventListener(); 
    });
  }

  getData("", true);
  
  $('th').click(function(e) {
    var target = e.target;
    console.log(target.id);
    if (!target.id) return;
    if (sortPolicy) {
      document.getElementById(sortPolicy).className = 'text-center sorting';
    }
    if (sortPolicy == target.id) {
      asc = !asc;  
    } else {
      sortPolicy = target.id;
      asc = true;
    }
    
    var policy2prop = {
      'api-name-th' : 'api_name',
      'api-key-th' : 'api_key',
      'method-th' : 'method',
      'valid-th' : 'valid',
      'write-time-th' : 'write_time' 
    };
    
    var prob = policy2prop[sortPolicy];
    if (asc) {
      document.getElementById(sortPolicy).className = 'text-center sorting_asc';
       stableSort.inplace(data, function(mem) {
         return function(a, b) {
            return a[mem] > b[mem]; 
         };
       }(prob));
    } else {
      document.getElementById(sortPolicy).className = 'text-center sorting_desc';
       stableSort.inplace(data, function(mem) {
         return function(a, b) {
            return a[mem] < b[mem]; 
         };
       }(prob));
    }
    show(data, currentPage);
    addPagingEventListener();
  });
  
  function show(data, page) {
    maxPage = Math.floor(Math.max(0, (data.length - 1) / ENTRY_PER_PAGE + 1));
    var pagination = document.getElementById('pagination');
    while (pagination.lastChild) {
      pagination.removeChild(pagination.lastChild);
    }
    
    for (var i = 1; i <= maxPage; ++i) {
      var li = document.createElement('li');
      li.classList.add('paginate_button');
      if (i == page) {
        li.classList.add('active');
      }
      var anchor = document.createElement('a');
      anchor.appendChild(document.createTextNode(i));
      li.appendChild(anchor);
      pagination.appendChild(li);
    }
    
    var tbody = document.getElementById('tableBody');
    while (tbody.lastChild) {
      tbody.removeChild(tbody.lastChild);
    }
    
    var createCenterAlignedTd = function(val) {
      var td = document.createElement('td');
      td.classList.add('center');
      td.appendChild(val);
      return td;
    };
    
    var startIndex = (page - 1) * ENTRY_PER_PAGE;
    var endIndex = Math.min(page * ENTRY_PER_PAGE, data.length);
    
    for (var i = startIndex; i < endIndex; ++i) {
      var tr = document.createElement('tr');
      tr.classList.add('text-center'); 
      var color = colorClasses[i % 10];
      if (color) tr.classList.add(color);
      var chkBox = document.createElement('input');
      chkBox.type = 'checkbox';
      chkBox.id = 'chk' + i;
      tr.appendChild(
        createCenterAlignedTd(chkBox));
      tr.appendChild(
        createCenterAlignedTd(document.createTextNode(data[i].api_name)));
      tr.appendChild(
        createCenterAlignedTd(document.createTextNode(data[i].api_key)));
      tr.appendChild(
        createCenterAlignedTd(document.createTextNode(data[i].method)));
      tr.appendChild(
        createCenterAlignedTd(function(v, aid) {
          var ie = document.createElement('i');
          if (v == 1) {
            ie.className = 'fa fa-check';
          } else if (v == 0) {
            ie.className = 'fa fa-tasks';
          }  else {
            ie.className = 'fa fa-warning';
            var a = document.createElement('a');
            a.href = '/api/err?aid=' + aid;
            a.appendChild(ie);
            return a;
          } 
          return ie;
        }(data[i].valid, data[i].api_key)));
      tr.appendChild(
        createCenterAlignedTd(document.createTextNode(data[i].write_time)));
        
      var anchor = document.createElement('a');
      var ie = document.createElement('i');
      anchor.href = '/api/info?aid=' + data[i].api_key;
      ie.className = 'fa fa-arrow-circle-right';
      anchor.appendChild(ie);
      tr.appendChild(createCenterAlignedTd(anchor));
    
      ie = document.createElement('i');
      anchor = document.createElement('a');
      if (data[i].valid == 1) {
        ie.className = 'fa fa-arrow-circle-right';
        anchor.href = '/api?aid=' + data[i].api_key;
      } else {
        ie.className = 'fa fa-warning';
        anchor.href = '/api/err?aid=' + data[i].api_key;
      }
      anchor.appendChild(ie);
      tr.appendChild(createCenterAlignedTd(anchor));
      tbody.appendChild(tr);
    }
  }
  
  $('#remove').click(function() {
    var nodes = document.getElementById('tableBody').childNodes;
    var length = nodes.length;
    data = [];
    for (var i = 0; i < length; ++i) {
      var nodesChildren = nodes[i].childNodes;
      if (nodesChildren[0].childNodes[0].checked) {
        data.push(nodesChildren[2].innerHTML);
      }
    }
    $.post('/remove', {rmList: data}, function(res) {
      getData(prevWord, false);
    });
  });
  
  $('#search-btn').click(function() {
    var word = $('#search-inp').val();
    getData(word, true);
    prevWord = word;
  });
});