/* global $, _ */
var Plumage = require('plumage');
var BaseExample = require('kitchen_sink/view/example/BaseExample');
var ExampleData = require('example/ExampleData');
var Post = require('example/model/Post');

var template = require('kitchen_sink/view/example/view/templates/ViewState.html');

module.exports = BaseExample.extend({

  template: template,

  subViews: [{
    viewCls: Plumage.view.form.fields.DropdownSelect,
    selector: '.dropdown-select',
    valueAttr: 'dropdown',
    noSelectionText: 'Select something',
    listValues: [
      {label: 'Select foo!', value: 'foo'},
      {label: 'No, select bar!', value: 'bar'}
    ],
    updateModelOnChange: true
  }, {
    viewCls: Plumage.view.ModelView,
    selector: '.query-string',
    template: '<label>Query String:</label><span>{{queryParams}}</span>',
    getTemplateData: function() {
      return {queryParams: $.param(this.model.getQueryParams())};
    },
    onModelChange: function(model) {
      Plumage.view.ModelView.prototype.onModelChange.apply(this, arguments);
      this.$('span').css({'background-color': '#ff3'});
      this.$('span').animate({'background-color': '#fff'}, 600);
    }
  }],

  onModelChange: function(model, options) {
    if (model.changed.dropdown) {
      model.updateUrl();
    }
    BaseExample.prototype.onModelChange.apply(this, arguments);
  }
});
