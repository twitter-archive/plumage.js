var Plumage = require('PlumageRoot');
var CategorySelect = require('view/form/fields/CategorySelect');

module.exports = Plumage.view.form.fields.ButtonGroupSelect = CategorySelect.extend({

  className: 'button-group-select',

  template: require('view/form/fields/templates/ButtonGroupSelect.html'),

  events:{
    'click li': 'onItemClick'
  },

  initialize: function() {
    CategorySelect.prototype.initialize.apply(this, arguments);
    this.$el.data('toggle', 'buttons-radio');
  }
});