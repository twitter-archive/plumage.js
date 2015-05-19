define([
  'jquery',
  'underscore',
  'backbone',
  'dropzone',
  'PlumageRoot',
  'view/ModelView',
  'text!view/form/templates/FileDropZone.html'

], function($, _, Backbone, Dropzone, Plumage, ModelView, template) {

  return Plumage.view.form.FileDropZone = ModelView.extend({

    className: 'file-dropzone-view',

    template: template,

    url: undefined,

    // see http://www.dropzonejs.com/#configuration-options
    dropzoneOptions: {
      maxFilesize: 10, // MB
      paramName: 'contents',
      addRemoveLinks: false,
      autoDiscover: false
    },

    initialize:function(options) {
      Dropzone.autoDiscover = false;

      //merge dropzone options
      if (options.dropzoneOptions) {
        this.dropzoneOptions = _.extend({}, this.dropzoneOptions, options.dropzoneOptions);
        delete options.dropzoneOptions;
      }
      ModelView.prototype.initialize.apply(this, arguments);

      this.dropzoneEl = $('<div class="dropzone"></div>');
      this.dropzone = new Dropzone(this.dropzoneEl[0],
        _.extend({}, this.dropzoneOptions, {url: this.url})
      );

      this.dropzone.on('success', this.onSuccess.bind(this));
    },

    onRender: function() {
      this.$el.append(this.dropzoneEl);
    },

    onShow: function() {
      ModelView.prototype.onShow.apply(this, arguments);
      if (this.dropzoneEl.closest('html').length === 0) {
        this.$el.append(this.dropzoneEl);
      }
    },

    onHide: function() {
      ModelView.prototype.onHide.apply(this, arguments);
      $(this.dropzoneEl).detach();
    },

    getTemplateData: function() {
      return {};
    },

    onSuccess: function(file, resp, event) {
      this.trigger('success', this, file, resp, event);
    }
  });
});