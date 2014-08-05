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
  'view/form/fields/DateRangeField'
], function($, _, Backbone, moment, sinon, Environment, EventLog, ExampleData, Post, DateRangeField) {

  //use Environment to mock ajax
  module('DateField', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  var defaultOptions = {
    fromAttr: 'fromDate',
    toAttr: 'toDate'
  };

  function createView(options) {
    options = _.extend({}, defaultOptions, options || {});
    return new DateRangeField(options);
  }

  test('empty render', function(){
    var field = createView();

    field.render();
    equal(field.getValue(), '', 'field with no model should have empty string value');
  });

  function getDate(i) {
    return moment([2014, 2, i+1]).valueOf();
  }

  test('field with model', function() {
    var model = new Post({body: 'initial'});
    var field = createView();

    field.setModel(model);
    field.update();

    deepEqual(field.getValue(), [undefined, undefined], '');

    model.set({fromDate: getDate(0), toDate: getDate(1)});

    deepEqual(field.getValue(), [getDate(0), getDate(1)]);

    var picker = field.getPicker();
    equal(picker.getSubView('fromCal').getValue(), getDate(0));
    equal(picker.getSubView('toCal').getValue(), getDate(1));

    model.set('toDate', getDate(2));
    deepEqual(field.getValue(), [getDate(0), getDate(2)]);

    this.ajaxResponse = {results: {
      id: 1,
      body: 'my body',
      fromDate: getDate(2),
      toDate: getDate(3),
    }};
    model.load();

    deepEqual(field.getValue(), [model.get('fromDate'), model.get('toDate')]);
  });

  test('edit text field', function() {
    var model = new Post({body: 'initial', fromDate: getDate(0), toDate: getDate(1)});
    var field = createView();

    field.setModel(model);
    field.update();

    //valid
    var validText = 'Mar 3, 2014 - Mar 4, 2014';
    var enterEvent = {keyCode: 13, preventDefault: function(){}};
    field.$('input:first').val(validText);
    field.onKeyDown(enterEvent);
    equal(field.$('input:first').val(), validText);

    equal(moment(field.getValue()[0]).format(field.format), 'Mar 3, 2014', 'should update value on enter');
    equal(moment(field.getValue()[1]).format(field.format), 'Mar 4, 2014', 'should update value on enter');

    //invalid
    field.$('input:first').val('fjfjoerjjsd');
    field.onKeyDown(enterEvent);
    equal(field.$('input:first').val(), validText);

    equal(moment(field.getValue()[0]).format(field.format), 'Mar 3, 2014', 'should not update on invalid');
  });

});