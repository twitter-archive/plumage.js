/* globals $, _ */

var moment = require('moment');
var Plumage = require('PlumageRoot');
var ModelView = require('view/ModelView');
var CommentModel = require('model/Comment');

var template = require('view/comment/templates/CommentView.html');
require('linkify');

module.exports = Plumage.view.comment.CommentView = ModelView.extend({
  className: 'comment',

  modelCls: CommentModel,

  template: template,

  events: {
    'click .delete': 'onDeleteClick'
  },

  getTemplateData: function() {
    if (this.model) {
      var result = this.model.toViewJSON();
      result.body = result.body.replace(/\n/g, '<br/>');
      result.created_at = moment(result.created_at).fromNow();
      result.can_delete = result.user.account === window.currentUser;
      return result;
    }
    return {};
  },

  onRender: function() {
    ModelView.prototype.onRender.apply(this, arguments);
    var body = this.$('.comment-body');
    body.linkify();
    $('a', body).addClass('outlink').attr('target', '_');
  },

  onDeleteClick: function(e) {
    e.preventDefault();
    var collection = this.model.collection;
    this.model.destroy();
  }
});
