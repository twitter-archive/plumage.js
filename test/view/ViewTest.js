/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var sinon = require('sinon');
var Environment = require('test/environment');

var View = require('view/View');

//use Environment to mock ajax
QUnit.module('View', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));

test('test deferRender', function(){
  var view = new View({deferRender: true});
  sinon.spy(view, 'onRender');

  view.render();
  ok(view.onRender.notCalled, 'should not render before onShow');

  view.onShow();
  ok(view.onRender.calledOnce, 'should render on show');

  view.onShow();
  ok(view.onRender.calledOnce, 'only render the first time on show');
});