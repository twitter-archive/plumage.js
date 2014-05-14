define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Select',
  'text!view/form/fields/templates/DropdownSelect.html',
  'bootstrap'
], function($, _, Backbone, Handlebars, Plumage, Select, template) {

  return Plumage.view.form.fields.DropdownSelect = Select.extend({

    template: Handlebars.compile(template),

    modelAttr: 'filter',

    noSelectionText: 'Click to select',

    noSelectionValue: '',

    buttonCls: undefined,

    iconCls: undefined,

    events:{
      'click li a': 'onItemClick'
    },

    initialize: function() {
      Select.prototype.initialize.apply(this, arguments);
    },

    onRender: function() {
      Select.prototype.onRender.apply(this, arguments);
    },

    getTemplateData: function() {
      var data = Select.prototype.getTemplateData.apply(this, arguments);
      data = _.extend(data, {
        buttonCls: this.buttonCls,
        iconCls: this.iconCls
      });
      return data;
    },

    onItemClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var li = $(e.target).closest('li'),
        value = li && li.data('value');

      this.$el.removeClass('open');
      this.setValue(value);
    }
  });
});