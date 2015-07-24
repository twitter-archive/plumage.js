var Collection = require('collection/Collection');
var CommentModel = require('example/model/Comment');

module.exports = Collection.extend({
  modelName: 'CommentCollection',
  urlRoot: CommentModel.prototype.urlRoot,
  model: CommentModel,

  sortField: 'body',
  sortDir: '-1'
});