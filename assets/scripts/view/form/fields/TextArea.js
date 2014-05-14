define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field'
], function($, Backbone, Handlebars, Plumage, Field) {
  return Plumage.view.form.fields.TextArea = Field.extend({
    template: Handlebars.compile('<textarea {{#fieldName}}name="{{fieldName}}"{{/fieldName}}>{{value}}</textarea>'),

    update: function(isLoad) {
      return this.$('textarea').val(this.getValue());
    }
  });
});
