var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Handlebars = require('handlebars');
var Spinner = require('spin.js');
var Plumage = require('PlumageRoot');

module.exports = Plumage.view.View = Backbone.View.extend(
/** @lends Plumage.view.View.prototype */
  {

    /** Has this view been rendered? */
    isRendered: false,

    /** Is this view loading (showing loading animation)? */
    isLoading: false,

    /** Is this view currently shown? */
    shown: false,

    /** handlebars template string or template function to render. */
    template: undefined,

    /** If specified, and this view is a top level view,
     * bodyCls is added to the DOM body when this view is shown by a Controller (and removed when hidden).
     * See [BaseController.showView]{@link Plumage.controller.BaseController#showView}))
     */
    bodyCls: undefined,

    /**
     * If set, don't render until [onShow]{@link Plumage.view.View#onShow} is called.
     * Normally a view will be rendered when its parent is rendered.
     */
    deferRender: false,

    /**
     * Options passed into [spin.js]{@link http://fgnass.github.io/spin.js/}
     */
    loadingAnimationOptions: undefined,

    //
    // Life Cycle
    ///////////////

    constructor: function(options) {
      options = options || {};
      _.extend(this, options);

      Backbone.View.apply(this, arguments);
    },

    /**
     * View class that renders to a DOM element.
     * Very basic. Most of the time you'll want to use/extend [ContainerView]{@link Plumage.view.ContainerView} or [ModelView]{@link Plumage.view.ModelView}.
     *
     * CAUTION: Do not override [render]{@link Plumage.view.View#render} like you would with a Backbone.View. Override the template method [onRender]{@link Plumage.view.View#onRender} instead.
     *
     * In addition to what Backbone.View does, Plumage.view.View adds:
     *
     *  - default [onRender]{@link Plumage.view.View#onRender} that renders a handlerbars template with data from [getTemplateData]{@link Plumage.view.View#getTemplateData}.
     *  - beforeRender and afterRender events and hooks.
     *  - [deferRender]{@link Plumage.view.View#deferRender} flag which defers rendering until [onShow]{@link Plumage.view.View#onShow} is called. Good for tabs etc which aren't visible initially.
     *  - [onShow]{@link Plumage.view.View#onShow} and [onHide]{@link Plumage.view.View#onHide} hooks. These are called automatically by [BaseController]{@link Plumage.controller.BaseController}.
     *
     * @constructs
     * @extends Backbone.View
     */
    initialize:function (options) {
      this.template = this.initTemplate(this.template);
    },

    initTemplate: function(template) {
      if (typeof(template) === 'string') {
        template = Handlebars.compile(template);
      }
      return template;
    },

    /** Hook called before render. Does nothing. */
    beforeRender: function() {
    },

    /**
     * Instead of rendering in this method, render triggers render hooks and events, then calls
     * the template method onRender to do the actual rendering.
     * @returns this;
     */
    render: function() {
      if (this.deferRender && !this.shown) {
        return;
      }

      this.beforeRender();
      this.trigger('beforeRender', this);

      this.onRender();
      this.hideLoadingAnimation();

      this.isRendered = true;
      this.trigger('afterRender', this);
      return this;
    },

    /**
     * Template method that returns data to pass into the handlebars template.
     *
     * Override to provide custom data.
     *
     * @returns {Object} Map of template data.
     */
    getTemplateData: function() {
      return {};
    },

    /**
     * Perform actually rendering here.
     *
     * Default implementation renders [template]{@link Plumage.view.View#template}
     * with data from [getTemplateData]{@link Plumage.view.View#getTemplateData}.
     */
    onRender:function () {
      if (this.template) {
        var data = this.getTemplateData();
        $(this.el).html(this.template(data));
      }
    },

    /**
     * Update when already rendered.
     * Default to just render again, but can be made more efficient by only updating what's changed.
     *
     * @param {Boolean} isLoad Context of update. True if loading, false if changing.
     */
    update: function(isLoad) {
      this.render();
    },

    remove: function() {
      Backbone.View.prototype.remove.apply(this, arguments);
      this.hideLoadingAnimation();
      return this;
    },

    /**
     * Hook called when this view is shown.
     *
     * Sets the shown flag, triggers deferred rendering and delegates events.
     *
     * If overriding, make sure to call super.
     */
    onShow: function() {
      this.shown = true;
      if (this.deferRender && !this.isRendered) {
        this.render();
      }
      this.delegateEvents();
    },


    /**
     * Hook called when this view is hidden.
     *
     * Unsets the shown flag, hides loading animation and undelegates events.
     *
     * If overriding, make sure to call super.
     */
    onHide: function() {
      if (this.shown) {
        this.undelegateEvents();
        this.shown = false;
      }
      this.hideLoadingAnimation();
    },

    /**
     * Handle link clicks by triggering navigate on the Router instead of reloading the page.
     * Not used by default. Add to events if necessary.
     */
    onLinkClick: function(e) {
      // allow command click to open in new tab
      if (e.metaKey) {
        return;
      }

      var a = $(e.target).closest('a');
      if (!a.hasClass('outlink') && a.attr('href') && a.attr('href')[0] !== '#' && a[0].host === window.location.host) {
        e.preventDefault();
        e.stopPropagation();
        var url = a.prop('pathname') + a.prop('search');
        window.router.navigateWithQueryParams(url, {trigger: true});
      }
    },

    /**
     * Handle anchor clicks by scrolling to the anchor in the page element.
     * Necessary because body has height: 100%
     */
    onAnchorClick: function(e) {
      e.preventDefault();
      var a = $(e.target).closest('a');
      var href = a.attr('href'); //should already have #
      $('#page').animate({scrollTop: $(href).offset().top - 50}, 400);
    },

    callOrRecurse: function(methodName, params) {
      if (this[methodName]) {
        return this[methodName].apply(this, params);
      }
      return true;
    },

    /** Show the loading animation. Uses spin.js */
    showLoadingAnimation: function(el) {
      if (el === undefined) {
        el = this.el;
      }
      var $el = $(this.el);
      var width = $el.width(), height = $el.height();
      if (!this.isRendered || width === 0 && height === 0) {
        this.on('afterRender', this.showLoadingAnimation.bind(this));
        return;
      }

      var opts = {
        lines: 13, // The number of lines to draw
        length: 7, // The length of each line
        width: 4, // The line thickness
        radius: 10, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#000', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };

      opts = _.extend(opts, this.loadingAnimationOptions);

      var offset = $el.offset();
      if(!this.loader){
        this.loader = $('<div class="loader"> <div class="spinner-box"></div> </div>');
        $('body').append(this.loader);
        this.spinner = new Spinner(opts);
      }
      this.spinner.spin($('.spinner-box', this.loader)[0]);
      this.loader.css({
        left: offset.left,
        top: offset.top,
        width: width,
        height: height
      });
      this.loader.show();
      this.spinner.spin($('.spinner-box', this.loader)[0]);
      this.isLoading = true;
    },

    /** Hide the loading animation. */
    hideLoadingAnimation: function() {
      this.off('afterRender', this.showLoadingAnimation.bind(this));
      if(this.loader){
        this.loader.fadeOut('fast', function() {
          this.spinner.stop();
        }.bind(this));
      }
    }
  }
);
