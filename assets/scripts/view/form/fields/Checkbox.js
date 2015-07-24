/* globals $, _ */
var Backbone = require('backbone');
var Plumage = require('PlumageRoot');
var Field = require('view/form/fields/Field');

var template = require('view/form/fields/templates/Checkbox.html');

module.exports = Plumage.view.form.fields.Checkbox = Field.extend(
/** @lends Plumage.view.form.fields.Checkbox.prototype */
{

  fieldTemplate: template,

  /** Label next to the checkbox. Optional */
  checkboxLabel: '',

  /** Model value to interpret as checked */
  checkedValue: true,

  /** Model value to interpret as unchecked */
  uncheckedValue: false,

  getTemplateData: function() {
    var data = Field.prototype.getTemplateData.apply(this, arguments);
    data.checkboxLabel = this.checkboxLabel;
    if (this.getValue() === this.checkedValue) {
      data.selected = true;
    }
    return data;
  },

  //override to ignore other non-relevant events
  delegateEvents: function(events) {
    events = events || _.result(this, 'events');
    var selector = this.getInputSelector();
    if (selector) {
      events = _.clone(events || {});
      events['change ' +selector] = 'onChange';
    }
    Backbone.View.prototype.delegateEvents.apply(this, [events]);
  },

  getValueFromDom: function() {
    return this.$('input:checked').val();
  },

  processDomValue: function(value) {
    return value === 'true' ? this.checkedValue : this.uncheckedValue;
  },

  update: function() {
    if (this.isRendered) {
      this.render();
    }
  }
});
