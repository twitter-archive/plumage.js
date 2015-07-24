/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var Environment = require('test/environment');
var CommentsSection = require('view/comment/CommentsSection');

//use Environment to mock ajax
QUnit.module('view/comment/CommentsSection', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));
