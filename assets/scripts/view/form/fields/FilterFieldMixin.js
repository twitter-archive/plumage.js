/* globals $, _ */
var Plumage = require('PlumageRoot');
var Filter = require('model/Filter');

module.exports = Plumage.view.form.fields.FilterFieldMixin = {

  filterKey: undefined,

  comparison: 'contains',

  updateModelOnChange: true,

  getValueFromModel: function() {
    if (this.model) {
      var filters = this.model.getFilters(this.filterKey);
      if (filters && filters.length) {
        return filters[0].get('value');
      }
    }
    return undefined;
  },

  updateModel: function(rootModel, parentModel) {
    var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
      value = this.getValue(),
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
          model.addFilter(new Filter({key: this.filterKey, comparison: this.comparison, value: value}));
        }
      }
    }
    return true;
  }
};