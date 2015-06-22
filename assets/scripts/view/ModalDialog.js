define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'view/templates/ModalDialog.html',
  'bootstrap'
], function($, _, Backbone, Handlebars, Plumage, ModelView, template) {

  return Plumage.view.ModalDialog = ModelView.extend({

    template: template,

    contentView: undefined,

    headerTemplate: '',

    showCancel: false,

    showSubmit: false,

    modalOptions: {
      show:false
    },

    events: {
      'click .submit': 'onSubmitClick'
    },

    initialize: function(options) {
      options = options || {};
      options.modalOptions = _.extend(this.modalOptions, options.modalOptions || {});
      if (this.contentView) {
        this.subViews = [this.contentView].concat(options.subViews || []);
        this.contentView.selector = '.modal-content';
        this.contentView.name = 'contentView';
      }

      ModelView.prototype.initialize.apply(this, arguments);

      if (this.contentView) {
        this.contentView = this.getSubView('contentView');
      }
    },

    onRender: function() {
      Handlebars.registerPartial('header', this.headerTemplate);
      ModelView.prototype.onRender.apply(this, arguments);
      if (this.$el.closest('html').length === 0) {
        $('body').append(this.$el);
        this.$('.modal').modal(this.modalOptions);
      }
    },

    getTemplateData: function() {
      var data = ModelView.prototype.getTemplateData.apply(this, arguments);
      return _.extend(data,{
        header: this.header,
        showCancel: this.showCancel,
        showSubmit: this.showSubmit,
        canSubmit: this.canSubmit()
      });
    },

    show: function() {
      this.render();
      this.$('.modal').modal('show');
      ModelView.prototype.onShow.apply(this, arguments);
    },

    hide: function() {
      this.$('.modal').modal('hide');
      ModelView.prototype.onHide.apply(this, arguments);
    },

    canSubmit: function(model) {
      return true;
    },

    onSubmitClick: function() {
      this.trigger('submit', this);
    }
  });
});

