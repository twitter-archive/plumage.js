define([
  'plumage',
  'example/model/Country'
], function(Plumage, Country) {

  return Plumage.collection.Collection.extend({
    model: Country
  });
});