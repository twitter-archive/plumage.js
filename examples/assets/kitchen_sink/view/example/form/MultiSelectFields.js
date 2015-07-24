var Plumage = require('plumage');
var ExampleData = require('example/ExampleData');
var Post = require('example/model/Post');
var template = require('kitchen_sink/view/example/form/templates/MultiSelectFields.html');

module.exports = Plumage.view.ModelView.extend({

  template: template,

  modelCls: Post,

  subViews: [{
    selector: '.multiselect',
    viewCls: Plumage.view.form.fields.MultiSelect
  }, {
    selector: '.dropdown-multiselect',
    viewCls: Plumage.view.form.fields.DropdownMultiSelect
  }, {
    selector: '.dropdown-multiselect2',
    viewCls: Plumage.view.form.fields.DropdownMultiSelect,
    showSelectAll: true
  }],

  defaultSubViewOptions: {
    updateModelOnChange: true,
    valueAttr: 'category',
    listValueAttr: 'name',
    listLabelAttr: 'label',
    listRelationship: 'categories',
    noSelectionText: 'Select something'
  },

  initialize:function(options) {
    Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
    var model = new Post(ExampleData.POST_WITH_CATEGORIES);
    this.setModel(model);
  }
});