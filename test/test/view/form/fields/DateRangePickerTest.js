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
  'example/model/Vacation',
  'view/form/fields/DateRangePicker'
], function($, _, Backbone, moment, sinon, Environment, EventLog, ExampleData, Vacation, DateRangePicker) {

  //use Environment to mock ajax
  module('DateRangePicker', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  var defaultOptions = {
    fromAttr: 'fromDate',
    toAttr: 'toDate',
  };

  function createView(options) {
    options = _.extend({}, defaultOptions, options || {});
    return new DateRangePicker(options);
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

    var model = new Vacation({fromDate: getDate(0), toDate: getDate(1)});
    var field = createView();

    field.setModel(model);
    field.update();

    deepEqual(field.getValue(), [getDate(0), getDate(1)]);
    equal(field.fromCalendar.selectedDate.valueOf(), getDate(0));

    model.set('fromDate', getDate(2));
    equal(field.getValue()[0], getDate(2), 'should update from value on model change');

    model.set('toDate', getDate(3));
    equal(field.getValue()[1], getDate(3), 'should update to value on model change');

    this.ajaxResponse = {results: {
      id: 1,
      fromDate: getDate(4),
      toDate: getDate(5)
    }};
    model.load();

    deepEqual(field.getValue(), [model.get('fromDate'), model.get('toDate')], 'should update value on model load');
  });

  test('edit text field', function() {
    var model = new Vacation({fromDate: getDate(0), toDate: getDate(1)});
    var field = createView();

    field.setModel(model);
    field.update();

    //valid
    var validText = 'Mar 1, 2014 - Mar 2, 2014';
    var enterEvent = {keyCode: 13, preventDefault: function(){}};
    field.$('input:first').val(validText);
    field.onKeyDown(enterEvent);
    equal(field.$('input:first').val(), validText);

    equal(moment(field.getValue()[0]).format(field.format), 'Mar 1, 2014', 'should update value on enter');
    equal(moment(field.getValue()[1]).format(field.format), 'Mar 2, 2014', 'should update value on enter');

    //invalid
    field.$('input:first').val('fjfjoerjjsd - irjiwfe');
    field.onKeyDown(enterEvent);
    equal(field.$('input:first').val(), validText);

    equal(moment(field.getValue()[0]).format(field.format), 'Mar 1, 2014', 'should not update on invalid');
    equal(moment(field.getValue()[1]).format(field.format), 'Mar 2, 2014', 'should not update on invalid');

    field.$('input:first').val('Mar 2, 2014 - irjiwfe');
    field.onKeyDown(enterEvent);
    equal(field.$('input:first').val(), validText);

    equal(moment(field.getValue()[0]).format(field.format), 'Mar 1, 2014', 'should not update on invalid');
    equal(moment(field.getValue()[1]).format(field.format), 'Mar 2, 2014', 'should not update on invalid');
  });

  test('select range', function() {
    var field = createView();
    field.selectPresetRange(field.ranges[0]);
    equal(field.fromDate, moment().hour(12).startOf('hour').valueOf());
  });
});