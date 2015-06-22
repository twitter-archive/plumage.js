define(['jquery', 'underscore', 'backbone', 'model/Model', 'model/User'],
function($, _, Backbone, Model, User) {

  return Model.extend({

    urlRoot: '/comments',

    modelName: 'Comment',

    relationships: {
      'user': {
        modelCls: User
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