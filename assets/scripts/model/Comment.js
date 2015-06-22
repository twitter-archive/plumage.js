define(['jquery', 'underscore', 'backbone', 'PlumageRoot', 'model/Model',
        'model/User'],
function($, _, Backbone, Plumage, Model, User) {

  return Plumage.model.Comment = Model.extend({

    urlRoot: '/comments',

    relationships: {
      'user': {
        modelCls: User,
        forceCreate: false
      }
    },

    validate: function(attrs, options) {
      if (!attrs.body || attrs.body.length <= 3) {
        return 'Comment is too short';
      }
    }

  });
});