define(['jquery', 'underscore', 'backbone', 'PlumageRoot',
  'model/Model',
  'collection/ActivityCollection'
],
function($, _, Backbone, Plumage, Model) {

  return Plumage.model.User = Model.extend({

    urlIdAttribute: 'account',

    urlRoot: '/users',

    relationships: {
      'comments': {
        modelCls: 'collection/CommentCollection',
        reverse: 'user',
        forceCreate: false
      },
      'activities': {
        modelCls: 'collection/ActivityCollection',
        reverse: 'owner',
        forceCreate: false
      }
    },

    getImageThumb: function() {
      return 'https://birdhouse.twitter.biz/people/photos/thumb/'+this.get('account')+'-thumb.jpg';
    },

    toViewJSON: function() {
      var result = Model.prototype.toViewJSON.apply(this, arguments);
      result.image_thumb = this.getImageThumb();
      return result;
    }
  });
});