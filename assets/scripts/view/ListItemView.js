define([ 'jquery', 'underscore', 'backbone',
  'PlumageRoot',
  'view/ModelView' ], function($, _, Backbone, Plumage, ModelView) {

  /**
   * Default ItemView for ListView
   */
  return Plumage.view.ListItemView = ModelView.extend(
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
});
