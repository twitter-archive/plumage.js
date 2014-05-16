define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Select',
  'text!view/form/fields/templates/CategorySelect.html'
], function($, Backbone, Handlebars, Plumage, Select, template) {

  return Plumage.view.form.fields.CategorySelect = Select.extend({

    className: 'category-select field',

    template: Handlebars.compile(template),

    listValueAttr: 'name',
    listLabelAttr: 'label',
    modelAttr: 'filter',

    itemTemplate: '<li data-value="{{value}}" class="{{value}}{{#selected}} active{{/selected}}"><a href="#">{{label}}</a></li>',

    noSelectionText: 'All',

    noSelectionValue: '',

    events:{
      'click a': 'onItemClick'
    },

    initialize: function() {
      Select.prototype.initialize.apply(this, arguments);
    },

    setModel: function() {
      Select.prototype.setModel.apply(this, arguments);
    },

    /**
     * Overrides
     */
    onListModelLoad: function(model, options) {
      this.render();
    },

    onItemClick: function(e) {
      e.preventDefault();
      var li = $(e.target).closest('li'),
        value = li && li.data('value');

      this.setValue(value);
    },

    getItemData: function(item) {
      return Select.prototype.getItemData.apply(this, arguments);
    }
  });
});