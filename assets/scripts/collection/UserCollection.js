define([
  'jquery',
  'backbone',
  'PlumageRoot',
  'collection/Collection',
  'model/User'
], function($, Backbone, Plumage, Collection, User) {

  return Plumage.collection.UserCollection = Collection.extend({
    model: User
  });
});