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
  'view/form/fields/TypeAhead'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, TypeAhead) {


  //use Environment to mock ajax
  QUnit.module('view/form/fields/TypeAhead', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));
});
