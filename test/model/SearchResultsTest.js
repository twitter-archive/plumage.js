/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'sinon',
  'test/environment',
  'test/EventLog',
  'example/ExampleData',
  'model/SearchResults'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, SearchResults) {


  //use Environment to mock ajax
  module('SearchResults', _.extend(new Environment(), {
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
});