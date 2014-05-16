define([
  'jquery',
  'backbone',
  'PlumageRoot',
  'collection/Collection',
  'model/User'
], function($, Backbone, Plumage, Collection) {

  return Plumage.collection.UserCollection = Collection.extend({
    model: 'model/User'
  });
});