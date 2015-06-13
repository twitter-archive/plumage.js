/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'sinon',
  'test/environment',
  'test/EventLog',
  'util/Logger'
], function($, _, sinon, Environment, EventLog, Logger) {


  //use Environment to mock ajax
  module('Logger', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  test('Logging', function(){
    var logger = new Logger({url: '/foo'});

    logger.error('foo_type', 'there was an error');
    var data = this.ajaxSettings.data;
    equal(data.level, 'error', 'should log level');
    equal(data.type, 'foo_type', 'should log type');
    equal(data.message, 'there was an error', 'should log message');
  });

  test('Save and retry on fail', function(){
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
});
