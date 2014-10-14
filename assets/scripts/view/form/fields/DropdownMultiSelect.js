define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/MultiSelect',
  'text!view/form/fields/templates/DropdownMultiSelect.html',
], function($, _, Backbone, Handlebars, Plumage, MultiSelect, template) {
  /**
   * Like a normal field, except value is an array of selected values.
   */
  return Plumage.view.form.fields.DropdownMultiSelect = MultiSelect.extend({

    template: template,

    showSelectOnly: true,

    events:{
      'click li a': 'onItemClick',
      'click li input': 'onItemClick',
      'click li.select-all a': 'onSelectAllClick',
      'click li.select-all input': 'onSelectAllClick'
    },

    initialize: function() {
      this.value = [];
      MultiSelect.prototype.initialize.apply(this, arguments);
    },

    /** overrides **/

    getTemplateData: function() {
      var data = MultiSelect.prototype.getTemplateData.apply(this, arguments);
      data.showSelectOnly = this.showSelectOnly;
      return data;
    },

    onRender: function() {
      MultiSelect.prototype.onRender.apply(this, arguments);
    },

    update: function(isLoad) {
      var open = this.$('.dropdown').hasClass('open');
      this.render();
      if (open) {
        this.$('.dropdown').addClass('open');
      }
    },

    /** Event Handlers **/

    onItemClick: function(e) {

      var li = $(e.target).closest('li'),
        value = li && li.data('value');

      if (value !== undefined) {
        e.preventDefault();
        e.stopPropagation();
        if ($(e.target).hasClass('only-link')) {
          this.setValue(value);
        } else {
          this.toggleValue(value);
        }
      }
    },

    onSelectAllClick: function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.toggleSelectAll();
    }
  });


});
