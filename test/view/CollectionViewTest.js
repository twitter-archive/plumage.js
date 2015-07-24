/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var sinon = require('sinon');
var Environment = require('test/environment');
var ExampleData = require('example/ExampleData');

var CollectionView = require('view/CollectionView');
var NoRenderModelView = require('example/view/NoRenderModelView');

var Post = require('example/model/Post');
var User = require('example/model/User');

QUnit.module('CollectionView', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));

var PostRemote = Post.extend({relationships: _.clone(Post.prototype.relationships)});
PostRemote.prototype.relationships.comments = _.extend({}, PostRemote.prototype.relationships.comments, {
  remote: 'loadOnShow'
});

function createView(options) {
  options = options || {};
  return new CollectionView(_.extend({
    el: $('<div></div>'),
    relationship: 'comments',
    itemViewCls: NoRenderModelView
  }, options));
}

test('creates and binds subviews', function (){

  var view = createView();
  view.setModel(new Post(ExampleData.POST_DATA_WITH_RELATED));
  var comments = view.model;

  view.render();
  equal(view.itemViews.length, comments.size(), 'creates the right number of subviews');

  var itemView1 = view.itemViews[0];
  var comment1 = comments.at(0);

  equal(view.itemViews[0].model.id, comments.at(0).id, 'sets the submodels in order');
  equal(view.itemViews[1].model.id, comments.at(1).id, 'sets the submodels in order');
});

test('recurses view calls', function () {
  var view = createView();
  view.setModel(new Post(ExampleData.POST_DATA_WITH_RELATED));
  var comments = view.model;

  view.render();

  var itemView1 = view.itemViews[0];

  sinon.spy(itemView1, 'onShow');
  view.onShow();
  ok(itemView1.onShow.calledOnce);

  sinon.spy(itemView1, 'onHide');
  view.onHide();
  ok(itemView1.onHide.calledOnce);

  sinon.spy(itemView1, 'remove');
  view.onModelDestroy(itemView1.model);
  ok(itemView1.remove.calledOnce);
});

test('shows empty text when appropriate', function () {
  var view = createView();

  view.render();
  equal(view.$('.items').html(), view.emptyTemplate(), 'show empty if no model');

  view.setModel(new PostRemote(ExampleData.POST_DATA_WITH_EMPTY_COMMENTS));
  var comments = view.model;

  view.render();
  equal(view.$('.items').html(), '', 'do not show empty text before fetch');

  this.ajaxResponse = {results: []};
  view.onShow();
  equal(view.$('.items').html(), view.emptyTemplate(), 'do show empty if fetch returned empty');

  this.ajaxResponse = {results: ExampleData.POST_DATA_WITH_EMPTY_COMMENTS.comments};
  comments.fetch();
  equal(view.itemViews.length, comments.size());
});

test('render template if available', function () {
  var template = sinon.stub().returns('foo');
  var view = createView({template: template});
  view.render();

  ok(template.calledOnce, 'should use template if available');
});

test('renders on load, not on change', function () {
  // CollectionView should render on load, to render item views.
  // Collections don't trigger change, but they do propagate change events from its items.
  // These changes should not trigger rendering of the CollectionView.
  var view = createView();
  var model = new Post(ExampleData.POST_DATA_WITH_RELATED);
  view.setModel(model);
  view.render();

  sinon.spy(view, 'render');
  model.onLoad();

  ok(view.render.calledOnce, 'should call render on load');

  var comment = model.getRelated('comments').at(0);
  comment.trigger('change', comment);

  ok(view.render.calledOnce, 'should not call render on change');
});