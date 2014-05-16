define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'plumage',
  'example/ExampleData',
  'example/model/Post',
  'text!kitchen_sink/view/example/form/templates/SelectFields.html'
], function($, _, Backbone, Handlebars, Plumage, ExampleData, Post, template) {

  return Plumage.view.ModelView.extend({

    template: template,

    modelCls: Post,

    fields: {
      'select': {cls: Plumage.view.form.fields.Select, options: {}},
      'dropdown-select': {cls: Plumage.view.form.fields.DropdownSelect, options: {}},
      'type-ahead-select': {cls: Plumage.view.form.fields.TypeAhead, options: {noSelectionText: 'Type something', listRelationship: undefined}},
      'category-select': {cls: Plumage.view.form.fields.CategorySelect, options: {}},
      'button-group-select': {cls: Plumage.view.form.fields.ButtonGroupSelect, options: {}}
    },

    defaultFieldOptions: {
      updateModelOnChange: true,
      valueAttr: 'category',
      listValueAttr: 'name',
      listLabelAttr: 'label',
      noSelectionText: 'Select something',
      listRelationship: 'categories'
    },

    initialize:function(options) {
      options = options || {};
      this.subViews = [];

      for (var key in this.fields) {
        var field = this.fields[key];
        this.subViews.push(
          new field.cls(_.extend({}, this.defaultFieldOptions, field.options, {
            selector: '.' + key
          }))
        );
      }

      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);

      var model = new Post(ExampleData.POST_WITH_CATEGORIES);
      this.setModel(model);

      var typeAheadListModel = new Plumage.collection.DataCollection(
        ExampleData.POST_WITH_CATEGORIES.categories,
        {processInMemory: true, queryAttrs: ['label']}
      );
      typeAheadListModel.onLoad();

      _.where(this.subViews, {selector: '.type-ahead-select'})[0].setListModel(typeAheadListModel);
    }
  });
});