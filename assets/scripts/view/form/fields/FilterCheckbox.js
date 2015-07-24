/* globals $, _ */
var Plumage = require('PlumageRoot');
var Checkbox = require('view/form/fields/Checkbox');

module.exports = Plumage.view.form.fields.FilterCheckbox = Checkbox.extend({

  filterKey: undefined,

  filterValue: true,

  invertMatch: false,

  checkboxLabel: undefined,

  comparison: 'equals',

  updateModelOnChange: true,

  processFilterValue: function(value) {
    return ((value === this.filterValue) !== this.invertMatch) ? true : false;
  },

  processValueForFilter: function(value) {
    return (value !== this.invertMatch) ? this.filterValue : undefined;
  },

  getValueFromModel: function() {
    if (this.model) {
      var filters = this.model.getFilters(this.filterKey),
        value;
      if (filters && filters.length) {
        value = filters[0].get('value');
      }
      return this.processFilterValue(value);
    }
    return undefined;
  },

  updateModel: function(rootModel, parentModel) {
    var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
      value = this.processValueForFilter(this.getValue()),
      filters = this.model.getFilters(this.filterKey);

    if (model) {
      if (filters && filters.length) {
        if (value === undefined || String(value) === '') {
          this.model.removeFilter(filters[0]);
        } else {
          filters[0].set('value', value);
        }
      } else {
        if (value !== undefined && String(value) !== '') {
          model.addFilter(new Plumage.model.Filter({key: this.filterKey, comparison: this.comparison, value: value}));
        }
      }
    }
  }
});