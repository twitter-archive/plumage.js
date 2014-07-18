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
  'view/form/fields/picker/DateRangePicker'
], function($, _, Backbone, moment, sinon, Environment, EventLog, ExampleData, Vacation, DateRangePicker) {

  //use Environment to mock ajax
  module('DateRangePicker', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  var defaultOptions = {
  };

  function createView(options) {
    options = _.extend({}, defaultOptions, options || {});
    return new DateRangePicker(options);
  }

  test('select range', function() {
    var picker = createView();
    picker.selectPresetRange({from: 'today', to: 'today'});
    equal(picker.model.get('fromDate').valueOf(), moment({hour: 0}).valueOf());

    picker = createView({utc: true});
    picker.selectPresetRange({from: {day: -1}, to: 'today'});

    equal(picker.model.get('fromDate').valueOf(), moment.utc({hour: 0}).add({day: -1}).valueOf());
  });

  test('hours', function() {
    var picker = createView({showHourSelect: true, utc: true});

    var value = moment.utc([2014,0,1, 12]).valueOf();
    picker.model.set('fromDate', value);
    picker.render();

    equal(picker.$('.from-hour input').val(), 12, 'should show hour select');
  });
});
