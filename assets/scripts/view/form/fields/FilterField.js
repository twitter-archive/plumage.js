/* globals $, _ */
var Plumage = require('PlumageRoot');
var Field = require('view/form/fields/Field');
var FilterFieldMixin = require('view/form/fields/FilterFieldMixin');

module.exports = Plumage.view.form.fields.FilterField = Field.extend(_.extend(FilterFieldMixin, {

  className: 'filter-text-field'
}));