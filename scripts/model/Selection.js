define(['jquery', 'underscore', 'backbone', 'PlumageRoot'],
function($, _, Backbone, Plumage) {

  return Plumage.model.Selection = Backbone.Model.extend({
    defaults: {
      selectedId: undefined
    }
  });
});