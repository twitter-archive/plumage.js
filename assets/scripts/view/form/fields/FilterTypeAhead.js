define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/TypeAhead',
  'model/Filter'
], function($, Backbone, Handlebars, Plumage, TypeAhead, Filter) {


  return Plumage.view.form.fields.FilterTypeAhead = TypeAhead.extend(
  /** @lends Plumage.view.form.fields.FilterTypeAhead.prototype */
  {

    filterKey: undefined,

    comparison: 'equals',

    updateModelOnChange: true,

    /**
     * TypeAhead that uses this.model's filters on as its model.
     *
     * @constructs
     * @extends Plumage.view.form.fields.TypeAhead
     */
    initialize: function() {
      TypeAhead.prototype.initialize.apply(this, arguments);
    },

    //Currently copy-paste to-from FilterField. Move to mixin?
    getValueFromModel: function() {
      if (this.model) {
        var filters = this.model.getFilters(this.filterKey);
        if (filters && filters.length) {
          return filters[0].get('value');
        }
      }
      return undefined;
    },

    setModel: function() {
      TypeAhead.prototype.setModel.apply(this, arguments);
    },

    //Currently copy-paste to-from FilterField. Move to mixin?
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
  });
});