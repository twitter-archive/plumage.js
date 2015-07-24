/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var Environment = require('test/environment');
var Logger = require('util/Logger');

//use Environment to mock ajax
QUnit.module('Logger', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));

QUnit.test('Logging', function(){
  var logger = new Logger({url: '/foo'});

  logger.error('foo_type', 'there was an error');
  var data = this.ajaxSettings.data;
  equal(data.level, 'error', 'should log level');
  equal(data.type, 'foo_type', 'should log type');
  equal(data.message, 'there was an error', 'should log message');
});

QUnit.test('Save and retry on fail', function(){
  var logger = new Logger({url: '/foo'});
  this.ajaxResponseStatus = 'error';

  logger.clearLogs();
  equal(logger.getStoredLogs().length, 0, 'should start with no stored logs');
  logger.error('foo_type', 'there was an error');
  logger.error('foo_type2', 'there was an error2');
  equal(this.ajaxCount, 2);
  equal(logger.getStoredLogs().length, 2, 'should save to local storage');

  this.ajaxResponseStatus = 'success';
  logger.retryLogs();
  equal(this.ajaxCount, 4);

  var data = this.ajaxSettings.data;
  equal(data.level, 'error', 'should log level');
  equal(data.type, 'foo_type2', 'should log type');
  equal(data.message, 'there was an error2', 'should log message');

  equal(logger.getStoredLogs().length, 0, 'should clear stored logs after sending');
});
