define([
  'jquery',
  'backbone',
  'underscore',
  'PlumageRoot',
  'view/ModelView',
  'util/ModelUtil'
], function($, Backbone, _, Plumage, ModelView, ModelUtil) {

  /**
   * Container for a field subviews.
   *
   * Uses dom form events to detect changes and submits in fields.
   */

  return Plumage.view.form.Form = ModelView.extend({

    tagName: 'form',

    template: '<div class="fields"></div><input type="submit" value="{{actionLabel}}"/>',

    actionLabel: 'Submit',

    updateModelOnChange: false,

    events: {
      'submit': 'onSubmit',
      'change': 'onChange'
    },

    initialize: function(options) {
      ModelView.prototype.initialize.apply(this, arguments);
    },

    getTemplateData: function() {
      var data = ModelView.prototype.getTemplateData.apply(this, arguments);
      return _.extend(data, {
        actionLabel: this.getActionLabel()
      });
    },

    getActionLabel: function() {
      return this.actionLabel ? this.actionLabel : 'Submit';
    },

    setMessage: function(message, messageCls) {
      var messageView = this.getSubView('message');
      if (messageView) {
        messageView.setMessage(message, messageCls);
      }
    },

    //
    // actions
    //

    submit: function() {
      if (!this.model) {
        this.model = new this.modelCls();
      }
      if(this.isValid()) {
        this.updateModel(this.rootModel);
        var error;
        if (this.model.validate) {
          error = this.model.validate(this.model.attributes);
        }
        if(!error) {
          this.model.save(null, {success: this.onSaveSuccess.bind(this)});
        }
      }
    },

    //
    // Events
    //

    onChange: function(e) {
      if (this.updateModelOnChange) {
        this.onSubmit(e);
      }
      this.trigger('change', this, e);
    },

    onSubmit: function(e) {
      e.preventDefault();
      this.submit();
    },

    onSaveSuccess: function(model, resp, xhr) {
      if (resp.meta.success) {
        this.trigger('save', this, model);
      } else {
        if (resp.meta.message) {
          this.setMessage(resp.meta.message, resp.meta.message_class);
        }
      }
    },

    onModelInvalid: function(model, validationError, message, messageCls) {
      if (message) {
        this.setMessage(message, messageCls);
      }
    }
  });
});