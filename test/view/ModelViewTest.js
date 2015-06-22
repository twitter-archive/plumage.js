/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'sinon',
  'test/environment',
  'test/EventLog',
  'test/DummyEvent',
  'view/View',
  'view/ModelView',
  'view/ContainerView',
  'model/Model',
  'example/model/Post',
  'example/collection/PostCollection',
  'example/model/User',
  'example/ExampleData'
], function($, _, Backbone, sinon, Environment, EventLog, DummyEvent, View, ModelView, ContainerView, Model, Post, PostCollection, User, ExampleData) {


  //use Environment to mock ajax
  QUnit.module('ModelView', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  var PostRemote = Post.extend({relationships: _.clone(Post.prototype.relationships)});
  PostRemote.prototype.relationships.comments = _.extend({}, PostRemote.prototype.relationships.comments, {
    remote: 'loadOnShow'
  });

  test('test model binding', function(){
    var model = new Post(ExampleData.POST_DATA_WITH_RELATED);
    var view = new ModelView();
    sinon.spy(view, 'onModelChange');
    sinon.spy(view, 'onModelLoad');

    view.setModel(model);
    ok(!view.onModelLoad.called, 'should not fire load on set unlead');

    model.trigger('change');
    ok(view.onModelChange.calledOnce, 'should handle change event');

    model.trigger('load');
    ok(view.onModelLoad.calledOnce, 'should handle load event');

    var newModel = new Post(ExampleData.POST_DATA_WITH_RELATED);
    newModel.onLoad();

    view.setModel(newModel);
    ok(view.onModelLoad.calledOnce, 'do not fire load when setting model with same id');

    model.trigger('load');
    ok(view.onModelLoad.calledOnce, 'stop listening to old model');

    newModel.trigger('load');
    ok(view.onModelLoad.calledTwice, 'start listening to new model');

    view.remove();
    newModel.trigger('load');
    ok(view.onModelLoad.calledTwice, 'stop listening after being removed');

    view.setModel(undefined);
    equal(view.model, undefined, 'should successfully set model to null');

  });

  test('Ignore setting wrong model class', function() {
    var model = new Post(ExampleData.POST_DATA_WITH_RELATED);

    var view = new ModelView({relationship: 'author'});
    view.setModel(model);

    equal(view.model, model.getRelated('author'), 'should set related model correctly');

    view.model = undefined;
    view.modelCls = Post;
    view.setModel(model);
    equal(view.model, undefined, 'should ingnore inconrrect modelCls');

    view.modelCls = User;
    view.setModel(model);
    equal(view.model, model.getRelated('author'), 'should set related model correctly');
  });

  test('Ignore setting wrong root model class', function() {
    var model = new Post(ExampleData.POST_DATA_WITH_RELATED);
    var view = new ModelView({rootModelCls: User, relationship: 'author'});

    view.setModel(model);
    equal(view.model, undefined, 'should ingnore inconrrect rootModelCls');

    view.rootModelCls = Post;
    view.setModel(model);
    equal(view.model, model.getRelated('author'), 'should successfully set correct rootModelCls');
  });

  test('Set with relationship', function() {
    var model = new Post(ExampleData.POST_DATA_WITH_RELATED);
    var author = model.getRelated('author');
    var company = author.getRelated('company');
    var view = new ModelView({
      defaultSubViewCls: ModelView,
      modelCls: User,
      relationship: 'author',
      subViews: [
        {relationship: 'author.company'},
        {relationship: '.company'}
      ]
    });

    view.setModel(model);

    equal(view.model.id, author.id, 'should correctly set related as model');
    equal(view.subViews[0].model, company, 'should correctly set nested related as model');
    equal(view.subViews[0].model, company, 'should correctly set relative related as model');
  });

  test('Do not render on load until rendered', function() {
    var model = new Post(ExampleData.POST_DATA_WITH_RELATED);
    var onRenderSpy = sinon.spy();
    var view = new ModelView({onRender: onRenderSpy});

    view.setModel(model);

    model.trigger('load');
    ok(!onRenderSpy.called, 'not rendered, so no render on load');

    view.render();
    model.trigger('load');
    ok(onRenderSpy.calledTwice, 'after render, so render on load');
  });

  test('onShow triggers loadOnShow', function() {
    var model = new PostRemote(_.extend({}, ExampleData.POST_DATA, {comments: []}));
    var comments = model.getRelated('comments');
    sinon.spy(comments, 'fetchIfAvailable');

    var view = new ModelView({relationship: 'comments', onRender: function(){}});
    view.setModel(model);

    equal(model.fetched, false);
    view.onShow();
    ok(comments.fetchIfAvailable.calledOnce, 'should fetch on show');

    view.onHide();
    view.onShow();
    ok(comments.fetchIfAvailable.calledOnce, 'should not fetch twice');

    view.model = null;
    comments.loadOnShow = true;
    comments.fetched = false;
    view.setModel(model);
    ok(comments.fetchIfAvailable.calledTwice, 'If view is already shown, fetch on setModel');
  });

  test('setModel sets model on subviews', function() {
    var post = new Post(ExampleData.POST_DATA_WITH_RELATED);
    var author = post.getRelated('author');
    var view = new ModelView({
      subViews: [
        new ContainerView({
          subViews: [
            new ModelView({
              relationship: 'author'
            })
          ]
        })
      ]
    });

    view.setModel(post);
    equal(view.subViews[0].subViews[0].model, author);
  });

  test('test build subviews', function(){
    var view = new ModelView({
      template: '<div class="section1"></div>',
      subViews: [{
        selector: '.section1',
        template: '<div>foo</div>'
      }]
    });

    ok(view.subViews[0] instanceof View, 'should instantiate subviews');
  });

  test('onLinkClick short circuits view state only navigation', function() {
    var model = new PostCollection();
    var view = new ModelView();
    view.setModel(model);

    var eventLog = new EventLog(model);

    sinon.stub(model, 'updateUrl');
    view.onLinkClick(new DummyEvent('click', $('<a href="?sortField=foo">foo</a>')));
    equal(model.get('sortField'), 'foo', 'should set view state');
    ok(eventLog.counts.load === undefined, 'should not trigger load');
    equal(eventLog.counts.change, 1, 'should trigger change');

  });

});