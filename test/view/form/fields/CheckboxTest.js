/* globals $, _ */
/* globals QUnit, test, asyncTest, expect, start, stop, ok, equal, notEqual, deepEqual */

var Environment = require('test/environment');
var Checkbox = require('view/form/fields/Checkbox');
var Post = require('example/model/Post');

//use Environment to mock ajax
QUnit.module('Checkbox', _.extend(new Environment(), {
  setup: function() {
    Environment.prototype.setup.apply(this, arguments);
  }
}));

function createView(options) {
  options = options || {};
  return new Checkbox(_.extend({
    valueAttr: 'foo',
    el: $('<div></div>'),
  }, options));
}

test('renders name', function() {
  var field = createView();
  field.render();
  equal(field.getInputEl().attr('name'), field.valueAttr, 'renders name attribute');
});

test('clicking changes value', function(){
  var field = createView();
  field.render();

  field.getInputEl().attr('checked', 'true');
  field.getInputEl().trigger('change');
  equal(field.getValue(), true);

  field.getInputEl().removeAttr('checked');
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

test('uses valueAttr value from model', function(){
  var field = createView({valueAttr: 'foo'});
  var model = new Post({foo: true});
  field.setModel(model);
  field.render();

  ok(field.getInputEl().is(':checked'));
  model.set('foo', false);

  ok(!field.getInputEl().is(':checked'));
});

test('checkedValue', function(){
  var field = createView({valueAttr: 'foo', checkedValue: 1, uncheckedValue: 0});

  var model = new Post({foo: 1});
  field.setModel(model);
  field.render();

  ok(field.getInputEl().is(':checked'));
  field.updateModel(model);
  equal(model.get('foo'), 1, 'should set model to checked value');

  field.getInputEl().removeAttr('checked').trigger('change');
  field.updateModel(model);
  equal(model.get('foo'), 0, 'should set model to unchecked value');

  model.set('foo', 2);
  ok(!field.getInputEl().is(':checked'), 'unknown value is unchecked');
  model.set('foo', 1);
  ok(field.getInputEl().is(':checked'));
});


