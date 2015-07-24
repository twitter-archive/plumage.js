/* globals $, _ */
var DummyEvent = function(name, target) {
  this.name = name;
  this.target = target;
};

_.extend(DummyEvent.prototype, {
  preventDefault: function() {},
  stopPropagation: function() {}
});

module.exports = DummyEvent;