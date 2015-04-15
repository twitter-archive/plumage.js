/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'sinon',
  'test/environment',
  'test/EventLog',
  'controller/ModelController',
  'view/controller/IndexView',
  'example/view/NoRenderModelView',
  'example/ExampleData',
  'example/model/Post',
  'example/collection/PostCollection'
], function($, _, Backbone, sinon, Environment, EventLog, ModelController, IndexView,
    NoRenderModelView, ExampleData, Post) {


  //use Environment to mock ajax
  module('ModelController', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createModelController() {
    var app = {views: {}};
    return new ModelController(app, {
      modelCls: 'example/model/Post',
      indexModelCls: 'example/collection/PostCollection',
      detailViewCls: NoRenderModelView,
      indexViewCls: IndexView,
      indexModelOptions: {foo:true}
    });
  }

  test('show views', function() {
    var ctrl = createModelController();
    sinon.spy(ctrl, 'showView');

    this.ajaxResponse = ExampleData.POSTS;
    ctrl.showIndex();

    ok(ctrl.showView.calledOnce, 'show view');
    ok(ctrl.getIndexCollection().fetched, 'should create and fetch index model');
    ok(ctrl.getIndexCollection().foo, 'should set indexModelOptions on index model');
    ok(ctrl.getIndexView(), 'should create index view');
    ok(ctrl.getIndexView().shown, 'should show index view');

    this.ajaxResponse = ExampleData.POST_DATA;
    ctrl.showDetail(1);

    ok(ctrl.showView.calledTwice, 'show view');
    ok(ctrl.getDetailModel().fetched, 'should create and fetch detail model');
    ok(ctrl.getDetailView(), 'should create detail view');
    ok(ctrl.getDetailView().shown, 'should show detail view');
    ok(!ctrl.getIndexView().shown, 'should hide index view');

    ok(ctrl.showView.calledTwice, 'do not show if already shown');
  });

  asyncTest('update url on model change', function() {
    var ctrl = createModelController();

    this.ajaxResponse = ExampleData.POSTS;
    ctrl.runHandler('showIndex').then(function(){
      equal(ctrl.getIndexCollection(), ctrl.activeModel, 'showIndex sets activeModel');
      start();
    });

    //this.ajaxResponse = ExampleData.POST_DATA;
    //ctrl.runHandler('showDetail');
    //equal(ctrl.getDetailModel(), ctrl.activeModel, 'showDetail sets activeModel');
  });

  test('current model updates url on change', function() {
    var ctrl = createModelController();
    var model = new Post();
    sinon.spy(model, 'updateUrl');
    ctrl.setActiveModel(model);
    model.trigger('change');
    ok(model.updateUrl.calledOnce);
  });

  test('showDetail is idempotent for same model', function() {
    var ctrl = createModelController();
    sinon.spy(ctrl, 'showView');


    this.ajaxResponse = ExampleData.POST_DATA;
    ctrl.showDetail(1);
    ok(ctrl.showView.calledOnce);

    sinon.spy(ctrl.getDetailView(), 'setModel');

    ctrl.showDetail(1);
    ok(ctrl.showView.calledTwice);
    ok(ctrl.getDetailView().setModel.notCalled);
    equal(this.ajaxCount, 1, 'should not load same model twice');
  });
});
