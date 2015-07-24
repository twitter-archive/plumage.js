var Model = require('model/Model');
var User = require('example/model/User');
var Post = require('example/model/Post');

module.exports = Model.extend({

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