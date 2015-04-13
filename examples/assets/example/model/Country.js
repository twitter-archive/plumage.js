define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
  'example/model/City'
], function($, _, Backbone, Plumage, City) {

  return Plumage.model.Model.extend({
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
});