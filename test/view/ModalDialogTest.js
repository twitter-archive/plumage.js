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
  'view/View',
  'view/ModalDialog'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, View, ModalDialog) {


  //use Environment to mock ajax
  module('ModalDialog', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createView(options) {
    options = options || {};
    return new ModalDialog(_.extend({
      className: 'test-dialog',
      contentView: new View()
    }, options));
  }

  test('render adds to dom', function(){
    var view = createView();
    view.render();
    ok(view.$el.closest('html').length > 0, 'should have been added to DOM');

    view.render();
    equal($('.test-dialog').length, 1, 'should be added to DOM once');

    view.remove();
    equal($('.test-dialog').length, 0, 'should remove');
  });

  test('show and hide', function(){
    var view = createView();
    view.show();
    ok(view.$el.closest('html').length > 0, 'should have been added to DOM');
    view.remove();
  });
});
