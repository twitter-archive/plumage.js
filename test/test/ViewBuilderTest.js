/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
  'sinon',
  'test/environment',
  'test/EventLog',
  'ViewBuilder',
  'text!test/templates/TestView.html'
], function($, _, Backbone, Plumage, sinon, Environment, EventLog, ViewBuilder, testViewTemplate) {

//use Environment to mock ajax
  module('Router', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    },

    teardown: function() {
    }
  }));

  test('build view with template', function() {
    var viewBuilder = new ViewBuilder();
    var view = viewBuilder.buildView({
      attr1: 'foo',
      template: 'test/templates/TestView.html'
    });

    equal(view.attr1, 'foo', 'should set config attrs');
    equal(typeof(view.template), 'function', 'should compile template');
    equal(view.template(), testViewTemplate, 'should be correct template');
  });

  test('build nested view', function() {
    var viewBuilder = new ViewBuilder();
    var view = viewBuilder.buildView({
      template: 'test/templates/TestView.html',
      subViews: [{
        template: 'test/templates/TestView.html',
        selector: '.section1',
        subViews: [{
          viewCls: Plumage.view.form.fields.Field,
          selector: '.field1',
          label: 'Name1',
          valueAttr: 'name1'
        }]
      },{
        viewCls: Plumage.view.form.fields.Field,
        selector: '.field1',
        label: 'Name2',
        valueAttr: 'name2'
      }, {
        viewCls: Plumage.view.form.fields.Select,
        selector: '.field2',
        listValues: [{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]
      }, {
        viewCls: Plumage.view.form.fields.DatePicker,
        selector: '.field2',
        valueAttr: 'date'
      }]
    });

    equal(view.subViews.length, 4, 'should have subviews');
    ok(view.subViews[0] instanceof Plumage.view.View, 'should instantiate subviews');
    ok(view.subViews[0].subViews[0] instanceof Plumage.view.View, 'should instantiate subviews subviews');
  });
});