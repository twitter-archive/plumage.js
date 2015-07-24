/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var Environment = require('test/environment');
var NavView = require('view/NavView');

//use Environment to mock ajax
QUnit.module('NavView', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));

function createView(options) {
  options = options || {};
  return new NavView(_.extend({
    el: $('<div></div>')
  }, options));
}
