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
  'view/NavView'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, NavView) {


  //use Environment to mock ajax
  QUnit.module('NavView', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createView(options) {
    options = options || {};
    return new NavView(_.extend({
      el: $('<div></div>')
    }, options));

  }

  test('expand and contract searchfield', function() {
    var navView = createView();
    navView.render();
    navView.onSearchValueChange();
    ok(navView.$('.right-nav').hasClass('expand-search'), 'should expand search view');

    navView.onSearchBlur();
    ok(!navView.$('.right-nav').hasClass('expand-search'), 'should contract search');
  });
});
