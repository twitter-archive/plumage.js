define([ 'jquery', 'underscore', 'backbone',
  'PlumageRoot',
  'view/ModelView' ], function($, _, Backbone, Plumage, ModelView) {

  /**
   * ListView is a CollectionView that renders a selectable, navigable UL.
   */
  return Plumage.view.ListItemView = ModelView.extend({

    tagName : 'li',

    className : 'list-item-view',

    events: {
      'click': 'onClick'
    },

    /** Event Handlers */

    onClick: function() {
      this.trigger('select', this, this.model);
    }

  });
});
