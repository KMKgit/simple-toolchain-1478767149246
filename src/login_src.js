var $ = require('jquery');
var domready = require('domready');
domready(function() {
  function getQueryStringValue (key) {  
    return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
  }  
  $('#login-btn').click(function(e) {
    console.log('click');
    var id = $('#id-inp').val();
    var pw = $('#pw-inp').val();
    $.post('/login', {id: id, password: pw}, function(data) {
      console.log(data);
      if (!data.success) {
        console.log(data.message);
        alert(data.message);
      } else {
        console.log('login success');
    
        // Would write the value of the QueryString-variable called name to the console  
        var redirectUri = getQueryStringValue("redirect_uri");
        if (redirectUri) {
          window.location.href = redirectUri;
        } else {
          window.location.reload();
        }
      }
    });
  });
  
  $('#logout-btn').click(function(e) {
    $.post('/logout', {}, function(data) {
      console.log('logout');
      window.location.reload();
    });
  });
    
    
    
    // $.ajax({
    //   type: 'POST',
    //   url: '/login',
    //   data: {id: id, password: pw},
    //   success: function(data) {
    //     console.log(data);
    //     if (!data.success) {
    //       console.log(data.message);
    //       alert(data.message);
    //     } else {
    //       console.log('login success');
    //       window.location.reload();
    //     }
    //   },
    //   dataType: 'application/json',
    // });
    
    // var res = request('POST', '/login', {
    //   json: { username: 'ForbesLindesay' }
    // });
    // var user = JSON.parse(res.getBody('utf8'));
});