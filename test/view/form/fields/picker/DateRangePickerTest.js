/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var moment = require('moment');
var Environment = require('test/environment');
var DummyEvent = require('test/DummyEvent');

var DateRangePicker = require('view/form/fields/picker/DateRangePicker');
var App = require('App');

//use Environment to mock ajax
QUnit.module('DateRangePicker', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));

var theApp = new App();

var defaultOptions = {
};

function createView(options) {
  options = _.extend({}, defaultOptions, options || {});
  return new DateRangePicker(options);
}

test('select range', function() {
  var picker = createView();
  picker.selectPresetRange({from: 'today', to: 'today'});
  equal(picker.model.get('fromDate'), moment({hour: 0}).valueOf());

  picker = createView({utc: true});
  picker.selectPresetRange({from: {day: -1}, to: 'today'});

  equal(picker.model.get('fromDate'), moment.utc({hour: 0}).add({day: -1}));
});

test('hours', function() {
  var picker = createView({showHourSelect: true, utc: true});

  var value = moment.utc([2014,0,1,12]).valueOf();
  picker.model.set('fromDate', value);
  picker.render();

  equal(picker.$('.from-hour input').val(), 12, 'should show hour select');
});
