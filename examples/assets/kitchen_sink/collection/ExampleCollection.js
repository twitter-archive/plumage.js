var Plumage = require('plumage');
var Example = require('kitchen_sink/model/Example');

module.exports = Plumage.collection.Collection.extend({
  model: Example,

  url: function() {
    return this.getRelated('parent').url();
  }
});