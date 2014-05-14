
define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'text!view/templates/DisplayField.html'
], function($, _, Backbone, Handlebars, Plumage, ModelView, template) {

  /**
   * Displays a non-editable value with an optional label.
   *
   * Useful for detail views with lists of fields.
   *
   */
  return Plumage.view.DisplayField = ModelView.extend({

    className: 'display-field',

    template: template,

    /**
     * optional. model attribute to display as label
     */
    labelAttr: undefined,

    /**
     * optional. String to use as label. Overrides labelAttr
     */
    label: undefined,

    /**
     * model attribute to display
     */
    valueAttr: undefined,

    /**
     * string to display. Overrides valueAttr.
     */
    value: undefined,

    /**
     * Used when value is null/undefined
     */
    defaultValue: '',

    getTemplateData: function() {
      var data = {
        label: this.label ,
        value: this.getValue(),
      };
      if (this.model) {
        if (!data.label) {
          if (this.labelAttr) {
            data.label = this.model.get(this.labelAttr);
          }
        }
        data.loading = !this.model.fetched;
      }
      return data;
    },

    getValue: function() {
      var value = this.value;
      if (this.model && !value) {
        if (this.valueAttr) {
          if (this.model.fetched) {
            value = this.model.get(this.valueAttr);
          }
        }
      }
      if (value) {
        return this.processValue(value);
      } else {
        return this.defaultValue;
      }
    },

    processValue: function(value) {
      return value;
    }
  });
});
