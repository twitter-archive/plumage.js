define([
  'jquery',
  'underscore',
  'plumage',
  'kitchen_sink/view/example/BaseExample',
  'example/ExampleData',
  'example/model/Post',
  'text!kitchen_sink/view/example/view/templates/ViewState.html'
], function($, _, Plumage, BaseExample, ExampleData, Post, template) {

  return BaseExample.extend({

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
});
