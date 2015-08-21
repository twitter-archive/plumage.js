/* globals $, _ */
var Plumage = require('PlumageRoot');
var TypeAhead = require('view/form/fields/TypeAhead');
var FilterFieldMixin = require('view/form/fields/FilterFieldMixin');

module.exports = Plumage.view.form.fields.FilterTypeAhead = TypeAhead.extend(_.extend(FilterFieldMixin,
/** @lends Plumage.view.form.fields.FilterTypeAhead.prototype */
  {
    updateModelOnChange: true,

    comparison: 'equals'
  }
));