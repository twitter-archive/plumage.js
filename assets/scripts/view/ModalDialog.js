var $ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');
var Plumage = require('PlumageRoot');
var ModelView = require('view/ModelView');
require('bootstrap');

var template = require('view/templates/ModalDialog.html');

module.exports = Plumage.view.ModalDialog = ModelView.extend({

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
      this.contentView.selector = '.modal-content-view';
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

  update: function() {
    if (this.contentView) {
      this.contentView.update();
    }
    if (this.showSubmit) {
      this.$('.modal-footer .submit').prop('disabled', !this.canSubmit(this.model));
    }
  },

  canSubmit: function(model) {
    return true;
  },

  onSubmitClick: function() {
    this.trigger('submit', this);
  }
});

