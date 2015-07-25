/* globals $, _ */
var moment = require('moment');
var Plumage = require('PlumageRoot');
var Select = require('view/form/fields/Select');
var template = require('view/form/fields/templates/DropdownSelect.html');

module.exports = Plumage.view.form.fields.DropdownSelect = Select.extend({

  template: template,

  modelAttr: 'filter',

  noSelectionText: 'Click to select',

  noSelectionValue: '',

  buttonCls: 'btn-default',

  iconCls: undefined,

  opens: 'right',

  preventFocus: false,


  events:{
    'click li a': 'onItemClick',
    'click .dropdown-toggle': 'onToggleClick'
  },

  initialize: function() {
    Select.prototype.initialize.apply(this, arguments);
    this.dropdownId = _.uniqueId('dropdown');
  },

  onRender: function() {
    Select.prototype.onRender.apply(this, arguments);
    this.$('[data-toggle=dropdown]').dropdown();
  },

  getTemplateData: function() {
    var data = Select.prototype.getTemplateData.apply(this, arguments);
    data = _.extend(data, {
      buttonCls: this.buttonCls,
      iconCls: this.iconCls,
      opens: this.opens,
      dropdownId: this.dropdownId
    });
    return data;
  },

  onToggleClick: function(e) {
    if (this.preventFocus) {
      e.preventDefault();
      e.stopPropagation();
      this.$('.dropdown').toggleClass('open');
    }
  },

  onItemClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var li = $(e.target).closest('li'),
      value = li && li.data('value');

    this.$el.removeClass('open');
    this.setValue(value);
  }
});