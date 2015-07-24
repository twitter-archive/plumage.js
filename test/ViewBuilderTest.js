/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var Environment = require('test/environment');
var ExampleData = require('example/ExampleData');

var ViewBuilder = require('ViewBuilder');
var View = require('view/View');
var ModelView = require('view/ModelView');

var Field = require('view/form/fields/Field');
var DateField = require('view/form/fields/DateField');
var Select = require('view/form/fields/Select');

var testViewTemplate = require('test/templates/TestView.html');

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