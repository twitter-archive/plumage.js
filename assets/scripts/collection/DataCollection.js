var Plumage = require('PlumageRoot');
var Collection = require('collection/Collection');
var Data = require('model/Data');

module.exports = Plumage.collection.DataCollection = Collection.extend({
  model: Data,
  urlRoot: '/'
});