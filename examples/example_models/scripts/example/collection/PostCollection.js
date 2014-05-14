define([
  'collection/Collection',
  'example/model/Post'
], function(Collection, Post) {

  return Collection.extend({
    modelName: 'PostCollection',

    urlRoot: Post.prototype.urlRoot,
    model: Post,

    sortField: 'body',
    sortDir: '-1',
  });
});