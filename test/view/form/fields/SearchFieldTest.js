/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var moment = require('moment');
var Environment = require('test/environment');
var EventLog = require('test/EventLog');

var SearchField = require('view/form/fields/SearchField');

//use Environment to mock ajax
QUnit.module('SearchField', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));

function createView(options) {
  options = options || {};
  return new SearchField(_.extend({
    el: $('<div></div>'),
  }, options));
}

test('triggers submit', function(){
  var field = createView();
  field.render();
  var eventLog = new EventLog(field);

  field.$('button').click();
  equal(eventLog.counts.submit, 1, 'should fire trigger event');

  var event = $.Event('keydown');
  event.keyCode = 13;
  var input = field.getInputEl().trigger(event);
  equal(eventLog.counts.submit, 2, 'should fire trigger event');
});
