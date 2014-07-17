define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'RequestManager'
],

function($, _, Backbone, Plumage, requestManager) {

  /**
   * Controller base class.
   *
   * Provides common logic for controllers including showing views (see [showView]{@link Plumage.controller.BaseController#showView}),
   * and loading models (see [loadModel]{@link Plumage.controller.BaseController#loadModel})
   * @constructs Plumage.controller.BaseController
   */
  var BaseController = function () {
    this.initialize.apply(this, arguments);
  };

  _.extend(BaseController.prototype,
  /** @lends Plumage.controller.BaseController.prototype */
  {

    requests: [],

    initialize: function(app) {
      this.app = app;
    },

    /** CSS selector for where to render top level views. See [showView]{@link Plumage.controller.BaseController#showView}. */
    contentSelector: '#page',

    /** The top level view currently shown by this controller */
    currentView: undefined,

    /**
     * Renders and shows a view in the el specified by [contentSelector]{@link Plumage.controller.BaseController#contentSelector}.
     * This hides and triggers onHide on the current view, cancels outstanding requests, then
     * shows and triggers onShow on the specified view.
     *
     * For more specific css styling, showView also adds the view's [bodyCls]{@link Plumage.view.View#bodyCls}))
     * attribute to the DOM body element.
     *
     * @param {Plumage.view.View} view View to show.
     */
    showView: function(view) {
      var currentView = this.app.views.current;
      if (currentView) {
        if (currentView === view) {
          return;
        }
        if (currentView.onHide) {
          currentView.onHide();
        }
        if (currentView.bodyCls) {
          $('body').removeClass(currentView.bodyCls);
        }
      }
      this.app.views.current = view;

      requestManager.abortOutstandingRequests();

      $(this.contentSelector).html(view.el);
      if (!view.isRendered) {
        view.render();
      }
      if (view.bodyCls) {
        $('body').addClass(view.bodyCls);
      }
      if (view.onShow) {
        view.onShow();
      }
    },

    /**
     * Load the specified model. Default implementation delegates to requestManager.
     * @param {Plumage.model.Model} model Model to load.
     */
    loadModel: function(model, options) {
      return requestManager.loadModel(model, options);
    }
  });

  BaseController.extend = Backbone.Model.extend;

  return Plumage.controller.BaseController = BaseController;

});