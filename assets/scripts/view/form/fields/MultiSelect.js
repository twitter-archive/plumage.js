define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Select',
  'text!view/form/fields/templates/MultiSelect.html',
], function($, _, Backbone, Handlebars, Plumage, Select, template) {
  /**
   * Like a normal field, except value is an array of selected values.
   */
  return Plumage.view.form.fields.MultiSelect = Select.extend({

    template: Handlebars.compile(template),

    showSelectAll: false,

    allLabel: 'All',

    initialize: function() {
      this.value = [];
      Select.prototype.initialize.apply(this, arguments);
    },

    /** overrides **/

    getTemplateData: function() {
      var data = Select.prototype.getTemplateData.apply(this, arguments);
      data.showSelectAll = this.showSelectAll;
      data.allSelected = _.all(data.listValues, function(x){ return x.selected;});
      return data;
    },

    onRender: function() {
      Select.prototype.onRender.apply(this, arguments);
    },

    getValue: function() {
      var value = Select.prototype.getValue.apply(this, arguments);
      if (value !== undefined) {
        return $.isArray(value) ? _.clone(value) : [value];
      }
      return [];
    },

    getValueLabel: function(value) {
      var labels = [];
      if (value && value.length) {
        this.listModel.each(function(item) {
          if (this.isValueSelected(this.getListItemValue(item))) {
            labels.push(this.getListItemLabel(item));
          }
        }.bind(this));
      }

      if (!this.listModel) {
        return '';
      }
      if (labels.length === this.listModel.size()) {
        return this.allLabel;
      }
      return labels.join(', ');
    },

    isValueSelected: function(value) {
      return _.contains(this.getValue(), value);
    },

    hasSelection: function() {
      var value = this.getValue();
      return Boolean(value && (value.length > 1 || value.length === 1 && value[0] !== this.noSelectionValue));
    },

    /** methods **/

    toggleValue: function(value, options) {
      var me = this;
      var currentValue = this.getValue();
      var index = currentValue.indexOf(value);
      if (index < 0) {
        index = _.sortedIndex(currentValue, value, function(value) {
          var item = me.listModel.find(function(x){
            return me.getListItemValue(x) === value;
          });
          return me.listModel.indexOf(item);
        });
        currentValue.splice(index, 0, value);
        this.setValue(currentValue, options);
      } else {
        currentValue.splice(index, 1);
        this.setValue(currentValue, options);
      }
    },

    setValueSelected: function(value, selected) {
      if (selected === undefined) {
        selected = true;
      }
      var currentValue = this.getValue();
      if (this.isValueSelected(value) !== selected) {
        this.toggleValue(value);
      }
    },

    selectAll: function() {
      var newValues = this.listModel.map(function(item){
        return this.getListItemValue(item);
      }.bind(this));
      this.setValue(newValues);
    },

    selectNone: function() {
      this.setValue([]);
    },

    toggleSelectAll: function() {
      var value = this.getValue();
      if (value && value.length === this.listModel.size()) {
        this.selectNone();
      } else {
        this.selectAll();
      }
    }
  });
});
