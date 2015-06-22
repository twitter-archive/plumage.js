define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView'
], function($, _, Backbone, Handlebars, Plumage, ModelView) {


  return Plumage.view.CollectionView = ModelView.extend(
  /** @lends Plumage.view.CollectionView.prototype */
  {

    className: 'collection-view',

    /** Class of ModelView to render for each Model in the Collection. */
    itemViewCls: undefined,

    /** Map of options to pass into constructor of sub ModelViews. */
    itemOptions: {},

    template: '<ul class="items"></ul>{{#moreUrl}}<a class="more-link" href="{{.}}">more</a>{{/moreUrl}}',

    /** Template to render when there are no items. */
    emptyTemplate: 'No items',

    /**
     * url string or function(model) that returns url to go to for more pages of this view
     */
    moreUrl: undefined,

    renderOnChange: false,

    /**
     * A ModelView that renders a sub ModelView for each item in its bound [Collection]{@link Plumage.collection.Collection}
     *
     * CAUTION: Item ModelViews must have a different [modelCls]{@link Plumage.view.ModelView#modelCls} than the CollectionView
     * so they don't get the Collection bound to it.
     *
     * Item Views are kept in itemViews instead of subViews to prevent them from getting hit with containerView composite methods
     * (not sure if this is really necessary).
     *
     * @constructs
     * @extends Plumage.view.ModelView
     */
    initialize:function (options) {
      ModelView.prototype.initialize.apply(this, arguments);
      options = options || {};

      if (typeof(this.emptyTemplate) === 'string') {
        this.emptyTemplate = Handlebars.compile(this.emptyTemplate);
      }
      this.itemViews = [];
    },

    //
    // overrides
    //

    getTemplateData: function() {
      var moreUrl;
      if (this.moreUrl && this.model && this.model.hasMore()) {
        moreUrl = $.isFunction(this.moreUrl) ? this.moreUrl(this.model) : this.moreUrl;
      }
      var data = {
        size: this.model && this.model.fetched ? this.model.size() : '',
        moreUrl: moreUrl
      };
      return data;
    },

    /** Get the el to render subViews into. */
    getItemsEl: function() {
      return this.template ? this.$('.items') : this.$el;
    },

    onRender:function () {
      if (this.template) {
        this.$el.html(this.template(this.getTemplateData()));
      }
      var itemsEl = this.getItemsEl();
      itemsEl.empty();

      //keep for reuse
      var oldItemViews = this.itemViews || [];
      this.itemViews = [];

      if (this.model && this.model.size()) {
        this.model.forEach(function(model, i) {
          var itemView = oldItemViews.pop() || this.renderItem();
          itemView.setModel(model);
          itemView.index = i;
          //TODO could be optimized to not render if reusing view
          itemView.render();

          itemsEl.append(itemView.el);
          if (this.shown) {
            itemView.onShow();
          }
          this.itemViews.push(itemView);
        }, this);
      }

      this.updateEmpty();

      //remove extra views
      _.each(oldItemViews, function(itemView){
        itemView.remove();
      }, this);
      this.hideLoadingAnimation();
    },

    update: function() {
      ModelView.prototype.update.apply(this, arguments);
    },

    updateModel: function(rootModel, parentModel) {
      ModelView.prototype.updateModel.apply(this, arguments);
      var collection = this.getModelFromRoot(this.relationship, rootModel, parentModel);
      if (collection) {
        collection.each(function(model, index) {
          if (index < this.itemViews.length) {
            this.itemViews[index].updateModel(model);
          }
        }.bind(this));
      }
    },

    //
    // Helpers
    //

    /**
     * Render a subView
     * @private
     */
    renderItem: function() {
      var view = new this.itemViewCls(this.itemOptions);
      view.on('afterRender', this.onItemRender.bind(this));
      return view;
    },

    /**
     * Show/hide [emptyTemplate]{@link Plumage.view.CollectionView#emptyTemplate} if necessary.
     * @private
     */
    updateEmpty: function() {
      if ((!this.model || (this.model.fetched && this.model.size() === 0)) &&
          this.emptyTemplate !== undefined) {

        this.getItemsEl().html(this.emptyTemplate());
      }
    },

    //
    // Methods
    //

    /**
     * Get the subView with bound model with the given id.
     * @param {Object} itemId Id of bound model.
     */
    getItemView: function(itemId) {
      for (var i=0;i<this.itemViews.length;i++) {
        var itemView = this.itemViews[i];
        if (itemView.model.id === itemId) {
          return itemView;
        }
      }
    },

    /**
     * Event Handlers
     */

    onModelAdd: function(model) {
      if (this.isRendered) {
        //TODO only render view for added model
        this.update(true);
      }
    },

    onModelRemove: function(model) {
      if (this.isRendered) {
        //TODO only remove view for removed model
        this.update(true);
      }
    },

    onModelLoad: function() {
      ModelView.prototype.onModelLoad.apply(this, arguments);
    },

    onModelDestroy: function(model) {
      for (var i=0;i<this.itemViews.length;i++) {
        var itemView = this.itemViews[i];
        if (itemView.model.id === model.id) {
          itemView.remove();
          break;
        }
      }
      this.updateEmpty();
    },

    onShow: function() {
      ModelView.prototype.onShow.apply(this, arguments);
      this.eachItemView(function(itemView){
        itemView.onShow();
      });
    },

    onHide: function() {
      ModelView.prototype.onHide.apply(this, arguments);
      this.eachItemView(function(itemView){
        itemView.onHide();
      });
    },

    /**
     * Helper method for calling a callback with ecah itemView
     */
    eachItemView: function(callback, scope) {
      if (this.itemViews) {
        _.each(this.itemViews, function(itemView) {
          if (scope) {
            callback.call(scope, itemView);
          } else {
            callback(itemView);
          }
        }, this);
      }
    },

    onDoneLoad: function(){
      this.hideLoadingAnimation();
    },

    onModelBeginLoad: function () {
      this.showLoadingAnimation();
    },

    onItemRender: function(itemView) {
      this.trigger('itemRender', this, itemView);
    }
  });
});