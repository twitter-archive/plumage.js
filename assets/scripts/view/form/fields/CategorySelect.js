/* globals $, _ */
var Plumage = require('PlumageRoot');
var Field = require('view/form/fields/Field');
var Select = require('view/form/fields/Select');

module.exports = Plumage.view.form.fields.CategorySelect = Select.extend({

  className: 'category-select field',

  template: require('view/form/fields/templates/CategorySelect.html'),

  listValueAttr: 'name',
  listLabelAttr: 'label',
  modelAttr: 'filter',

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

  update: function() {
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