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
  'example/model/Post',
  'example/collection/CommentWithPostCollection'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, Post) {


  //use Environment to mock ajax
  module('Model', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    },
    afterEach: function() {
      window.router = undefined;
    }
  }));

  var PostRemote = Post.extend({relationships: _.clone(Post.prototype.relationships)});
  PostRemote.prototype.relationships.comments = _.extend({}, PostRemote.prototype.relationships.comments, {remote: true});

  test('Can instantiate', function(){
    var model = new Post();
    model.set({id: 1, body: 'my body'});
    equal(model.get('body'), 'my body');
  });

  //
  // Url
  //


  test('uses href for url', function(){
    var model = new Post({href: '/foo'});
    equal(model.url(), '/foo');
  });

  test('combines query params from href and view state', function(){
    var model = new Post({href: '/foo?a=1', bar: 'baz'});
    model.viewAttrs = ['bar'];
    equal(model.urlWithParams(), '/foo?a=1&bar=baz');
  });

  test('navigate and updateUrl use viewUrl', function() {
    var PostWithViewUrl = Post.extend({
      viewUrlWithParams: function() {return '/bar';}
    });

    var model = new PostWithViewUrl({
      href: '/foo'
    });

    window.router = {navigateWithQueryParams: sinon.spy()};

    model.navigate();
    equal(window.router.navigateWithQueryParams.getCall(0).args[0], '/bar');

    model.updateUrl();
    equal(window.router.navigateWithQueryParams.getCall(1).args[0], '/bar');
  });

  //
  // Relationships
  //

  test('Can instantiate related', function(){
    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_RELATED};

    //try both set and fetch
    for (var i=0; i<2; i++) {
      var model = new Post();
      var eventLog = new EventLog(model);
      if (i===0) {
        model.set(ExampleData.POST_DATA_WITH_RELATED);
        model.onLoad();
      } else {
        model.load();
      }

      equal(eventLog.counts.load, 1, 'should fire load event');

      var comments = model.getRelated('comments');
      var comment1 = comments.at(0);
      var user1 = comment1.getRelated('user');

      equal(model.get('body'), 'my body');
      equal(comments.size(), 2);
      equal(comments.at(1).get('id'), 6);
      equal(comments.getRelated('post'), model);
      equal(comment1.get('body'), 'my comment');
      equal(comment1.getRelated('post'), model);

      equal(user1.get('username'), 'user1');

      equal(comments.fetched, true, 'relations should be marked as fetched');
      equal(comment1.fetched, true, 'relations should be marked as fetched');
    }
  });

  test('Can instantiate related href', function(){
    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_RELATED_HREFS};
    var model = new Post();
    model.set(ExampleData.POST_DATA_WITH_RELATED_HREFS);
    equal(model.getRelated('author').url(), '/author_href/7');
    equal(model.getRelated('comments').url(), '/comments_href');
  });

  test('Can instantiate related collection with attributes', function(){
    var model = new Post();
    model.set(ExampleData.POST_DATA_WITH_COMMENTS_WITH_ATTRIBTES);
    equal(model.getRelated('comments').url(), '/comments_href');
    equal(model.getRelated('comments').size(), 2);
  });

  test('Can instantiate remote related collection with href', function(){
    var model = new PostRemote();
    model.set(ExampleData.POST_DATA_WITH_RELATED_HREFS);
    equal(model.getRelated('comments').url(), '/comments_href');
  });

  //
  // Loading
  //

  test('Related collection fires load', function(){
    var model = new Post({comments: []});
    var eventLog = new EventLog([model, model.getRelated('comments')]);
    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_RELATED};

    model.load();

    equal(eventLog.counts.load, 2, 'both model and related collection should fire load');
    equal(eventLog.log[0].emitter, model, 'model should fire load first');
    equal(eventLog.log[1].emitter, model.getRelated('comments'), 'collection should fire load second');
  });

  asyncTest('Does not load again while already loading', function(){
    var model = new Post({comments: []});
    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_RELATED};
    this.ajaxAsync = true;

    model.load({success: function() {
      equal(this.ajaxCount, 1, 'should not load while loading');
      start();
    }.bind(this)});

    model.load({success: function() {
      ok(false, 'should not load again');
    }});

    this.ajaxAsync = false;
  });

  test('setting other variables does not affect related models', function() {
    var model = new Post({comments: []});
    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_RELATED};
    model.load();

    model.set('foo', 'bar');
    equal(model.getRelated('comments').size(), ExampleData.POST_DATA_WITH_RELATED.comments.length);

    // again with force create

    var PostForce = Post.extend({relationships: _.clone(Post.prototype.relationships)});
    PostForce.prototype.relationships.comments = _.extend({}, PostForce.prototype.relationships.comments, {
      forceCreate: true
    });

    model = new PostForce(ExampleData.POST_DATA_WITH_RELATED);
    model.load();

    model.set('foo', 'bar');
    equal(model.getRelated('comments').size(), ExampleData.POST_DATA_WITH_RELATED.comments.length);

  });

  test('load events happen in correct order', function() {
    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_RELATED};
    for (var i=0; i<2; i++) {
      var model = new Post({comments: []});

      var eventLog = new EventLog([model, model.getRelated('comments')]);

      if (i===0) {
        model.set(ExampleData.POST_DATA_WITH_RELATED);
        model.onLoad();
      } else {
        model.load();
      }
      equal(eventLog.counts.load, 2, 'both load');
      var loadEvents = _.where(eventLog.log, {event: 'load'});
      equal(loadEvents[0].emitter, model, 'root model fires load first');
      equal(loadEvents[1].emitter, model.getRelated('comments'), 'children fire load after');
    }
  });

  test('Loading', function(){
    var post = new Post(ExampleData.POST_DATA);
    equal(post.fetched, false);

    var eventLog = new EventLog(post);
    post.load();

    equal(post.fetched, true);
    equal(eventLog.counts.beginLoad, 1, 'beginLoad should have been triggered');
    equal(eventLog.counts.load, 1, 'load should have been triggered');
    equal(this.ajaxCount, 1, 'fetch should make an async call');
  });

  test('Load error', function(){
    var post = new Post();
    var eventLog = new EventLog(post);

    this.ajaxResponseStatus = 'error';

    var errorHandler = sinon.spy();
    post.load({error: errorHandler});

    equal(post.fetched, false);
    equal(eventLog.counts.error, 1, 'error should have been triggered');
    ok(errorHandler.calledOnce, 'error handler should have been called');
  });

  test('Remote relationship', function(){
    PostRemote.prototype.relationships.comments.deferLoad = false;
    var post = new PostRemote(ExampleData.POST_DATA_WITH_EMPTY_COMMENTS);
    var comments = post.getRelated('comments');
    sinon.spy(comments, 'resetInMemory');
    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_EMPTY_COMMENTS};
    post.load();

    ok(!comments.resetInMemory.called, 'remote relationship should not be reset in memory');
    equal(this.ajaxCount, 2, 'should fetch both parent and remote children');

    PostRemote.prototype.relationships.comments.deferLoad = true;
    post = new PostRemote(ExampleData.POST_DATA_WITH_EMPTY_COMMENTS);
    post.load();

    equal(this.ajaxCount, 3, 'Should not fetch remote children with deferLoad');

    ok(!post.getRelated('comments').fetched, 'defered load children should not be fetched');
  });

  test('Defer load of remote relationship', function(){
    PostRemote.prototype.relationships.comments.deferLoad = true;
    var post = new PostRemote(ExampleData.POST_DATA_WITH_RELATED);
    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_RELATED};

    equal(post.getRelated('comments').deferLoad, true, 'should flag model as defer load');

    post.load();

    equal(this.ajaxCount, 1, 'should fetch both parent and remote children');

    equal(post.getRelated('comments').deferLoad, true, 'should flag model as defer load');
  });

  test('Force create relationship', function(){
    var post = new Post(ExampleData.POST_DATA);
    equal(post.getRelated('comments'), undefined, 'should not created related comments unless forced');

    var PostForce = Post.extend({relationships: _.clone(Post.prototype.relationships)});
    PostForce.prototype.relationships.comments = _.extend({}, PostForce.prototype.relationships.comments, {
      forceCreate: true
    });

    post = new PostForce(ExampleData.POST_DATA);
    var comments = post.getRelated('comments');
    var commentEventCount = this.countEvents(comments);

    equal(comments.size(), 0, 'should have force created related comments');
    equal(comments.fetched, false, 'force created model should not have fetched flag set');

    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_RELATED};
    post.load();

    equal(commentEventCount.load, 1, 'original comments should fire load');
  });

  test('Circular Relationship', function() {
    var PostCirc = Post.extend({relationships: _.clone(Post.prototype.relationships)});
    PostCirc.prototype.relationships.comments = _.extend({}, PostCirc.prototype.relationships.comments, {
      modelCls: 'example/collection/CommentWithPostCollection'
    });

    this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_RELATED};

    for (var i=0; i<2; i++) {
      var model = new PostCirc();
      if (i===0) {
        model.set(ExampleData.POST_DATA_WITH_RELATED);
        model.onLoad();
      } else {
        model.load();
      }
      var comments = model.getRelated('comments');
      var comment1 = comments.at(0);

      equal(comment1.fetched, true);
    }
  });

  test('Relationship with no data in response should be considered fetched', function() {
    var post = new Post({comments: []});
    this.ajaxResponse = ExampleData.POST_DATA;

    var eventCount = this.countEvents(post.getRelated('comments'));

    equal(post.getRelated('comments').fetched, false);
    post.load();
    equal(post.getRelated('comments').fetched, true);
    equal(eventCount.load, '1', 'Comments should fire load');
  });

  test('Query params included in load url', function() {
    var PostWithQuery = Post.extend({getQueryParams: function() {
      return {foo: '1'};
    }});
    var post = new PostWithQuery({comments: []});
    this.ajaxResponse = ExampleData.POST_DATA;
    post.load();

    equal(this.syncArgs.options.data.foo, post.getQueryParams().foo, 'request url should include query params');

    post.load({data:{bar: '2'}});
    deepEqual(this.syncArgs.options.data, {foo: '1', bar: '2'}, 'request url should include data option');
  });

  test('View state', function(){
    var PostWithViewState = Post.extend({viewAttrs: ['tab', 'filter']});

    var post = new PostWithViewState();

    this.ajaxResponse = ExampleData.POST_WITH_VIEW_STATE;
    post.load();
    var tab = ExampleData.POST_WITH_VIEW_STATE.tab;
    var queryParams = post.getQueryParams();
    equal(queryParams.tab, tab, 'query params should include view state');

    var postJson = post.toJSON();
    equal(postJson.tab, undefined, 'should not include view state in json to persist');

    postJson = post.toViewJSON();
    equal(postJson.tab, tab, 'should include view state in view json');

    equal(post.get('tab'), tab);

    var eventLog = new EventLog(post);
    post.set('tab');
    equal(eventLog.counts['change:tab'], 1, 'should fire change event');
  });

  test('urlWithParams accepts overrides', function() {
    var PostWithViewState = Post.extend({viewAttrs: ['tab', 'filter']});

    var post = new PostWithViewState(ExampleData.POST_WITH_VIEW_STATE);
    equal(post.urlWithParams(), '/posts/1?tab=detail');
    equal(post.urlWithParams({foo: 'bar', tab: 'foo'}), '/posts/1?tab=foo&foo=bar', 'should override view params');
  });

  test('display name', function() {

    var post = new Post({name: 'foo'});
    equal(post.getDisplayName(), undefined);
    equal(post.toViewJSON().displayName, undefined);

    var PostWithDisplayName = Post.extend({displayNameAttr: 'name'});
    post = new PostWithDisplayName({name: 'foo'});
    equal(post.getDisplayName(), 'foo');
    equal(post.toViewJSON().displayName, 'foo', 'should include displayName in view json');
  });

  //
  // Saving
  //

  test('saving', function() {
    var post = new Post();
    post.set(ExampleData.POST_DATA);
    var eventLog = new EventLog(post);

    this.ajaxResponse = {
      meta: {success: true},
      result: ExampleData.POST_DATA
    };
    post.save();
    equal(eventLog.counts.load, 1, 'should fire load on save');

    // save failed
    this.ajaxResponse = {
      meta: {success: false, message_body: 'oops', message_class: 'bad'}
    };

    post.save();
    equal(eventLog.counts.load, 1, 'should not fire load again');
    equal(eventLog.counts.invalid, 1, 'should fire invalid');

    this.ajaxResponse = {
      meta: {success: false, validationError: {'body':'too short'}}
    };
    post.save();
    equal(eventLog.counts.load, 1, 'should not fire load again');
    equal(eventLog.counts.invalid, 2, 'should fire invalid');
  });


//  test('Relationship with getParams', function() {
//    var PostParams = Post.extend({relationships: _.clone(Post.prototype.relationships)});
//    PostForce.prototype.relationships.comments = _.extend({}, PostForce.prototype.relationships.comments, {
//      getParams: function(parent) {}});
//
//
//  });

});