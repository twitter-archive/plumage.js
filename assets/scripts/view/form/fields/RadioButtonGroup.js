/* globals $, _ */
var Plumage = require('PlumageRoot');
var Radio = require('view/form/fields/Radio');

var template = require('view/form/fields/templates/RadioButtonGroup.html');

module.exports = Plumage.view.form.fields.RadioButtonGroup = Radio.extend({

  template: template,

  events: {
    'click button': 'onChange'
  },

  onChange: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var newValue = $(e.target).data('value');
    if (!this.changing) {
      this.setValue(newValue, {silent: true});
    }
    this.trigger('change', this, this.getValue());
  }
});
