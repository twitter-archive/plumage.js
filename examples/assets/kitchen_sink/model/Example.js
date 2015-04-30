define(['jquery', 'underscore', 'backbone', 'plumage'],
function($, _, Backbone, Plumage) {

  return Plumage.model.Model.extend({
    idAttribute: 'name',

    urlIdAttribute: 'name',

    urlRoot: '/example',

    viewAttrs: ['tab', 'dropdown'],

    url: function() {
      if (this.collection) {
        return this.collection.url() + '/' + this.get('name');
      }
      return this.urlRoot + '/';
    },

    getViewClsPath: function() {
      var name = this.get('name');
      var section = this.collection.getRelated('parent').get('name');
      return 'kitchen_sink/view/example/' + section + '/' + name;
    },

    getSource: function(sourceType, callback) {
      var name = this.get('name');
      var section = this.collection.getRelated('parent').get('name');

      if (this.get(sourceType) === undefined) {
        var path;
        if (sourceType === 'js') {
          path = 'text!' + this.getViewClsPath() + '.js';
        } else {
          path = 'text!kitchen_sink/view/example/'+ section + '/templates/' + name + '.html';
        }
        require([path], function(source){
          this.set(sourceType, source);
          callback(source);
        }.bind(this));
      } else {
        return this.get(sourceType);
      }
    },

    requireSrc: function() {
      this.set('viewCls', require(this.getViewClsPath()));
    }
  });
});