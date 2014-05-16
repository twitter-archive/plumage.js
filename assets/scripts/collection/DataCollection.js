define([
  'PlumageRoot',
  'collection/Collection',
  'model/Data'
], function(Plumage, Collection, Data) {

  return Plumage.collection.DataCollection = Collection.extend({
    model: Data,
    urlRoot: '/'
  });
});