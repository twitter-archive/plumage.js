var Plumage = require('plumage');
var ExampleCollection = require('kitchen_sink/collection/ExampleCollection');

module.exports = Plumage.model.Model.extend({
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