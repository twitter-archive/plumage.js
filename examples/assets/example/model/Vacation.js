define(['jquery', 'underscore', 'backbone', 'model/Model'],
function($, _, Backbone, Model) {

  return Model.extend({

    modelName: 'Vacation',

    urlRoot: '/vacations',

    queryAttrs: ['name']
  });
});