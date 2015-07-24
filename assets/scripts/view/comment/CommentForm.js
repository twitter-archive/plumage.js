/* globals $, _ */

var Plumage = require('PlumageRoot');
var Form = require('view/form/Form');
var TextArea = require('view/form/fields/TextArea');
var CommentModel = require('model/Comment');

module.exports = Plumage.view.comment.CommentForm = Form.extend({

  modelCls: CommentModel,

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
