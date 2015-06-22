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
  'view/form/fields/DurationField',
  'model/Model'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, DurationField, Model) {


  //use Environment to mock ajax
  QUnit.module('DurationField', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createView(options) {
    options = options || {};
    return new DurationField(_.extend({
      el: $('<div></div>')
    }, options));
  }

  test('Setting model results in correct unit', function(){
    var field = createView({valueAttr: 'duration'});
    var model = new Model({duration: 86400000});
    field.setModel(model);

    var data = field.getTemplateData();
    equal(data.units[2].selected, true);
    equal(data.value, 1);

    field = createView({valueAttr: 'duration'});
    model.set('duration', 3600000 * 12);
    field.setModel(model);

    data = field.getTemplateData();
    equal(data.units[1].selected, true);
    equal(data.value, 12);


    field = createView({valueAttr: 'duration'});
    model.set('duration', 60000 * 10);
    field.setModel(model);

    data = field.getTemplateData();
    equal(data.units[0].selected, true);
    equal(data.value, 10);
  });

  test('Updating model results in correct unit', function(){
    var field = createView({valueAttr: 'duration'});
    var model = new Model({duration: 86400000});
    field.setModel(model);

    field.render();

    model.set('duration', 3600000 * 12);
    var data = field.getTemplateData();
    equal(data.units[1].selected, true);
    equal(data.value, 12);
    equal(field.$('select').val(), data.units[1].value);

    model.set('duration', 60000 * 10);
    data = field.getTemplateData();
    equal(data.units[0].selected, true);
    equal(data.value, 10);
    equal(field.$('select').val(), data.units[0].value);

    model.set('duration', 86400000);
    data = field.getTemplateData();
    equal(data.units[2].selected, true);
    equal(data.value, 1);
    equal(field.$('select').val(), data.units[2].value);
  });

  test('get correct value from dom', function(){
    var field = createView();

    field.setValue(86400000);
    field.render();
    equal(field.getValueFromDom(), 86400000);
    field.$('select').val(3600000);
    equal(field.getValueFromDom(), 86400000);

    field.setValue(3600000 * 12);
    field.render();
    equal(field.getValueFromDom(), 3600000 * 12);
  });

  test('updates value from dom', function(){
    var field = createView();
    field.render();
    field.getInputEl().val(1);
    equal(field.getValueFromDom(), 60000);
  });

  test('can set large value as minutes', function(){
    var field = createView();
    field.render();

    equal(field.selectedUnit, 60000);

    field.getInputEl().val(14400); //10 days
    field.onBlur();
    equal(field.selectedUnit, 60000);
    equal(field.getValue(), 14400*60000);
  });
});
