/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var sinon = require('sinon');
var Environment = require('test/environment');
var EventLog = require('test/EventLog');
var ExampleData = require('example/ExampleData');
var SearchResults = require('model/SearchResults');

//use Environment to mock ajax
QUnit.module('SearchResults', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));

test('Can instantiate and load', function(){
  var searchResults = new SearchResults();
  var eventLog = new EventLog(searchResults);

  this.ajaxResponse = {results: {results: [{name: 'result1'}, {name: 'result2'}, {name: 'result3'}]}};
  searchResults.set('query', 'test');
  searchResults.load();

  equal(eventLog.counts.beginLoad, 1, 'should fire beginLoad');
  equal(eventLog.counts.load, 1, 'should fire load');

  equal(searchResults.getRelated('results').size(), ExampleData.POSTS.length);
});