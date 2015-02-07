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
      this.showIndexModel(model);
    },

    /** handler for showing the detail view. Override this to accept more url params*/
    showDetail: function(id, params){
      var model = this.createDetailModel(id, {}, params);
      this.showDetailModel(model);
    },

    /** handler for showing the new view. Override this to accept more url params*/
    showNew: function(params){
      var model = this.createEditModel();
      this.showEditModel(model);
    },

    /** Logic for binding a model to, and then showing the index view */
    showIndexModel: function(model) {
      this.indexModel = model;
      var view = this.getIndexView();
      view.setModel(this.indexModel);
      this.showView(view);

      this.loadModel(this.indexModel, {reset: true}).then(function() {
        view.setModel(model);
      });

      this.indexModel.on('change', this.onIndexChange.bind(this));
    },

    /**
     * Logic for binding a model to, and then showing the detail view
     * Override to add extra event handlers.
     *
     *
     */
    showDetailModel: function(model) {

      if (this.detailModel) {
        this.detailModel.off('error', this.onModelError, this);
      }

      this.detailModel = model;
      this.detailModel.on('error', this.onModelError, this);

      var view = this.getDetailView();

      view.setModel(model);
      this.showView(view);

      return this.loadModel(model).then(function() {
        // call setModel again, so subviews can get newly loaded related models
        if (model.related) {
          view.setModel(model);
        }
      });
    },

    showEditModel: function(model) {
      var view = this.getEditView();

      view.setModel(model);
      this.showView(view);

      return this.loadModel(model).then(function() {
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
    createDetailModel: function(id, attributes, viewState) {
      return this.createModel(this.modelCls, id, attributes, viewState);
    },

    /**
     * Create the edit model from specified attributes.
     * Override to add default attributes, eg empty relationships.
     */
    createEditModel: function(id, attributes, viewState) {
      return this.createModel(this.modelCls, id, attributes, viewState);
    },

    /** Helper for creating the detail model. */
    createModel: function(modelCls, id, attributes, viewState) {
      attributes = attributes || {};
      var options = {};
      if (id) {
        attributes = _.clone(attributes);
        attributes[modelCls.prototype.idAttribute] = id;
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

    // Event Handlers

    /** Show detail view on index item select */
    onIndexItemSelected: function(selection) {
      if(selection) {
        var model = this.createDetailModel(selection.id, selection.attributes);
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
    reloadIndex: _.debounce(function(collection, updateUrl) {
      updateUrl = updateUrl === undefined ? true : false;
      if (updateUrl) {
        collection.updateUrl();
      }
      collection.load({reset: true});
    }, 200)
  });
});