define([
  'PlumageRoot',
  'collection/Collection',
  'kitchen_sink/model/Example'
], function(Plumage, Collection, Example) {

  return Collection.extend({
    model: Example,

    url: function() {
      return this.getRelated('parent').url();
    }
  });
});