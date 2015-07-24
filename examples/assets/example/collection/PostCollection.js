var Collection = require('collection/Collection');
var Post = require('example/model/Post');

module.exports = Collection.extend({
  modelName: 'PostCollection',

  urlRoot: Post.prototype.urlRoot,
  model: Post,

  sortField: 'body',
  sortDir: '-1'
});