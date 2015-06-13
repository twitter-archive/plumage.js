define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone) {


  var DummyEvent = function(name, target) {
    this.name = name;
    this.target = target;
  };

  _.extend(DummyEvent.prototype, {
    preventDefault: function() {},
    stopPropagation: function() {}
  });

  return DummyEvent;
});