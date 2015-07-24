var Plumage = require('PlumageRoot');
var CategorySelect = require('view/form/fields/CategorySelect');

var template = require('view/form/templates/FileDropZone.html');

module.exports = Plumage.view.form.fields.ButtonGroupSelect = CategorySelect.extend({

  className: 'button-group-select',

  template: template,

  events:{
    'click li': 'onItemClick'
  },

  initialize: function() {
    CategorySelect.prototype.initialize.apply(this, arguments);
    this.$el.data('toggle', 'buttons-radio');
  }
});