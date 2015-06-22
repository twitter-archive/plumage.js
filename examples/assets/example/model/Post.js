define(['jquery', 'underscore', 'backbone', 'model/Model', 'collection/DataCollection',
        'example/collection/CommentCollection', 'example/model/User'],
function($, _, Backbone, Model, DataCollection, CommentCollection, User) {

  return Model.extend({

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
});