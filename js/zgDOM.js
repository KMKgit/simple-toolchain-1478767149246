module.exports = function() {
  function _createElement(tagName, id, className) {
    var ret = document.createElement(tagName);
    if (id) {
      ret.id = id;
    }
    if (className) {
      ret.className = className;
    }
    return ret; 
  }
  
  return{
    createElement: _createElement
  };
}();