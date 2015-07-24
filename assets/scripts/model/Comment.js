var Plumage = require('PlumageRoot');
var Model = require('model/Model');
var User = require('model/User');

module.exports = Plumage.model.Comment = Model.extend({

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