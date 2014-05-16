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

  test('empty render', function(){
    var field = createView();

    field.render();
    equal(field.getValue(), '', 'field with no model should have empty string value');
  });

  test('field with model', function() {
    var model = new Post({body: 'initial'});
    var field = createView({valueAttr: 'body'});

    field.setModel(model);
    field.render();

    equal(field.getValue(), 'initial');

    model.set('body', 'foo');
    equal(field.getValue(), 'foo');

    this.ajaxResponse = {results: ExampleData.POST_DATA};
    model.load();

    equal(field.getValue(), model.get('body'));
  });

  test('update model', function() {
    var model = new Post({body: 'foo'});
    var field = createView({valueAttr: 'body'});

    field.setModel(model);
    field.render();

    field.setValue('new value');
    equal(model.get('body'), 'foo', 'model value should not change on field change');

    field.updateModel(model);
    equal(model.get('body'), 'new value', 'model value should change on update model');

    field = createView({valueAttr: 'body', updateModelOnChange: true});
    field.setModel(model);
    field.setValue('new value2');
    equal(model.get('body'), 'new value2', 'model value should update on change when using updateModelOnChange');
  });
});
