var Collection = require('collection/Collection');
var CommentWithPost = require('example/model/CommentWithPost');

module.exports = Collection.extend({
  modelName: 'CommentCollection',
  urlRoot: CommentWithPost.prototype.urlRoot,
  model: CommentWithPost,

  sortField: 'body',
  sortDir: '-1'
});