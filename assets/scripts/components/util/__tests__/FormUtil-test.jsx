/* eslint-env jest */
jest.dontMock('../FormUtil.jsx');
jest.dontMock('model/Model');
jest.dontMock('collection/Collection');

describe('FormUtil', function() {
  let FormUtil;
  let Model;
  let Collection;
  let state;
  let model;

  beforeEach(() => {
    FormUtil = require('../FormUtil.jsx');
    Model = require('model/Model');
    Collection = require('collection/Collection');
    state = {
      name: 'foo',
      address: {
        postalCode: 90210,
        city: 'LA'
      },
      apps: [
        {href: '/apps/1', name: 'app1'},
        {href: '/apps/2', name: 'app2'},
        {href: '/apps/3', name: 'app3'}
      ]
    };

    let ModelCls = Model.extend({
      relationships: {
        address: {
          modelCls: Model
        },
        apps: {
          modelCls: Collection
        }
      }
    });
    model = new ModelCls();

    model.set(state);
  });

  describe('update', function() {
    let result;
    beforeEach(function() {
      result = FormUtil.applyFormChanges(state, 'update', {
        name: 'bar',
        address: {city: 'SF'},
        extra: {deep: {field: 1}}
      });
    });


    it('updates attributes', function() {
      expect(result.name).toEqual('bar');
      expect(result.address.city).toEqual('SF');
    });

    it('creates new nested objects', function() {
      expect(result.extra.deep.field).toEqual(1);
    });

    it('does not change the original state object', function() {
      expect(state.name).toEqual('foo');
      expect(state.address.city).toEqual('LA');
    });
  });

  describe('delete', function() {
    let result;
    beforeEach(function() {
      result = FormUtil.applyFormChanges(state, 'delete', {
        name: true,
        address: {
          city: true
        },
        apps: {
          1: true
        }
      });
    });


    it('deletes attributes', function() {
      expect(result.name).toBeUndefined();
      expect(result.address.city).toBeUndefined();
    });

    it('does not change the original state object', function() {
      expect(state.name).toEqual('foo');
      expect(state.address.city).toEqual('LA');
      expect(state.apps.length).toEqual(3);
    });

    it('delete indexes from array', function() {
      expect(result.apps.length).toEqual(2);
      expect(result.apps[1].name).toEqual('app3');
    });
  });

  describe('update model', function() {
    beforeEach(function() {
      FormUtil.applyFormChangesToModel(model, 'update', {
        name: 'bar',
        address: {city: 'SF'},
        apps: {
          1: {
            name: 'qqq'
          }
        }
      });
    });

    it('updates attributes', function() {
      expect(model.get('name')).toEqual('bar');
      expect(model.getRelated('address').get('city')).toEqual('SF');
      expect(model.getRelated('apps').at(1).get('name')).toEqual('qqq');
    });
  });

  describe('delete model', function() {
    beforeEach(function() {
      FormUtil.applyFormChangesToModel(model, 'delete', {
        name: true,
        address: {
          city: true
        },
        apps: {
          1: true
        }
      });
    });

    it('deletes attributes', function() {
      expect(model.get('name')).toBeUndefined();
      expect(model.getRelated('address').get('city')).toBeUndefined();
    });

    it('deletes indexes from array', function() {
      let apps = model.getRelated('apps');
      expect(apps.size()).toEqual(2);
      expect(apps.at(1).get('name')).toEqual('app3');
    });
  });
});