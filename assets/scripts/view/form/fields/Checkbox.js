define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/form/fields/Field',
  'text!view/form/fields/templates/Checkbox.html'
], function($, _, Backbone, Plumage, Field, template) {
  return Plumage.view.form.fields.Checkbox = Field.extend({

    fieldTemplate: template,

    checkboxLabel: '',

    getTemplateData: function() {
      var data = Field.prototype.getTemplateData.apply(this, arguments);
      data.checkboxLabel = this.checkboxLabel;
      if (this.getValue()) {
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
      return value === 'true' ? true : false;
    },

    update: function() {
      if (this.rendered) {
        this.render();
      }
    }
  });
});
