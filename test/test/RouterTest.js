/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'sinon',
  'test/environment',
  'test/EventLog',
  'example/ExampleData',
  'Router'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, Router) {


  //use Environment to mock ajax
  module('Router', _.extend(new Environment(), {
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

    router.start();
    router.navigate(fragment, {trigger: true});

    equal(qParam, 'sdf');
  });


  test('parseQueryString decodes +', function(){
    var router = new Router(),
      queryString = 'q=sdf+sdf';
    var params = router.parseQueryString(queryString);
    equal(params.q, 'sdf sdf', 'should remove + from query');
  });

});
