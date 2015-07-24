/* globals $, _ */
var Plumage = require('PlumageRoot');
var Field = require('view/form/fields/Field');

var template = require('view/form/fields/templates/SearchField.html');

module.exports = Plumage.view.form.SearchField = Field.extend(
/** @lends Plumage.view.form.fields.SearchField.prototype */
{
  template: template,

  className: 'search-field',

  //need to add bootstrap search-query class
  fieldTemplate: '<input type="text" class="search-query form-control" name="{{valueAttr}}" {{#placeholder}}placeholder="{{.}}"{{/placeholder}} value="{{value}}"/>',

  valueAttr: 'query',

  updateModelOnChange: true,

  events: {
    'click button': 'onSubmitClick'
  },

  onKeyDown: function(e) {
    if (e.keyCode === 13) { //on enter
      e.preventDefault();
      this.trigger('submit', this, this.getValue());
    }
  },

  onSubmitClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.trigger('submit', this, this.getValue());
  }
});