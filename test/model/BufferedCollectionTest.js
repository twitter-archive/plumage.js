/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var Environment = require('test/environment');
var EventLog = require('test/EventLog');
var ExampleData = require('example/ExampleData');
var PostCollection = require('example/collection/PostCollection');
var BufferedCollection = require('collection/BufferedCollection');

//use Environment to mock ajax
QUnit.module('BufferedCollection', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));

test('Can ensureData', function() {
  this.ajaxResponse = {results: ExampleData.POSTS, meta: {total: 6}};
  var collection = new PostCollection(null);
  collection.set('pageSize', 3);

  var buffered = new BufferedCollection(collection);

  var eventLog = new EventLog(buffered);

  buffered.ensureData(0,1);

  equal(eventLog.counts.beginLoad, 1, 'should emit beginPageLoad');
  equal(eventLog.counts.pageLoad, 1, 'should emit pageLoad');

  equal(buffered.size(), 6, 'should get total from response meta');
  equal(buffered.buffer.length, 3, 'should have only actually loaded one page');

  buffered.ensureData(2,3);
  equal(this.ajaxCount, 2, 'should request 2nd page');
  equal(buffered.buffer.length, 6, 'should have loaded 2nd page');
});

test('Can ensureData across pages', function() {
  this.ajaxResponse = {results: ExampleData.POSTS, meta: {total: 6}};
  var collection = new PostCollection(null);
  collection.set('pageSize', 3);

  var buffered = new BufferedCollection(collection);
  var eventLog = new EventLog(buffered);

  buffered.ensureData(1,5);

  equal(buffered.buffer.length, 6, 'should load 2 pages');
  equal(eventLog.counts.pageLoad, 2, 'should 2 pages pageLoad');
});

test('loaded models have fetched set', function() {
  this.ajaxResponse = {results: ExampleData.POSTS, meta: {total: 6}};
  var collection = new PostCollection(null);
  collection.set('pageSize', 3);

  var buffered = new BufferedCollection(collection);
  var eventLog = new EventLog(buffered);

  buffered.ensureData(0,3);
  equal(buffered.at(0).fetched, true, 'should set fetched');
  buffered.ensureData(3,6);
  equal(buffered.at(5).fetched, true, 'should set fetched');
});

