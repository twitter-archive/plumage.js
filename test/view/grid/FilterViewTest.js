/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var Environment = require('test/environment');

var FilterView = require('view/grid/FilterView');

//use Environment to mock ajax
QUnit.module('FilterView', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));
