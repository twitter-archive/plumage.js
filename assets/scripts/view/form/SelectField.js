define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Select',
  'view/form/templates/SelectField.html'
], function($, Backbone, Handlebars, Plumage, Select, template) {

  return Plumage.view.form.SelectField = Select.extend({

    tagName: 'select',

    className: 'select-field',

    template: Handlebars.compile(template),

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
});