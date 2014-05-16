define([
  'collection/Collection',
  'example/model/Comment'
], function(Collection, Comment) {

  return Collection.extend({
    modelName: 'CommentCollection',
    urlRoot: Comment.prototype.urlRoot,
    model: Comment,

    sortField: 'body',
    sortDir: '-1',
  });
});