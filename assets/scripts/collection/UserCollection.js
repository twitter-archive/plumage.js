var Plumage = require('PlumageRoot');
var Collection = require('collection/Collection');
var User = require('model/User');

module.exports = Plumage.collection.UserCollection = Collection.extend({
  model: User
});