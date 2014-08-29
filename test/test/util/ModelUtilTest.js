/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'test/environment',
  'model/Model',
  'util/ModelUtil'
], function($, _, Environment, Model, ModelUtil) {


  //use Environment to mock ajax
  module('ModelUtil', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  test('merge', function(){
    var modelCls = Model.extend({
      config: {
        foo: {
          bar: 1,
          boop: 1
        }
      }
    });

    var model = new modelCls();
    ModelUtil.mergeOption('config', model, {config: {foo: {baz: 2, boop:2}}});
    equal(model.config.foo.bar, 1, 'should keep original value');
    equal(model.config.foo.baz, 2, 'should include new');
    equal(model.config.foo.boop, 2, 'should override copy');
  });

  test('mergeDeep', function(){
    var modelCls = Model.extend({
      config: {
        foo: {
          bar: 1,
          boop: 1
        }
      }
    });

    var modelCls2 = modelCls.extend({
      config: {
        foo: {
          baz: 2,
          boop:2
        }
      }
    });

    var model = new modelCls2();
    ModelUtil.mergeOption('config', model, {}, true);
    equal(model.config.foo.bar, 1, 'should keep original value');
    equal(model.config.foo.baz, 2, 'should include new');
    equal(model.config.foo.boop, 2, 'should override copy');
  });

  test('parseQueryString decodes +', function(){
    var queryString = 'q=sdf+sdf';
    var params = ModelUtil.parseQueryString(queryString);
    equal(params.q, 'sdf sdf', 'should remove + from query');
  });
});
