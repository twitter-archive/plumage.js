/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var sinon = require('sinon');
var Environment = require('test/environment');

var View = require('view/View');
var TabView = require('view/TabView');

var Post = require('example/model/Post');

//use Environment to mock ajax
QUnit.module('TabView', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  },
  afterEach: function() {
    window.router = undefined;
  }
}));

function createView(options) {
  options = options || {};
  return new TabView(_.extend({
    el: $('<div><div class="tab1"></div><div class="tab2"></div></div>'),
    subViews: [
      new View({selector:'.tab1', tabId: 'tab1', className: 'tab-pane', template: 'tab1'}),
      new View({selector:'.tab2', tabId: 'tab2', className: 'tab-pane', template: 'tab2'})
    ]
  }, options));
}

test('setModel', function(){
  var view = createView();
  view.setModel(new Post());
  view.model.updateUrl = sinon.stub();

  equal(view.model.get('tab'), 'tab1', 'should set model tab');

  view.setActiveTab('tab2');
  equal(view.model.get('tab'), 'tab2', 'should set model tab');
});

test('logTabNavigation', function() {

  var view = createView();
  view.setModel(new Post());
  view.model.updateUrl = sinon.stub();
  view.setActiveTab('tab2'); //ok with no router?

  try {
    window.router = {logNavigationAction: sinon.spy()};

    view.setActiveTab('tab1');
    ok(window.router.logNavigationAction.notCalled);

    view.logTabNavigation = true;
    view.setActiveTab('tab2');
    ok(window.router.logNavigationAction.calledOnce);

    view.setActiveTab('tab2');
    ok(window.router.logNavigationAction.calledOnce, 'log only on tab change');
  } finally {
    window.router = undefined;
  }
});
