module.exports = function() {
  function appendAll(parent, children) {
    var len = children.length;
    for (var i = 0; i < len; ++i) {
      parent.appendChild(children[i]);
    }
  }
  
  return {
    appendAll: appendAll  
  };
}();