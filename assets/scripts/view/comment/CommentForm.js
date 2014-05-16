define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/Form',
  'view/form/fields/TextArea',
  'model/Comment'
], function($, Backbone, Handlebars, Plumage, Form, TextArea) {

  return Plumage.view.comment.CommentForm = Form.extend({

    modelCls: 'model/Comment',

    actionLabel: 'Comment',

    initialize: function(options) {
      Form.prototype.initialize.apply(this, arguments);
      options = options || {};
      this.subViews = [
        new TextArea({
          selector: '.fields',
          valueAttr: 'body'
        })
      ];
    }
  });
});
