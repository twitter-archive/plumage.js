/* globals $, _ */
var moment = require('moment');
var Plumage = require('PlumageRoot');
var ModelView = require('view/ModelView');
var MultiSelect = require('view/form/fields/MultiSelect');
var template = require('view/form/fields/templates/DropdownMultiSelect.html');

/**
 * Like a normal field, except value is an array of selected values.
 */
module.exports = Plumage.view.form.fields.DropdownMultiSelect = MultiSelect.extend({

  template: template,

  showSelectOnly: true,

  events:{
    'click li a': 'onItemClick',
    'click li input': 'onItemClick',
    'click li.select-all a': 'onSelectAllClick',
    'click li.select-all input': 'onSelectAllClick',
    'click .dropdown-toggle': 'onToggleClick'
  },

  initialize: function() {
    this.value = [];
    MultiSelect.prototype.initialize.apply(this, arguments);
    this.dropdownId = _.uniqueId('dropdown');
  },

  /** overrides **/

  getTemplateData: function() {
    var data = MultiSelect.prototype.getTemplateData.apply(this, arguments);
    data.showSelectOnly = this.showSelectOnly;
    data.dropdownId = this.dropdownId;
    return data;
  },

  onRender: function() {
    MultiSelect.prototype.onRender.apply(this, arguments);
    this.$('[data-toggle=dropdown]').dropdown();
  },

  update: function(isLoad) {
    var open = this.$('.dropdown').hasClass('open');
    this.render();
    if (open) {
      this.$('.dropdown').addClass('open');
    }
  },

  /** Event Handlers **/

  onItemClick: function(e) {

    var li = $(e.target).closest('li'),
      value = li && li.data('value');

    if (value !== undefined) {
      e.preventDefault();
      e.stopPropagation();
      if ($(e.target).hasClass('only-link')) {
        this.setValue(value);
      } else {
        this.toggleValue(value);
      }
    }
  },

  onSelectAllClick: function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.toggleSelectAll();
  }
});
