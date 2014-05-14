define(['jquery', 'underscore', 'backbone', 'model/Model', 'collection/DataCollection',
        'example/collection/CommentCollection', 'example/model/User'],
function($, _, Backbone, Model) {

  return Model.extend({

    modelName: 'Post',

    urlRoot: '/posts',

    queryAttrs: ['body'],

    relationships: {
      'comments': {
        modelCls: 'example/collection/CommentCollection',
        reverse: 'post'
      },
      'author': {
        modelCls: 'example/model/User'
      },
      'categories': {
        modelCls: 'collection/DataCollection'
      }
    }
  });
});