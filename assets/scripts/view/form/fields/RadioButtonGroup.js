define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Radio',
  'text!view/form/fields/templates/RadioButtonGroup.html'
], function($, Backbone, Handlebars, Plumage, Radio, template) {
  return Plumage.view.form.fields.RadioButtonGroup = Radio.extend({

    template: Handlebars.compile(template),

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
});
