define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'text!view/templates/MessageView.html'
], function($, Backbone, Handlebars, Plumage, ModelView, template) {

  /**
   * lists with selections need two models:
   *  - one for list contents
   *  - one for list selection
   *
   * The selection model, populated by the model hierarchy. The list model needs to be populated manually.
   */
  return Plumage.view.MessageView = ModelView.extend({

    className: 'message',

    template: template,

    updateOnMessage: true,

    events: {
      'click a': 'onLinkClick'
    },

    initialize: function() {
      ModelView.prototype.initialize.apply(this, arguments);
      if (this.updateOnMessage) {
        theApp.dispatch.on('message', this.setMessage.bind(this));
      }
    },

    onRender: function() {
      ModelView.prototype.onRender.apply(this, arguments);
      this.updateClass();
    },

    getTemplateData: function() {
      var data = {
        body: this.messageBody,
        cls: this.messageCls
      };
      return data;
    },

    updateClass: function() {
      this.$el.toggleClass('show', Boolean(this.messageBody));
    },

    setMessage: function(messageBody, messageCls) {
      this.messageBody = messageBody;
      this.messageCls = messageCls;
      if (this.shown) {
        this.render();
      }
    },

    onShow: function() {
      ModelView.prototype.onShow.apply(this, arguments);
      this.render();
    },

    setModel: function() {
      this.messageBody = undefined;
      this.messageCls = undefined;
      ModelView.prototype.setModel.apply(this, arguments);
    }
  });
});