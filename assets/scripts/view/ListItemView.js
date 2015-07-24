/* globals $, _ */
var Plumage = require('PlumageRoot');
var ModelView = require('view/ModelView');

/**
 * Default ItemView for ListView
 */
module.exports = Plumage.view.ListItemView = ModelView.extend(
/** @lends Plumage.view.ListItemView.prototype */
{

  tagName : 'li',

  className : 'list-item-view',

  events: {
    'click': 'onClick'
  },

  /* Event Handlers */

  onClick: function() {
    this.trigger('select', this, this.model);
  }

});
