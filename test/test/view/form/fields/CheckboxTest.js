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
  'view/form/fields/Checkbox'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, Checkbox) {


  //use Environment to mock ajax
  module('Checkbox', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createView(options) {
    options = options || {};
    return new Checkbox(_.extend({
      el: $('<div></div>'),
    }, options));
  }

  test('clicking changes value', function(){
    var field = createView();
    field.render();

    var el = field.getInputEl();
    el.attr('checked', 'true');
    field.getInputEl().trigger('change');
    equal(field.getValue(), true);

    el.removeAttr('checked');
    field.getInputEl().trigger('change');
    equal(field.getValue(), false);
  });

  test('renders correct state', function(){
    var field = createView();
    field.render();
    ok(!field.getInputEl().is(':checked'));

    field.setValue(true);
    field.render();
    ok(field.getInputEl().is(':checked'));
  });
});
