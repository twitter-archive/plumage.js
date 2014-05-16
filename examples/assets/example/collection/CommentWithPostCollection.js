define([
  'collection/Collection',
  'example/model/CommentWithPost'
], function(Collection, CommentWithPost) {

  return Collection.extend({
    modelName: 'CommentCollection',
    urlRoot: CommentWithPost.prototype.urlRoot,
    model: CommentWithPost,

    sortField: 'body',
    sortDir: '-1',
  });
});