define([
  'PlumageRoot',
  'collection/Collection',
  'model/Comment'
], function(Plumage, Collection, Comment) {

  return Plumage.collection.CommentCollection = Collection.extend({
    model: Comment
  });
});