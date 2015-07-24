/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var Environment = require('test/environment');

var View = require('view/View');
var ModalDialog = require('view/ModalDialog');

//use Environment to mock ajax
QUnit.module('ModalDialog', _.extend(new Environment(), {
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
