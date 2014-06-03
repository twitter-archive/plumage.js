define(['jquery', 'underscore', 'backbone', 'model/Model'],
function($, _, Backbone, Model) {

  return Model.extend({
    urlRoot: '/users',
    relationships: {
      company: {
        modelCls: 'model/Data'
      }
    }
  });
});