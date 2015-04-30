define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/View',
], function($, _, Backbone, Handlebars, Plumage, View) {

  return Plumage.view.ContainerView = View.extend(
  /** @lends Plumage.view.ContainerView.prototype */
  {

    /** Array of subViews. */
    subViews: [],

    rootModelCls: undefined,

    /**
     * View that contains subViews.
     *
     * Implements composite pattern, i.e. calling render on ContainerView will call render
     * on all it's subViews and their subViews etc, in depth first order.
     *
     * Composite methods like render must call super to ensure recursion.
     *
     * To add a new compositable method (eg updateModel) add it to the ContainerView subclass,
     * and use callOrRecurse to propagate the call even when some subViews don't have the new method.
     * This allows adding new methods without having to have every view implement them.
     * @constructs
     * @extends Plumage.view.View
     */
    initialize:function (options) {
      View.prototype.initialize.apply(this, arguments);
    },

    /**
     * Get subView by name
     */
    getSubView: function(name) {
      var result = this.doGetSubView(name);
      if (!result) {
        console.warn('Failed getting subview with name: ' + name);
      }
      return result;
    },

    doGetSubView: function(name) {
      var names = typeof(name) === 'string' ? name.split('.') : name;
      if (!names) {
        return undefined;
      }
      var result = _.findWhere(this.subViews, {name: names[0]});
      names.shift();
      if (result && names.length) {
        result = result.doGetSubView(names);
      }
      return result;
    },

    /**
     * Detach rendered subviews so they don't get clobbered.
     * @override
     */
    beforeRender: function() {
      this.eachSubView(function(subView, selector) {
        if(subView.isRendered) {
          subView.$el.detach();
        }
      });
    },

    /**
     * Composite method.
     * Triggers render events, calls onRender, and recurses to subviews.
     * @override
     */
    render: function() {
      if (this.deferRender && !this.shown) {
        return;
      }
      this.beforeRender();
      this.trigger('beforeRender', this);

      this.onRender();
      this.renderSubViews();

      this.isRendered = true;
      this.trigger('afterRender', this);
      return this;
    },

    onRender: function() {
      View.prototype.onRender.apply(this, arguments);
    },

    /**
     * Render and add subViews to this.el based on their selector property.
     */
    renderSubViews: function() {
      var me = this;
      this.eachSubView(function(subView) {
        if (subView.replaceEl) {
          subView.setElement(me.$(subView.selector)[0]);
          if (subView.className) {
            subView.$el.addClass(subView.className);
          }
          subView.render();
        } else {
          var containerEl = me.$el;
          if (subView.selector) {
            containerEl = me.$(subView.selector);
          }
          subView.render();
          if (subView.el) {
            containerEl.append(subView.el);
          }
        }
      });
    },

    remove: function() {
      View.prototype.remove.apply(this, arguments);
      return this;
    },

    hideLoadingAnimation: function() {
      View.prototype.hideLoadingAnimation.apply(this, arguments);
    },


    //
    // Hooks
    //

    /**
     * Composite method.
     * @override
     */
    onShow: function() {
      View.prototype.onShow.apply(this, arguments);
      this.eachSubView(function(subView) {
        subView.onShow();
      });
    },

    /**
     * Composite method.
     * @override
     */
    onHide: function() {
      View.prototype.onHide.apply(this, arguments);
      this.eachSubView(function(subView) {
        subView.onHide();
      });
    },

    onLinkClick: function(e) {
      View.prototype.onLinkClick.apply(this, arguments);
    },

    //
    // Util
    //

    /**
     * Helper method that calls a callback with each subView.
     * @param {function} callback Callback to call on each subView
     * @param {Object} scope Scope for callback. or just use bind.
     */
    eachSubView: function(callback, scope) {
      _.each(this.subViews, function(subView) {
        if (scope) {
          callback.call(scope, subView);
        } else {
          callback(subView);
        }
      }, this);
    },

    /**
     * Calls a method on ContainerView if it exists or calls it on its subViews.
     * Eliminates need for ContainerView to know about composite methods provided by subclasses.
     * @param {string} methodName Name of method to call.
     * @param {Array} params Params to pass into method.
     */
    callOrRecurse: function(methodName, params) {
      if (this[methodName]) {
        return this[methodName].apply(this, params);
      } else {
        var success = true;
        this.eachSubView(function(subView) {
          success = subView.callOrRecurse(methodName, params) && success;
        });
        return success;
      }
    }
  });
});
