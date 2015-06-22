define([
  'PlumageRoot',
  'collection/Collection',
  'model/Activity'
], function(Plumage, Collection, Activity) {

  return Plumage.collection.ActivityCollection = Collection.extend({
    model: Activity
  });
});