define(['jquery', 'underscore', 'backbone', 'model/Model', 'model/User'],
function($, _, Backbone, Model) {

  return Model.extend({

    urlRoot: '/comments',

    modelName: 'Comment',

    relationships: {
      'user': {
        modelCls: 'model/User'
      },

      //test circular relationship
      'post': {
        modelCls: 'model/Post'
      }
    },

    validate: function(attrs, options) {
      if (!attrs.body || attrs.body.length <= 3) {
        return 'Comment is too short';
      }
    }
  });
});