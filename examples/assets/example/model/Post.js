var Model = require('model/Model');
var CommentCollection = require('example/collection/CommentCollection');
var DataCollection = require('collection/DataCollection');
var User = require('example/model/User');

module.exports = Model.extend({
  modelName: 'Post',

  urlRoot: '/posts',

  queryAttrs: ['body'],

  relationships: {
    'comments': {
      modelCls: CommentCollection,
      reverse: 'post'
    },
    'author': {
      modelCls: User
    },
    'categories': {
      modelCls: DataCollection
    }
  }
});