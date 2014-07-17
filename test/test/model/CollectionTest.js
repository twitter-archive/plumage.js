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
  'example/collection/PostCollection',
  'model/Filter'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, PostCollection, Filter) {


  //use Environment to mock ajax
  module('Collection', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  test('Can instantiate', function() {
    var collection = new PostCollection();
    collection.reset(ExampleData.POSTS);

    equal(collection.size(), 3);
    equal(collection.at(1).get('body'), 'my body2');

    ok(collection.getRelated('filters') !== undefined, 'filter should exist');

    collection.setFilter('foo', 'bar');
    collection.set('foo', 'bar');

    var collection2 = new PostCollection();
    equal(collection2.get('foo'), undefined, 'should not share meta');
    ok(collection2.getFilters('foo').length === 0, 'should not share filter');
  });

  test('Can set attributes and models', function() {
    var collection = new PostCollection();

    collection.set({
      href: '/foo',
      models: ExampleData.POSTS
    });

    equal(collection.get('href'), '/foo', 'should set attributes');
    equal(collection.size(), ExampleData.POSTS.length, 'should set models');
  });

  test('load', function() {
    this.ajaxResponse = {results: ExampleData.POSTS};

    var collection = new PostCollection();
    var eventLog = new EventLog(collection);
    collection.load();

    equal(eventLog.counts.load, 1, 'should fire load only once (do not propagate childrens load events');
    equal(collection.at(0).fetched, true, 'children should be fetched');
  });

  test('Load error', function(){
    var collection = new PostCollection();
    var eventLog = new EventLog(collection);

    this.ajaxResponseStatus = 'error';
    var errorHandler = sinon.spy();
    collection.load({error: errorHandler});

    equal(eventLog.counts.error, 1, 'error should have been triggered');
    ok(errorHandler.calledOnce, 'error handler should have been called');
  });

  asyncTest('Does not load again while already loading', function(){
    var collection = new PostCollection();

    this.ajaxResponse = {results: ExampleData.POSTS};
    this.ajaxAsync = true;

    collection.load({success: function() {
      equal(this.ajaxCount, 1, 'should not load while loading');
      start();
    }.bind(this)});

    collection.load({success: function() {
      ok(false, 'should not load again');
    }});

    this.ajaxAsync = false;
  });

  asyncTest('Do load again while already loading if params have changed', function(){
    var collection = new PostCollection();

    this.ajaxResponse = {results: ExampleData.POSTS};
    this.ajaxAsync = true;

    collection.load();

    collection.set('pageSize', 7);

    collection.load({success: function() {
      equal(this.ajaxCount, 2, 'should load again after param change');
      start();
    }.bind(this)});

    this.ajaxAsync = false;
  });

  test('should discard load if query has changed before returning', function(){
    var collection = new PostCollection();

    this.ajaxResponse = {results: ExampleData.POSTS, meta: {query: 'foo', filter: {body: 'foo'}}};

    collection.set({query: 'foo', filter: {body: 'foo'}});
    collection.load({success: function() {
      ok(true, 'should complete load since query is the same');
    }.bind(this)});

    collection.set('query', 'bar');
    collection.load({success: function() {
      ok(false, 'should not complete load since query changed');
    }});

    collection.set({query: 'foo', filter: {body: 'bar'}});
    collection.load({success: function() {
      ok(false, 'should not complete load since filter changed');
    }});
  });

  test('Can instantiate related', function() {
    var collection;

    this.ajaxResponse = {results: ExampleData.POSTS_WITH_COMMENTS};
    for (var i=0; i<2; i++) {
      collection = new PostCollection();
      if (i===0) {
        collection.reset(ExampleData.POSTS_WITH_COMMENTS);
      } else {
        collection.load();
      }
      var post = collection.at(0);
      var comments = collection.at(0).getRelated('comments');
      var comment1 = comments.at(0);
      var user1 = comment1.getRelated('user');

      equal(post.get('body'), 'my body');
      equal(comments.size(), 1);
      equal(user1.get('username'), 'user1');
    }
  });


  test('In memory', function() {
    var collection = new PostCollection(null, {processInMemory: true});

    this.ajaxResponse = {results: ExampleData.POSTS};
    var eventLog = new EventLog(collection);
    collection.load();
    equal(collection.size(), 3);
    equal(this.ajaxCount, 1, 'should load both parent and remote children');
    equal(eventLog.counts.load, 1, 'should fire load on inital load');


    collection.load();
    equal(this.ajaxCount, 1, 'should not load again if processInMemory');
    equal(eventLog.counts.load, 2, 'should fire load on in memory load');

    equal(collection.size(), 3);

    collection.set({query: '2'});
    collection.load();
    equal(collection.size(), 1, 'should query in memory');
    equal(collection.at(0).id, 2);

    collection.set({
      query: undefined,
      filter: {id: 1}
    });
    collection.addFilter(new Filter({key: 'id', value: 1, comparison: 'equals'}));
    collection.load();
    equal(collection.size(), 1, 'should filter in memory');
    equal(collection.at(0).id, 1);
  });

  test('reset in memory', function(){
    var collection = new PostCollection(null, {processInMemory: true});

    collection.resetInMemory([]);
    equal(collection.size(), 0);

    collection.resetInMemory([ExampleData.POSTS[0]]);
    equal(collection.size(), 1);
  });

  test('Add/remove on in memory collection', function() {
    var collection = new PostCollection(null, {processInMemory: true});

    collection.resetInMemory([]);
    equal(collection.size(), 0);

    collection.add(ExampleData.POSTS[0]);
    equal(collection.fetched, true);
    equal(collection.size(), 1);

    collection.load();
    equal(collection.size(), 1);

    collection.remove(collection.at(0));
    equal(collection.size(), 0);

    collection.load();
    equal(collection.size(), 0);
  });

  test('changing model then filtering in memory keeps changes', function() {
    var collection = new PostCollection(null, {processInMemory: true});

    this.ajaxResponse = {results: ExampleData.POSTS};
    var eventLog = new EventLog(collection);
    collection.load();
    equal(collection.at(0).get('active'), undefined);

    collection.at(0).set('active', true);
    collection.set('filter', {id: ExampleData.POSTS[0].id});
    collection.load();
    equal(collection.at(0).get('active'), true, 'should keep values after filtering');
  });

  test('setSort should retrigger load event on load', function() {
    this.ajaxResponse = {results: ExampleData.POSTS};

    var collection = new PostCollection();
    var eventLog = new EventLog(collection);
    collection.load();

    collection.setSort('body', 1);
    equal(collection.get('sortField'), 'body');
    equal(collection.get('sortDir'), 1);
    collection.load();
    equal(eventLog.counts.load, 2, 'should fire load again after sort');
  });

  test('Query params included in load url', function() {
    var CollectionWithQuery = PostCollection.extend({getQueryParams: function() {
      return {foo: '1'};
    }});
    var collection = new CollectionWithQuery();
    this.ajaxResponse = ExampleData.POSTS;
    collection.load();

    equal(this.syncArgs.options.data.foo, collection.getQueryParams().foo, 'request url should include query params');
  });

  test('View state', function(){
    var collection = new PostCollection();

    this.ajaxResponse = {results: ExampleData.POSTS, meta: {sortField: 'subject', sortDir: 1, page: 0, pageSize: 200}};
    collection.load();

    var queryParams = collection.getQueryParams();
    equal(queryParams.sortField, 'subject', 'query params should include view state');
    equal(queryParams.sortDir, 1, 'query params should include view state');

    var eventLog = new EventLog(collection);
    collection.set({sortField: 'body'});
    equal(eventLog.counts['change:sortField'], 1, 'should fire change event');
    collection.set({sortField: 'body'});
    equal(eventLog.counts['change:sortField'], 1, 'should not fire change when value is the same');
  });

  test('toViewJSON includes view state and items', function() {
    var collection = new PostCollection();

    this.ajaxResponse = {results: ExampleData.POSTS, meta: {sortField: 'subject', sortDir: 1, page: 0, pageSize: 200}};
    collection.load();

    var data = collection.toViewJSON();
    equal(data.sortField, 'subject');

    equal(data.items.length, ExampleData.POSTS.length, 'view json should include items');

  });

  test('Propagates item change event', function() {
    this.ajaxResponse = {results: ExampleData.POSTS};
    var collection = new PostCollection();
    collection.load();

    var eventLog = new EventLog(collection);

    collection.at(0).set('body', 'adfsdf');

    equal(eventLog.counts.change, 1, 'should propagate change event of item');
  });

  test('Filters', function() {
    var collection = new PostCollection(ExampleData.POSTS, {processInMemory: true});
    collection.onLoad();
    ok(collection.getRelated('filters') !== undefined, 'should have filters');

    collection.addFilter(
      new Filter({key: 'body', value: 'my body2', comparison: 'equals'}
    ));

    collection.updateInMemory();
    equal(collection.size(), 1, 'should filter all but one');
    collection.getFilters('body')[0].set({value: 'my body', comparison: 'contains'});
    collection.updateInMemory();
    equal(collection.size(), 3, 'all items should pass contains filter');

    collection.addFilter(new Filter({key: 'body', value: '2', comparison: 'contains'}));
    collection.updateInMemory();
    equal(collection.size(), 1, 'should apply multiple filters');

    equal(JSON.parse(collection.getQueryParams().filters)[0].value, 'my body', 'should include filters in query params');
  });
});