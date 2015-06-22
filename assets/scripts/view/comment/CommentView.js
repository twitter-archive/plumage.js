define([
  'jquery',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'model/Comment',
  'view/ModelView',
  'view/comment/templates/CommentView.html',
  'linkify'
], function($, Backbone, Handlebars, moment, Plumage, Comment, ModelView, template) {

  return Plumage.view.comment.CommentView = ModelView.extend({
    className: 'comment',

    modelCls: Comment,

    template: Handlebars.compile(template),

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
});
