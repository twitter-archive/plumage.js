define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'view/comment/CommentForm',
  'model/Comment',
  'view/CollectionView',
  'view/comment/CommentView',
  'view/comment/templates/CommentsSection.html'
], function($, Backbone, Handlebars, Plumage, ModelView, CommentForm, Comment, CollectionView, CommentView, template) {

  return Plumage.view.comment.CommentsSection = ModelView.extend({

    expandable: false,

    expanded: false,

    template: Handlebars.compile(template),

    title: 'Comments',

    events: {
      'click .comments-toggle': 'onClickToggle'
    },

    getTemplateData: function() {
      var label = 'No Comments';
      if (this.model) {
        var comments = this.model.getRelated('comments');
        var count = comments ? comments.size() : 0;
        if (count === 1) {
          label = '1 Comment';
        } else if (count > 1){
          label = count + ' Comments';
        }
      }
      return {
        title: this.title,
        expandable: this.expandable,
        expanded: this.expandable ? this.expanded : true,
        label: label
      };
    },

    initialize: function(options) {
      ModelView.prototype.initialize.apply(this, arguments);
      options = options || {};
      var emptyTemplate;
      if (!this.expandable) {
        emptyTemplate = '<div class="comment no-comments">No comments yet. Leave the first one.</div>';
      }

      //lazy init subviews
      if (!this.expandable || this.expanded) {
        this.initSubViews();
      }
    },

    initSubViews: function() {
      var emptyTemplate;
      if (!this.expandable) {
        emptyTemplate = '<div class="comment no-comments">No comments yet. Leave the first one.</div>';
      }
      this.subViews = [
        this.commentsView = new CollectionView({
          selector: '.comments',
          itemViewCls: CommentView,
          relationship: 'comments',
          emptyTemplate: emptyTemplate
        }),
        this.commentForm = new CommentForm({selector: '.comment-form'})
      ];
      this.commentForm.on('save', this.onCommentFormSave.bind(this));
      if (this.model) {
        this.commentsView.setModel(this.model);
        this.resetCommentForm();
      }
    },

    setModel: function(rootModel, parentModel) {
      ModelView.prototype.setModel.apply(this, arguments);
      this.resetCommentForm();
    },

    getCommentableId: function(model) {
      return model ? model.id : undefined;
    },

    getSubject: function(model) {
      return undefined;
    },

    /**
     * Event Handlers
     */

    onModelLoad: function() {
      this.resetCommentForm();
    },

    onCommentFormSave: function(form, model) {
      if (this.getSubject) {
        model.set('subject', this.getSubject(model));
      }
      this.resetCommentForm();
      this.model.getRelated('comments').add(model);
      this.render();
    },

    onClickToggle: function(e) {
      e.preventDefault();
      if(!this.commentsView) {
        this.initSubViews();
        //let event propagation finish before re-rendering
        setTimeout(function() {
          this.render();
          this.toggleComments();
        }.bind(this), 0);
      } else {
        this.toggleComments();
      }
    },


    /**
     * Helpers
     */

    toggleComments: function() {
      this.$('.comments-wrap').animate({'height': 'toggle'}, 200);
      this.expanded = !this.expanded;
    },

    resetCommentForm: function() {
      if (this.commentForm) {
        this.commentForm.setModel(new Comment({
          commentable_type: this.model.commentableType,
          commentable_url: this.model.url(),
          body: '',
          subject: this.getSubject(this.model)
        }));
      }
    }

  });
});
