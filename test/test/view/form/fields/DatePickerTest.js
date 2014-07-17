/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'sinon',
  'test/environment',
  'test/EventLog',
  'example/ExampleData',
  'example/model/Post',
  'view/form/fields/DatePicker'
], function($, _, Backbone, moment, sinon, Environment, EventLog, ExampleData, Post, DatePicker) {

  //use Environment to mock ajax
  module('DatePicker', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  var defaultOptions = {
    valueAttr: 'post_date'
  };

  function createView(options) {
    options = _.extend({}, defaultOptions, options || {});
    return new DatePicker(options);
  }

  test('empty render', function(){
    var field = createView();

    field.render();
    equal(field.getValue(), '', 'field with no model should have empty string value');
  });

  test('empty render', function(){
    var field = createView();

    field.render();
    equal(field.getValue(), '', 'field with no model should have empty string value');
  });

  function getDate(i) {
    return moment([2014, 2, i+1]).valueOf();
  }

  test('field with model', function() {
    var model = new Post({body: 'initial', post_date: getDate(0)});
    var field = createView();

    field.setModel(model);
    field.update();

    equal(field.getValue(), getDate(0));
    equal(field.getSubView('calendar').getValue(), getDate(0));

    model.set('post_date', getDate(1));
    equal(field.getValue(), getDate(1));

    this.ajaxResponse = {results: {
      id: 1,
      body: 'my body',
      post_date: getDate(2)
    }};
    model.load();

    equal(field.getValue(), model.get('post_date'));
  });

  test('edit text field', function() {
    var model = new Post({body: 'initial', post_date: getDate(0)});
    var field = createView();

    field.setModel(model);
    field.update();

    //valid
    var validText = 'Mar 1, 2014';
    var enterEvent = {keyCode: 13, preventDefault: function(){}};
    field.$('input:first').val(validText);
    field.onKeyDown(enterEvent);
    equal(field.$('input:first').val(), validText);

    equal(moment(field.getValue()).format(field.format), 'Mar 1, 2014', 'should update value on enter');

    //invalid
    field.$('input:first').val('fjfjoerjjsd');
    field.onKeyDown(enterEvent);
    equal(field.$('input:first').val(), validText);

    equal(moment(field.getValue()).format(field.format), 'Mar 1, 2014', 'should not update on invalid');
  });
});