define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'controller/BaseController',
  'util/ModelUtil'
],

function($, _, Backbone, Plumage, BaseController, ModelUtil) {

  return Plumage.controller.ModelController = BaseController.extend(
  /** @lends Plumage.controller.ModelController.prototype */
  {

    /** Model Class for detail view. Override this */
    modelCls: undefined,

    /** Collection Class for index view. Override this */
    indexModelCls: undefined,

    /** Options to pass into index model constructor */
    indexModelOptions: {},

    /** View class for index. Override this */
    indexViewCls: undefined,

    /** View class for detail. Override this */
    detailViewCls: undefined,

    /** View class for editing. Override this */
    editViewCls: undefined,

    notFoundMessage: '404 Not Found',

    /**
     * Controller with general index and detail handlers.
     *
     * Handles creating index and detail models from url params, creating index and detail views,
     * binding models to said views, showing the view, and loading the model.
     * @constructs
     * @extends Plumage.controller.BaseController
     */
    initialize : function(app, options) {
      BaseController.prototype.initialize.apply(this, arguments);
      options = options || {};
      this.modelCls = ModelUtil.loadClass(options.modelCls ? options.modelCls : this.modelCls);

      this.indexModelCls = ModelUtil.loadClass(options.indexModelCls ? options.indexModelCls : this.indexModelCls);
      this.indexModelOptions = options.indexModelOptions ? options.indexModelOptions : this.indexModelOptions;
      this.indexViewCls = ModelUtil.loadClass(options.indexViewCls ? options.indexViewCls : this.indexViewCls);
      this.detailViewCls = ModelUtil.loadClass(options.detailViewCls ? options.detailViewCls : this.detailViewCls);
      this.editViewCls = ModelUtil.loadClass(options.editViewCls ? options.editViewCls : this.editViewCls);
    },

    /** override to set activeModel*/
    runHandler: function(handlerName, params) {
      //this.setActiveModel(undefined);
      //var promise = this[handlerName].apply(this, params);
      //if (promise) {
      //  return promise.done(function (model, resp) {
      //    if (model) {
      //      this.setActiveModel(model);
      //    }
      //  }.bind(this));
      //}
    },

    /** Get the most recently used index model */
    getIndexCollection: function() {
      return this.indexModel;
    },

    /** Get the most recently used detail model */
    getDetailModel: function() {
      return this.detailModel;
    },

    /** handler for showing the index view. Override this to accept more url params */
    showIndex: function(params) {
      params = params || {};
      if (params && params.filters && typeof(params.filters) === 'string') {
        params.filters = JSON.parse(params.filters);
      }
      var model = this.createIndexModel({}, params);
      return this.showIndexModel(model);
    },

    /** handler for showing the detail view. Override this to accept more url params*/
    showDetail: function(urlId, params){

      var model = this.createDetailModel(urlId, {}, params);
      return this.showDetailModel(model);
    },

    /** handler for showing the new view. Override this to accept more url params*/
    showNew: function(fragment, params){
      var model = this.createEditModel();
      return this.showEditModel(model);
    },

    showEdit: function(urlId, params){
      var model = this.createEditModel(urlId, {}, params);
      return this.showEditModel(model);
    },

    /** Logic for binding a model to, and then showing the index view */
    showIndexModel: function(model) {
      this.indexModel = model;
      var view = this.getIndexView();
      view.setModel(this.indexModel);
      this.showView(view);

      this.indexModel.on('change', this.onIndexChange.bind(this));
      return this.loadModel(this.indexModel, {reset: true}).done(function() {
        view.setModel(model);
      });

    },

    /**
     * Logic for binding a model to, and then showing the detail view
     * Override to add extra event handlers.
     *
     *
     */
    showDetailModel: function(model) {

      var view = this.getDetailView();

      var result;
      if (this.getCurrentView() !== view || model !== this.detailModel) {
        if (this.detailModel) {
          this.detailModel.off('error', this.onModelError, this);
        }

        this.detailModel = model;
        this.detailModel.on('error', this.onModelError, this);
        view.setModel(model);
        result = this.loadModel(model).done(function () {
          // call setModel again, so subviews can get newly loaded related models
          if (model.related) {
            view.setModel(model);
          }
        });
      } else {
        result = $.Deferred().resolve(model).promise().done();
      }

      this.showView(view);
      return result;
    },

    showEditModel: function(model) {
      var view = this.getEditView();

      view.setModel(model);
      this.showView(view);

      this.loadModel(model).done(function() {
        // call setModel again, so subviews can get newly loaded related models
        if (model.related) {
          view.setModel(model);
        }
      });
    },

    //
    // View getters
    //

    /** Get and lazy create the index view */
    getIndexView: function() {
      if (!this.indexView) {
        var index = this.indexView = this.createIndexView();
      }

      return this.indexView;
    },

    /** Get and lazy create the detail view */
    getDetailView: function() {
      if (!this.detailView) {
        this.detailView = this.createDetailView();
      }
      return this.detailView;
    },

    getEditView: function() {
      if (!this.editView) {
        this.editView = this.createEditView();
      }
      return this.editView;
    },

    // Hooks

    /** Create the index model from specified data. */
    createIndexModel: function(options, meta) {
      return this.createCollection(this.indexModelCls, options, meta);
    },

    /**
     * Create the detail model from specified attributes.
     * Override to add default attributes, eg empty relationships.
     */
    createDetailModel: function(urlId, attributes, viewState) {
      var result = this.createModel(this.modelCls, urlId, attributes, viewState);
      if (this.detailModel && result.url() === this.detailModel.url()) {
        this.detailModel.set(attributes);
        if (viewState) {
          this.detailModel.setViewState(viewState);
        }
        result = this.detailModel;
      }
      return result;
    },

    /**
     * Create the edit model from specified attributes.
     * Override to add default attributes, eg empty relationships.
     */
    createEditModel: function(urlId, attributes, viewState) {
      return this.createModel(this.modelCls, urlId, attributes, viewState);
    },

    /** Helper for creating the detail model. */
    createModel: function(modelCls, urlId, attributes, viewState) {
      attributes = attributes || {};
      var options = {};
      if (urlId) {
        attributes = _.clone(attributes);
        attributes[modelCls.prototype.urlIdAttribute] = urlId;
      }
      options.viewState = viewState;
      return new modelCls(attributes, options);
    },

    createCollection: function(modelCls, options, meta) {
      options = _.clone(options || {});
      meta = _.clone(meta || {});
      var filters = meta.filters;
      if (filters) {
        if (filters && typeof(filters) === 'string') {
          meta.filters = JSON.parse(meta.filters);
        }
      }
      options = _.extend(_.clone(this.indexModelOptions || {}), options);
      options.meta = meta;
      return new modelCls(null, options);
    },

    /** Create the index view. Feel free to override */
    createIndexView: function () {
      var index =  new this.indexViewCls();
      index.on('itemSelected', this.onIndexItemSelected, this);
      return index;
    },

    /** Create the detail view. Feel free to override */
    createDetailView: function () {
      return new this.detailViewCls();
    },

    /** Create the detail view. Feel free to override */
    createEditView: function () {
      return new this.editViewCls();
    },

    setActiveModel: function(model) {
      //if (this.activeModel) {
      //  this.activeModel.off('change', this.onActiveModelChange, this);
      //}
      //this.activeModel = model;
      //if (this.activeModel) {
      //  this.activeModel.on('change', this.onActiveModelChange, this);
      //}
    },

    // Event Handlers

    onActiveModelChange: function() {
      //this.activeModel.updateUrl();
    },

    /** Show detail view on index item select */
    onIndexItemSelected: function(selection) {
      if(selection) {
        var model = this.createDetailModel(null, selection.attributes);
        model.navigate();
      }
    },

    /** Reload the index model on change. eg sort field or filter change */
    onIndexChange: function(collection) {
      this.reloadIndex(collection);
    },

    onModelError: function(model, response, options) {
      if (response.status === 404) {

        this.createIndexModel().navigate({replace: true});
        setTimeout(function() {
          theApp.dispatch.trigger('message', this.notFoundMessage, 'bad');
        }.bind(this), 500);
      }
    },

    /**
     * Debounced helper for reloading the index model
     * @param {Plumage.model.Collection} collection Collection to reload
     * @param {Boolean} updateUrl should update url? default to true
     */
    reloadIndex: _.debounce(function(collection) {
      collection.load({reset: true});
    }, 200)
  });
});