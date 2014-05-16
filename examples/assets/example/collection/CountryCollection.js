define([
  'plumage',
  'example/model/Country'
], function(Plumage) {

  return Plumage.collection.Collection.extend({
    model: 'example/model/Country'
  });
});