var Plumage = require('PlumageRoot');
var ModelView = require('view/ModelView');
var Select = require('view/form/fields/Select');

var template = require('view/form/templates/SelectField.html');

module.exports = Plumage.view.form.SelectField = Select.extend({

  tagName: 'select',

  className: 'select-field',

  template: template,

  // attribute of the list items used as the key of available selections
  listValueAttr: undefined,

  // attribute of the list items used as the label of available selections
  listLabelAttr: undefined,

  // attribute of the model representing the selection
  modelAttr: undefined,

  noSelectionText: '',

  value: '',

  events: {
    'change': 'onChange'
  },

  initialize:function() {
    Select.prototype.initialize.apply(this, arguments);
  }
});