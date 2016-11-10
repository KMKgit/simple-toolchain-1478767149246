var $ = require('jquery');
var domready = require('domready');
domready(function() {
  $('#signup-btn').click(function(e) {
    console.log('click');
    var email = $('#email-inp').val();
    var name = $('#name-inp').val();
    var pw1 = $('#pw1-inp').val();
    var pw2 = $('#pw2-inp').val();
    console.log(email,name, pw1, pw2);
    if (pw1 !== pw2) {
      alert('passwords are different');
      return;
    }
      
    $.post('/signup', {
      email: email,
      user_id: name,
      password: pw1
    }, function(data) {
      console.log(data);
      if (!data.success) {
        alert(data.message);
      } else {
        window.location.href = '/login';  
      }
    });
  });
});