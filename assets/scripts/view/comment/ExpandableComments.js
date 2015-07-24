/* globals $, _ */

var moment = require('moment');
var Plumage = require('PlumageRoot');
var ModelView = require('view/ModelView');
var CommentView = require('view/comment/CommentView');

var template = require('view/comment/templates/ExpandableComments.html');

module.exports = Plumage.view.comment.ExpandableComments = ModelView.extend({

  template: template,

  itemViewCls: CommentView,

  events: {
    'click .comments-action': 'onActionClick'
  },

  getTemplateData: function() {
    return {
      comments: ModelView.prototype.getTemplateData.apply(this, arguments),
      actionLabel: this.getActionLabel()
    };
  },

  getActionLabel: function() {
    var size = this.model.size();
    if (size === 0) {
      return 'comment';
    } else if (size === 1) {
      return '1 comment';
    } else {
      return this.model.size() + ' comments';
    }
  },

  onActionClick: function() {
    var el = this.$('.comment-wrapper');
    if (el.hasClass('hidden')) {
      el.removeClass('hidden');
      el.find('.comment-text').focus();
      window.setTimeout(function() { el.addClass('open'); }, 50);
    } else {
      el.removeClass('open');
      window.setTimeout(function() { el.addClass('hidden'); }, 200);
    }
  }
});
