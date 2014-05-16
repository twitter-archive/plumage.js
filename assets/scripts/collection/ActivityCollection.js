define([
  'PlumageRoot',
  'collection/Collection',
  'model/Activity'
], function(Plumage, Collection) {

  return Plumage.collection.ActivityCollection = Collection.extend({
    model: 'model/Activity'
  });
});