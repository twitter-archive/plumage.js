define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ContainerView',
  'util/ModelUtil',
  'ViewBuilder',
  'text!view/templates/LoadError.html'
], function($, _, Backbone, Handlebars, Plumage, ContainerView, ModelUtil, ViewBuilder, errorTemplate) {



  return Plumage.view.ModelView = ContainerView.extend(
  /** @lends Plumage.view.ModelView.prototype */
  {

    /**
     * Class of model to bind to. Ignores all other models passed into setModel.
     *
     * Useful for preventing a subView from getting bound to a superview's model.
     */
    modelCls: undefined,

    /**
     * The relationship path in the root model to get the model for this view.
     *
     * Doesn't support dot notation but should at some point.
     */
    relationship: undefined,

    /**
     * Should [render]{@link Plumage.view.View#render} by called on model change?
     *
     * If left unset, update will be called on change only if this view has no subViews.
     */
    renderOnChange: undefined,


    /**
     * Should [render]{@link Plumage.view.View#render} by called on model load?
     *
     * If left unset, update will be called on load only if this view has no subViews.
     */
    renderOnLoad: undefined,

    /**
     * Instead of a View, ModelView can take config object as a subView, and instantiate
     * a View from it. If no viewCls is specified, defaultSubViewCls is used.
     */
    defaultSubViewCls: undefined,

    defaultSubViewOptions: undefined,

    /**
     * Adding to the functionality of ConainerView, ModelView supports binding of Models to it.
     *
     * This is the default View to use. Most of the time you should be
     * binding models to your views.
     *
     * Bind a [Model]{@link Plumage.model.Model} to ModelView using [setModel]{@link Plumage.view.ModelView#setModel}.
     * This will connect the various model events, with some default handling, eg render on load.
     *
     * setModel is a [ContainerView]{@link Plumage.view.ContainerView} composite method.
     * i.e. calling setModel on the root ModelView will recursively call setModel with the same model object
     * on all child ModelViews.
     *
     *  - A child ModelView can specify which part of the model to bind to using the [relationship]{@link Plumage.view.ModelView#relationship}
     *    param (leave it blank to have it bind to the root model).
     *  - If a child ModelView should only be bound to a certain Model class, specifiy
     *    [modelCls]{@link Plumage.view.ModelView#modelCls} with the Model class to restrict it to.
     *
     *    eg. a child view might be located under a parent ModelView in the DOM, but not be related in the data
     *    structure. In this case set modelCls on the child so it doesn't get the parent's Model set on it.
     *
     * ModelView also uses ViewBuilder automatically, for intantiating subviews. If passed a config
     * object instead of a View in subViews, it will be instantiated by ViewBuilder.
     *
     * @constructs
     * @extends Plumage.view.ContainerView
     */
    initialize:function (options) {
      ContainerView.prototype.initialize.apply(this, arguments);

      this.buildSubViews();

      //Backbone.View constructor will already set model if it's passed in.
      if (this.model) {
        throw 'Do not pass model into constructor. call setModel';
      }
    },

    buildSubViews: function() {
      var viewBuilder = new ViewBuilder({
        defaultViewCls: this.defaultSubViewCls,
        defaultViewOptions: this.defaultSubViewOptions
      });

      this.subViews = $.isArray(this.subViews) ? this.subViews : [this.subViews];
      this.subViews = _.map(this.subViews, function(subView) {
        return viewBuilder.buildView(subView);
      });
    },

    /**
     * Gets model to bind to from the root model.
     * @param {Plumage.model.Model} model The root model.
     * @param {string} relationship The relationship path in the root model to get the model for this view.
     */
    getModelFromRoot: function(relationship, model, parentModel) {
      if (!model) {
        return;
      }
      if (!relationship) {
        return model;
      }

      if (relationship.slice(0,1) === '.') {
        if (parentModel) {
          return parentModel.getRelated(relationship.slice(1));
        }
        return undefined;
      }

      return model.getRelated(relationship);
    },

    //
    // Life Cycle
    //

    /**
     * Bind a model if applicable. Call setModel on your top level view in your Controller.
     *
     * Calls onModelLoad if the model has changed (set model != this.model) and is already loaded.
     *
     * @params {Plumage.model.Model} rootModel The root model
     * @params {Plumage.model.Model} parentModel The model the parent view bound to. For relative relationships.
     * @params {Boolean} force Ignore modelCls. Normally used when modelCls = false.
     */
    setModel: function(rootModel, parentModel, force) {
      if (!force) {
        if (this.rootModelCls && rootModel) {
          var rootModelCls = requirejs(this.rootModelCls);
          if (!(rootModel instanceof rootModelCls)) {
            return;
          }
        }
        this.rootModel = rootModel;
      }

      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        changed = true;
      if (!force && this.modelCls !== undefined) {
        if (this.modelCls === false) {
          return;
        }
        if (model && !(model instanceof ModelUtil.loadClass(this.modelCls))) {
          return;
        }
      }

      if (model && this.model &&
          model.id !== undefined && this.model.id !== undefined && model.id === this.model.id) {
        changed = false;
      }
      if (this.model) {
        this.model.off(null,null,this);
      }
      this.model = model;
      if (this.model) {
        this.model.on('beginLoad', this.onModelBeginLoad, this);
        this.model.on('change', this.onModelChange, this);
        this.model.on('load', this.onModelLoad, this);
        this.model.on('add', this.onModelAdd, this);
        this.model.on('remove', this.onModelRemove, this);
        this.model.on('destroy', this.onModelDestroy, this);
        this.model.on('invalid', this.onModelInvalid, this);
        this.model.on('error', this.onModelError, this);
      }

      if (changed && this.model && this.model.fetched) {
        this.onModelLoad();
      }

      if (this.shown) {
        this.ensureData();
      }

      //recurse
      this.eachSubView(function(subView) {
        subView.callOrRecurse('setModel', [rootModel, this.model]);
      }.bind(this));
    },

    /** triggers loading of deferLoad Models. */
    ensureData: function() {
      if (this.model && this.model.deferLoad && !this.model.fetched) {
        this.model.fetchIfAvailable();
      }
    },

    /**
     * Provides template data to render with.
     *
     * ModelView's implemenation returns the result of this.model.toViewJSON
     * @override
     */
    getTemplateData: function() {
      var data = {};
      if (this.model) {
        data = this.model.toViewJSON();
        if (this.model.hasUrl() && !data.model_url) {
          data.model_url = this.model.urlWithParams();
        }
      }
      return data;
    },

    /**
     * Update given model with any changes eg from forms
     * @param {Plumage.model.Model} model Model to update.
     */
    updateModel: function(rootModel, parentModel) {
      var success = true;
      this.eachSubView(function(subView) {
        success = subView.callOrRecurse('updateModel', [rootModel, this.model]) && success;
      });
      return success;
    },

    isValid: function(rootModel, parentModel) {
      var valid = true;
      this.eachSubView(function(subView) {
        valid = subView.callOrRecurse('isValid', [rootModel, this.model]) && valid;
      });
      return valid;
    },

    /** Hook to modify view state on model load */
    updateViewState: function(model) {

    },

    hideLoadingAnimation: function() {
      ContainerView.prototype.hideLoadingAnimation.apply(this, arguments);
    },

    shouldRender: function(isLoad) {
      var hasSubViews = this.subViews.length > 0;
      var shouldRenderFlag = isLoad ? this.renderOnLoad : this.renderOnChange;
      return shouldRenderFlag !== undefined && shouldRenderFlag ||
        shouldRenderFlag === undefined && !hasSubViews;
    },

    update: function(isLoad) {
      if (this.isRendered && this.shouldRender(isLoad)) {
        this.render();
      }
    },

    //
    // Event Handlers
    //

    onModelBeginLoad: function() {
      this.loading = true;
    },

    onModelChange: function(event, model) {
      this.update(false);
    },

    onModelLoad: function(model, options) {
      this.loading = false;
      this.updateViewState(model);
      this.update(true);
      this.hideLoadingAnimation();
    },

    onModelAdd: function(event, model) {
      this.onModelChange(event, model);
    },

    onModelRemove: function(event, model) {
      this.onModelChange(event, model);
    },

    onModelDestroy: function(event, model) {
    },

    onModelInvalid: function(model, validationErrors) {
    },

    onModelError: function(model, response, options) {
      $(this.el).html(Handlebars.compile(errorTemplate)(options.data));

      //needs rerendering after rendering error template
      this.isRendered = false;
    },

    remove: function() {
      ContainerView.prototype.remove.apply(this, arguments);
      if (this.model) {
        this.model.off(null, null, this);
      }
      return this;
    },

    onShow: function() {
      ContainerView.prototype.onShow.apply(this, arguments);
      this.ensureData();
    },

    onHide: function() {
      ContainerView.prototype.onHide.apply(this, arguments);
    },

    /** override to short circuit changes to view state only */
    onLinkClick: function(e) {
      var a = $(e.target).closest('a');
      if (!a.hasClass('outlink')) {
        if (a.attr('href')[0] === '?') {
          e.preventDefault();
          e.stopPropagation();
          var params = ModelUtil.parseQueryString(a.attr('href').slice(1));
          this.model.set(params);
          this.model.updateUrl({replace: false});
        } else {
          ContainerView.prototype.onLinkClick.apply(this, arguments);
        }
      }
    },

    delegateEvents: function(events) {
      Backbone.View.prototype.delegateEvents.apply(this, arguments);
    },

    undelegateEvents: function(events) {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
    }
  });
});