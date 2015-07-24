var Plumage = require('plumage');

module.exports = Plumage.model.Model.extend({
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

  getViewCls: function() {
    var name = this.get('name');
    var section = this.collection.getRelated('parent').get('name');
    return require('kitchen_sink/view/example/' + section + '/' + name);
  },

  getJsSource: function() {
    var result = this.get('js');
    if (!result) {
      var name = this.get('name');
      var section = this.collection.getRelated('parent').get('name');
      result = require('raw!kitchen_sink/view/example/' + section + '/' + name + '.js');
      this.set('js', result);
    }
    return result;
  },

  getHtmlSource: function() {
    var result = this.get('html');
    if (!result) {
      var name = this.get('name');
      var section = this.collection.getRelated('parent').get('name');
      result = require('kitchen_sink/view/example/' + section + '/templates/' + name + '.html');
      this.set('html', result);
    }
    return result;
  }
});