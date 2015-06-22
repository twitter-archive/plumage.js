define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
  'kitchen_sink/collection/ExampleCollection'
], function($, _, Backbone, Plumage, ExampleCollection) {

  return Plumage.model.Model.extend({
    idAttribute: 'name',

    urlIdAttribute: 'name',
    urlRoot: '/',


    relationships: {
      'examples': {
        modelCls: ExampleCollection,
        reverse: 'parent'
      }
    },

    getCurrentExample: function () {
      return this.getRelated('examples').getById(this.get('example'));
    }
  });
});