define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field',
  'model/Filter'
], function($, Backbone, Handlebars, Plumage, Field, Filter) {


  return Plumage.view.form.fields.FilterField = Field.extend({

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

    updateModel: function(rootModel) {
      var model = this.getModelFromRoot(rootModel, this.relationship),
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
    }
  });
});