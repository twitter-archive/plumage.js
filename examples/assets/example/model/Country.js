var Plumage = require('plumage');
var City = require('example/model/City');

module.exports = Plumage.model.Model.extend({
  idAttribute: 'name',

  urlIdAttribute: 'name',

  urlRoot: '/',

  queryAttrs: ['name', 'region'],

  relationships: {
    'capital': {
      modelCls: City,
      reverse: 'parent'
    },
    'language': {
      modelCls: Plumage.collection.DataCollection
    }
  }
});