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
  'view/grid/GridView',
  'example/collection/PostCollection'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, GridView, PostCollection) {


  //use Environment to mock ajax
  module('GridView', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createModel() {
    return new PostCollection(ExampleData.POSTS);
  }

  function createView(options) {
    options = options || {};
    return new GridView(_.extend({
      el: $('<div></div>'),
      columns: [
        {id: 'index',  width: 30, cssClass: 'index'},
        {id: 'body', name: 'username', field: 'username', sortable: true},
        {id: 'date', name: 'date', field: 'date', sortable: true}
      ]
    }, options));
  }

  test('grid life cycle (not infinite scroll)', function(){
    var gridView = createView({infiniteScroll: false});
    var grid = gridView.grid;
    sinon.spy(grid, 'init');

    gridView.setModel(createModel());

    //render
    gridView.render();

    ok(gridView.gridEl.hasClass('grid'), 'should have rendered grid el');
    ok(grid.init.notCalled, 'slickgrid can not handle having init called outside the dom');

    //show
    gridView.onShow();
    ok(grid.init.calledOnce, 'should call init on show');

    gridView.onShow();
    ok(grid.init.calledOnce, 'only call init on first show');

    //model load
    sinon.spy(grid, 'invalidate');
    gridView.model.trigger('load', {data: {sortField: 'body', sortDir: '1'}});
    ok(grid.invalidate.calledOnce, 'non-infinite scroll should invalidate on load');
  });

  test('grid life cycle (infinite scroll)', function(){
    var gridView = createView({infiniteScroll: true});
    var grid = gridView.grid;

    var model = new PostCollection([], {meta: {pageSize: 1}});
    gridView.setModel(model);

    //render
    gridView.render();

    //show
    gridView.onShow();

    //model load
    sinon.spy(grid, 'invalidate');
    sinon.spy(grid, 'invalidateRow');

    this.ajaxResponse = {results: [ExampleData.POSTS[0]], meta: {total: 4}};
    grid.getData().ensureData(0, 0);
    ok(grid.invalidate.notCalled, 'infinite scroll should not invalidate the entire grid');
    ok(grid.invalidateRow.calledOnce, 'should invalidate loaded rows');

    this.ajaxResponse = {results: [ExampleData.POSTS[1]], meta: {total: 4}};
    grid.getData().ensureData(1, 1);
    ok(grid.invalidateRow.calledTwice, 'should invalidate loaded rows');
  });

  test('shows no data message (not infinite scroll)', function(){
    var gridView = createView({infiniteScroll: false});
    var grid = gridView.grid;
    var model =  new PostCollection([]);
    gridView.setModel(model);
    gridView.render();

    model.onLoad();

    equal(gridView.noDataEl.css('display'), 'block', 'should show noData when there are no rows');
  });

  test('Sort should get request with sort params', function() {
    var gridView = createView({infiniteScroll: false});
    var grid = gridView.grid;
    var model =  createModel();
    gridView.setModel(model);

    this.ajaxResponse = {results: ExampleData.POSTS, meta: {total: 4}};
    model.load();

    var eventLog = new EventLog(model);
    sinon.stub(model, 'updateUrl');

    gridView.onSort({}, {sortAsc: true, sortCol: {field: 'body'}});
    equal(eventLog.counts.change, 1, 'should trigger change on sort');
    equal(model.get('sortField'), 'body', 'should set sortField');
  });

  test('Grid should get set sort based on response meta', function() {
    var gridView = createView({infiniteScroll: false});
    var grid = gridView.grid;
    var model =  createModel();
    gridView.setModel(model);

    this.ajaxResponse = {results: ExampleData.POSTS, meta: {total: 4, sortField: 'date', sortDir: -1}};
    model.load();
    equal(grid.getSortColumns()[0].columnId, 'date', 'sort column should have been set');
    equal(grid.getSortColumns()[0].sortAsc, false, 'sort dir should have been set');

    this.ajaxResponse = {results: ExampleData.POSTS, meta: {total: 4, sortField: 'username', sortDir: 1}};
    model.load();
    equal(grid.getSortColumns()[0].columnId, 'username', 'sort column should have been set');
    equal(grid.getSortColumns()[0].sortAsc, true, 'sort dir should have been set');
  });

});
