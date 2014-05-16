define([
  'PlumageRoot',
  'collection/Collection',
  'kitchen_sink/model/Example'
], function(Plumage, Collection) {

  return Collection.extend({
    model: 'kitchen_sink/model/Example',

    url: function() {
      return this.getRelated('parent').url();
    }
  });
});