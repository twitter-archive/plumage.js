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

    template: template,

    modelAttr: 'filter',

    noSelectionText: 'Click to select',

    noSelectionValue: '',

    buttonCls: undefined,

    iconCls: undefined,

    preventFocus: false,

    events:{
      'click li a': 'onItemClick',
      'click .dropdown-toggle': 'onToggleClick'
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

    onToggleClick: function(e) {
      if (this.preventFocus) {
        e.preventDefault();
        e.stopPropagation();
        this.$('.dropdown').toggleClass('open');
      }
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