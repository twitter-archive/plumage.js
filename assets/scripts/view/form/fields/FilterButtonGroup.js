/* globals $, _ */
var Plumage = require('PlumageRoot');
var ButtonGroupSelect = require('view/form/fields/ButtonGroupSelect');
var FilterFieldMixin = require('view/form/fields/FilterFieldMixin');

module.exports = Plumage.view.form.fields.FilterButtonGroup = ButtonGroupSelect.extend(_.extend(FilterFieldMixin, {

  className: 'filter-button-group',
  comparison: 'equals',

  update: function() {
    this.render();
  }
}));