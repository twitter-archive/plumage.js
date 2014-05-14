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
});
