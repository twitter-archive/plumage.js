/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'test/environment',
  'test/EventLog',
  'example/ExampleData',
  'example/collection/PostCollection',
  'collection/BufferedGridData'
], function($, _, Backbone, Environment, EventLog, ExampleData, PostCollection, BufferedGridData) {


  //use Environment to mock ajax
  module('BufferedGridData', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  test('Can ensureData', function() {
    this.ajaxResponse = {results: ExampleData.POSTS, meta: {total: 6}};
    var collection = new PostCollection(null);
    collection.set('pageSize', 3);

    var bufferedData = new BufferedGridData(collection);

    var eventLog = new EventLog(bufferedData);

    bufferedData.ensureData(0,1);

    equal(eventLog.counts.dataBeginLoad, 1, 'should emit dataBeginLoad');
    equal(eventLog.counts.dataLoaded, 1, 'should emit dataLoaded');

    equal(bufferedData.getLength(), 6, 'should get total from response meta');
    equal(bufferedData.data.length, 3, 'should have only actually loaded one page');

    bufferedData.ensureData(2,3);
    equal(this.ajaxCount, 2, 'should request 2nd page');
    equal(bufferedData.data.length, 6, 'should have loaded 2nd page');
  });


});

