/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'sinon',
  'test/environment',
  'test/EventLog',
  'view/View'
], function($, _, Backbone, sinon, Environment, EventLog, View) {


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
});