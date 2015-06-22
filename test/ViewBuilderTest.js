/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'sinon',
  'test/environment',
  'test/EventLog',
  'view/ModelView',
  'ViewBuilder',
  'view/View',
  'view/form/fields/Field',
  'view/form/fields/DateField',
  'view/form/fields/Select',
  'test/templates/TestView.html'
], function($, _, Backbone, sinon, Environment, EventLog, ModelView, ViewBuilder, View, Field, DateField, Select, testViewTemplate) {

//use Environment to mock ajax
  QUnit.module('ViewBuilder', _.extend(new Environment(), {
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
      template: testViewTemplate
    }, ModelView);

    equal(view.attr1, 'foo', 'should set config attrs');
    ok(view instanceof ModelView, 'should use defaultViewCls');
    equal(typeof(view.template), 'function', 'should compile template');
    equal(view.template(), testViewTemplate, 'should be correct template');
  });

  test('build nested view', function() {
    var viewBuilder = new ViewBuilder();
    var view = viewBuilder.buildView({
      viewCls: ModelView,
      template: 'test/templates/TestView.html',
      subViews: [{
        viewCls: ModelView,
        template: 'test/templates/TestView.html',
        selector: '.section1',
        subViews: [{
          viewCls: Field,
          selector: '.field1',
          label: 'Name1',
          valueAttr: 'name1'
        }]
      },{
        viewCls: Field,
        selector: '.field1',
        label: 'Name2',
        valueAttr: 'name2'
      }, {
        viewCls: Select,
        selector: '.field2',
        listValues: [{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]
      }, {
        viewCls: DateField,
        selector: '.field2',
        valueAttr: 'date'
      }]
    });

    equal(view.subViews.length, 4, 'should have subviews');
    ok(view.subViews[0] instanceof ModelView, 'should instantiate subviews');
    ok(view.subViews[0].subViews[0] instanceof View, 'should instantiate subviews subviews');
  });
});