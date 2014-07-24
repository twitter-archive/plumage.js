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

    submit: function() {
      if (!this.model) {
        var ModelCls = ModelUtil.loadClass(this.modelCls);
        this.model = new ModelCls();
      }
      this.updateModel(this.model);

      if (this.model.validate) {
        var error = this.model.validate(this.model.attributes);
        if(!error) {
          this.model.save(null, {success: this.onSaveSuccess.bind(this)});
        }
      }
    },

    onSaveSuccess: function(model, resp, xhr) {
      this.trigger('save', this, model);
    }
  });
});