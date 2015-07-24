/* globals $, _ */
var Handlebars = require('handlebars');
var Plumage = require('PlumageRoot');
var Field = require('view/form/fields/Field');

module.exports = Plumage.view.form.fields.TextArea = Field.extend({
  template: Handlebars.compile('<textarea {{#fieldName}}name="{{fieldName}}"{{/fieldName}}>{{value}}</textarea>'),

  update: function(isLoad) {
    return this.$('textarea').val(this.getValue());
  }
});
