var Plumage = require('PlumageRoot');
var Collection = require('collection/Collection');
var Activity = require('model/Activity');

module.exports = Plumage.collection.ActivityCollection = Collection.extend({
  model: Activity
});