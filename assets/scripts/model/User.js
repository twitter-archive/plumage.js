/* globals $, _ */
var Backbone = require('backbone');
var Plumage = require('PlumageRoot');
var Model = require('model/Model');

module.exports = Plumage.model.User = Model.extend({

  urlIdAttribute: 'account',

  urlRoot: '/users',

  relationships: {
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