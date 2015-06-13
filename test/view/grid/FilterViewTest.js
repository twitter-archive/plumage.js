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
  'view/grid/FilterView'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, FilterView) {


  //use Environment to mock ajax
  module('FilterView', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));
});
