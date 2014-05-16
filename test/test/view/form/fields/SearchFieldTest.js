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
  'view/form/fields/SearchField'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, SearchField) {


  //use Environment to mock ajax
  module('SearchField', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createView(options) {
    options = options || {};
    return new SearchField(_.extend({
      el: $('<div></div>'),
    }, options));
  }

  test('triggers submit', function(){
    var field = createView();
    field.render();
    var eventLog = new EventLog(field);

    field.$('button').click();
    equal(eventLog.counts.submit, 1, 'should fire trigger event');

    var event = $.Event('keydown');
    event.keyCode = 13;
    var input = field.getInputEl().trigger(event);
    equal(eventLog.counts.submit, 2, 'should fire trigger event');
  });
});
