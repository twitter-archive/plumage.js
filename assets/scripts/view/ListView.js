define([ 'jquery', 'underscore', 'backbone',
  'PlumageRoot',
  'collection/Selection',
  'view/CollectionView','view/ListItemView' ], function($, _, Backbone, Plumage,
      Selection, CollectionView, ListItemView) {

  /**
   * ListView is a CollectionView that renders a selectable, navigable UL.
   */
  return Plumage.view.ListView = CollectionView.extend(
  /** @lends Plumage.view.ListView.prototype */
  {

    selection : undefined,

    selectionAttr: 'selectionId',

    className : 'list-view',

    itemViewCls: ListItemView,

    /**
     * Can select items?
     */
    selectable : true,

    /**
     * Select first item by default
     */
    autoselect: true,


    /**
     * CollectionView with selectable items. Useful for eg master/detail.
     * @constructs
     * @extends Plumage.view.CollectionView
     */
    initialize : function(options) {
      var me = this;
      CollectionView.prototype.initialize.apply(this, arguments);

      if (this.selectable && !this.selection) {
        this.setSelectionModel(new Selection());
      }
    },

    setSelectionModel: function(selection) {
      if (this.selection) {
        this.selection.off('change', this.onSelectionChange, this);
      }
      this.selection = selection;
      this.selection.on('change', this.onSelectionChange, this);
      this.autoSelectFirst();
      this.updateSelection();
    },

    onRender : function() {
      CollectionView.prototype.onRender.apply(this, arguments);
      this.autoSelectFirst();
      this.updateSelection();
    },

    /* Overrides */

    renderItem: function() {
      var itemView = CollectionView.prototype.renderItem.apply(this, arguments);
      itemView.on('select', this.onItemViewSelect.bind(this));
      return itemView;
    },

    update: function() {
      CollectionView.prototype.update.apply(this, arguments);
      this.autoSelectFirst();
    },

    /* Event Handlers */

    onSelectionChange: function() {
      if (this.selectable) {
        this.updateSelection();
        this.trigger('selectionChange', this.selection.get(this.selectionAttr));
      }
    },

    onItemViewSelect: function(view, model) {
      this.select(model.id);
    },

    /* Helpers */

    autoSelectFirst: function() {
      if (this.selection.get(this.selectionAttr) === undefined && this.autoselect) {
        this.selectFirst();
      }
    },

    /**
     * Update the view based on the current selection state
     */
    updateSelection: function() {
      if (this.selectable) {
        var id = this.selection.get(this.selectionAttr);
        if (id !== undefined) {
          var selectedModel = this.model.getById(id);
          if (!selectedModel) {
            return;
          }
          for (var i=0; i < this.itemViews.length; i++) {
            var itemView = this.itemViews[i];
            if (itemView.model.id === selectedModel.id) {
              itemView.$el.addClass('active');
            } else {
              itemView.$el.removeClass('active');
            }
          }
        }
      }
    },

    /** Modifiers */

    select : function(id) {
      this.selection.set(this.selectionAttr, id);
    },

    selectFirst: function() {
      if (this.model && this.model.size()) {
        this.selection.set(this.selectionAttr, this.model.at(0).id);
      }
    }
  });
});
