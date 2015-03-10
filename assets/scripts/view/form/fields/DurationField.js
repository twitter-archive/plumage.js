define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/form/fields/Field',
  'text!view/form/fields/templates/DurationField.html'
], function($, _, Backbone, Plumage, Field, template) {
  return Plumage.view.form.fields.DurationField = Field.extend({

    className: 'duration-field control-group',

    fieldTemplate: template,

    units: [
      {label: 'minutes', value: 60000},
      {label: 'hours', value: 3600000},
      {label: 'days', value: 86400000}
    ],

    validationRules: 'number',

    events: {
      'change select': 'onUnitChange'
    },

    /**
     * View state. Value of selected unit.
     */
    selectedUnit: undefined,

    initialize: function() {
      Field.prototype.initialize.apply(this, arguments);
      if (!this.selectedUnit) {
        this.selectedUnit = this.units[0].value;
      }
    },

    getTemplateData: function() {
      var data = Field.prototype.getTemplateData.apply(this, arguments);

      data.units = _.map(this.units, function (unit) {
        var result =  _.clone(unit);
        if (this.selectedUnit !== undefined && result.value === this.selectedUnit) {
          result.selected = true;
        }
        return result;
      }.bind(this));

      return data;
    },

    getValueString: function(value) {
      if (this.validateValue(value)) {
        if (value && this.selectedUnit !== undefined) {
          return value/this.selectedUnit;
        }
      }
      return value;
    },

    valueChanged: function(){
      this.selectedUnit = this.getUnitForValue(this.getValue());
    },

    getUnitForValue: function(value) {
      var selectedIndex = 0;
      for (var i = 0; i < this.units.length; i++) {
        if (value % this.units[i].value === 0) {
          selectedIndex = i;
        }
      }
      return this.units[selectedIndex].value;
    },

    getValueFromDom: function() {
      var value = Field.prototype.getValueFromDom.apply(this, arguments);
      if ($.isNumeric(value)) {
        return value * this.selectedUnit;
      }
      return value;
    },

    //
    // Events
    //

    onUnitChange: function() {
      this.selectedUnit = Number($(arguments[0].target).val());
      this.update();
    }
  });
});
