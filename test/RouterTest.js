/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var sinon = require('sinon');
var Environment = require('test/environment');
var ExampleData = require('example/ExampleData');

var Router = require('Router');

//use Environment to mock ajax
QUnit.module('Router', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  },

  teardown: function() {
    window.history.replaceState({}, '', '/');
  }
}));

test('navigating passes query params', function() {
  var router = new Router(),
    queryString = '?q=sdf',
    fragment = 'foos/1' + queryString;

  var qParam;
  router.route('foos/:id', 'foo_route', function(id, queryParams) {
    qParam = queryParams.q;
  });


  sinon.stub(router.history, 'navigate', function(fragment) {
    this.loadUrl(fragment);
  });
  router.navigate(fragment, {trigger: true});

  equal(qParam, 'sdf');
});
