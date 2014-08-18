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
  'example/model/Post',
  'view/form/fields/Field'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, Post, Field) {


  //use Environment to mock ajax
  module('Field', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createView(options) {
    options = options || {};
    return new Field(_.extend({
      el: $('<div></div>'),
    }, options));
  }

  function createViewWithModel(options) {
    var view = createView(options),
      model = new Post({body: 'foo'});

    view.setModel(model);
    view.render();

    return view;
  }

  test('unbound field', function(){
    var field = createView();

    field.render();
    equal(field.getValue(), '', 'field with no model should have empty string value');

    ok(!field.hasValue(), 'unbound field should not hasValue');
  });

  test('field with model', function() {
    var field = createViewWithModel({label: 'field', valueAttr: 'body'}),
      model = field.model;

    equal(field.getValue(), 'foo');

    field.model.set('body', 'bar');
    equal(field.getValue(), 'bar');

    this.ajaxResponse = {results: ExampleData.POST_DATA};
    field.model.load();

    equal(field.getValue(), model.get('body'));
  });

  test('update model', function() {
    var field = createViewWithModel({label: 'field', valueAttr: 'body'}),
      model = field.model;

    field.setValue('new value');
    equal(model.get('body'), 'foo', 'model value should not change on field change');

    field.updateModel(model);
    equal(model.get('body'), 'new value', 'model value should change on update model');

    field = createView({valueAttr: 'body', updateModelOnChange: true});
    field.setModel(model);
    field.setValue('new value2');
    equal(model.get('body'), 'new value2', 'model value should update on change when using updateModelOnChange');
  });

  test('validation error', function() {
    var field = createViewWithModel({label: 'field', valueAttr: 'body'}),
      model = field.model;

    model.trigger('invalid', model, {body: 'message'});
    equal(field.validationState, 'error', 'should set validation state to error');
    var data = field.getTemplateData();

    equal(data.validationState, 'error', 'should render validation state');
    equal(data.message, 'message', 'should render message');
  });

  test('ignore error when not for this field', function() {
    var field = createViewWithModel({label: 'field', valueAttr: 'body'}),
      model = field.model;

    model.trigger('invalid', model, {subject: 'message'});
    equal(field.validationState, undefined, 'should ignore error for other field');
  });

  test('reset validation state', function() {
    var field = createViewWithModel({label: 'field', valueAttr: 'body'}),
      model = field.model;

    model.trigger('invalid', model, {body: 'message'});
    model.trigger('load', model);

    equal(field.validationState, undefined, 'should reset validation state on load');
  });

  test('validate', function() {
    var field = createView({label: 'field', valueAttr: 'body', validationRules: 'required'});
    field.validate();
    equal(field.validationState, 'error', 'should fail validation');
    equal(field.message, field.validationMessages.required);

    field = createView({label: 'field', valueAttr: 'body', validationRules: {required: true, minLength: 2}});
    field.validate();
    equal(field.validationState, 'error', 'should fail validation');
    equal(field.message, field.validationMessages.required);

    field.setValue('a');
    field.validate();
    equal(field.message, field.validationMessages.minLength.replace('{{param0}}', 2));
  });

});
