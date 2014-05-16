define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
  'kitchen_sink/collection/ExampleCollection'
], function($, _, Backbone, Plumage, ExampleCollection) {

  return Plumage.model.Model.extend({
    idAttribute: 'name',

    urlRoot: '/',

    sourceLoaded: false,

    relationships: {
      'examples': {
        modelCls: ExampleCollection,
        reverse: 'parent'
      }
    },

    preloadSource: function(callback) {
      if (!this.sourceLoaded) {
        var paths = this.getRelated('examples').map(function(example) {
          return example.getViewClsPath();
        });
        require(paths, function(){
          this.getRelated('examples').each(function(example){example.requireSrc();});
          callback();
        }.bind(this));
        this.sourceLoaded = true;
      }
    },

    getCurrentExample: function () {
      return this.getRelated('examples').getById(this.get('example'));
    }
  });
});