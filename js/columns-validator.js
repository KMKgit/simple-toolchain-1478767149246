module.exports = function() {
  function pValidate(columns) {
    var len = columns.length;
    for (var i = 0; i < len; ++i) {
      for (var j = 0; j < i; ++j) {
        if (columns[i] === columns[j]) {
          return false;
        }
      }  
    }
    return true;
  }
  
  return {
    validate: pValidate
  };
}();