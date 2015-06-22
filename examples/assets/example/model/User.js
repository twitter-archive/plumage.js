define(['jquery', 'underscore', 'backbone', 'model/Model', 'model/Data'],
function($, _, Backbone, Model, Data) {

  return Model.extend({
    urlRoot: '/users',
    relationships: {
      company: {
        modelCls: Data
      }
    }
  });
});