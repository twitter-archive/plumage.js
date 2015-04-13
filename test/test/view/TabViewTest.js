/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'sinon',
  'test/environment',
  'test/EventLog',
  'example/ExampleData',
  'view/TabView',
  'view/View',
  'example/model/Post'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, TabView, View, Post) {


  //use Environment to mock ajax
  module('TabView', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    },
    afterEach: function() {
      window.router = undefined;
    }
  }));

  function createView(options) {
    options = options || {};
    return new TabView(_.extend({
      el: $('<div><div class="tab1"></div><div class="tab2"></div></div>'),
      subViews: [
        new View({selector:'.tab1', tabId: 'tab1', className: 'tab-pane', template: 'tab1'}),
        new View({selector:'.tab2', tabId: 'tab2', className: 'tab-pane', template: 'tab2'})
      ]
    }, options));
  }

  test('setModel', function(){
    var view = createView();
    view.setModel(new Post());
    view.model.updateUrl = sinon.stub();

    equal(view.model.get('tab'), 'tab1', 'should set model tab');

    view.setActiveTab('tab2');
    equal(view.model.get('tab'), 'tab2', 'should set model tab');
  });

  test('logTabNavigation', function() {

    var view = createView();
    view.setModel(new Post());
    view.model.updateUrl = sinon.stub();
    view.setActiveTab('tab2'); //ok with no router?

    try {
      window.router = {logNavigationAction: sinon.spy()};

      view.setActiveTab('tab1');
      ok(window.router.logNavigationAction.notCalled);

      view.logTabNavigation = true;
      view.setActiveTab('tab2');
      ok(window.router.logNavigationAction.calledOnce);

      view.setActiveTab('tab2');
      ok(window.router.logNavigationAction.calledOnce, 'log only on tab change');
    } finally {
      window.router = undefined;
    }
  });
});
