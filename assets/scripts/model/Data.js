define(['jquery', 'underscore', 'backbone', 'PlumageRoot', 'model/Model'],
function($, _, Backbone, Plumage, Model) {

  return Plumage.model.Data = Model.extend({
    idAttribute: 'name'
  });
});