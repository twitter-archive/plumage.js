define([
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/View',
  'text!view/menu/templates/DropdownMenu.html',
  'bootstrap'
], function($, Backbone, Handlebars, Plumage, View, template) {

  return Plumage.view.menu.DropdownMenu = View.extend({
    template: template,

    className: 'dropdown',

    buttonStyle: false,

    menuItems: [],

    iconCls: undefined,

    showCaret: true,

    opens: 'right',

    events: {
      'click li a': 'onItemClick'
    },

    getTemplateData: function() {
      return {
        label: this.label,
        iconCls: this.iconCls,
        menuItems: this.menuItems,
        showCaret: this.showCaret,
        buttonStyle: this.buttonStyle,
        dropdownCls: this.opens === 'left' ? 'pull-right' : ''
      };
    },

    setLabel: function(label) {
      this.label = label;
      this.render();
    },

    /** Methods **/

    open: function() {
      this.$el.addClass('open');
    },

    close: function() {
      this.$el.removeClass('open');
    },

    /** Event Handlers **/

    onItemClick: function(e) {
      this.trigger('itemClick', this, $(e.target).data('value'));
    }
  });
});
