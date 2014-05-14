define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/CategorySelect',
  'text!view/form/fields/templates/ButtonGroupSelect.html'
], function($, Backbone, Handlebars, Plumage, CategorySelect, template) {

  return Plumage.view.form.fields.ButtonGroupSelect = CategorySelect.extend({

    className: 'button-group-select',

    template: Handlebars.compile(template),

    events:{
      'click li': 'onItemClick'
    },

    initialize: function() {
      CategorySelect.prototype.initialize.apply(this, arguments);
      this.$el.data('toggle', 'buttons-radio');
    }
  });
});