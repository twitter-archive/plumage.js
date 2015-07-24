var Plumage = require('PlumageRoot');
var Collection = require('collection/Collection');
var CommentModel = require('model/Comment');

module.exports = Plumage.collection.CommentCollection = Collection.extend({
  model: CommentModel
});