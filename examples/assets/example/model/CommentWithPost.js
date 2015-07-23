define(['jquery', 'underscore', 'backbone', 'model/Model', 'model/User', 'example/model/Post'],
function($, _, Backbone, Model, User, Post) {

  return Model.extend({

    urlRoot: '/comments',

    modelName: 'Comment',

    relationships: {
      'user': {
        modelCls: User
      },

      //test circular relationship
      'post': {
        modelCls: Post
      }
    },

    validate: function(attrs, options) {
      if (!attrs.body || attrs.body.length <= 3) {
        return 'Comment is too short';
      }
    }
  });
});