var $ = require('jquery');
var request = require('sync-request');
var domready = require('domready');
domready(function() {
  $('#login-btn').click(function(e) {
    console.log('click');
    var id = $('#id-inp').val();
    var pw = $('#pw-inp').val();
    // $.post('/login', {id: id, password: pw}, function(data) {
    //   if (!data.success) {
    //     console.log(data.message);
    //     alert(data.message);
    //   } else {
    //     console.log('login success');
    //     window.location.reload();
    //   }
    // });
    
    
    $.ajax({
      type: 'POST',
      url: '/login',
      data: {id: id, password: pw},
      success: function(data) {
        if (!data.success) {
          console.log(data.message);
          alert(data.message);
        } else {
          console.log('login success');
          window.location.reload();
        }
      },
      dataType: 'application/json',
    });
    
    // var res = request('POST', '/login', {
    //   json: { username: 'ForbesLindesay' }
    // });
    // var user = JSON.parse(res.getBody('utf8'));
  });
});