define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/View',
  'text!view/templates/ModalDialog.html'
], function($, _, Backbone, Plumage, View, template) {

  return Plumage.view.ModalDialog = View.extend({

    template: template,

    contentView: undefined,

    header: '',

    modalOptions: {
      show:false
    },

    initialize: function(options) {
      options = options || {};
      options.modalOptions = _.extend(this.modalOptions, options.modalOptions || {});
      View.prototype.initialize.apply(this, arguments);
    },

    onRender: function() {
      View.prototype.onRender.apply(this, arguments);
      if (this.contentView) {
        this.$('.modal-body').html(this.contentView.render().el);
      }

      if (this.$el.closest('html').length === 0) {
        $('body').append(this.$el);
        this.$('.modal').modal(this.modalOptions);
      }
    },

    getTemplateData: function() {
      return {
        header: this.header
      };
    },

    show: function() {
      if (!this.isRendered) {
        this.render();
      }
      this.$('.modal').modal('show');
    },

    hide: function() {
      this.$('.modal').modal('hide');
    }
  });
});

