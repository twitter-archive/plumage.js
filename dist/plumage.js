define('PlumageRoot',[], function(){
  /** @namespace Plumage */
  return {
    /** @namespace Plumage.model */
    model: {},
    /** @namespace Plumage.collection */
    collection: {},
    /** @namespace Plumage.controller */
    controller: {},
    /** @namespace Plumage.util */
    util: {},
    /** @namespace Plumage.vendor */
    vendor: {},
    /** @namespace Plumage.view */
    view: {
      /** @namespace Plumage.view.comment */
      comment: {},
      /** @namespace Plumage.view.controller */
      controller: {},
      /** @namespace Plumage.view.form */
      form: {
        /** @namespace Plumage.view.form.fields */
        fields: {
          /** @namespace Plumage.view.form.fields.picker */
          picker: {}
        }
      },
      /** @namespace Plumage.view.grid */
      grid: {},
      /** @namespace Plumage.view.menu */
      menu: {}
    }
  };
});
define('ControllerManager',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot'
],

function($, _, Backbone, Plumage) {

  /**
   * Creates and keeps the singleton Controller instances.
   *
   * The instance of ControllerManager. Access the ControllerManager through the global App.
   * @constructs Plumage.ControllerManager
   */
  var ControllerManager = function(app, controllerNames) {
    this.app = app;

    /** Hash of id to controller instances */
    this.controllers = {};

    /** List of controller names. Controllers must be in the controller/ requirejs path */
    this.controllerNames = controllerNames;

    this.initialize.apply(this, arguments);
  };

  _.extend(ControllerManager.prototype,
  /** @lends Plumage.ControllerManager.prototype */
  {
    initialize: function() {
      this.initControllers();
    },

    /** get a controller by id */
    getController: function(id) {
      return this.controllers[id];
    },

    /** Create and store the controllers in controllerNames */
    initControllers: function() {
      _.each(this.controllerNames, function(name){
        var className = name;
        if (className.indexOf('/') < 0) {
          className = 'controller/' + className;
        }
        var cls = requirejs(className);
        this.controllers[name] = new cls(this.app);
      }, this);
    }
  });

  return Plumage.ControllerManager = ControllerManager;
});
define('util/Logger',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot'
],

function($, _, Backbone, Plumage) {

  /**
   * Logger that posts log calls to the server.
   *
   * Stores logs in local storage on POST so they can be retried if the request fails.
   *
   * @constructs Plumage.util.Logger
   */
  var Logger = function(options) {
    this.initialize.apply(this, arguments);
  };

  _.extend(Logger.prototype,
  /** @lends Plumage.util.Logger.prototype */
  {

    /** Server url to post to. */
    url: undefined,

    /** Local storage key to store unsent logs in. */
    localStorageKey: 'Plumage.util.Logger.failedLogs',

    /** initialization logic. */
    initialize: function(options) {
      _.extend(this, options);
      this.retryLogs();
    },

    /** Logs an error. Should add other log levels at some point. */
    error: function(type, message) {
      this.sendLog({level: 'error', type: type, message: message});
    },

    /** Send a log to the server. */
    sendLog: function(data) {
      if(data.time === undefined) { data.time = new Date().getTime(); }
      this.storeLog(data);

      Backbone.ajax({
        type: 'POST',
        url: this.url,
        data: data,
        success: this.getSuccessHandler(data).bind(this)
      });
    },

    /**
     * Gets logs from local storage.
     * @returns {Array} List of unsent log Objects
     */
    getStoredLogs: function() {
      var storedLogs = localStorage.getItem(this.localStorageKey);
      if (storedLogs) {
        try {
          return JSON.parse(storedLogs);
        } catch(e) {}
      }
      return [];
    },

    /** Try resending unsent logs. */
    retryLogs: function() {
      var storedLogs = this.getStoredLogs();
      for (var i = 0; i < storedLogs.length; i++) {
        this.sendLog(storedLogs[i]);
      }
    },

    /** Store a log in local storage. */
    storeLog: function(data) {
      var storedLogs = this.getStoredLogs();
      for ( var i = 0; i < storedLogs.length; i++) {
        if (storedLogs[i].time === data.time && storedLogs[i].type === data.type) {
          return;
        }
      }
      storedLogs.push(data);
      localStorage.setItem(this.localStorageKey, JSON.stringify(storedLogs));
    },

    /** Remove a log from local storage. */
    removeLog: function(data) {
      var logs = this.getStoredLogs();
      if (logs) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(_.filter(logs, function(log){
          return log.time !== data.time && log.type !== data.type;
        })));
      }
    },

    /** Delete all stored logs. */
    clearLogs: function() {
      localStorage.removeItem(this.localStorageKey);
    },

    //
    // Event Handlers
    //

    /**
     * Creates event handler that removes a stored log on success.
     * @param {Object} data The log being sent. Stored in closure.
     * @returns {function} The event handler
     * @private
     *
     */
    getSuccessHandler: function(data) {
      return function(response, status, xhr) {
        this.removeLog(data);
      };
    }
  });

  return Plumage.util.Logger = Logger;
});
define('App',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'ControllerManager',
  'util/Logger'
],

function($, _, Backbone, Handlebars, Plumage, ControllerManager, Logger) {

  /**
   * Global object responsible for initializing your App as well as the Controllers and Nav etc.
   *
   * After creating it, pass your app to your Router.
   *
   * @constructs Plumage.App
   */
  var App = function(options) {
    this.initialize.apply(this, arguments);
  };

  _.extend(App.prototype, Backbone.Events,
  /** @lends Plumage.App.prototype */
  {
    /**
     * Array of [Controllers]{@link Plumage.controller.BaseController} to instantiate.
     * Don't forget to require your controllers in your App's js file.
     *
     * @see [ControllerManager]{@link Plumage.ControllerManager}
     */
    controllers: undefined,

    /** Keeps track of the current top level view */
    views: {current: null},

    /** Should init cross-site request forgery token in $.ajax. See jQuery docs */
    initCSRFToken: false,

    /** Initialization logic. Feel free to extend */
    initialize: function(options) {
      _.extend(this, options);

      this.registerHandlebarsHelpers();

      this.controllerManager = new ControllerManager(this, this.controllers);

      if (this.initCSRFToken) {
        $.ajaxSetup({
          headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
          }
        });
      }
      this.dispatch = _.extend({}, Backbone.Events);
    },

    registerHandlebarsHelpers: function() {
      Handlebars.registerHelper('setIndex', function(value){
        this.index = Number(value + 1); //I needed human readable index, not zero based
      });
    },

    getViewState: function() {
      var view = this.views.current;

      if (view && view.model) {
        return view.model.getQueryParams();
      }
      return {};
    }
  });

  App.extend = Backbone.Model.extend;

  return Plumage.App = App;
});
define('RequestManager',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot'
],

function($, _, Backbone, Plumage) {


  var instance;
  /**
   * Singleton object. Call loadModel to load a Model, and have RequestManager keep a reference to the request so it
   * can be cancelled if necessary.
   *
   * Request manager also triggers 'message' on the Plumage.App for flash messages if the response contains a message.
   *
   * @constructs Plumage.RequestManager
   */
  var RequestManager = function() {
    this.requests = [];
    this.initialize.apply(this, arguments);
  };

  _.extend(RequestManager.prototype,
  /** @lends Plumage.RequestManager.prototype */
  {
    /** Does nothing. Override to provide initialization logic. */
    initialize: function() {
    },

    /** Load the given model, keeping a reference to the request. */
    loadModel: function(model, options) {
      options = _.defaults({}, options, {reset: true});

      var xhr = model.load(options);
      if (xhr) {
        this.requests.push({xhr: xhr, url: model.url()});
      }
      return xhr;
    },

    /** cancel all uncompleted requests. */
    abortOutstandingRequests: function() {
      for(var i=0;i<this.requests.length;i++) {
        var xhr = this.requests[i].xhr;
        var url = this.requests[i].url;
        if (xhr.abort){
          xhr.abort();
        }
      }
      this.requests = [];
    }
  });

  if (instance === undefined) {
    instance = new RequestManager();
  }

  return Plumage.requestManager = instance;
});
define('util/ModelUtil',[
  'jquery', 'PlumageRoot'
], function($, Plumage) {
  return Plumage.util.ModelUtil = {
    loadClass: function(cls) {
      return typeof(cls) === 'string' ? require(cls) : cls;
    },

    /**
     * Merge options arguments with class values, including deeper prototypes if specified
     * @param {string} name Name of option to merge
     * @param {Model} model Model to set the option on
     * @param {object} options Options argument
     * @param {boolean} deep Merge deeper prototype values?
     */
    mergeOption: function(name, model, options, deep) {

      var args = [options[name] || {}];

      if (deep) {
        var proto = model;
        while (proto) {
          if (proto.hasOwnProperty(name)) {
            args.unshift(proto[name]);
          }
          proto = Object.getPrototypeOf(proto);
        }
      } else {
        args.unshift(model[name] || {});
      }
      var result = $.extend.apply(null, [true, {}].concat(args));
      delete options[name];
      model[name] = result;
    },

    parseQueryString: function(queryString) {
      if (!queryString) {
        return undefined;
      }
      var result = {};
      queryString = decodeURIComponent(queryString.replace(/\+/g, '%20'));
      if(queryString) {
        $.each(queryString.split('&'), function(index, value) {
          if(value) {
            var param = value.split('=');
            result[param[0]] = param[1];
          }
        });
      }
      return result;
    }
  };
});
define('collection/BufferedCollection',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
],

function($, _, Backbone, Plumage) {


  /**
   * Wraps a collection to cache pages.
   *
   * @constructs Plumage.collection.BufferedCollection
   */
  var BufferedCollection = function(collection) {
    this.initialize.apply(this, arguments);
  };

  _.extend(BufferedCollection.prototype, Backbone.Events,
  /** @lends Plumage.collection.BufferedCollection.prototype */
  {

    /** buffer of pages */
    buffer: undefined,

    /** Map of id to index for everything in cache */
    idToIndex: undefined,

    /** Running requests */
    requests: undefined,

    /** Total rows on the server. */
    total: 0,

    initialize: function(collection, options) {
      this.requests = [];
      this.clearBuffer();

      this.collection = collection;
      this.collection.on('load', this.onCollectionLoad, this);
      this.collection.on('all', this.onCollectionEvent, this);

    },

    // wrapped overrides

    at: function(index) {
      return this.buffer[index];
    },

    getById: function(id) {
      return this.at(this.idToIndex[id]);
    },

    indexOf: function(model) {
      return this.idToIndex[model.id];
    },

    size: function() {
      return this.total;
    },

    /**
     * Loads missing pages
     */
    ensureData: function(from, to) {
      if (!this.collection.fetched) {
        //regular load first to get meta data
        this.trigger('beginPageLoad', this, 0);

        this.collection.once('load', function() {
          this.ensureData(from, to);
        }.bind(this));

        this.collection.load();

        return;
      }

      var pageSize = this.collection.get('pageSize');
      if (from < 0) {
        from = 0;
      }
      if (!to) {
        to = from + pageSize-1;
      }
      var fromPage = Math.floor(from / pageSize);
      var toPage = Math.floor(to / pageSize);

      while (this.buffer[fromPage * pageSize] !== undefined && fromPage < toPage) {
        fromPage += 1;
      }

      while (this.buffer[toPage * pageSize] !== undefined && fromPage < toPage) {
        toPage -= 1;
      }

      if (fromPage > toPage || ((fromPage === toPage) && this.buffer[fromPage * pageSize] !== undefined)) {
        // already have it
        return;
      }

      this.trigger('beginLoad', this, from, to);

      for (var i=fromPage;i<=toPage;i++) {
        this.loadPage(i);
      }
    },

    /** Load page number 'page' */
    loadPage: function(pageIndex) {
      //already requesting?
      if (this.requests[pageIndex] !== undefined) {
        return;
      }

      var options = {
        data: _.extend(this.collection.getQueryParams(), {page: pageIndex, noTotal: true}),
        success: function (resp) {
          //silent because so we don't trigger this.onLoad
          this.collection.reset(resp, {parse: true, silent: true});
          this.collection.onLoad({silent: true});
          this.onBufferLoad(this.collection, pageIndex);
        }.bind(this)
      };

      this.trigger('beginPageLoad', this, pageIndex);
      //calling sync directly instead of load so we don't trigger load event
      this.requests[pageIndex] = this.collection.sync('read', this.collection, options);
    },

    // Handlers

    /** Loads models into the buffer after a page load request. */
    onBufferLoad: function(collection, pageIndex) {
      delete this.requests[pageIndex];

      this.addModelsToBuffer(collection.models, pageIndex, this.collection.get('pageSize'));
    },

    /**
     * Propagate all events except load. Triggering of load event is special cased in [onCollectionLoad]{@link Plumage.collection.BufferedCollection#onLoad}
     */
    onCollectionEvent: function(e, collection, resp) {
      // load is handled separately in onCollectionLoad (because named handlers are triggered before all handlers)
      if (e !== 'load') {
        this.trigger(e);
      }
    },

    /**
     * Handle collection's initial load event
     * Clears the buffer and adds the collection's models when the Collection emits the load event.
     * Does not occur when loading subsequent pages.
     */
    onCollectionLoad: function(collection, resp) {
      this.clearBuffer();
      this.total = collection.get('total') || collection.size();
      this.addModelsToBuffer(collection.models, collection.get('page'), collection.get('pageSize'));
    },

    clearBuffer: function() {
      this.buffer = [];
      this.idToIndex = {};
    },

    /**
     * Helper that adds a list of models to the buffer.
     * @private
     */
    addModelsToBuffer: function(models, pageIndex, pageSize) {
      for (var i=0; i<models.length;i++) {
        var model = models[i];
        var index = pageIndex * pageSize + i;
        this.buffer[index] = model;
        this.idToIndex[model.id] = index;
      }
      var from = pageIndex * pageSize;
      var to = from + models.length;
      this.trigger('pageLoad', this, from, to);
    }


  });

  var passThroughMethods = ['getRelated', 'setSort'];
  _.each(passThroughMethods, function(method) {
    BufferedCollection.prototype[method] = function() {this.collection[method].apply(this.collection, arguments);};
  });


  return Plumage.collection.BufferedCollection = BufferedCollection;
});
define('model/Model',['jquery', 'underscore', 'backbone',
  'PlumageRoot',
  'RequestManager',
  'util/ModelUtil',
  'collection/BufferedCollection'],
function($, _, Backbone, Plumage, requestManager, ModelUtil, BufferedCollection) {

  return Plumage.model.Model = Backbone.Model.extend(
  /** @lends Plumage.model.Model.prototype */
  {
    /**
     * eg
     * [{
     *   addresses: {
     *     modelCls: Address, forceCreate: true
     *   }
     * }]
     *
     * params:
     *  - forceCreate: create the related model even if it doesn't exist in the initial data. This way
     *      They can be set on views, in preparation for later updates.
     */
    relationships: {},

    /** actual related model instances */
    related: undefined,

    queryAttrs: [],

    /** attributes to include in url query params. */
    viewAttrs: [],

    /** Path where to find the response data in the response JSON.*/
    resultsPath: 'results',

    /** Attribute to display when shown in a general View, like a title */
    displayNameAttr: undefined,

    /** Has this Model been loaded yet? */
    fetched: false,


    /**
     * Base Model class for Plumage models.
     *
     * Based on Backbone.Model, with some interface changes and some additional features.
     *
     * #### Life Cycle ####
     *
     * ##### Load #####
     *
     *  - Create a new instance with the id of the record you want to load.
     *  - Set the Model on any [ModelViews]{@link Plumage.view.ModelView} you want to bind it to before calling
     *    load. This allows the views to bind to the Model's load event.
     *  - Call [load]{@link Plumage.model.Model#load}, to async load model data from the server.
     *  - On success, the load method [sets]{@link Plumage.model.Model#set} the Model's attributes and instantiates related models
     *     that maybe been included in the JSON response (see [instantiateRelationship]{@link Plumage.model.Model#instantiateRelationship}).
     *
     * ##### Display #####
     *
     *  - [ModelViews]{@link Plumage.view.ModelView} will generally render a Model into a template, calling [toViewJSON]{@link Plumage.model.Model#toViewJSON} to get the template params.
     *
     * ##### Update #####
     *
     *  - Call [set]{@link Plumage.model.Model#set} with new attributes or related model data. Normally done by
     *    [ModelView.updateModel]{@link Plumage.view.ModelView#updateModel}.
     *  - This triggers a change event so other views can update.
     *
     * ##### Save/Create #####
     *
     *  - Call [sync]{@link Plumage.model.Model#sync} to POST model state to the server.
     *  - POST data is determined by [toJSON]{@link Plumage.model.Model#toJSON}.
     *
     *
     * #### Additional Features ####
     *
     * ##### Relationships #####
     *
     *  - Specify relationships in the [relationships]{@link Plumage.model.Model#relationships} attribute.
     *  - Related Models and Collections are automatically populated from nested JSON on load.
     *
     * ##### View state #####
     *  - View state stores model state that is not persisted to the server in the url query string. This allows
     *    a customized view (eg sorted) to be linked to in its customized state.
     *  - Model attributes specified in [viewAttrs]{@link Plumage.model.Model#viewAttrs} are automatically
     *    added as query params returned from [getQueryParams]{@link Plumage.model.Model#getQueryParams}.
     *
     * @constructs
     */
    constructor : function (attributes, options ) {
      options = options || {};
      this.related = {};
      Backbone.Model.apply( this, arguments );
    },

    /**
     * Overridable initialization logic
     */
    initialize: function(attributes, options) {
      options = options || {};
      if (options.urlRoot) {
        this.urlRoot = options.urlRoot;
      }
      if (options.url) {
        this.urlRoot = options.url;
      }
    },

    /**
     * Gets attributes that are to be including in url query params
     * @returns {Object}
     */
    getQueryParams: function () {
      var params = {};
      for ( var i = 0; i < this.viewAttrs.length; i++) {
        var viewAttr = this.viewAttrs[i];
        if (this.get(viewAttr) !== undefined) {
          params[viewAttr] = this.get(viewAttr);
        }
      }
      return params;
    },

    /**
     * Convenience function to update the location bar and trigger the route for this model
     * @param {Object} options Router.navigate options.
     */
    navigate: function(options) {
      options = _.extend({trigger: true}, options);
      if (window.router) {
        window.router.navigateWithQueryParams(this.viewUrlWithParams(), options);
      }
    },

    navigateToIndex: function(options) {
      options = _.extend({trigger: true}, options);
      if (window.router) {
        window.router.navigateWithQueryParams(this.urlRoot, options);
      }
    },

    /**
     * Convenience function to update the location bar when the view state has changed.
     * Does not trigger routes.
     * @param {Object} options Router.navigate options.
     */
    updateUrl: function(options) {
      options = _.extend({replace: true, trigger: false}, options);
      if (window.router) {
        window.router.navigateWithQueryParams(this.viewUrlWithParams(), options);
      }
    },

    /**
     * Saves model state to server. See Backbone.Model
     */
    sync: function(method, model, options) {
      options.cache = false;
      return Backbone.sync.apply(this, [method, model, options]);
    },

    get: function(attr) {
      if (!attr) {
        return;
      }
      var parts = attr.split('.');
      if (parts.length > 1) {
        var related = this.getRelated(parts[0]);
        if (related) {
          return related.get(parts.slice(1).join('.'));
        }
      } else {
        return this.attributes[attr];
      }
    },

    /**
     * Sets model attributes and constructs related models from provided data. Fires `"change"` unless
     * you choose to silenced with options.silent.
     */
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key === null) {
        return this;
      }

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = options || {};

      // Run validation.
      if (!this._validate(attrs, options)) {
        return false;
      }

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes;
      prev = this._previousAttributes;

      /*
       * changes
       ******************************************/

      // add valid view state to attrs
      if (options.viewState) {
        var viewState = this.processViewState(options.viewState);
        _.extend(attrs, viewState);
      }

      var relatedAttrs = {};
      attrs = _.clone(attrs);
      //get rel data, but don't instantiate only after initializing this
      _.each(this.relationships, function(relationship, key) {
        relatedAttrs[key] = attrs[key];
        delete attrs[key];
        //skip normal set for relationships
      }, this);

      /* **************************************** */


      // Check for changes of `id`.
      if (this.idAttribute in attrs) {
        this.id = attrs[this.idAttribute];
      }

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) {
          changes.push(attr);
        }
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        if (unset) {
          delete current[attr];
        } else {
          current[attr] = val;
        }
      }

      /*
       * changes
       ******************************************/
      _.each(this.relationships, function(relationship, key) {
        var relatedData = relatedAttrs[key];
        if (relatedData !== undefined || relationship.forceCreate && this.getRelated(key) === undefined) {
          if (this.instantiateRelationship(key, relatedData, relationship)) {
            changes.push(key, true);
          }
        }
      }, this);
      /* **************************************** */

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) {
          this._pending = options;
        }
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) {
        return this;
      }
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    processViewState: function(viewState) {
      var results = {};
      for ( var iAttrs = 0; iAttrs < this.viewAttrs.length; iAttrs++) {
        var viewAttr = this.viewAttrs[iAttrs], value = viewState[viewAttr];
        if (value) {
          results[viewAttr] = value;
        }
      }
      return results;
    },

    /**
     * Instantiates or updates a related Model from nested data being set on the model.
     *
     * Nested JSON objects that match the key of a relationship are extracted data, and
     * used to recursively instantiate related models.
     *
     * If the related Model doesn't exist yet, instantiateRelationship will call [createRelatedModel]{@link Plumage.model.Model#createRelatedModel}
     * or [createRelatedCollection]{@link Plumage.model.Model#createRelatedCollection} as appropriate.
     *
     * @param {String} key Relationship key
     * @param {Object} data The original data being [set]{@link Plumage.model.Model#set} on this Model.
     * @param {Object} relationship Relationship config, as defined in the [relationships]{@link Plumage.model.Model#relationships} attribute.
     */
    instantiateRelationship: function(key, data, relationship) {
      var related = this.getRelated(key);
      if (related === undefined) {
        var RelatedClass = ModelUtil.loadClass(relationship.modelCls);

        if (RelatedClass.prototype instanceof Plumage.collection.Collection) {
          related = this.createRelatedCollection(RelatedClass, relationship, data);
        } else {
          related = this.createRelatedModel(RelatedClass, relationship, data);
        }
        this.setRelated(key, related);
        return true;
      } else {
        return this.updateRelatedModel(relationship, related, data);
      }
    },

    /**
     * Returns true if this Model has a related model related by the relationship key.
     * @param {String} key Relationship key
     */
    hasRelated: function(key) {
      return this.related && this.related[key] ||
        this.collection && this.collection.getRelated(key);
    },

    /**
     * Returns true if this Model has a relationship with the key, whether or not it's instantiated.
     *
     * Because of reverse relationships, it's possible for a model can have a relationship even though it's
     * not defined in the [relationships]{@link Plumage.model.Model#relationships} attribute.
     *
     * @param {String} key Relationship key
     */
    hasRelationship: function(key) {
      return this.related[key] !== undefined || this.relationships[key] !== undefined;
    },

    /**
     * Get the related model for relationship 'key'. If it doesn't exist, tries to getRelated on
     * the parent collection if there is one.
     *
     * @param {String} key Relationship key
     */
    getRelated: function(key) {
      var keyParts = key.split('.'),
        keyPart = keyParts[0],
        related;

      if (this.related && this.related[keyPart]) {
        related = this.related[keyPart];
      } else if (this.collection && this.collection.hasRelationship(keyPart) && this.collection.getRelated(keyPart)) {
        related = this.collection.getRelated(keyPart);
      } else {
        if (!this.hasRelationship(keyPart)) {
          throw 'unknown relationship';
        }
      }

      if (related && keyParts.length > 1) {
        return related.getRelated(keyParts.slice(1).join('.'));
      }
      return related;
    },

    setRelated: function(key, model) {
      this.related = this.related || {};
      //TODO update event handlers
      this.related[key] = model;
    },

    /**
     * Helper: Create a related Model according to the relationship config.
     * @param {Class} RelatedClass Model class to create
     * @param {Object} relationship Relationship config
     * @param {Object} data Initial data to set on the related model
     */
    createRelatedModel: function(RelatedClass, relationship, data) {

      var options = relationship.options || {};
      if ($.isFunction(options)) {
        options = options(this);
      }
      var attributes = relationship.attributes || {};
      if ($.isFunction(attributes)) {
        attributes = attributes(this);
      }
      var relatedModel = new RelatedClass(attributes, options);

      if (relationship.reverse) {
        relatedModel.setRelated(relationship.reverse, this);
      }
      this.updateRelatedModel(relationship, relatedModel, data);
      return relatedModel;
    },

    /**
     * Helper: Create a related Collection according to the relationship config.
     * @param {Class} RelatedClass Collection class to create
     * @param {Object} relationship Relationship config
     * @param {Object} data Initial data to set on the related model
     */
    createRelatedCollection: function(RelatedClass, relationship, data) {
      var options = relationship.options || {};
      if ($.isFunction(options)) {
        options = options(this);
      }
      var relatedCollection = new RelatedClass(null, options);

      if (relationship.buffered) {
        if (!relationship.remote) {
          throw 'if buffered, must also be remote';
        }
        relatedCollection = new BufferedCollection(relatedCollection);
      }

      if (relationship.propagateEvents) {
        //TODO different events for collection/model
        relatedCollection.on('destroy', this.onRelationChange.bind(this));
        relatedCollection.on('add', this.onRelationChange.bind(this));
        relatedCollection.on('remove', this.onRelationChange.bind(this));
        relatedCollection.on('change', this.onRelationChange.bind(this));
      }

      relatedCollection.processInMemory = !relationship.remote;
      if (relationship.reverse) {
        relatedCollection.setRelated(relationship.reverse, this);
      }
      if (relationship.foreignKey) {
        relatedCollection.setFilter(relationship.foreignKey, this.id);
      }

      this.updateRelatedModel(relationship, relatedCollection, data);
      return relatedCollection;
    },

    /**
     * Helper: Update a related child model.
     * Note: Does not call model.onLoad, which should only be called after the entire model tree is updated.
     *
     * @param {Object} relationship Relationship config
     * @param {Plumage.model.Model} model Related model to update
     * @param {Object} data Data to set on Model.
     */
    updateRelatedModel: function(relationship, model, data) {
      if (relationship.remote && relationship.deferLoad) {
        model.deferLoad = true;
      }
      if (model instanceof Plumage.collection.Collection) {
        if ($.isArray(data)) {
          data = {models: data};
        }
      }
      model.set(data, {silent: true});
      return !$.isEmptyObject(model.changed);
    },

    /**
     * Predicate for whether this model matches a search query.
     * Not sure this is a good idea. Might remove it.
     * @param {string} query The search query
     */
    matchesQuery: function(query) {
      var attrs = [], i, attrName, value;
      var queryAttrs = this.queryAttrs;
      if (!queryAttrs || !queryAttrs.length) {
        queryAttrs = _.keys(this.attributes);
      }
      for (i = 0;i<queryAttrs.length;i++) {
        attrName = queryAttrs[i];
        value = this.get(attrName);
        if (value) {
          attrs[queryAttrs[i]] = value;
        }
      }
      return this.attrsMatchQuery(attrs, null, query);
    },

    attrsMatchQuery: function(attrs, queryAttrs, query) {
      if (!query || query.length === 0) { return true; }

      //only check attrs in queryAttrs
      var filteredAttrs = {}, i,
        attrName, value;
      if (queryAttrs) {
        for (i = 0;i<queryAttrs.length;i++) {
          attrName = queryAttrs[i];
          value = attrs[attrName];
          if (value) {
            filteredAttrs[attrName] = value;
          }
        }
        attrs = filteredAttrs;
      }
      for (attrName in attrs) {
        if (attrs.hasOwnProperty(attrName)) {
          if(String(attrs[attrName]).match(new RegExp(query, 'i')) !== null) {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Does this model have an url?
     * @returns {boolean}
     */
    hasUrl: function() {
      return Boolean(_.result(this, 'url') || _.result(this, 'urlRoot'));
    },

    /**
     * This Model's url. Returns an attribute named 'href' if it exists.
     * Otherwise uses urlRoot from backbone.
     *
     * Do not override this method. Override urlFromAttributes instead.
     * @returns {string} Url or null
     * @see Plumage.model.Model#fetchIfAvailable
     * @see Plumage.model.Model#urlFromAttributes
     */
    url: function() {
      var href = this.get('href');
      if (href) {
        return href;
      }
      return this.urlFromAttributes();
    },

    newUrl: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url');

      if (base) {
        var a = document.createElement('a');
        a.href = base;
        return a.pathname + '/new' + a.search;
      }
      return null;
    },

    /**
     * Generate the url for this model from its attributes. By default this returns
     * urlRoot/id. If no urlRoot is specified it returns null. This is so prevent loading models
     * whose urls' can't be derived from attributed. (eg when url depends a parent model's url)
     *
     * Override this method if you have custom urls.
     * Return null if attributes for url are not yet available.
     * @returns {string} Url or null
     */
    urlFromAttributes: function() {
      if (this.isNew()) {
        return this.newUrl();
      }

      //no url so do nothing
      if (!this.urlRoot) {
        return null;
      }

      return Backbone.Model.prototype.url.apply(this, arguments);
    },

    /**
     * Get url, including query params.
     * @returns {string} Url with query params or null
     * @see Plumage.model.Model#getQueryParams
     *
     */
    urlWithParams: function (extras) {
      extras = extras || {};
      var url = this.url.apply(this, arguments);
      if (url === null || url === undefined) {
        return null;
      }
      var params = this.getQueryParams();
      params = _.extend({}, params, extras);
      return this._appendParamsToUrl(url, params);
    },

    /**
     * Sometimes you want the view url to be different than the server resource url (eg appending a subview nav id).
     * Called by navigate and updateUrl.
     *
     * By default just calls urlWithParams.
     */
    viewUrlWithParams: function(extras) {
      return this.urlWithParams(extras);
    },

    isNew: function() {
      return !this.has(this.idAttribute) || this.get('href') && this.get('href').match(/\/new$/) !== null;
    },

    /**
     * Extracts model data from JSON response.
     * @param {Object} resp XHR response
     * @param {Object} options original request options
     */
    parse: function(resp, options) {
      if(this.resultsPath && resp[this.resultsPath]) {
        return resp[this.resultsPath];
      }
      return resp;
    },

    /**
     * Async load model from the server. Calls [onLoad]{@link Plumage.model.Model#onLoad} on success.
     * @param {Object} options Backbone.sync options
     * @fires beginLoad
     * @see Plumage.model.Model#onLoad
     */
    load: function(options) {
      options = options || {};
      options.data = _.extend(this.getQueryParams(), options.data);

      if (_.isEqual(this.latestLoadParams, options.data)) {
        return;
      }
      //save params to prevent multiple identical requests
      this.latestLoadParams = options.data;

      this._wrapHandlers(options);

      this.fireBeginLoad();
      return this.fetch(options);
    },

    save: function(key, val, options) {
      var attrs;
      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key === null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }
      options = options || {};
      this._wrapHandlers(options);
      Backbone.Model.prototype.save.apply(this, [attrs, options]);
    },

    /**
     * Sets fetches=true triggers 'load' and recurses down to related models.
     * @param {Object} options Original load options. Passed to load event handlers
     * @param {Object} visited Record of which models onLoad has been called on to prevent an infinite loop.
     * @fires load
     */
    onLoad: function(options, visited) {
      options = options || {};
      this.fetched = true;

      visited = visited || {};
      visited[this.cid] = true;

      if (!options.silent) {
        this.trigger('load', this, options);
      }

      _.each(this.relationships, function(relationship, key) {
        var rel = this.getRelated(key);
        if (rel && !visited[rel.cid]) {
          if (relationship.remote) {
            if (!rel.deferLoad) {
              rel.fetchIfAvailable();
            }
          } else {
            rel.onLoad(options, visited);
          }
        }
      }, this);
    },

    /**
     * Convenience function to trigger beginLoad
     */
    fireBeginLoad: function() {
      this.trigger('beginLoad', this);
      _.each(this.relationships, function(relationship, key) {
        var rel = this.getRelated(key);
        if (rel && relationship.remote && !rel.deferLoad) {
          rel.fireBeginLoad();
        }
      }, this);
    },

    /**
     * Load if [urlWithParams]{@link Plumage.model.Model#urlWithParams} returns an url.
     * A remote related Model might not have a complete url yet if its parent has not yet loaded.
     */
    fetchIfAvailable: function() {
      var url = this.urlWithParams();
      if (url) {
        requestManager.loadModel(this);
      }
    },

    /**
     * Gets a 'display name'/title for this model
     * @returns {string}
     */
    getDisplayName: function() {
      if (this.displayNameAttr !== undefined) {
        return this.get(this.displayNameAttr);
      }
    },

    /**
     * Returns attributes to be persisted to the server.
     * TODO: persist related Models depending on a relatonship config flag.
     *
     * @see Plumage.model.Model#sync
     */
    toJSON: function(options) {
      var json = _.clone(this.attributes);
      for ( var i = 0; i < this.viewAttrs.length; i++) {
        delete json[this.viewAttrs[i]];
      }
      return json;
    },

    /**
     * Returns an object containing state for rendering into a [ModelView]{@link Plumage.view.ModelView}.
     */
    toViewJSON: function(options) {
      var result = _.clone(this.attributes);
      if (result.url === undefined && this.hasUrl()) {
        result.url = this.url();
      }
      var displayName = this.getDisplayName();
      if (displayName !== undefined) {
        result.displayName = displayName;
      }
      _.each(this.relationships, function(relationship, key) {
        var related = this.getRelated(key);
        if (related) {
          result[key] = related.toViewJSON();
        }
      }, this);
      return result;
    },


    /**
     * Listen to relationships
     */
    onRelationChange: function() {
      this.trigger('change', this);
    },

    //
    // Helpers
    //

    _appendParamsToUrl: function(url, params) {
      if (params && !$.isEmptyObject(params)) {
        params = $.param(params, true);
        if (url.indexOf('?') >= 0) {
          return url + '&' + params;
        } else {
          return url + '?' + params;
        }
      }
      return url;
    },

    _wrapHandlers: function(options) {
      var success = options.success,
        error = options.error;

      options.success = function(model, resp, options) {
        if (resp.meta && resp.meta.success === false) {
          var seenRelated = {};
          if (resp.meta.validationError) {
            model.validationError = resp.meta.validationError;
            _.each(model.validationError, function(v,k) {
              var parts = k.split('.');
              if (parts.length > 1) {
                var field = parts.pop();
                var related = model.getRelated(parts.join('.'));
                if (related) {
                  related.validationError = related.validationError || {};
                  related.validationError[field] = v;
                  seenRelated[related.id] = related;
                }
              }
            });
          }
          model.trigger('invalid',
            model,
            model.validationError,
            resp.meta.message,
            resp.meta.message_class
          );

          _.each(seenRelated, function(related) {
            related.trigger('invalid', related, related.validationError);
          });

        } else {
          model.latestLoadParams = undefined;
          model.onLoad(options);
          if (typeof theApp !== 'undefined' && resp.meta && resp.meta.message) {
            theApp.dispatch.trigger('message', resp.meta.message, resp.meta.message_class);
          }

          if (success) {
            success(model, resp, options);
          }
        }

      };

      //NOTE: backbone triggers 'error'
      options.error = function(model, xhr, options) {
        if (typeof theApp !== 'undefined' && theApp.logger) {
          if (xhr.statusText !== 'abort') {
            theApp.logger.error(xhr.statusText, 'Model load error');
          }
        }
        if (error) {
          error(model, xhr, options);
        }
      };
    }
  });
});

define('model/Filter',['jquery', 'underscore', 'backbone', 'PlumageRoot', 'model/Model'],
function($, _, Backbone, Plumage, Model) {

  return Plumage.model.Filter = Model.extend(
  /** @lends Plumage.model.Filter.prototype */
  {
    /**
     * Model for a Filter on a [Collection]{@link Plumage.collection.Collection}.
     *
     * Attributes are:
     *  - key: The key of the attribute being filtered on.
     *  - value: The filter value
     *  - comparison: A string or function that compares the model value with the filter value.
     *
     * eg model's 'name'[key] equals[comaprison] 'foo'[value]
     *
     * For client side filtering, also contains a [compare]{@link Plumage.model.Filter} predicate for testing if Models pass the specified filter.
     *
     * @constructs
     * @extends Plumage.model.Model
     */
    initialize: function() {
      //filters exist only on client, so give them all unique ids
      this.set('id', _.uniqueId('filter'));
    },

    /** Map of built in comparison names to comparison functions */
    comparisons: {
      equals: function(filterValue, value, key) {
        return String(filterValue).toLowerCase() === String(value).toLowerCase();
      },
      contains: function(filterValue, value, key) {
        return String(value).toLowerCase().indexOf(String(filterValue).toLowerCase()) !== -1;
      },
      startswith: function(filterValue, value, key) {
        return String(value).indexOf(String(filterValue)) === 0;
      },
      endswith: function(filterValue, value, key) {
        return String(value).toLowerCase().indexOf(String(filterValue)).toLowerCase() === String(value).length;
      }
    },

    /**
     * Predicate testing whether the given model passes this filter
     * @param {Plumage.model.Model} model Model to test
     */
    compare: function(model) {
      var key = this.get('key'), value;
      if (model.get) {
        value = model.get(key);
      } else {
        value = model[key];
      }
      var filterValue = this.get('value');
      if (filterValue === undefined) {
        return true;
      }
      var comparison = this.get('comparison');
      if (typeof(comparison) === 'string') {
        comparison = this.comparisons[comparison];
        if (comparison) {
          return comparison(filterValue, value, key);
        }
        return true;
      }
      return comparison(filterValue, value, key);
    },

    toJSON: function(){
      //don't include arbitrary id in json
      var json = Model.prototype.toJSON.apply(this, arguments);
      delete json.id;
      return json;
    }
  });
});
define('collection/Collection',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'model/Model',
  'model/Filter',
  'RequestManager'
], function($, _, Backbone, Plumage, Model, Filter, requestManager) {

  Plumage.collection.Collection = Model.extend(
  /** @lends Plumage.collection.Collection.prototype */
  {

    urlRoot: undefined,

    viewAttrs: ['query', 'sortDir', 'sortField', 'page', 'pageSize'],

    resultsPath: 'results',

    /** Perform view changes like sorting and filtering in memory (as opposed to on the server)? */
    processInMemory: false,

    /** Unsorted and unfiltered models when processInMemory is true for reference */
    originalModels: undefined,

    /** Default attribute values */
    defaultMeta: {
      page: 0,
      pageSize: 200
    },

    /** If true, will automatically create filters relationship */
    hasFilters: true,

    relationships: {},

    selections: undefined,

    /**
     * Base Collection class for Plumage collections.
     *
     * Based on Backbone.Collection, but extends Plumage.Model for additional features like
     * viewState, attributes and relationships.
     *
     * Collections have parameters that affect its display eg sortField.
     * Rather than use JS attributes like Backbone.Collection, use Model attributes (by extending Plumage.model.Model)
     * which allows model binding. Then the Field can be agnostic about whether its binding a model's attribute or a
     * collection's pageSize or sortField. This also gets us view state and query params.
     *
     * A Collection can also have relationships like a Model. eg Collections have relations collection of Filters.
     * This allows Filter Views to bind to a collection's Filters as if they were any other Model.
     *
     * #### Additional Features
     *
     * ##### Attributes and View State
     *
     * ##### Filters and Relationships
     *
     * ##### processInMemory
     *
     * By default, calling [load]{@link Plumage.collection.Collection#load} after changing view state (sort, filter etc)
     * queries the server for new data. If [processInMemory]{@link Plumage.collection.Collection#processInMemory}
     * has been set however, load is short circuited with filtering, sorting and searching performed in memory.
     * Useful when you don't have that much data and you don't want to adding sorting/paging etc to your server.
     *
     * Unless the relationship has remote = true, related Collections automatically have processInMemory set.
     *
     * @constructs
     * @extends Plumage.model.Model
     */
    constructor : function (models, options ) {
      //define filters relationship here to avoid circular dependency
      if (this.hasFilters && !this.relationships.filters) {
        this.relationships.filters = {
          modelCls: Plumage.collection.Collection.extend({
            model: Filter,
            urlRoot: '/',
            relationships: {},
            hasFilters: false,
          }),
          forceCreate: true,
          propagateEvents: true
        };
      }
      Model.apply( this, arguments );

      options = (options || {});
      if (options.model) {
        this.model = options.model;
      }
      if (typeof(this.model) === 'string') {
        this.model = require(this.model);
      }

      this._reset();
      if (models) {
        this.reset(models, _.extend({silent: true}, options));
      }

      if (this.urlRoot === undefined && this.model) {
        this.urlRoot = this.model.prototype.urlRoot;
      }
    },

    initialize: function(models, options) {
      options = options || {};
      var meta = _.extend(_.clone(this.defaultMeta), options.meta || {});
      this.set(meta, {silent: true});
      delete options.meta;
      _.extend(this, options);
    },

    hasUrl: function() {
      return true;
    },

    /**
     * This Collection's url. Returns an attribute or option named 'href' if it exists.
     * Otherwise uses urlRoot like backbone.
     */
    url: function () {
      var href = this.href || this.get('href');
      if (href) {
        return href;
      }
      return this.urlRoot;
    },


    /**
     * Overridden from Model. Takes a special attributes 'models' to use as collection data,
     * so that attributes and models can be set from the same data.
     */
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key === null) {
        return this;
      }

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = options || {};
      attrs = _.clone(attrs);

      if (attrs.models) {
        if (this.processInMemory) {
          this.resetInMemory(attrs.models);
        } else {
          this.reset(attrs.models);
        }
        delete attrs.models;
      }
      return Model.prototype.set.apply(this, [attrs, options]);
    },

    //
    // Collection CRUD
    //

    /**
     * Copied from Backbone.Collection
     * When you have more items than you want to add or remove individually,
     * you can reset the entire setCollection with a new list of models, without firing
     * you can reset the entire set with a new list of models, without firing
     * any granular `add` or `remove` events. Fires `reset` when finished.
     * Useful for bulk operations and optimizations.
     * @param {Array} models Array of model data
     * @param {Object} options Add options
     */
    reset: function(models, options) {
      options = (options || {});
      this.resetting = true;

      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));

      this.resetting = false;

      if (!options.silent) {
        this.trigger('reset', this, options);
      }
      return models;
    },

    /**
     * Copied from Backbone.Collection
     * Add a model to the end of the collection.
     */
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    /**
     * Copied from Backbone.Collection
     * Remove a model from the end of the collection.
     */
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    /**
     * Copied from Backbone.Collection
     * Add a model to the beginning of the collection.
     */
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    /**
     * Copied from Backbone.Collection
     * Remove a model from the beginning of the collection.
     */
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    /**
     * Copied from Backbone.Collection
     * Slice out a sub-array of models from the collection.
     */
    slice: function() {
      return [].slice.apply(this.models, arguments);
    },

    /**
     * Get the model with the given id
     * @param {string} obj The id
     */
    getById: function(obj) {
      if (obj === void 0) {
        return void 0;
      }
      return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
    },

    /**
     * get the model at the given index.
     * @param {Number} index The index
     */
    at: function(index) {
      return this.models[index];
    },

    /** Add a model, or list of models to the set. */
    add: function(models, options) {
      return this.setCollection(models, _.extend({merge: false}, options, {add: true, remove: false}));
    },

    /**
     * Copied from Backbone.Collection
     * Remove a model, or a list of models from the set.
     */
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options = (options || {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.getById(models[i]);
        if (!model) {
          continue;
        }
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;

        if (this.originalModels) {
          i = _.indexOf(this.originalModels, model);
          if (i >=0 ) {
            delete this.originalModels[i];
          }
        }

        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return singular ? models[0] : models;
    },

    //
    // Advanced CRUD
    //

    /**
     * Copied from Backbone.Collection
     * Return models with matching attributes. Useful for simple cases of `filter`.
     */
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) {
        return first ? void 0 : [];
      }
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) {
            return false;
          }
        }
        return true;
      });
    },

    /**
     * Copied from Backbone.Collection
     *
     * Return the first model with matching attributes. Useful for simple cases
     * of `find`.
     */
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    /**
     * Copied from Backbone.Collection
     * Pluck an attribute from each model in the collection.
     */
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    /**
     * Create a new collection with an identical list of models as this one.
     */
    clone: function() {
      var result = new this.constructor(this.models, {meta: _.clone(this.attributes)});
      if (this.hasFilters) {
        result.setRelated('filters', this.getRelated('filters'));
      }
      return result;
    },

    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    toViewJSON: function() {
      var result = Model.prototype.toViewJSON.apply(this, arguments);
      result.items = this.toJSON.apply(this, arguments);
      result.size = this.size();
      return result;
    },

    //
    // Meta
    //

    /**
     * Has the server indicated there is more data than what is loaded?
     * @returns {Boolean}
     */
    hasMore: function() {
      if (this.processInMemory) {
        return false;
      }

      var total = this.get('total');
      if (!total) {
        total = this.get('totals') && this.get('totals').total;
      }
      return total && total > this.size();
    },

    /**
     * Sets sortField and sortDir.
     * @param {string} sortField
     * @param {Number} sortDir
     * @param {Boolean} refresh should load?
     */
    setSort: function(sortField, sortDir, refresh) {
      this.set({sortField: sortField, sortDir: sortDir});
      if (!this.processInMemory) {
        this.fetched = false;
      }
      if (refresh) {
        requestManager.loadModel(this);
      }
    },

    /**
     * Gets a named [Selection]{@link Plumage.collection.Selection} for storing selection state.
     *
     * A collection can have any number of named selections, which are created on demand. Selections
     * are named so that different views can share the same selection state.
     *
     * @param {String} selectionName Name of selection to get.
     */
    getSelection: function(selectionName) {
      if (!this.selections) {
        this.selections = {};
      }
      if (!this.selections[selectionName]) {
        this.selections[selectionName] = new Plumage.collection.Selection([], {collection: this});
      }
      return this.selections[selectionName];
    },

    //
    // Filter convenience methods
    //

    getFilters: function(key) {
      return this.getRelated('filters').where({key: key});
    },

    setFilter: function(key, value, comparison) {
      if (comparison === undefined) {
        comparison = 'equals';
      }

      var filter = this.getFilters(key);
      if (filter) {
        this.removeFilter(filter);
      }
      this.addFilter({key: key, value: value, comparison: comparison});
    },

    addFilter: function(filter) {
      var filters = this.getRelated('filters');
      filters.add(filter);
    },

    removeFilter: function(filter) {
      this.getRelated('filters').remove(filter);
    },

    //
    // Loading
    //

    /**
     * Override to support processInMemory.
     *
     * If in memory, and already loaded, applies filters, sorting etc from view state.
     * Note: This will never reload from the server after the first load. To force reloading from
     * the server for a processInMemory collection, call [forceReload]{@link Plumage.collection.Collection#forceReload}
     *
     * If not in memory, load remote data for current model and view state.
     */
    load: function(options) {
      options = (options || {});
      if (this.processInMemory && this.fetched) {
        if (this.buffered) {
          throw 'Can not be both buffered and processInMemory';
        }
        this.onLoad(_.clone(options));
        return;
      }
      return Model.prototype.load.apply(this, arguments);
    },

    /**
     * For processInMemory collections. Force reloading from remote.
     */
    forceReload: function() {
      if (!this.processInMemory) {
        throw 'forceReload is for processInMemory collections only';
      }
      this.fetched = false;
      this.originalModels = undefined;
      this.load({reset: true});
    },

    /**
     * Copied from Backbone.Collection. Changed to check
     * {@link isLoadStillValid}, and not trigger load if it's not.
     */
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) {
        options.parse = true;
      }
      var success = options.success;
      var collection = this;
      options.success = function(resp) {

        //
        // CHANGE
        //
        if (!collection.isLoadStillValid(resp)) {
          return;
        }

        //Update meta
        if (options.parse) {
          var meta = resp.meta;
          if (meta) {
            //No change events on load. Listen to 'load'.
            collection.set(meta, {silent: true});
          }
        }

        //call set/reset
        if (options.reset) {
          collection.reset(resp, options);
        } else {
          collection.setCollection(resp, options);
        }

        ///////////

        if (success) {
          success(collection, resp, options);
        }
        collection.trigger('sync', collection, resp, options);
      };
      this.wrapError(options);
      return this.sync('read', this, options);
    },

    /**
     * Create a new instance of a model in this collection. Add the model to the
     * collection immediately, unless `wait: true` is passed, in which case we
     * wait for the server to agree.
     */
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) {
        return false;
      }
      if (!options.wait) {
        this.add(model, options);
      }
      var collection = this;
      var success = options.success;
      options.success = function(model, resp, options) {
        if (options.wait) {
          collection.add(model, options);
        }
        if (success) {
          success(model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    /**
     * Do the response query params match the current values?
     * @param {Object} resp XHR response
     * @returns {Boolean}
     */
    isLoadStillValid: function(resp) {
      var meta = resp.meta;
      if (!meta) { return true; }

      if (meta.query !== undefined && meta.query !== this.get('query')) {
        return false;
      }
      if (meta.filter !== undefined && !_.isEqual(meta.filter, this.get('filter'))) {
        return false;
      }
      return true;
    },

    onLoad: function(options, visited) {

      options = options || {};
      this.fetched = true;
      this.latestLoadParams = undefined;

      visited = visited || {};

      this.forEach(function(model) {
        if (!visited[model.cid]) {
          model.onLoad(options, visited);
        }
      });

      if (this.processInMemory) {
        if (this.originalModels === undefined) {
          this.originalModels = _.clone(this.models);
        }
        this.updateInMemory();
      }

      Model.prototype.onLoad.apply(this, arguments);
    },

    wrapError: function(options) {
      var model = this;
      var error = options.error;
      options.error = function(resp) {
        if (error) {
          error(model, resp, options);
        }
        model.trigger('error', model, resp, options);
      };
    },


    getQueryParams: function () {
      var params = Model.prototype.getQueryParams.apply(this, arguments);

      if (this.hasFilters) {
        params.filters = JSON.stringify(this.getRelated('filters').toJSON());
      }
      return params;
    },

    /**
     * Process In Memory
     */

    getUniqueValuesForAttribute: function(attr) {
      if (this.processInMemory) {
        var values = [];
        if (this.originalModels !== undefined) {
          _.each(this.originalModels, function(item){
            values.push(item[attr]);
          }, this);
        } else {
          this.forEach(function(item) {
            values.push(item.get(attr));
          }, this);
        }
        values.sort();
        values = _.uniq(values, true);
        return values;
      } else {
//        throw "TODO: Implement remote filter values";
        return [];
      }
    },

    /**
     * Queries passed in models based on query attribute. This is for search boxes.
     * What fields it looks in depends on the the models' matchesQuery method.
     * Helper for [updateInMemory]{@link Plumage.collection.Collection#updateInMemory}
     * @param {array} models Array of models to query. Not modified.
     * @returns {array} Queried models.
     * @private
     */
    _query: function(models) {
      var query = this.get('query');
      return _.filter(models, function(model){
        if (model.matchesQuery) {
          return model.matchesQuery(query);
        } else {
          return this.model.prototype.attrsMatchQuery(model, this.model.prototype.queryAttrs, query);
        }
      }, this);
    },

    /**
     * Filters passed in models based on related Filters.
     * Helper for [updateInMemory]{@link Plumage.collection.Collection#updateInMemory}
     * @param {array} models Array of models to filter. Not modified.
     * @returns {array} filtered models.
     * @private
     */
    _filter: function(models) {
      if (!this.hasRelationship('filters') || this.getRelated('filters').size() === 0) {
        return models;
      }
      var filters = this.getRelated('filters');
      return _.filter(models, function(model){
        return filters.all(function(filter) {
          return filter.compare(model);
        });
      }, this);
    },

    /**
     * Sorts passed in models based on sortField and sortDir attributes.
     * Helper for [updateInMemory]{@link Plumage.collection.Collection#updateInMemory}
     * @param {array} models Array of models to sort. Not modified.
     * @returns {array} sorted models.
     * @private
     */
    _sort: function(models) {
      var sortField = this.get('sortField'), sortDir = this.get('sortDir');
      if (sortField && sortDir) {
        var sorted = _.sortBy(models, function(model) {
          return model.get(sortField);
        });
        if (sortDir === -1) {
          sorted = sorted.reverse();
        }
        return sorted;
      }
      return models;
    },


    /**
     * Forces reset of original models, and applies in memory filters, sorting etc.
     * Used when data is updated from server.
     */
    resetInMemory: function(models) {
      this.reset(models);
      this.originalModels = _.clone(this.models);
      this.updateInMemory();
      return this;
    },

    /** apply query, filter and sort to in memory collection */
    updateInMemory: function() {
      var results = this._query(this.originalModels);
      results = this._filter(results);
      results = this._sort(results);
      this.reset(results);
    },

    /**
     * Special reset method that loads remote models if the relatonship is remote, or
     * calls resetInMemory if its not.
     * @param {Array} models Array of model data for this Collection from parent model.
     */
    resetFromRelationship: function(models) {
      if (this.processInMemory) {
        this.resetInMemory(models);
      } else {
        this.fetchIfAvailable();
      }
    },

    //
    // Helpers
    //

    /**
     * Copied from Backbone.Collection.
     *
     * Private method to reset all internal state. Called when the collection
     * is first initialized or reset.
     * @private
     */
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    /**
     * Copied from Backbone.Collection.
     * @private
     */
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) {
        if (!attrs.collection) {
          attrs.collection = this;
        }
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) {
        return model;
      }
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    /**
     * Copied from Backbone.Collection.
     * Internal method to sever a model's ties to a collection.
     * @private
     */
    _removeReference: function(model) {
      if (this === model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    /**
     * Copied from Backbone.Collection. Modified to not propagate load events.
     *
     * Internal method called every time a model in the set fires an event.
     * Sets need to update their indexes when models change ids. All other
     * events simply proxy through. "add" and "remove" events that originate
     * in other collections are ignored.
     * @private
     */
    _onModelEvent: function(event, model, collection, options) {
      //don't propagate load event
      if (event === 'load') {
        return;
      }

      if ((event === 'add' || event === 'remove') && collection !== this) {
        return;
      }
      if (event === 'destroy') {
        this.remove(model, options);
      }
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id !== null) {
          this._byId[model.id] = model;
        }
      }
      this.trigger(event, this, model, collection, options);
    },

    /**
     * Copied from Backbone.Collection. Renamed to setCollection from set to not conflict with Model.set
     * Update a collection by `set`-ing a new list of models, adding new ones,
     * removing models that are no longer present, and merging models that
     * already exist in the collection, as necessary. Similar to **Model#set**,
     * the core operation for updating the data contained by the collection.
     */
    setCollection: function(models, options) {
      options = _.defaults({}, options, {add: true, remove: true, merge: true});
      if (options.parse) {
        models = this.parse(models, options);
      }
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at === null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i];
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.getById(id)) {
          if (remove) {
            modelMap[existing.cid] = true;
          }
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) {
              attrs = existing.parse(attrs, options);
            }
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) {
              sort = true;
            }
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) {
            continue;
          }
          toAdd.push(model);

          // Listen to added models' events, and index models for lookup by
          // `id` and by `cid`.
          model.on('all', this._onModelEvent, this);
          this._byId[model.cid] = model;
          if (model.id !== null) {
            this._byId[model.id] = model;
          }
        }
        if (order) {
          order.push(existing || model);
        }
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) {
            toRemove.push(model);
          }
        }
        if (toRemove.length) {
          this.remove(toRemove, options);
        }
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        /* Change */
        //Adding to an unfetched collection implies it is not expecting server data.
        this.fetched = true;
        /**********/

        if (sortable) {
          sort = true;
        }
        this.length += toAdd.length;
        if (at !== void 0) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
            /* Change */
            if (this.processInMemory && this.originalModels) {
              this.originalModels.push(toAdd[i]);
            }
            /**********/
          }
        } else {
          if (order) {
            this.models.length = 0;
          }
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
            /* Change */
            if (this.processInMemory && this.originalModels && !this.resetting) {
              this.originalModels.push(orderedModels[i]);
            }
            /**********/
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) {
        this.sort({silent: true});
      }

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) {
          this.trigger('sort', this, options);
        }
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },
  });

  //Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Plumage.collection.Collection.prototype[method] = function() {
      var args = [].slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Plumage.collection.Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  return Plumage.collection.Collection;
});
define('model/User',['jquery', 'underscore', 'backbone', 'PlumageRoot',
  'model/Model',
  'collection/ActivityCollection'
],
function($, _, Backbone, Plumage, Model) {

  return Plumage.model.User = Model.extend({

    idAttribute: 'account',

    urlRoot: '/users',

    relationships: {
      'comments': {
        modelCls: 'collection/CommentCollection',
        reverse: 'user',
        forceCreate: false
      },
      'activities': {
        modelCls: 'collection/ActivityCollection',
        reverse: 'owner',
        forceCreate: false
      }
    },

    getImageThumb: function() {
      return 'https://birdhouse.twitter.biz/people/photos/thumb/'+this.get('account')+'-thumb.jpg';
    },

    toViewJSON: function() {
      var result = Model.prototype.toViewJSON.apply(this, arguments);
      result.image_thumb = this.getImageThumb();
      return result;
    }
  });
});
/*jshint -W103 */

define('model/Activity',['jquery', 'underscore', 'backbone', 'handlebars', 'PlumageRoot', 'moment', 'model/Model',
        'model/User'],
function($, _, Backbone, Handlebars, Plumage, moment, Model) {

  return Plumage.model.Activity = Model.extend({

    urlRoot: '/activities',

    actionTexts: {
      'Description': {
        'create': 'added a description to {{{recipientHTML}}}',
        'update': 'updated the description of {{{recipientHTML}}}'
      },
      'Comment': {
        'create': 'commented on {{{recipientHTML}}}'
      }
    },

    relationships: {
      'user': {
        modelCls: 'model/User',
        forceCreate: false
      }
    },

    toViewJSON: function() {
      var data = Model.prototype.toViewJSON.apply(this, arguments);
      data.recipientHTML = this.getRelatedModelHTML(this.get('recipient_type'), this.get('recipient'));
      data.trackableHTML = this.getRelatedModelHTML(this.get('trackable_type'), this.get('trackable'));
      data.action_text = this.getActionText(data);
      data.create_at_text = moment(Number(data.created_at)*1000).fromNow();
      return data;
    },

    getRelatedModelHTML: function(modelType, data) {
      if (modelType) {
        var modelCls = require('model/' + modelType);
        var model = new modelCls(data);
        var displayName = model.getDisplayName();
        return '<a href="'+model.url()+'" class="name" title="'+displayName+'">'+displayName+'</a>';
      }
      return '';
    },

    getActionText: function(data) {
      var actionTexts;
      var context = this;
      while (!actionTexts && context && context.actionTexts) {
        actionTexts = context.actionTexts[this.get('trackable_type')];
        if (!actionTexts || !actionTexts[this.get('action_type')]) {
          context = context.__proto__;
        }
      }
      if (actionTexts) {
        return Handlebars.compile(actionTexts[this.get('action_type')])(data);
      }
    }
  });
});

define('collection/ActivityCollection',[
  'PlumageRoot',
  'collection/Collection',
  'model/Activity'
], function(Plumage, Collection) {

  return Plumage.collection.ActivityCollection = Collection.extend({
    model: 'model/Activity'
  });
});
define('model/Comment',['jquery', 'underscore', 'backbone', 'PlumageRoot', 'model/Model',
        'model/User'],
function($, _, Backbone, Plumage, Model) {

  return Plumage.model.Comment = Model.extend({

    urlRoot: '/comments',

    relationships: {
      'user': {
        modelCls: 'model/User',
        forceCreate: false
      }
    },

    validate: function(attrs, options) {
      if (!attrs.body || attrs.body.length <= 3) {
        return 'Comment is too short';
      }
    }

  });
});
define('collection/CommentCollection',[
  'PlumageRoot',
  'collection/Collection',
  'model/Comment'
], function(Plumage, Collection, Comment) {

  return Plumage.collection.CommentCollection = Collection.extend({
    model: Comment
  });
});
define('model/Data',['jquery', 'underscore', 'backbone', 'PlumageRoot', 'model/Model'],
function($, _, Backbone, Plumage, Model) {

  return Plumage.model.Data = Model.extend({
    idAttribute: 'name'
  });
});
define('collection/DataCollection',[
  'PlumageRoot',
  'collection/Collection',
  'model/Data'
], function(Plumage, Collection, Data) {

  return Plumage.collection.DataCollection = Collection.extend({
    model: Data,
    urlRoot: '/'
  });
});
define('collection/Selection',['jquery', 'underscore', 'backbone',
        'PlumageRoot', 'collection/Collection'],
function($, _, Backbone, Plumage, Collection) {

  return Plumage.collection.Selection = Collection.extend(
  /** @lends Plumage.collection.Selection.prototype */
  {
    /** multiselect? */
    multi: true,

    model: Plumage.model.Model.extend({idAttribute: 'id'}),

    /** parent collection being selected from */
    collection: undefined,

    /**
     * A selection of models from a Collection.
     *
     * Contains a set of selected ids (stored as models with a single 'id' field).
     *
     * Includes a number of methods for selecting and deselecting items.
     *
     * @constructs
     * @extends Plumage.collection.Collection
     */
    initialize: function(data, options) {
      Plumage.collection.Collection.prototype.initialize.apply(this, arguments);
      if (options && options.collection) {
        this.collection = options.collection;
        this.collection.on('load', this.onCollectionLoad, this);
      }
    },

    /** total number of items in the parent collection */
    getTotalSize: function() {
      return this.collection.size();
    },

    /** Is id selected? */
    isSelectedId: function(id) {
      return this.getById(id) !== undefined;
    },

    /** Is index selected? */
    isSelectedIndex: function(index) {
      return this.getById(this.collection.at(index).id) !== undefined;
    },

    /**
     * @returns {Array} array of selected indices
     */
    getSelectedIndices: function() {
      return this.map(function(selectionItem) {
        var item = this.collection.getById(selectionItem.id);
        return this.collection.indexOf(item);
      }.bind(this));
    },

    /**
     * Select a array of indices
     * @param {Array} indices Array of indices to select
     */
    setSelectedIndices: function(indices) {
      var ids = _.map(indices, function(index) {
        return this.collection.at(index).id;
      }.bind(this));
      this.setSelectedIds(ids);
    },

    /**
     * @returns {Array} array of selected ids
     */
    getSelectedIds: function(ids) {
      return this.map(function(item) {return item.id;});
    },

    /**
     * Select a array of ids
     * @param {Array} ids Array of ids to select
     */
    setSelectedIds: function(ids) {
      var data = _.map(ids, function(id) {return {id: id};});
      this.reset(data);
    },

    /**
     * Select a single index
     * @param {Number} index index to select
     */
    selectIndex: function(index) {
      var item = this.collection.at(index);
      if (this.getById(item.id) === undefined) {
        if (this.multi) {
          this.add(new this.model({id: item.id}));
        } else {
          this.setSelectedIds([item.id]);
        }
      }
    },

    /**
     * Deselect a single index
     * @param {Number} index index to dsselect
     */
    deselectIndex: function(index) {
      var item = this.collection.at(index),
        selectionItem = this.getById(item.id);

      if (selectionItem) {
        this.remove(selectionItem);
      }
    },

    toggleIndex: function(index) {
      if (this.isSelectedIndex(index)) {
        this.deselectIndex(index);
      } else {
        this.selectIndex(index);
      }
    },

    /**
     * Select all items in the parent collection
     */
    selectAll: function() {
      var data = this.collection.map(function(item) {
        return {id: item.id};
      });
      this.reset(data);
    },

    /**
     * Clears this selection
     */
    deselectAll: function() {
      this.reset([]);
    },

    // Event handlers

    onCollectionLoad: function() {
      // reset with only ids still in the collection after load
      var data = [];
      this.each(function(item){
        if (this.collection.getById(item.id) !== undefined) {
          data.push(item);
        }
      }.bind(this));
      this.reset(data);
    }
  });
});
/*! jQuery UI - v1.10.4 - 2014-03-28
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.position.js, jquery.ui.draggable.js, jquery.ui.droppable.js, jquery.ui.resizable.js, jquery.ui.selectable.js, jquery.ui.sortable.js, jquery.ui.datepicker.js, jquery.ui.slider.js, jquery.ui.effect.js, jquery.ui.effect-blind.js, jquery.ui.effect-bounce.js, jquery.ui.effect-clip.js, jquery.ui.effect-drop.js, jquery.ui.effect-explode.js, jquery.ui.effect-fade.js, jquery.ui.effect-fold.js, jquery.ui.effect-highlight.js, jquery.ui.effect-pulsate.js, jquery.ui.effect-scale.js, jquery.ui.effect-shake.js, jquery.ui.effect-slide.js, jquery.ui.effect-transfer.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function(e,t){function i(t,i){var s,a,o,r=t.nodeName.toLowerCase();return"area"===r?(s=t.parentNode,a=s.name,t.href&&a&&"map"===s.nodeName.toLowerCase()?(o=e("img[usemap=#"+a+"]")[0],!!o&&n(o)):!1):(/input|select|textarea|button|object/.test(r)?!t.disabled:"a"===r?t.href||i:i)&&n(t)}function n(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}var s=0,a=/^ui-id-\d+$/;e.ui=e.ui||{},e.extend(e.ui,{version:"1.10.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({focus:function(t){return function(i,n){return"number"==typeof i?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),n&&n.call(t)},i)}):t.apply(this,arguments)}}(e.fn.focus),scrollParent:function(){var t;return t=e.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(i){if(i!==t)return this.css("zIndex",i);if(this.length)for(var n,s,a=e(this[0]);a.length&&a[0]!==document;){if(n=a.css("position"),("absolute"===n||"relative"===n||"fixed"===n)&&(s=parseInt(a.css("zIndex"),10),!isNaN(s)&&0!==s))return s;a=a.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++s)})},removeUniqueId:function(){return this.each(function(){a.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(i){return!!e.data(i,t)}}):function(t,i,n){return!!e.data(t,n[3])},focusable:function(t){return i(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var n=e.attr(t,"tabindex"),s=isNaN(n);return(s||n>=0)&&i(t,!s)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(i,n){function s(t,i,n,s){return e.each(a,function(){i-=parseFloat(e.css(t,"padding"+this))||0,n&&(i-=parseFloat(e.css(t,"border"+this+"Width"))||0),s&&(i-=parseFloat(e.css(t,"margin"+this))||0)}),i}var a="Width"===n?["Left","Right"]:["Top","Bottom"],o=n.toLowerCase(),r={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+n]=function(i){return i===t?r["inner"+n].call(this):this.each(function(){e(this).css(o,s(this,i)+"px")})},e.fn["outer"+n]=function(t,i){return"number"!=typeof t?r["outer"+n].call(this,t):this.each(function(){e(this).css(o,s(this,t,!0,i)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(i){return arguments.length?t.call(this,e.camelCase(i)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.support.selectstart="onselectstart"in document.createElement("div"),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,i,n){var s,a=e.ui[t].prototype;for(s in n)a.plugins[s]=a.plugins[s]||[],a.plugins[s].push([i,n[s]])},call:function(e,t,i){var n,s=e.plugins[t];if(s&&e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType)for(n=0;s.length>n;n++)e.options[s[n][0]]&&s[n][1].apply(e.element,i)}},hasScroll:function(t,i){if("hidden"===e(t).css("overflow"))return!1;var n=i&&"left"===i?"scrollLeft":"scrollTop",s=!1;return t[n]>0?!0:(t[n]=1,s=t[n]>0,t[n]=0,s)}})})(jQuery);(function(t,e){var i=0,s=Array.prototype.slice,n=t.cleanData;t.cleanData=function(e){for(var i,s=0;null!=(i=e[s]);s++)try{t(i).triggerHandler("remove")}catch(o){}n(e)},t.widget=function(i,s,n){var o,a,r,h,l={},c=i.split(".")[0];i=i.split(".")[1],o=c+"-"+i,n||(n=s,s=t.Widget),t.expr[":"][o.toLowerCase()]=function(e){return!!t.data(e,o)},t[c]=t[c]||{},a=t[c][i],r=t[c][i]=function(t,i){return this._createWidget?(arguments.length&&this._createWidget(t,i),e):new r(t,i)},t.extend(r,a,{version:n.version,_proto:t.extend({},n),_childConstructors:[]}),h=new s,h.options=t.widget.extend({},h.options),t.each(n,function(i,n){return t.isFunction(n)?(l[i]=function(){var t=function(){return s.prototype[i].apply(this,arguments)},e=function(t){return s.prototype[i].apply(this,t)};return function(){var i,s=this._super,o=this._superApply;return this._super=t,this._superApply=e,i=n.apply(this,arguments),this._super=s,this._superApply=o,i}}(),e):(l[i]=n,e)}),r.prototype=t.widget.extend(h,{widgetEventPrefix:a?h.widgetEventPrefix||i:i},l,{constructor:r,namespace:c,widgetName:i,widgetFullName:o}),a?(t.each(a._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,r,i._proto)}),delete a._childConstructors):s._childConstructors.push(r),t.widget.bridge(i,r)},t.widget.extend=function(i){for(var n,o,a=s.call(arguments,1),r=0,h=a.length;h>r;r++)for(n in a[r])o=a[r][n],a[r].hasOwnProperty(n)&&o!==e&&(i[n]=t.isPlainObject(o)?t.isPlainObject(i[n])?t.widget.extend({},i[n],o):t.widget.extend({},o):o);return i},t.widget.bridge=function(i,n){var o=n.prototype.widgetFullName||i;t.fn[i]=function(a){var r="string"==typeof a,h=s.call(arguments,1),l=this;return a=!r&&h.length?t.widget.extend.apply(null,[a].concat(h)):a,r?this.each(function(){var s,n=t.data(this,o);return n?t.isFunction(n[a])&&"_"!==a.charAt(0)?(s=n[a].apply(n,h),s!==n&&s!==e?(l=s&&s.jquery?l.pushStack(s.get()):s,!1):e):t.error("no such method '"+a+"' for "+i+" widget instance"):t.error("cannot call methods on "+i+" prior to initialization; "+"attempted to call method '"+a+"'")}):this.each(function(){var e=t.data(this,o);e?e.option(a||{})._init():t.data(this,o,new n(a,this))}),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(e,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this.bindings=t(),this.hoverable=t(),this.focusable=t(),s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:t.noop,_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(t.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:t.noop,widget:function(){return this.element},option:function(i,s){var n,o,a,r=i;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof i)if(r={},n=i.split("."),i=n.shift(),n.length){for(o=r[i]=t.widget.extend({},this.options[i]),a=0;n.length-1>a;a++)o[n[a]]=o[n[a]]||{},o=o[n[a]];if(i=n.pop(),1===arguments.length)return o[i]===e?null:o[i];o[i]=s}else{if(1===arguments.length)return this.options[i]===e?null:this.options[i];r[i]=s}return this._setOptions(r),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return this.options[t]=e,"disabled"===t&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!e).attr("aria-disabled",e),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(i,s,n){var o,a=this;"boolean"!=typeof i&&(n=s,s=i,i=!1),n?(s=o=t(s),this.bindings=this.bindings.add(s)):(n=s,s=this.element,o=this.widget()),t.each(n,function(n,r){function h(){return i||a.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof r?a[r]:r).apply(a,arguments):e}"string"!=typeof r&&(h.guid=r.guid=r.guid||h.guid||t.guid++);var l=n.match(/^(\w+)\s*(.*)$/),c=l[1]+a.eventNamespace,u=l[2];u?o.delegate(u,c,h):s.bind(c,h)})},_off:function(t,e){e=(e||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.unbind(e).undelegate(e)},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){t(e.currentTarget).addClass("ui-state-hover")},mouseleave:function(e){t(e.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){t(e.currentTarget).addClass("ui-state-focus")},focusout:function(e){t(e.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}})})(jQuery);(function(t){var e=!1;t(document).mouseup(function(){e=!1}),t.widget("ui.mouse",{version:"1.10.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.bind("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).bind("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):undefined}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(i){if(!e){this._mouseStarted&&this._mouseUp(i),this._mouseDownEvent=i;var s=this,n=1===i.which,a="string"==typeof this.options.cancel&&i.target.nodeName?t(i.target).closest(this.options.cancel).length:!1;return n&&!a&&this._mouseCapture(i)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){s.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(i)&&this._mouseDelayMet(i)&&(this._mouseStarted=this._mouseStart(i)!==!1,!this._mouseStarted)?(i.preventDefault(),!0):(!0===t.data(i.target,this.widgetName+".preventClickEvent")&&t.removeData(i.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return s._mouseMove(t)},this._mouseUpDelegate=function(t){return s._mouseUp(t)},t(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),i.preventDefault(),e=!0,!0)):!0}},_mouseMove:function(e){return t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button?this._mouseUp(e):this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){return t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),!1},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})})(jQuery);(function(t,e){function i(t,e,i){return[parseFloat(t[0])*(p.test(t[0])?e/100:1),parseFloat(t[1])*(p.test(t[1])?i/100:1)]}function s(e,i){return parseInt(t.css(e,i),10)||0}function n(e){var i=e[0];return 9===i.nodeType?{width:e.width(),height:e.height(),offset:{top:0,left:0}}:t.isWindow(i)?{width:e.width(),height:e.height(),offset:{top:e.scrollTop(),left:e.scrollLeft()}}:i.preventDefault?{width:0,height:0,offset:{top:i.pageY,left:i.pageX}}:{width:e.outerWidth(),height:e.outerHeight(),offset:e.offset()}}t.ui=t.ui||{};var a,o=Math.max,r=Math.abs,l=Math.round,h=/left|center|right/,c=/top|center|bottom/,u=/[\+\-]\d+(\.[\d]+)?%?/,d=/^\w+/,p=/%$/,f=t.fn.position;t.position={scrollbarWidth:function(){if(a!==e)return a;var i,s,n=t("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),o=n.children()[0];return t("body").append(n),i=o.offsetWidth,n.css("overflow","scroll"),s=o.offsetWidth,i===s&&(s=n[0].clientWidth),n.remove(),a=i-s},getScrollInfo:function(e){var i=e.isWindow||e.isDocument?"":e.element.css("overflow-x"),s=e.isWindow||e.isDocument?"":e.element.css("overflow-y"),n="scroll"===i||"auto"===i&&e.width<e.element[0].scrollWidth,a="scroll"===s||"auto"===s&&e.height<e.element[0].scrollHeight;return{width:a?t.position.scrollbarWidth():0,height:n?t.position.scrollbarWidth():0}},getWithinInfo:function(e){var i=t(e||window),s=t.isWindow(i[0]),n=!!i[0]&&9===i[0].nodeType;return{element:i,isWindow:s,isDocument:n,offset:i.offset()||{left:0,top:0},scrollLeft:i.scrollLeft(),scrollTop:i.scrollTop(),width:s?i.width():i.outerWidth(),height:s?i.height():i.outerHeight()}}},t.fn.position=function(e){if(!e||!e.of)return f.apply(this,arguments);e=t.extend({},e);var a,p,g,m,v,_,b=t(e.of),y=t.position.getWithinInfo(e.within),k=t.position.getScrollInfo(y),w=(e.collision||"flip").split(" "),D={};return _=n(b),b[0].preventDefault&&(e.at="left top"),p=_.width,g=_.height,m=_.offset,v=t.extend({},m),t.each(["my","at"],function(){var t,i,s=(e[this]||"").split(" ");1===s.length&&(s=h.test(s[0])?s.concat(["center"]):c.test(s[0])?["center"].concat(s):["center","center"]),s[0]=h.test(s[0])?s[0]:"center",s[1]=c.test(s[1])?s[1]:"center",t=u.exec(s[0]),i=u.exec(s[1]),D[this]=[t?t[0]:0,i?i[0]:0],e[this]=[d.exec(s[0])[0],d.exec(s[1])[0]]}),1===w.length&&(w[1]=w[0]),"right"===e.at[0]?v.left+=p:"center"===e.at[0]&&(v.left+=p/2),"bottom"===e.at[1]?v.top+=g:"center"===e.at[1]&&(v.top+=g/2),a=i(D.at,p,g),v.left+=a[0],v.top+=a[1],this.each(function(){var n,h,c=t(this),u=c.outerWidth(),d=c.outerHeight(),f=s(this,"marginLeft"),_=s(this,"marginTop"),x=u+f+s(this,"marginRight")+k.width,C=d+_+s(this,"marginBottom")+k.height,M=t.extend({},v),T=i(D.my,c.outerWidth(),c.outerHeight());"right"===e.my[0]?M.left-=u:"center"===e.my[0]&&(M.left-=u/2),"bottom"===e.my[1]?M.top-=d:"center"===e.my[1]&&(M.top-=d/2),M.left+=T[0],M.top+=T[1],t.support.offsetFractions||(M.left=l(M.left),M.top=l(M.top)),n={marginLeft:f,marginTop:_},t.each(["left","top"],function(i,s){t.ui.position[w[i]]&&t.ui.position[w[i]][s](M,{targetWidth:p,targetHeight:g,elemWidth:u,elemHeight:d,collisionPosition:n,collisionWidth:x,collisionHeight:C,offset:[a[0]+T[0],a[1]+T[1]],my:e.my,at:e.at,within:y,elem:c})}),e.using&&(h=function(t){var i=m.left-M.left,s=i+p-u,n=m.top-M.top,a=n+g-d,l={target:{element:b,left:m.left,top:m.top,width:p,height:g},element:{element:c,left:M.left,top:M.top,width:u,height:d},horizontal:0>s?"left":i>0?"right":"center",vertical:0>a?"top":n>0?"bottom":"middle"};u>p&&p>r(i+s)&&(l.horizontal="center"),d>g&&g>r(n+a)&&(l.vertical="middle"),l.important=o(r(i),r(s))>o(r(n),r(a))?"horizontal":"vertical",e.using.call(this,t,l)}),c.offset(t.extend(M,{using:h}))})},t.ui.position={fit:{left:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollLeft:s.offset.left,a=s.width,r=t.left-e.collisionPosition.marginLeft,l=n-r,h=r+e.collisionWidth-a-n;e.collisionWidth>a?l>0&&0>=h?(i=t.left+l+e.collisionWidth-a-n,t.left+=l-i):t.left=h>0&&0>=l?n:l>h?n+a-e.collisionWidth:n:l>0?t.left+=l:h>0?t.left-=h:t.left=o(t.left-r,t.left)},top:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollTop:s.offset.top,a=e.within.height,r=t.top-e.collisionPosition.marginTop,l=n-r,h=r+e.collisionHeight-a-n;e.collisionHeight>a?l>0&&0>=h?(i=t.top+l+e.collisionHeight-a-n,t.top+=l-i):t.top=h>0&&0>=l?n:l>h?n+a-e.collisionHeight:n:l>0?t.top+=l:h>0?t.top-=h:t.top=o(t.top-r,t.top)}},flip:{left:function(t,e){var i,s,n=e.within,a=n.offset.left+n.scrollLeft,o=n.width,l=n.isWindow?n.scrollLeft:n.offset.left,h=t.left-e.collisionPosition.marginLeft,c=h-l,u=h+e.collisionWidth-o-l,d="left"===e.my[0]?-e.elemWidth:"right"===e.my[0]?e.elemWidth:0,p="left"===e.at[0]?e.targetWidth:"right"===e.at[0]?-e.targetWidth:0,f=-2*e.offset[0];0>c?(i=t.left+d+p+f+e.collisionWidth-o-a,(0>i||r(c)>i)&&(t.left+=d+p+f)):u>0&&(s=t.left-e.collisionPosition.marginLeft+d+p+f-l,(s>0||u>r(s))&&(t.left+=d+p+f))},top:function(t,e){var i,s,n=e.within,a=n.offset.top+n.scrollTop,o=n.height,l=n.isWindow?n.scrollTop:n.offset.top,h=t.top-e.collisionPosition.marginTop,c=h-l,u=h+e.collisionHeight-o-l,d="top"===e.my[1],p=d?-e.elemHeight:"bottom"===e.my[1]?e.elemHeight:0,f="top"===e.at[1]?e.targetHeight:"bottom"===e.at[1]?-e.targetHeight:0,g=-2*e.offset[1];0>c?(s=t.top+p+f+g+e.collisionHeight-o-a,t.top+p+f+g>c&&(0>s||r(c)>s)&&(t.top+=p+f+g)):u>0&&(i=t.top-e.collisionPosition.marginTop+p+f+g-l,t.top+p+f+g>u&&(i>0||u>r(i))&&(t.top+=p+f+g))}},flipfit:{left:function(){t.ui.position.flip.left.apply(this,arguments),t.ui.position.fit.left.apply(this,arguments)},top:function(){t.ui.position.flip.top.apply(this,arguments),t.ui.position.fit.top.apply(this,arguments)}}},function(){var e,i,s,n,a,o=document.getElementsByTagName("body")[0],r=document.createElement("div");e=document.createElement(o?"div":"body"),s={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},o&&t.extend(s,{position:"absolute",left:"-1000px",top:"-1000px"});for(a in s)e.style[a]=s[a];e.appendChild(r),i=o||document.documentElement,i.insertBefore(e,i.firstChild),r.style.cssText="position: absolute; left: 10.7432222px;",n=t(r).offset().left,t.support.offsetFractions=n>10&&11>n,e.innerHTML="",i.removeChild(e)}()})(jQuery);(function(t){t.widget("ui.draggable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"!==this.options.helper||/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative"),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._mouseInit()},_destroy:function(){this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy()},_mouseCapture:function(e){var i=this.options;return this.helper||i.disabled||t(e.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(e),this.handle?(t(i.iframeFix===!0?"iframe":i.iframeFix).each(function(){t("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>").css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1e3}).css(t(this).offset()).appendTo("body")}),!0):!1)},_mouseStart:function(e){var i=this.options;return this.helper=this._createHelper(e),this.helper.addClass("ui-draggable-dragging"),this._cacheHelperProportions(),t.ui.ddmanager&&(t.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(),this.offsetParent=this.helper.offsetParent(),this.offsetParentCssPosition=this.offsetParent.css("position"),this.offset=this.positionAbs=this.element.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},this.offset.scroll=!1,t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.originalPosition=this.position=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",e)===!1?(this._clear(),!1):(this._cacheHelperProportions(),t.ui.ddmanager&&!i.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this._mouseDrag(e,!0),t.ui.ddmanager&&t.ui.ddmanager.dragStart(this,e),!0)},_mouseDrag:function(e,i){if("fixed"===this.offsetParentCssPosition&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",e,s)===!1)return this._mouseUp({}),!1;this.position=s.position}return this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),!1},_mouseStop:function(e){var i=this,s=!1;return t.ui.ddmanager&&!this.options.dropBehaviour&&(s=t.ui.ddmanager.drop(this,e)),this.dropped&&(s=this.dropped,this.dropped=!1),"original"!==this.options.helper||t.contains(this.element[0].ownerDocument,this.element[0])?("invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||t.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?t(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",e)!==!1&&i._clear()}):this._trigger("stop",e)!==!1&&this._clear(),!1):!1},_mouseUp:function(e){return t("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)}),t.ui.ddmanager&&t.ui.ddmanager.dragStop(this,e),t.ui.mouse.prototype._mouseUp.call(this,e)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(e){return this.options.handle?!!t(e.target).closest(this.element.find(this.options.handle)).length:!0},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return s.parents("body").length||s.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s[0]===this.element[0]||/(fixed|absolute)/.test(s.css("position"))||s.css("position","absolute"),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===document.body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.element.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;return n.containment?"window"===n.containment?(this.containment=[t(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,t(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,t(window).scrollLeft()+t(window).width()-this.helperProportions.width-this.margins.left,t(window).scrollTop()+(t(window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):"document"===n.containment?(this.containment=[0,0,t(document).width()-this.helperProportions.width-this.margins.left,(t(document).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):n.containment.constructor===Array?(this.containment=n.containment,undefined):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=t(n.containment),s=i[0],s&&(e="hidden"!==i.css("overflow"),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(e?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(e?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relative_container=i),undefined):(this.containment=null,undefined)},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent;return this.offset.scroll||(this.offset.scroll={top:n.scrollTop(),left:n.scrollLeft()}),{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top)*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)*s}},_generatePosition:function(e){var i,s,n,a,o=this.options,r="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,l=e.pageX,h=e.pageY;return this.offset.scroll||(this.offset.scroll={top:r.scrollTop(),left:r.scrollLeft()}),this.originalPosition&&(this.containment&&(this.relative_container?(s=this.relative_container.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,e.pageX-this.offset.click.left<i[0]&&(l=i[0]+this.offset.click.left),e.pageY-this.offset.click.top<i[1]&&(h=i[1]+this.offset.click.top),e.pageX-this.offset.click.left>i[2]&&(l=i[2]+this.offset.click.left),e.pageY-this.offset.click.top>i[3]&&(h=i[3]+this.offset.click.top)),o.grid&&(n=o.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/o.grid[1])*o.grid[1]:this.originalPageY,h=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-o.grid[1]:n+o.grid[1]:n,a=o.grid[0]?this.originalPageX+Math.round((l-this.originalPageX)/o.grid[0])*o.grid[0]:this.originalPageX,l=i?a-this.offset.click.left>=i[0]||a-this.offset.click.left>i[2]?a:a-this.offset.click.left>=i[0]?a-o.grid[0]:a+o.grid[0]:a)),{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top),left:l-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1},_trigger:function(e,i,s){return s=s||this._uiHash(),t.ui.plugin.call(this,e,[i,s]),"drag"===e&&(this.positionAbs=this._convertPositionTo("absolute")),t.Widget.prototype._trigger.call(this,e,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),t.ui.plugin.add("draggable","connectToSortable",{start:function(e,i){var s=t(this).data("ui-draggable"),n=s.options,a=t.extend({},i,{item:s.element});s.sortables=[],t(n.connectToSortable).each(function(){var i=t.data(this,"ui-sortable");i&&!i.options.disabled&&(s.sortables.push({instance:i,shouldRevert:i.options.revert}),i.refreshPositions(),i._trigger("activate",e,a))})},stop:function(e,i){var s=t(this).data("ui-draggable"),n=t.extend({},i,{item:s.element});t.each(s.sortables,function(){this.instance.isOver?(this.instance.isOver=0,s.cancelHelperRemoval=!0,this.instance.cancelHelperRemoval=!1,this.shouldRevert&&(this.instance.options.revert=this.shouldRevert),this.instance._mouseStop(e),this.instance.options.helper=this.instance.options._helper,"original"===s.options.helper&&this.instance.currentItem.css({top:"auto",left:"auto"})):(this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",e,n))})},drag:function(e,i){var s=t(this).data("ui-draggable"),n=this;t.each(s.sortables,function(){var a=!1,o=this;this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this.instance._intersectsWith(this.instance.containerCache)&&(a=!0,t.each(s.sortables,function(){return this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this!==o&&this.instance._intersectsWith(this.instance.containerCache)&&t.contains(o.instance.element[0],this.instance.element[0])&&(a=!1),a})),a?(this.instance.isOver||(this.instance.isOver=1,this.instance.currentItem=t(n).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return i.helper[0]},e.target=this.instance.currentItem[0],this.instance._mouseCapture(e,!0),this.instance._mouseStart(e,!0,!0),this.instance.offset.click.top=s.offset.click.top,this.instance.offset.click.left=s.offset.click.left,this.instance.offset.parent.left-=s.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=s.offset.parent.top-this.instance.offset.parent.top,s._trigger("toSortable",e),s.dropped=this.instance.element,s.currentItem=s.element,this.instance.fromOutside=s),this.instance.currentItem&&this.instance._mouseDrag(e)):this.instance.isOver&&(this.instance.isOver=0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",e,this.instance._uiHash(this.instance)),this.instance._mouseStop(e,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),s._trigger("fromSortable",e),s.dropped=!1)})}}),t.ui.plugin.add("draggable","cursor",{start:function(){var e=t("body"),i=t(this).data("ui-draggable").options;e.css("cursor")&&(i._cursor=e.css("cursor")),e.css("cursor",i.cursor)},stop:function(){var e=t(this).data("ui-draggable").options;e._cursor&&t("body").css("cursor",e._cursor)}}),t.ui.plugin.add("draggable","opacity",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("opacity")&&(n._opacity=s.css("opacity")),s.css("opacity",n.opacity)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._opacity&&t(i.helper).css("opacity",s._opacity)}}),t.ui.plugin.add("draggable","scroll",{start:function(){var e=t(this).data("ui-draggable");e.scrollParent[0]!==document&&"HTML"!==e.scrollParent[0].tagName&&(e.overflowOffset=e.scrollParent.offset())},drag:function(e){var i=t(this).data("ui-draggable"),s=i.options,n=!1;i.scrollParent[0]!==document&&"HTML"!==i.scrollParent[0].tagName?(s.axis&&"x"===s.axis||(i.overflowOffset.top+i.scrollParent[0].offsetHeight-e.pageY<s.scrollSensitivity?i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop+s.scrollSpeed:e.pageY-i.overflowOffset.top<s.scrollSensitivity&&(i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop-s.scrollSpeed)),s.axis&&"y"===s.axis||(i.overflowOffset.left+i.scrollParent[0].offsetWidth-e.pageX<s.scrollSensitivity?i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft+s.scrollSpeed:e.pageX-i.overflowOffset.left<s.scrollSensitivity&&(i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft-s.scrollSpeed))):(s.axis&&"x"===s.axis||(e.pageY-t(document).scrollTop()<s.scrollSensitivity?n=t(document).scrollTop(t(document).scrollTop()-s.scrollSpeed):t(window).height()-(e.pageY-t(document).scrollTop())<s.scrollSensitivity&&(n=t(document).scrollTop(t(document).scrollTop()+s.scrollSpeed))),s.axis&&"y"===s.axis||(e.pageX-t(document).scrollLeft()<s.scrollSensitivity?n=t(document).scrollLeft(t(document).scrollLeft()-s.scrollSpeed):t(window).width()-(e.pageX-t(document).scrollLeft())<s.scrollSensitivity&&(n=t(document).scrollLeft(t(document).scrollLeft()+s.scrollSpeed)))),n!==!1&&t.ui.ddmanager&&!s.dropBehaviour&&t.ui.ddmanager.prepareOffsets(i,e)}}),t.ui.plugin.add("draggable","snap",{start:function(){var e=t(this).data("ui-draggable"),i=e.options;e.snapElements=[],t(i.snap.constructor!==String?i.snap.items||":data(ui-draggable)":i.snap).each(function(){var i=t(this),s=i.offset();this!==e.element[0]&&e.snapElements.push({item:this,width:i.outerWidth(),height:i.outerHeight(),top:s.top,left:s.left})})},drag:function(e,i){var s,n,a,o,r,l,h,c,u,d,p=t(this).data("ui-draggable"),g=p.options,f=g.snapTolerance,m=i.offset.left,_=m+p.helperProportions.width,v=i.offset.top,b=v+p.helperProportions.height;for(u=p.snapElements.length-1;u>=0;u--)r=p.snapElements[u].left,l=r+p.snapElements[u].width,h=p.snapElements[u].top,c=h+p.snapElements[u].height,r-f>_||m>l+f||h-f>b||v>c+f||!t.contains(p.snapElements[u].item.ownerDocument,p.snapElements[u].item)?(p.snapElements[u].snapping&&p.options.snap.release&&p.options.snap.release.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=!1):("inner"!==g.snapMode&&(s=f>=Math.abs(h-b),n=f>=Math.abs(c-v),a=f>=Math.abs(r-_),o=f>=Math.abs(l-m),s&&(i.position.top=p._convertPositionTo("relative",{top:h-p.helperProportions.height,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r-p.helperProportions.width}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l}).left-p.margins.left)),d=s||n||a||o,"outer"!==g.snapMode&&(s=f>=Math.abs(h-v),n=f>=Math.abs(c-b),a=f>=Math.abs(r-m),o=f>=Math.abs(l-_),s&&(i.position.top=p._convertPositionTo("relative",{top:h,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c-p.helperProportions.height,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l-p.helperProportions.width}).left-p.margins.left)),!p.snapElements[u].snapping&&(s||n||a||o||d)&&p.options.snap.snap&&p.options.snap.snap.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=s||n||a||o||d)}}),t.ui.plugin.add("draggable","stack",{start:function(){var e,i=this.data("ui-draggable").options,s=t.makeArray(t(i.stack)).sort(function(e,i){return(parseInt(t(e).css("zIndex"),10)||0)-(parseInt(t(i).css("zIndex"),10)||0)});s.length&&(e=parseInt(t(s[0]).css("zIndex"),10)||0,t(s).each(function(i){t(this).css("zIndex",e+i)}),this.css("zIndex",e+s.length))}}),t.ui.plugin.add("draggable","zIndex",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("zIndex")&&(n._zIndex=s.css("zIndex")),s.css("zIndex",n.zIndex)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._zIndex&&t(i.helper).css("zIndex",s._zIndex)}})})(jQuery);(function(t){function e(t,e,i){return t>e&&e+i>t}t.widget("ui.droppable",{version:"1.10.4",widgetEventPrefix:"drop",options:{accept:"*",activeClass:!1,addClasses:!0,greedy:!1,hoverClass:!1,scope:"default",tolerance:"intersect",activate:null,deactivate:null,drop:null,out:null,over:null},_create:function(){var e,i=this.options,s=i.accept;this.isover=!1,this.isout=!0,this.accept=t.isFunction(s)?s:function(t){return t.is(s)},this.proportions=function(){return arguments.length?(e=arguments[0],undefined):e?e:e={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight}},t.ui.ddmanager.droppables[i.scope]=t.ui.ddmanager.droppables[i.scope]||[],t.ui.ddmanager.droppables[i.scope].push(this),i.addClasses&&this.element.addClass("ui-droppable")},_destroy:function(){for(var e=0,i=t.ui.ddmanager.droppables[this.options.scope];i.length>e;e++)i[e]===this&&i.splice(e,1);this.element.removeClass("ui-droppable ui-droppable-disabled")},_setOption:function(e,i){"accept"===e&&(this.accept=t.isFunction(i)?i:function(t){return t.is(i)}),t.Widget.prototype._setOption.apply(this,arguments)},_activate:function(e){var i=t.ui.ddmanager.current;this.options.activeClass&&this.element.addClass(this.options.activeClass),i&&this._trigger("activate",e,this.ui(i))},_deactivate:function(e){var i=t.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass),i&&this._trigger("deactivate",e,this.ui(i))},_over:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this.options.hoverClass&&this.element.addClass(this.options.hoverClass),this._trigger("over",e,this.ui(i)))},_out:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("out",e,this.ui(i)))},_drop:function(e,i){var s=i||t.ui.ddmanager.current,n=!1;return s&&(s.currentItem||s.element)[0]!==this.element[0]?(this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function(){var e=t.data(this,"ui-droppable");return e.options.greedy&&!e.options.disabled&&e.options.scope===s.options.scope&&e.accept.call(e.element[0],s.currentItem||s.element)&&t.ui.intersect(s,t.extend(e,{offset:e.element.offset()}),e.options.tolerance)?(n=!0,!1):undefined}),n?!1:this.accept.call(this.element[0],s.currentItem||s.element)?(this.options.activeClass&&this.element.removeClass(this.options.activeClass),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("drop",e,this.ui(s)),this.element):!1):!1},ui:function(t){return{draggable:t.currentItem||t.element,helper:t.helper,position:t.position,offset:t.positionAbs}}}),t.ui.intersect=function(t,i,s){if(!i.offset)return!1;var n,a,o=(t.positionAbs||t.position.absolute).left,r=(t.positionAbs||t.position.absolute).top,l=o+t.helperProportions.width,h=r+t.helperProportions.height,c=i.offset.left,u=i.offset.top,d=c+i.proportions().width,p=u+i.proportions().height;switch(s){case"fit":return o>=c&&d>=l&&r>=u&&p>=h;case"intersect":return o+t.helperProportions.width/2>c&&d>l-t.helperProportions.width/2&&r+t.helperProportions.height/2>u&&p>h-t.helperProportions.height/2;case"pointer":return n=(t.positionAbs||t.position.absolute).left+(t.clickOffset||t.offset.click).left,a=(t.positionAbs||t.position.absolute).top+(t.clickOffset||t.offset.click).top,e(a,u,i.proportions().height)&&e(n,c,i.proportions().width);case"touch":return(r>=u&&p>=r||h>=u&&p>=h||u>r&&h>p)&&(o>=c&&d>=o||l>=c&&d>=l||c>o&&l>d);default:return!1}},t.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(e,i){var s,n,a=t.ui.ddmanager.droppables[e.options.scope]||[],o=i?i.type:null,r=(e.currentItem||e.element).find(":data(ui-droppable)").addBack();t:for(s=0;a.length>s;s++)if(!(a[s].options.disabled||e&&!a[s].accept.call(a[s].element[0],e.currentItem||e.element))){for(n=0;r.length>n;n++)if(r[n]===a[s].element[0]){a[s].proportions().height=0;continue t}a[s].visible="none"!==a[s].element.css("display"),a[s].visible&&("mousedown"===o&&a[s]._activate.call(a[s],i),a[s].offset=a[s].element.offset(),a[s].proportions({width:a[s].element[0].offsetWidth,height:a[s].element[0].offsetHeight}))}},drop:function(e,i){var s=!1;return t.each((t.ui.ddmanager.droppables[e.options.scope]||[]).slice(),function(){this.options&&(!this.options.disabled&&this.visible&&t.ui.intersect(e,this,this.options.tolerance)&&(s=this._drop.call(this,i)||s),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],e.currentItem||e.element)&&(this.isout=!0,this.isover=!1,this._deactivate.call(this,i)))}),s},dragStart:function(e,i){e.element.parentsUntil("body").bind("scroll.droppable",function(){e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)})},drag:function(e,i){e.options.refreshPositions&&t.ui.ddmanager.prepareOffsets(e,i),t.each(t.ui.ddmanager.droppables[e.options.scope]||[],function(){if(!this.options.disabled&&!this.greedyChild&&this.visible){var s,n,a,o=t.ui.intersect(e,this,this.options.tolerance),r=!o&&this.isover?"isout":o&&!this.isover?"isover":null;r&&(this.options.greedy&&(n=this.options.scope,a=this.element.parents(":data(ui-droppable)").filter(function(){return t.data(this,"ui-droppable").options.scope===n}),a.length&&(s=t.data(a[0],"ui-droppable"),s.greedyChild="isover"===r)),s&&"isover"===r&&(s.isover=!1,s.isout=!0,s._out.call(s,i)),this[r]=!0,this["isout"===r?"isover":"isout"]=!1,this["isover"===r?"_over":"_out"].call(this,i),s&&"isout"===r&&(s.isout=!1,s.isover=!0,s._over.call(s,i)))}})},dragStop:function(e,i){e.element.parentsUntil("body").unbind("scroll.droppable"),e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)}}})(jQuery);(function(t){function e(t){return parseInt(t,10)||0}function i(t){return!isNaN(parseInt(t,10))}t.widget("ui.resizable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"resize",options:{alsoResize:!1,animate:!1,animateDuration:"slow",animateEasing:"swing",aspectRatio:!1,autoHide:!1,containment:!1,ghost:!1,grid:!1,handles:"e,s,se",helper:!1,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:90,resize:null,start:null,stop:null},_create:function(){var e,i,s,n,a,o=this,r=this.options;if(this.element.addClass("ui-resizable"),t.extend(this,{_aspectRatio:!!r.aspectRatio,aspectRatio:r.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:r.helper||r.ghost||r.animate?r.helper||"ui-resizable-helper":null}),this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)&&(this.element.wrap(t("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")})),this.element=this.element.parent().data("ui-resizable",this.element.data("ui-resizable")),this.elementIsWrapper=!0,this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")}),this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0}),this.originalResizeStyle=this.originalElement.css("resize"),this.originalElement.css("resize","none"),this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"})),this.originalElement.css({margin:this.originalElement.css("margin")}),this._proportionallyResize()),this.handles=r.handles||(t(".ui-resizable-handle",this.element).length?{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"}:"e,s,se"),this.handles.constructor===String)for("all"===this.handles&&(this.handles="n,e,s,w,se,sw,ne,nw"),e=this.handles.split(","),this.handles={},i=0;e.length>i;i++)s=t.trim(e[i]),a="ui-resizable-"+s,n=t("<div class='ui-resizable-handle "+a+"'></div>"),n.css({zIndex:r.zIndex}),"se"===s&&n.addClass("ui-icon ui-icon-gripsmall-diagonal-se"),this.handles[s]=".ui-resizable-"+s,this.element.append(n);this._renderAxis=function(e){var i,s,n,a;e=e||this.element;for(i in this.handles)this.handles[i].constructor===String&&(this.handles[i]=t(this.handles[i],this.element).show()),this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)&&(s=t(this.handles[i],this.element),a=/sw|ne|nw|se|n|s/.test(i)?s.outerHeight():s.outerWidth(),n=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join(""),e.css(n,a),this._proportionallyResize()),t(this.handles[i]).length},this._renderAxis(this.element),this._handles=t(".ui-resizable-handle",this.element).disableSelection(),this._handles.mouseover(function(){o.resizing||(this.className&&(n=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)),o.axis=n&&n[1]?n[1]:"se")}),r.autoHide&&(this._handles.hide(),t(this.element).addClass("ui-resizable-autohide").mouseenter(function(){r.disabled||(t(this).removeClass("ui-resizable-autohide"),o._handles.show())}).mouseleave(function(){r.disabled||o.resizing||(t(this).addClass("ui-resizable-autohide"),o._handles.hide())})),this._mouseInit()},_destroy:function(){this._mouseDestroy();var e,i=function(e){t(e).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").removeData("ui-resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};return this.elementIsWrapper&&(i(this.element),e=this.element,this.originalElement.css({position:e.css("position"),width:e.outerWidth(),height:e.outerHeight(),top:e.css("top"),left:e.css("left")}).insertAfter(e),e.remove()),this.originalElement.css("resize",this.originalResizeStyle),i(this.originalElement),this},_mouseCapture:function(e){var i,s,n=!1;for(i in this.handles)s=t(this.handles[i])[0],(s===e.target||t.contains(s,e.target))&&(n=!0);return!this.options.disabled&&n},_mouseStart:function(i){var s,n,a,o=this.options,r=this.element.position(),h=this.element;return this.resizing=!0,/absolute/.test(h.css("position"))?h.css({position:"absolute",top:h.css("top"),left:h.css("left")}):h.is(".ui-draggable")&&h.css({position:"absolute",top:r.top,left:r.left}),this._renderProxy(),s=e(this.helper.css("left")),n=e(this.helper.css("top")),o.containment&&(s+=t(o.containment).scrollLeft()||0,n+=t(o.containment).scrollTop()||0),this.offset=this.helper.offset(),this.position={left:s,top:n},this.size=this._helper?{width:this.helper.width(),height:this.helper.height()}:{width:h.width(),height:h.height()},this.originalSize=this._helper?{width:h.outerWidth(),height:h.outerHeight()}:{width:h.width(),height:h.height()},this.originalPosition={left:s,top:n},this.sizeDiff={width:h.outerWidth()-h.width(),height:h.outerHeight()-h.height()},this.originalMousePosition={left:i.pageX,top:i.pageY},this.aspectRatio="number"==typeof o.aspectRatio?o.aspectRatio:this.originalSize.width/this.originalSize.height||1,a=t(".ui-resizable-"+this.axis).css("cursor"),t("body").css("cursor","auto"===a?this.axis+"-resize":a),h.addClass("ui-resizable-resizing"),this._propagate("start",i),!0},_mouseDrag:function(e){var i,s=this.helper,n={},a=this.originalMousePosition,o=this.axis,r=this.position.top,h=this.position.left,l=this.size.width,c=this.size.height,u=e.pageX-a.left||0,d=e.pageY-a.top||0,p=this._change[o];return p?(i=p.apply(this,[e,u,d]),this._updateVirtualBoundaries(e.shiftKey),(this._aspectRatio||e.shiftKey)&&(i=this._updateRatio(i,e)),i=this._respectSize(i,e),this._updateCache(i),this._propagate("resize",e),this.position.top!==r&&(n.top=this.position.top+"px"),this.position.left!==h&&(n.left=this.position.left+"px"),this.size.width!==l&&(n.width=this.size.width+"px"),this.size.height!==c&&(n.height=this.size.height+"px"),s.css(n),!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize(),t.isEmptyObject(n)||this._trigger("resize",e,this.ui()),!1):!1},_mouseStop:function(e){this.resizing=!1;var i,s,n,a,o,r,h,l=this.options,c=this;return this._helper&&(i=this._proportionallyResizeElements,s=i.length&&/textarea/i.test(i[0].nodeName),n=s&&t.ui.hasScroll(i[0],"left")?0:c.sizeDiff.height,a=s?0:c.sizeDiff.width,o={width:c.helper.width()-a,height:c.helper.height()-n},r=parseInt(c.element.css("left"),10)+(c.position.left-c.originalPosition.left)||null,h=parseInt(c.element.css("top"),10)+(c.position.top-c.originalPosition.top)||null,l.animate||this.element.css(t.extend(o,{top:h,left:r})),c.helper.height(c.size.height),c.helper.width(c.size.width),this._helper&&!l.animate&&this._proportionallyResize()),t("body").css("cursor","auto"),this.element.removeClass("ui-resizable-resizing"),this._propagate("stop",e),this._helper&&this.helper.remove(),!1},_updateVirtualBoundaries:function(t){var e,s,n,a,o,r=this.options;o={minWidth:i(r.minWidth)?r.minWidth:0,maxWidth:i(r.maxWidth)?r.maxWidth:1/0,minHeight:i(r.minHeight)?r.minHeight:0,maxHeight:i(r.maxHeight)?r.maxHeight:1/0},(this._aspectRatio||t)&&(e=o.minHeight*this.aspectRatio,n=o.minWidth/this.aspectRatio,s=o.maxHeight*this.aspectRatio,a=o.maxWidth/this.aspectRatio,e>o.minWidth&&(o.minWidth=e),n>o.minHeight&&(o.minHeight=n),o.maxWidth>s&&(o.maxWidth=s),o.maxHeight>a&&(o.maxHeight=a)),this._vBoundaries=o},_updateCache:function(t){this.offset=this.helper.offset(),i(t.left)&&(this.position.left=t.left),i(t.top)&&(this.position.top=t.top),i(t.height)&&(this.size.height=t.height),i(t.width)&&(this.size.width=t.width)},_updateRatio:function(t){var e=this.position,s=this.size,n=this.axis;return i(t.height)?t.width=t.height*this.aspectRatio:i(t.width)&&(t.height=t.width/this.aspectRatio),"sw"===n&&(t.left=e.left+(s.width-t.width),t.top=null),"nw"===n&&(t.top=e.top+(s.height-t.height),t.left=e.left+(s.width-t.width)),t},_respectSize:function(t){var e=this._vBoundaries,s=this.axis,n=i(t.width)&&e.maxWidth&&e.maxWidth<t.width,a=i(t.height)&&e.maxHeight&&e.maxHeight<t.height,o=i(t.width)&&e.minWidth&&e.minWidth>t.width,r=i(t.height)&&e.minHeight&&e.minHeight>t.height,h=this.originalPosition.left+this.originalSize.width,l=this.position.top+this.size.height,c=/sw|nw|w/.test(s),u=/nw|ne|n/.test(s);return o&&(t.width=e.minWidth),r&&(t.height=e.minHeight),n&&(t.width=e.maxWidth),a&&(t.height=e.maxHeight),o&&c&&(t.left=h-e.minWidth),n&&c&&(t.left=h-e.maxWidth),r&&u&&(t.top=l-e.minHeight),a&&u&&(t.top=l-e.maxHeight),t.width||t.height||t.left||!t.top?t.width||t.height||t.top||!t.left||(t.left=null):t.top=null,t},_proportionallyResize:function(){if(this._proportionallyResizeElements.length){var t,e,i,s,n,a=this.helper||this.element;for(t=0;this._proportionallyResizeElements.length>t;t++){if(n=this._proportionallyResizeElements[t],!this.borderDif)for(this.borderDif=[],i=[n.css("borderTopWidth"),n.css("borderRightWidth"),n.css("borderBottomWidth"),n.css("borderLeftWidth")],s=[n.css("paddingTop"),n.css("paddingRight"),n.css("paddingBottom"),n.css("paddingLeft")],e=0;i.length>e;e++)this.borderDif[e]=(parseInt(i[e],10)||0)+(parseInt(s[e],10)||0);n.css({height:a.height()-this.borderDif[0]-this.borderDif[2]||0,width:a.width()-this.borderDif[1]-this.borderDif[3]||0})}}},_renderProxy:function(){var e=this.element,i=this.options;this.elementOffset=e.offset(),this._helper?(this.helper=this.helper||t("<div style='overflow:hidden;'></div>"),this.helper.addClass(this._helper).css({width:this.element.outerWidth()-1,height:this.element.outerHeight()-1,position:"absolute",left:this.elementOffset.left+"px",top:this.elementOffset.top+"px",zIndex:++i.zIndex}),this.helper.appendTo("body").disableSelection()):this.helper=this.element},_change:{e:function(t,e){return{width:this.originalSize.width+e}},w:function(t,e){var i=this.originalSize,s=this.originalPosition;return{left:s.left+e,width:i.width-e}},n:function(t,e,i){var s=this.originalSize,n=this.originalPosition;return{top:n.top+i,height:s.height-i}},s:function(t,e,i){return{height:this.originalSize.height+i}},se:function(e,i,s){return t.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[e,i,s]))},sw:function(e,i,s){return t.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[e,i,s]))},ne:function(e,i,s){return t.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[e,i,s]))},nw:function(e,i,s){return t.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[e,i,s]))}},_propagate:function(e,i){t.ui.plugin.call(this,e,[i,this.ui()]),"resize"!==e&&this._trigger(e,i,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}}),t.ui.plugin.add("resizable","animate",{stop:function(e){var i=t(this).data("ui-resizable"),s=i.options,n=i._proportionallyResizeElements,a=n.length&&/textarea/i.test(n[0].nodeName),o=a&&t.ui.hasScroll(n[0],"left")?0:i.sizeDiff.height,r=a?0:i.sizeDiff.width,h={width:i.size.width-r,height:i.size.height-o},l=parseInt(i.element.css("left"),10)+(i.position.left-i.originalPosition.left)||null,c=parseInt(i.element.css("top"),10)+(i.position.top-i.originalPosition.top)||null;i.element.animate(t.extend(h,c&&l?{top:c,left:l}:{}),{duration:s.animateDuration,easing:s.animateEasing,step:function(){var s={width:parseInt(i.element.css("width"),10),height:parseInt(i.element.css("height"),10),top:parseInt(i.element.css("top"),10),left:parseInt(i.element.css("left"),10)};n&&n.length&&t(n[0]).css({width:s.width,height:s.height}),i._updateCache(s),i._propagate("resize",e)}})}}),t.ui.plugin.add("resizable","containment",{start:function(){var i,s,n,a,o,r,h,l=t(this).data("ui-resizable"),c=l.options,u=l.element,d=c.containment,p=d instanceof t?d.get(0):/parent/.test(d)?u.parent().get(0):d;p&&(l.containerElement=t(p),/document/.test(d)||d===document?(l.containerOffset={left:0,top:0},l.containerPosition={left:0,top:0},l.parentData={element:t(document),left:0,top:0,width:t(document).width(),height:t(document).height()||document.body.parentNode.scrollHeight}):(i=t(p),s=[],t(["Top","Right","Left","Bottom"]).each(function(t,n){s[t]=e(i.css("padding"+n))}),l.containerOffset=i.offset(),l.containerPosition=i.position(),l.containerSize={height:i.innerHeight()-s[3],width:i.innerWidth()-s[1]},n=l.containerOffset,a=l.containerSize.height,o=l.containerSize.width,r=t.ui.hasScroll(p,"left")?p.scrollWidth:o,h=t.ui.hasScroll(p)?p.scrollHeight:a,l.parentData={element:p,left:n.left,top:n.top,width:r,height:h}))},resize:function(e){var i,s,n,a,o=t(this).data("ui-resizable"),r=o.options,h=o.containerOffset,l=o.position,c=o._aspectRatio||e.shiftKey,u={top:0,left:0},d=o.containerElement;d[0]!==document&&/static/.test(d.css("position"))&&(u=h),l.left<(o._helper?h.left:0)&&(o.size.width=o.size.width+(o._helper?o.position.left-h.left:o.position.left-u.left),c&&(o.size.height=o.size.width/o.aspectRatio),o.position.left=r.helper?h.left:0),l.top<(o._helper?h.top:0)&&(o.size.height=o.size.height+(o._helper?o.position.top-h.top:o.position.top),c&&(o.size.width=o.size.height*o.aspectRatio),o.position.top=o._helper?h.top:0),o.offset.left=o.parentData.left+o.position.left,o.offset.top=o.parentData.top+o.position.top,i=Math.abs((o._helper?o.offset.left-u.left:o.offset.left-u.left)+o.sizeDiff.width),s=Math.abs((o._helper?o.offset.top-u.top:o.offset.top-h.top)+o.sizeDiff.height),n=o.containerElement.get(0)===o.element.parent().get(0),a=/relative|absolute/.test(o.containerElement.css("position")),n&&a&&(i-=Math.abs(o.parentData.left)),i+o.size.width>=o.parentData.width&&(o.size.width=o.parentData.width-i,c&&(o.size.height=o.size.width/o.aspectRatio)),s+o.size.height>=o.parentData.height&&(o.size.height=o.parentData.height-s,c&&(o.size.width=o.size.height*o.aspectRatio))},stop:function(){var e=t(this).data("ui-resizable"),i=e.options,s=e.containerOffset,n=e.containerPosition,a=e.containerElement,o=t(e.helper),r=o.offset(),h=o.outerWidth()-e.sizeDiff.width,l=o.outerHeight()-e.sizeDiff.height;e._helper&&!i.animate&&/relative/.test(a.css("position"))&&t(this).css({left:r.left-n.left-s.left,width:h,height:l}),e._helper&&!i.animate&&/static/.test(a.css("position"))&&t(this).css({left:r.left-n.left-s.left,width:h,height:l})}}),t.ui.plugin.add("resizable","alsoResize",{start:function(){var e=t(this).data("ui-resizable"),i=e.options,s=function(e){t(e).each(function(){var e=t(this);e.data("ui-resizable-alsoresize",{width:parseInt(e.width(),10),height:parseInt(e.height(),10),left:parseInt(e.css("left"),10),top:parseInt(e.css("top"),10)})})};"object"!=typeof i.alsoResize||i.alsoResize.parentNode?s(i.alsoResize):i.alsoResize.length?(i.alsoResize=i.alsoResize[0],s(i.alsoResize)):t.each(i.alsoResize,function(t){s(t)})},resize:function(e,i){var s=t(this).data("ui-resizable"),n=s.options,a=s.originalSize,o=s.originalPosition,r={height:s.size.height-a.height||0,width:s.size.width-a.width||0,top:s.position.top-o.top||0,left:s.position.left-o.left||0},h=function(e,s){t(e).each(function(){var e=t(this),n=t(this).data("ui-resizable-alsoresize"),a={},o=s&&s.length?s:e.parents(i.originalElement[0]).length?["width","height"]:["width","height","top","left"];t.each(o,function(t,e){var i=(n[e]||0)+(r[e]||0);i&&i>=0&&(a[e]=i||null)}),e.css(a)})};"object"!=typeof n.alsoResize||n.alsoResize.nodeType?h(n.alsoResize):t.each(n.alsoResize,function(t,e){h(t,e)})},stop:function(){t(this).removeData("resizable-alsoresize")}}),t.ui.plugin.add("resizable","ghost",{start:function(){var e=t(this).data("ui-resizable"),i=e.options,s=e.size;e.ghost=e.originalElement.clone(),e.ghost.css({opacity:.25,display:"block",position:"relative",height:s.height,width:s.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass("string"==typeof i.ghost?i.ghost:""),e.ghost.appendTo(e.helper)},resize:function(){var e=t(this).data("ui-resizable");e.ghost&&e.ghost.css({position:"relative",height:e.size.height,width:e.size.width})},stop:function(){var e=t(this).data("ui-resizable");e.ghost&&e.helper&&e.helper.get(0).removeChild(e.ghost.get(0))}}),t.ui.plugin.add("resizable","grid",{resize:function(){var e=t(this).data("ui-resizable"),i=e.options,s=e.size,n=e.originalSize,a=e.originalPosition,o=e.axis,r="number"==typeof i.grid?[i.grid,i.grid]:i.grid,h=r[0]||1,l=r[1]||1,c=Math.round((s.width-n.width)/h)*h,u=Math.round((s.height-n.height)/l)*l,d=n.width+c,p=n.height+u,f=i.maxWidth&&d>i.maxWidth,g=i.maxHeight&&p>i.maxHeight,m=i.minWidth&&i.minWidth>d,v=i.minHeight&&i.minHeight>p;i.grid=r,m&&(d+=h),v&&(p+=l),f&&(d-=h),g&&(p-=l),/^(se|s|e)$/.test(o)?(e.size.width=d,e.size.height=p):/^(ne)$/.test(o)?(e.size.width=d,e.size.height=p,e.position.top=a.top-u):/^(sw)$/.test(o)?(e.size.width=d,e.size.height=p,e.position.left=a.left-c):(p-l>0?(e.size.height=p,e.position.top=a.top-u):(e.size.height=l,e.position.top=a.top+n.height-l),d-h>0?(e.size.width=d,e.position.left=a.left-c):(e.size.width=h,e.position.left=a.left+n.width-h))}})})(jQuery);(function(t){t.widget("ui.selectable",t.ui.mouse,{version:"1.10.4",options:{appendTo:"body",autoRefresh:!0,distance:0,filter:"*",tolerance:"touch",selected:null,selecting:null,start:null,stop:null,unselected:null,unselecting:null},_create:function(){var e,i=this;this.element.addClass("ui-selectable"),this.dragged=!1,this.refresh=function(){e=t(i.options.filter,i.element[0]),e.addClass("ui-selectee"),e.each(function(){var e=t(this),i=e.offset();t.data(this,"selectable-item",{element:this,$element:e,left:i.left,top:i.top,right:i.left+e.outerWidth(),bottom:i.top+e.outerHeight(),startselected:!1,selected:e.hasClass("ui-selected"),selecting:e.hasClass("ui-selecting"),unselecting:e.hasClass("ui-unselecting")})})},this.refresh(),this.selectees=e.addClass("ui-selectee"),this._mouseInit(),this.helper=t("<div class='ui-selectable-helper'></div>")},_destroy:function(){this.selectees.removeClass("ui-selectee").removeData("selectable-item"),this.element.removeClass("ui-selectable ui-selectable-disabled"),this._mouseDestroy()},_mouseStart:function(e){var i=this,s=this.options;this.opos=[e.pageX,e.pageY],this.options.disabled||(this.selectees=t(s.filter,this.element[0]),this._trigger("start",e),t(s.appendTo).append(this.helper),this.helper.css({left:e.pageX,top:e.pageY,width:0,height:0}),s.autoRefresh&&this.refresh(),this.selectees.filter(".ui-selected").each(function(){var s=t.data(this,"selectable-item");s.startselected=!0,e.metaKey||e.ctrlKey||(s.$element.removeClass("ui-selected"),s.selected=!1,s.$element.addClass("ui-unselecting"),s.unselecting=!0,i._trigger("unselecting",e,{unselecting:s.element}))}),t(e.target).parents().addBack().each(function(){var s,n=t.data(this,"selectable-item");return n?(s=!e.metaKey&&!e.ctrlKey||!n.$element.hasClass("ui-selected"),n.$element.removeClass(s?"ui-unselecting":"ui-selected").addClass(s?"ui-selecting":"ui-unselecting"),n.unselecting=!s,n.selecting=s,n.selected=s,s?i._trigger("selecting",e,{selecting:n.element}):i._trigger("unselecting",e,{unselecting:n.element}),!1):undefined}))},_mouseDrag:function(e){if(this.dragged=!0,!this.options.disabled){var i,s=this,n=this.options,a=this.opos[0],o=this.opos[1],r=e.pageX,l=e.pageY;return a>r&&(i=r,r=a,a=i),o>l&&(i=l,l=o,o=i),this.helper.css({left:a,top:o,width:r-a,height:l-o}),this.selectees.each(function(){var i=t.data(this,"selectable-item"),h=!1;i&&i.element!==s.element[0]&&("touch"===n.tolerance?h=!(i.left>r||a>i.right||i.top>l||o>i.bottom):"fit"===n.tolerance&&(h=i.left>a&&r>i.right&&i.top>o&&l>i.bottom),h?(i.selected&&(i.$element.removeClass("ui-selected"),i.selected=!1),i.unselecting&&(i.$element.removeClass("ui-unselecting"),i.unselecting=!1),i.selecting||(i.$element.addClass("ui-selecting"),i.selecting=!0,s._trigger("selecting",e,{selecting:i.element}))):(i.selecting&&((e.metaKey||e.ctrlKey)&&i.startselected?(i.$element.removeClass("ui-selecting"),i.selecting=!1,i.$element.addClass("ui-selected"),i.selected=!0):(i.$element.removeClass("ui-selecting"),i.selecting=!1,i.startselected&&(i.$element.addClass("ui-unselecting"),i.unselecting=!0),s._trigger("unselecting",e,{unselecting:i.element}))),i.selected&&(e.metaKey||e.ctrlKey||i.startselected||(i.$element.removeClass("ui-selected"),i.selected=!1,i.$element.addClass("ui-unselecting"),i.unselecting=!0,s._trigger("unselecting",e,{unselecting:i.element})))))}),!1}},_mouseStop:function(e){var i=this;return this.dragged=!1,t(".ui-unselecting",this.element[0]).each(function(){var s=t.data(this,"selectable-item");s.$element.removeClass("ui-unselecting"),s.unselecting=!1,s.startselected=!1,i._trigger("unselected",e,{unselected:s.element})}),t(".ui-selecting",this.element[0]).each(function(){var s=t.data(this,"selectable-item");s.$element.removeClass("ui-selecting").addClass("ui-selected"),s.selecting=!1,s.selected=!0,s.startselected=!0,i._trigger("selected",e,{selected:s.element})}),this._trigger("stop",e),this.helper.remove(),!1}})})(jQuery);(function(t){function e(t,e,i){return t>e&&e+i>t}function i(t){return/left|right/.test(t.css("float"))||/inline|table-cell/.test(t.css("display"))}t.widget("ui.sortable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"sort",ready:!1,options:{appendTo:"parent",axis:!1,connectWith:!1,containment:!1,cursor:"auto",cursorAt:!1,dropOnEmpty:!0,forcePlaceholderSize:!1,forceHelperSize:!1,grid:!1,handle:!1,helper:"original",items:"> *",opacity:!1,placeholder:!1,revert:!1,scroll:!0,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1e3,activate:null,beforeStop:null,change:null,deactivate:null,out:null,over:null,receive:null,remove:null,sort:null,start:null,stop:null,update:null},_create:function(){var t=this.options;this.containerCache={},this.element.addClass("ui-sortable"),this.refresh(),this.floating=this.items.length?"x"===t.axis||i(this.items[0].item):!1,this.offset=this.element.offset(),this._mouseInit(),this.ready=!0},_destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled"),this._mouseDestroy();for(var t=this.items.length-1;t>=0;t--)this.items[t].item.removeData(this.widgetName+"-item");return this},_setOption:function(e,i){"disabled"===e?(this.options[e]=i,this.widget().toggleClass("ui-sortable-disabled",!!i)):t.Widget.prototype._setOption.apply(this,arguments)},_mouseCapture:function(e,i){var s=null,n=!1,o=this;return this.reverting?!1:this.options.disabled||"static"===this.options.type?!1:(this._refreshItems(e),t(e.target).parents().each(function(){return t.data(this,o.widgetName+"-item")===o?(s=t(this),!1):undefined}),t.data(e.target,o.widgetName+"-item")===o&&(s=t(e.target)),s?!this.options.handle||i||(t(this.options.handle,s).find("*").addBack().each(function(){this===e.target&&(n=!0)}),n)?(this.currentItem=s,this._removeCurrentsFromItems(),!0):!1:!1)},_mouseStart:function(e,i,s){var n,o,a=this.options;if(this.currentContainer=this,this.refreshPositions(),this.helper=this._createHelper(e),this._cacheHelperProportions(),this._cacheMargins(),this.scrollParent=this.helper.scrollParent(),this.offset=this.currentItem.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.helper.css("position","absolute"),this.cssPosition=this.helper.css("position"),this.originalPosition=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,a.cursorAt&&this._adjustOffsetFromHelper(a.cursorAt),this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]},this.helper[0]!==this.currentItem[0]&&this.currentItem.hide(),this._createPlaceholder(),a.containment&&this._setContainment(),a.cursor&&"auto"!==a.cursor&&(o=this.document.find("body"),this.storedCursor=o.css("cursor"),o.css("cursor",a.cursor),this.storedStylesheet=t("<style>*{ cursor: "+a.cursor+" !important; }</style>").appendTo(o)),a.opacity&&(this.helper.css("opacity")&&(this._storedOpacity=this.helper.css("opacity")),this.helper.css("opacity",a.opacity)),a.zIndex&&(this.helper.css("zIndex")&&(this._storedZIndex=this.helper.css("zIndex")),this.helper.css("zIndex",a.zIndex)),this.scrollParent[0]!==document&&"HTML"!==this.scrollParent[0].tagName&&(this.overflowOffset=this.scrollParent.offset()),this._trigger("start",e,this._uiHash()),this._preserveHelperProportions||this._cacheHelperProportions(),!s)for(n=this.containers.length-1;n>=0;n--)this.containers[n]._trigger("activate",e,this._uiHash(this));return t.ui.ddmanager&&(t.ui.ddmanager.current=this),t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this.dragging=!0,this.helper.addClass("ui-sortable-helper"),this._mouseDrag(e),!0},_mouseDrag:function(e){var i,s,n,o,a=this.options,r=!1;for(this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),this.lastPositionAbs||(this.lastPositionAbs=this.positionAbs),this.options.scroll&&(this.scrollParent[0]!==document&&"HTML"!==this.scrollParent[0].tagName?(this.overflowOffset.top+this.scrollParent[0].offsetHeight-e.pageY<a.scrollSensitivity?this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop+a.scrollSpeed:e.pageY-this.overflowOffset.top<a.scrollSensitivity&&(this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop-a.scrollSpeed),this.overflowOffset.left+this.scrollParent[0].offsetWidth-e.pageX<a.scrollSensitivity?this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft+a.scrollSpeed:e.pageX-this.overflowOffset.left<a.scrollSensitivity&&(this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft-a.scrollSpeed)):(e.pageY-t(document).scrollTop()<a.scrollSensitivity?r=t(document).scrollTop(t(document).scrollTop()-a.scrollSpeed):t(window).height()-(e.pageY-t(document).scrollTop())<a.scrollSensitivity&&(r=t(document).scrollTop(t(document).scrollTop()+a.scrollSpeed)),e.pageX-t(document).scrollLeft()<a.scrollSensitivity?r=t(document).scrollLeft(t(document).scrollLeft()-a.scrollSpeed):t(window).width()-(e.pageX-t(document).scrollLeft())<a.scrollSensitivity&&(r=t(document).scrollLeft(t(document).scrollLeft()+a.scrollSpeed))),r!==!1&&t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e)),this.positionAbs=this._convertPositionTo("absolute"),this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),i=this.items.length-1;i>=0;i--)if(s=this.items[i],n=s.item[0],o=this._intersectsWithPointer(s),o&&s.instance===this.currentContainer&&n!==this.currentItem[0]&&this.placeholder[1===o?"next":"prev"]()[0]!==n&&!t.contains(this.placeholder[0],n)&&("semi-dynamic"===this.options.type?!t.contains(this.element[0],n):!0)){if(this.direction=1===o?"down":"up","pointer"!==this.options.tolerance&&!this._intersectsWithSides(s))break;this._rearrange(e,s),this._trigger("change",e,this._uiHash());break}return this._contactContainers(e),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),this._trigger("sort",e,this._uiHash()),this.lastPositionAbs=this.positionAbs,!1},_mouseStop:function(e,i){if(e){if(t.ui.ddmanager&&!this.options.dropBehaviour&&t.ui.ddmanager.drop(this,e),this.options.revert){var s=this,n=this.placeholder.offset(),o=this.options.axis,a={};o&&"x"!==o||(a.left=n.left-this.offset.parent.left-this.margins.left+(this.offsetParent[0]===document.body?0:this.offsetParent[0].scrollLeft)),o&&"y"!==o||(a.top=n.top-this.offset.parent.top-this.margins.top+(this.offsetParent[0]===document.body?0:this.offsetParent[0].scrollTop)),this.reverting=!0,t(this.helper).animate(a,parseInt(this.options.revert,10)||500,function(){s._clear(e)})}else this._clear(e,i);return!1}},cancel:function(){if(this.dragging){this._mouseUp({target:null}),"original"===this.options.helper?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):this.currentItem.show();for(var e=this.containers.length-1;e>=0;e--)this.containers[e]._trigger("deactivate",null,this._uiHash(this)),this.containers[e].containerCache.over&&(this.containers[e]._trigger("out",null,this._uiHash(this)),this.containers[e].containerCache.over=0)}return this.placeholder&&(this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]),"original"!==this.options.helper&&this.helper&&this.helper[0].parentNode&&this.helper.remove(),t.extend(this,{helper:null,dragging:!1,reverting:!1,_noFinalSort:null}),this.domPosition.prev?t(this.domPosition.prev).after(this.currentItem):t(this.domPosition.parent).prepend(this.currentItem)),this},serialize:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},t(i).each(function(){var i=(t(e.item||this).attr(e.attribute||"id")||"").match(e.expression||/(.+)[\-=_](.+)/);i&&s.push((e.key||i[1]+"[]")+"="+(e.key&&e.expression?i[1]:i[2]))}),!s.length&&e.key&&s.push(e.key+"="),s.join("&")},toArray:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},i.each(function(){s.push(t(e.item||this).attr(e.attribute||"id")||"")}),s},_intersectsWith:function(t){var e=this.positionAbs.left,i=e+this.helperProportions.width,s=this.positionAbs.top,n=s+this.helperProportions.height,o=t.left,a=o+t.width,r=t.top,h=r+t.height,l=this.offset.click.top,c=this.offset.click.left,u="x"===this.options.axis||s+l>r&&h>s+l,d="y"===this.options.axis||e+c>o&&a>e+c,p=u&&d;return"pointer"===this.options.tolerance||this.options.forcePointerForContainers||"pointer"!==this.options.tolerance&&this.helperProportions[this.floating?"width":"height"]>t[this.floating?"width":"height"]?p:e+this.helperProportions.width/2>o&&a>i-this.helperProportions.width/2&&s+this.helperProportions.height/2>r&&h>n-this.helperProportions.height/2},_intersectsWithPointer:function(t){var i="x"===this.options.axis||e(this.positionAbs.top+this.offset.click.top,t.top,t.height),s="y"===this.options.axis||e(this.positionAbs.left+this.offset.click.left,t.left,t.width),n=i&&s,o=this._getDragVerticalDirection(),a=this._getDragHorizontalDirection();return n?this.floating?a&&"right"===a||"down"===o?2:1:o&&("down"===o?2:1):!1},_intersectsWithSides:function(t){var i=e(this.positionAbs.top+this.offset.click.top,t.top+t.height/2,t.height),s=e(this.positionAbs.left+this.offset.click.left,t.left+t.width/2,t.width),n=this._getDragVerticalDirection(),o=this._getDragHorizontalDirection();return this.floating&&o?"right"===o&&s||"left"===o&&!s:n&&("down"===n&&i||"up"===n&&!i)},_getDragVerticalDirection:function(){var t=this.positionAbs.top-this.lastPositionAbs.top;return 0!==t&&(t>0?"down":"up")},_getDragHorizontalDirection:function(){var t=this.positionAbs.left-this.lastPositionAbs.left;return 0!==t&&(t>0?"right":"left")},refresh:function(t){return this._refreshItems(t),this.refreshPositions(),this},_connectWith:function(){var t=this.options;return t.connectWith.constructor===String?[t.connectWith]:t.connectWith},_getItemsAsjQuery:function(e){function i(){r.push(this)}var s,n,o,a,r=[],h=[],l=this._connectWith();if(l&&e)for(s=l.length-1;s>=0;s--)for(o=t(l[s]),n=o.length-1;n>=0;n--)a=t.data(o[n],this.widgetFullName),a&&a!==this&&!a.options.disabled&&h.push([t.isFunction(a.options.items)?a.options.items.call(a.element):t(a.options.items,a.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),a]);for(h.push([t.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):t(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]),s=h.length-1;s>=0;s--)h[s][0].each(i);return t(r)},_removeCurrentsFromItems:function(){var e=this.currentItem.find(":data("+this.widgetName+"-item)");this.items=t.grep(this.items,function(t){for(var i=0;e.length>i;i++)if(e[i]===t.item[0])return!1;return!0})},_refreshItems:function(e){this.items=[],this.containers=[this];var i,s,n,o,a,r,h,l,c=this.items,u=[[t.isFunction(this.options.items)?this.options.items.call(this.element[0],e,{item:this.currentItem}):t(this.options.items,this.element),this]],d=this._connectWith();if(d&&this.ready)for(i=d.length-1;i>=0;i--)for(n=t(d[i]),s=n.length-1;s>=0;s--)o=t.data(n[s],this.widgetFullName),o&&o!==this&&!o.options.disabled&&(u.push([t.isFunction(o.options.items)?o.options.items.call(o.element[0],e,{item:this.currentItem}):t(o.options.items,o.element),o]),this.containers.push(o));for(i=u.length-1;i>=0;i--)for(a=u[i][1],r=u[i][0],s=0,l=r.length;l>s;s++)h=t(r[s]),h.data(this.widgetName+"-item",a),c.push({item:h,instance:a,width:0,height:0,left:0,top:0})},refreshPositions:function(e){this.offsetParent&&this.helper&&(this.offset.parent=this._getParentOffset());var i,s,n,o;for(i=this.items.length-1;i>=0;i--)s=this.items[i],s.instance!==this.currentContainer&&this.currentContainer&&s.item[0]!==this.currentItem[0]||(n=this.options.toleranceElement?t(this.options.toleranceElement,s.item):s.item,e||(s.width=n.outerWidth(),s.height=n.outerHeight()),o=n.offset(),s.left=o.left,s.top=o.top);if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(i=this.containers.length-1;i>=0;i--)o=this.containers[i].element.offset(),this.containers[i].containerCache.left=o.left,this.containers[i].containerCache.top=o.top,this.containers[i].containerCache.width=this.containers[i].element.outerWidth(),this.containers[i].containerCache.height=this.containers[i].element.outerHeight();return this},_createPlaceholder:function(e){e=e||this;var i,s=e.options;s.placeholder&&s.placeholder.constructor!==String||(i=s.placeholder,s.placeholder={element:function(){var s=e.currentItem[0].nodeName.toLowerCase(),n=t("<"+s+">",e.document[0]).addClass(i||e.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper");return"tr"===s?e.currentItem.children().each(function(){t("<td>&#160;</td>",e.document[0]).attr("colspan",t(this).attr("colspan")||1).appendTo(n)}):"img"===s&&n.attr("src",e.currentItem.attr("src")),i||n.css("visibility","hidden"),n},update:function(t,n){(!i||s.forcePlaceholderSize)&&(n.height()||n.height(e.currentItem.innerHeight()-parseInt(e.currentItem.css("paddingTop")||0,10)-parseInt(e.currentItem.css("paddingBottom")||0,10)),n.width()||n.width(e.currentItem.innerWidth()-parseInt(e.currentItem.css("paddingLeft")||0,10)-parseInt(e.currentItem.css("paddingRight")||0,10)))}}),e.placeholder=t(s.placeholder.element.call(e.element,e.currentItem)),e.currentItem.after(e.placeholder),s.placeholder.update(e,e.placeholder)},_contactContainers:function(s){var n,o,a,r,h,l,c,u,d,p,f=null,g=null;for(n=this.containers.length-1;n>=0;n--)if(!t.contains(this.currentItem[0],this.containers[n].element[0]))if(this._intersectsWith(this.containers[n].containerCache)){if(f&&t.contains(this.containers[n].element[0],f.element[0]))continue;f=this.containers[n],g=n}else this.containers[n].containerCache.over&&(this.containers[n]._trigger("out",s,this._uiHash(this)),this.containers[n].containerCache.over=0);if(f)if(1===this.containers.length)this.containers[g].containerCache.over||(this.containers[g]._trigger("over",s,this._uiHash(this)),this.containers[g].containerCache.over=1);else{for(a=1e4,r=null,p=f.floating||i(this.currentItem),h=p?"left":"top",l=p?"width":"height",c=this.positionAbs[h]+this.offset.click[h],o=this.items.length-1;o>=0;o--)t.contains(this.containers[g].element[0],this.items[o].item[0])&&this.items[o].item[0]!==this.currentItem[0]&&(!p||e(this.positionAbs.top+this.offset.click.top,this.items[o].top,this.items[o].height))&&(u=this.items[o].item.offset()[h],d=!1,Math.abs(u-c)>Math.abs(u+this.items[o][l]-c)&&(d=!0,u+=this.items[o][l]),a>Math.abs(u-c)&&(a=Math.abs(u-c),r=this.items[o],this.direction=d?"up":"down"));if(!r&&!this.options.dropOnEmpty)return;if(this.currentContainer===this.containers[g])return;r?this._rearrange(s,r,null,!0):this._rearrange(s,null,this.containers[g].element,!0),this._trigger("change",s,this._uiHash()),this.containers[g]._trigger("change",s,this._uiHash(this)),this.currentContainer=this.containers[g],this.options.placeholder.update(this.currentContainer,this.placeholder),this.containers[g]._trigger("over",s,this._uiHash(this)),this.containers[g].containerCache.over=1}},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e,this.currentItem])):"clone"===i.helper?this.currentItem.clone():this.currentItem;return s.parents("body").length||t("parent"!==i.appendTo?i.appendTo:this.currentItem[0].parentNode)[0].appendChild(s[0]),s[0]===this.currentItem[0]&&(this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")}),(!s[0].style.width||i.forceHelperSize)&&s.width(this.currentItem.width()),(!s[0].style.height||i.forceHelperSize)&&s.height(this.currentItem.height()),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===document.body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.currentItem.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;"parent"===n.containment&&(n.containment=this.helper[0].parentNode),("document"===n.containment||"window"===n.containment)&&(this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,t("document"===n.containment?document:window).width()-this.helperProportions.width-this.margins.left,(t("document"===n.containment?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]),/^(document|window|parent)$/.test(n.containment)||(e=t(n.containment)[0],i=t(n.containment).offset(),s="hidden"!==t(e).css("overflow"),this.containment=[i.left+(parseInt(t(e).css("borderLeftWidth"),10)||0)+(parseInt(t(e).css("paddingLeft"),10)||0)-this.margins.left,i.top+(parseInt(t(e).css("borderTopWidth"),10)||0)+(parseInt(t(e).css("paddingTop"),10)||0)-this.margins.top,i.left+(s?Math.max(e.scrollWidth,e.offsetWidth):e.offsetWidth)-(parseInt(t(e).css("borderLeftWidth"),10)||0)-(parseInt(t(e).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,i.top+(s?Math.max(e.scrollHeight,e.offsetHeight):e.offsetHeight)-(parseInt(t(e).css("borderTopWidth"),10)||0)-(parseInt(t(e).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top])},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,o=/(html|body)/i.test(n[0].tagName);return{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():o?0:n.scrollTop())*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():o?0:n.scrollLeft())*s}},_generatePosition:function(e){var i,s,n=this.options,o=e.pageX,a=e.pageY,r="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,h=/(html|body)/i.test(r[0].tagName);return"relative"!==this.cssPosition||this.scrollParent[0]!==document&&this.scrollParent[0]!==this.offsetParent[0]||(this.offset.relative=this._getRelativeOffset()),this.originalPosition&&(this.containment&&(e.pageX-this.offset.click.left<this.containment[0]&&(o=this.containment[0]+this.offset.click.left),e.pageY-this.offset.click.top<this.containment[1]&&(a=this.containment[1]+this.offset.click.top),e.pageX-this.offset.click.left>this.containment[2]&&(o=this.containment[2]+this.offset.click.left),e.pageY-this.offset.click.top>this.containment[3]&&(a=this.containment[3]+this.offset.click.top)),n.grid&&(i=this.originalPageY+Math.round((a-this.originalPageY)/n.grid[1])*n.grid[1],a=this.containment?i-this.offset.click.top>=this.containment[1]&&i-this.offset.click.top<=this.containment[3]?i:i-this.offset.click.top>=this.containment[1]?i-n.grid[1]:i+n.grid[1]:i,s=this.originalPageX+Math.round((o-this.originalPageX)/n.grid[0])*n.grid[0],o=this.containment?s-this.offset.click.left>=this.containment[0]&&s-this.offset.click.left<=this.containment[2]?s:s-this.offset.click.left>=this.containment[0]?s-n.grid[0]:s+n.grid[0]:s)),{top:a-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():h?0:r.scrollTop()),left:o-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():h?0:r.scrollLeft())}},_rearrange:function(t,e,i,s){i?i[0].appendChild(this.placeholder[0]):e.item[0].parentNode.insertBefore(this.placeholder[0],"down"===this.direction?e.item[0]:e.item[0].nextSibling),this.counter=this.counter?++this.counter:1;var n=this.counter;this._delay(function(){n===this.counter&&this.refreshPositions(!s)})},_clear:function(t,e){function i(t,e,i){return function(s){i._trigger(t,s,e._uiHash(e))}}this.reverting=!1;var s,n=[];if(!this._noFinalSort&&this.currentItem.parent().length&&this.placeholder.before(this.currentItem),this._noFinalSort=null,this.helper[0]===this.currentItem[0]){for(s in this._storedCSS)("auto"===this._storedCSS[s]||"static"===this._storedCSS[s])&&(this._storedCSS[s]="");this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else this.currentItem.show();for(this.fromOutside&&!e&&n.push(function(t){this._trigger("receive",t,this._uiHash(this.fromOutside))}),!this.fromOutside&&this.domPosition.prev===this.currentItem.prev().not(".ui-sortable-helper")[0]&&this.domPosition.parent===this.currentItem.parent()[0]||e||n.push(function(t){this._trigger("update",t,this._uiHash())}),this!==this.currentContainer&&(e||(n.push(function(t){this._trigger("remove",t,this._uiHash())}),n.push(function(t){return function(e){t._trigger("receive",e,this._uiHash(this))}}.call(this,this.currentContainer)),n.push(function(t){return function(e){t._trigger("update",e,this._uiHash(this))}}.call(this,this.currentContainer)))),s=this.containers.length-1;s>=0;s--)e||n.push(i("deactivate",this,this.containers[s])),this.containers[s].containerCache.over&&(n.push(i("out",this,this.containers[s])),this.containers[s].containerCache.over=0);if(this.storedCursor&&(this.document.find("body").css("cursor",this.storedCursor),this.storedStylesheet.remove()),this._storedOpacity&&this.helper.css("opacity",this._storedOpacity),this._storedZIndex&&this.helper.css("zIndex","auto"===this._storedZIndex?"":this._storedZIndex),this.dragging=!1,this.cancelHelperRemoval){if(!e){for(this._trigger("beforeStop",t,this._uiHash()),s=0;n.length>s;s++)n[s].call(this,t);this._trigger("stop",t,this._uiHash())}return this.fromOutside=!1,!1}if(e||this._trigger("beforeStop",t,this._uiHash()),this.placeholder[0].parentNode.removeChild(this.placeholder[0]),this.helper[0]!==this.currentItem[0]&&this.helper.remove(),this.helper=null,!e){for(s=0;n.length>s;s++)n[s].call(this,t);this._trigger("stop",t,this._uiHash())}return this.fromOutside=!1,!0},_trigger:function(){t.Widget.prototype._trigger.apply(this,arguments)===!1&&this.cancel()},_uiHash:function(e){var i=e||this;return{helper:i.helper,placeholder:i.placeholder||t([]),position:i.position,originalPosition:i.originalPosition,offset:i.positionAbs,item:i.currentItem,sender:e?e.element:null}}})})(jQuery);(function(e,t){function i(){this._curInst=null,this._keyEvent=!1,this._disabledInputs=[],this._datepickerShowing=!1,this._inDialog=!1,this._mainDivId="ui-datepicker-div",this._inlineClass="ui-datepicker-inline",this._appendClass="ui-datepicker-append",this._triggerClass="ui-datepicker-trigger",this._dialogClass="ui-datepicker-dialog",this._disableClass="ui-datepicker-disabled",this._unselectableClass="ui-datepicker-unselectable",this._currentClass="ui-datepicker-current-day",this._dayOverClass="ui-datepicker-days-cell-over",this.regional=[],this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:!1,showMonthAfterYear:!1,yearSuffix:""},this._defaults={showOn:"focus",showAnim:"fadeIn",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:!1,hideIfNoPrevNext:!1,navigationAsDateFormat:!1,gotoCurrent:!1,changeMonth:!1,changeYear:!1,yearRange:"c-10:c+10",showOtherMonths:!1,selectOtherMonths:!1,showWeek:!1,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",minDate:null,maxDate:null,duration:"fast",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:!0,showButtonPanel:!1,autoSize:!1,disabled:!1},e.extend(this._defaults,this.regional[""]),this.dpDiv=a(e("<div id='"+this._mainDivId+"' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"))}function a(t){var i="button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";return t.delegate(i,"mouseout",function(){e(this).removeClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&e(this).removeClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&e(this).removeClass("ui-datepicker-next-hover")}).delegate(i,"mouseover",function(){e.datepicker._isDisabledDatepicker(n.inline?t.parent()[0]:n.input[0])||(e(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"),e(this).addClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&e(this).addClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&e(this).addClass("ui-datepicker-next-hover"))})}function s(t,i){e.extend(t,i);for(var a in i)null==i[a]&&(t[a]=i[a]);return t}e.extend(e.ui,{datepicker:{version:"1.10.4"}});var n,r="datepicker";e.extend(i.prototype,{markerClassName:"hasDatepicker",maxRows:4,_widgetDatepicker:function(){return this.dpDiv},setDefaults:function(e){return s(this._defaults,e||{}),this},_attachDatepicker:function(t,i){var a,s,n;a=t.nodeName.toLowerCase(),s="div"===a||"span"===a,t.id||(this.uuid+=1,t.id="dp"+this.uuid),n=this._newInst(e(t),s),n.settings=e.extend({},i||{}),"input"===a?this._connectDatepicker(t,n):s&&this._inlineDatepicker(t,n)},_newInst:function(t,i){var s=t[0].id.replace(/([^A-Za-z0-9_\-])/g,"\\\\$1");return{id:s,input:t,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:i,dpDiv:i?a(e("<div class='"+this._inlineClass+" ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")):this.dpDiv}},_connectDatepicker:function(t,i){var a=e(t);i.append=e([]),i.trigger=e([]),a.hasClass(this.markerClassName)||(this._attachments(a,i),a.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp),this._autoSize(i),e.data(t,r,i),i.settings.disabled&&this._disableDatepicker(t))},_attachments:function(t,i){var a,s,n,r=this._get(i,"appendText"),o=this._get(i,"isRTL");i.append&&i.append.remove(),r&&(i.append=e("<span class='"+this._appendClass+"'>"+r+"</span>"),t[o?"before":"after"](i.append)),t.unbind("focus",this._showDatepicker),i.trigger&&i.trigger.remove(),a=this._get(i,"showOn"),("focus"===a||"both"===a)&&t.focus(this._showDatepicker),("button"===a||"both"===a)&&(s=this._get(i,"buttonText"),n=this._get(i,"buttonImage"),i.trigger=e(this._get(i,"buttonImageOnly")?e("<img/>").addClass(this._triggerClass).attr({src:n,alt:s,title:s}):e("<button type='button'></button>").addClass(this._triggerClass).html(n?e("<img/>").attr({src:n,alt:s,title:s}):s)),t[o?"before":"after"](i.trigger),i.trigger.click(function(){return e.datepicker._datepickerShowing&&e.datepicker._lastInput===t[0]?e.datepicker._hideDatepicker():e.datepicker._datepickerShowing&&e.datepicker._lastInput!==t[0]?(e.datepicker._hideDatepicker(),e.datepicker._showDatepicker(t[0])):e.datepicker._showDatepicker(t[0]),!1}))},_autoSize:function(e){if(this._get(e,"autoSize")&&!e.inline){var t,i,a,s,n=new Date(2009,11,20),r=this._get(e,"dateFormat");r.match(/[DM]/)&&(t=function(e){for(i=0,a=0,s=0;e.length>s;s++)e[s].length>i&&(i=e[s].length,a=s);return a},n.setMonth(t(this._get(e,r.match(/MM/)?"monthNames":"monthNamesShort"))),n.setDate(t(this._get(e,r.match(/DD/)?"dayNames":"dayNamesShort"))+20-n.getDay())),e.input.attr("size",this._formatDate(e,n).length)}},_inlineDatepicker:function(t,i){var a=e(t);a.hasClass(this.markerClassName)||(a.addClass(this.markerClassName).append(i.dpDiv),e.data(t,r,i),this._setDate(i,this._getDefaultDate(i),!0),this._updateDatepicker(i),this._updateAlternate(i),i.settings.disabled&&this._disableDatepicker(t),i.dpDiv.css("display","block"))},_dialogDatepicker:function(t,i,a,n,o){var u,c,h,l,d,p=this._dialogInst;return p||(this.uuid+=1,u="dp"+this.uuid,this._dialogInput=e("<input type='text' id='"+u+"' style='position: absolute; top: -100px; width: 0px;'/>"),this._dialogInput.keydown(this._doKeyDown),e("body").append(this._dialogInput),p=this._dialogInst=this._newInst(this._dialogInput,!1),p.settings={},e.data(this._dialogInput[0],r,p)),s(p.settings,n||{}),i=i&&i.constructor===Date?this._formatDate(p,i):i,this._dialogInput.val(i),this._pos=o?o.length?o:[o.pageX,o.pageY]:null,this._pos||(c=document.documentElement.clientWidth,h=document.documentElement.clientHeight,l=document.documentElement.scrollLeft||document.body.scrollLeft,d=document.documentElement.scrollTop||document.body.scrollTop,this._pos=[c/2-100+l,h/2-150+d]),this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px"),p.settings.onSelect=a,this._inDialog=!0,this.dpDiv.addClass(this._dialogClass),this._showDatepicker(this._dialogInput[0]),e.blockUI&&e.blockUI(this.dpDiv),e.data(this._dialogInput[0],r,p),this},_destroyDatepicker:function(t){var i,a=e(t),s=e.data(t,r);a.hasClass(this.markerClassName)&&(i=t.nodeName.toLowerCase(),e.removeData(t,r),"input"===i?(s.append.remove(),s.trigger.remove(),a.removeClass(this.markerClassName).unbind("focus",this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",this._doKeyUp)):("div"===i||"span"===i)&&a.removeClass(this.markerClassName).empty())},_enableDatepicker:function(t){var i,a,s=e(t),n=e.data(t,r);s.hasClass(this.markerClassName)&&(i=t.nodeName.toLowerCase(),"input"===i?(t.disabled=!1,n.trigger.filter("button").each(function(){this.disabled=!1}).end().filter("img").css({opacity:"1.0",cursor:""})):("div"===i||"span"===i)&&(a=s.children("."+this._inlineClass),a.children().removeClass("ui-state-disabled"),a.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!1)),this._disabledInputs=e.map(this._disabledInputs,function(e){return e===t?null:e}))},_disableDatepicker:function(t){var i,a,s=e(t),n=e.data(t,r);s.hasClass(this.markerClassName)&&(i=t.nodeName.toLowerCase(),"input"===i?(t.disabled=!0,n.trigger.filter("button").each(function(){this.disabled=!0}).end().filter("img").css({opacity:"0.5",cursor:"default"})):("div"===i||"span"===i)&&(a=s.children("."+this._inlineClass),a.children().addClass("ui-state-disabled"),a.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!0)),this._disabledInputs=e.map(this._disabledInputs,function(e){return e===t?null:e}),this._disabledInputs[this._disabledInputs.length]=t)},_isDisabledDatepicker:function(e){if(!e)return!1;for(var t=0;this._disabledInputs.length>t;t++)if(this._disabledInputs[t]===e)return!0;return!1},_getInst:function(t){try{return e.data(t,r)}catch(i){throw"Missing instance data for this datepicker"}},_optionDatepicker:function(i,a,n){var r,o,u,c,h=this._getInst(i);return 2===arguments.length&&"string"==typeof a?"defaults"===a?e.extend({},e.datepicker._defaults):h?"all"===a?e.extend({},h.settings):this._get(h,a):null:(r=a||{},"string"==typeof a&&(r={},r[a]=n),h&&(this._curInst===h&&this._hideDatepicker(),o=this._getDateDatepicker(i,!0),u=this._getMinMaxDate(h,"min"),c=this._getMinMaxDate(h,"max"),s(h.settings,r),null!==u&&r.dateFormat!==t&&r.minDate===t&&(h.settings.minDate=this._formatDate(h,u)),null!==c&&r.dateFormat!==t&&r.maxDate===t&&(h.settings.maxDate=this._formatDate(h,c)),"disabled"in r&&(r.disabled?this._disableDatepicker(i):this._enableDatepicker(i)),this._attachments(e(i),h),this._autoSize(h),this._setDate(h,o),this._updateAlternate(h),this._updateDatepicker(h)),t)},_changeDatepicker:function(e,t,i){this._optionDatepicker(e,t,i)},_refreshDatepicker:function(e){var t=this._getInst(e);t&&this._updateDatepicker(t)},_setDateDatepicker:function(e,t){var i=this._getInst(e);i&&(this._setDate(i,t),this._updateDatepicker(i),this._updateAlternate(i))},_getDateDatepicker:function(e,t){var i=this._getInst(e);return i&&!i.inline&&this._setDateFromField(i,t),i?this._getDate(i):null},_doKeyDown:function(t){var i,a,s,n=e.datepicker._getInst(t.target),r=!0,o=n.dpDiv.is(".ui-datepicker-rtl");if(n._keyEvent=!0,e.datepicker._datepickerShowing)switch(t.keyCode){case 9:e.datepicker._hideDatepicker(),r=!1;break;case 13:return s=e("td."+e.datepicker._dayOverClass+":not(."+e.datepicker._currentClass+")",n.dpDiv),s[0]&&e.datepicker._selectDay(t.target,n.selectedMonth,n.selectedYear,s[0]),i=e.datepicker._get(n,"onSelect"),i?(a=e.datepicker._formatDate(n),i.apply(n.input?n.input[0]:null,[a,n])):e.datepicker._hideDatepicker(),!1;case 27:e.datepicker._hideDatepicker();break;case 33:e.datepicker._adjustDate(t.target,t.ctrlKey?-e.datepicker._get(n,"stepBigMonths"):-e.datepicker._get(n,"stepMonths"),"M");break;case 34:e.datepicker._adjustDate(t.target,t.ctrlKey?+e.datepicker._get(n,"stepBigMonths"):+e.datepicker._get(n,"stepMonths"),"M");break;case 35:(t.ctrlKey||t.metaKey)&&e.datepicker._clearDate(t.target),r=t.ctrlKey||t.metaKey;break;case 36:(t.ctrlKey||t.metaKey)&&e.datepicker._gotoToday(t.target),r=t.ctrlKey||t.metaKey;break;case 37:(t.ctrlKey||t.metaKey)&&e.datepicker._adjustDate(t.target,o?1:-1,"D"),r=t.ctrlKey||t.metaKey,t.originalEvent.altKey&&e.datepicker._adjustDate(t.target,t.ctrlKey?-e.datepicker._get(n,"stepBigMonths"):-e.datepicker._get(n,"stepMonths"),"M");break;case 38:(t.ctrlKey||t.metaKey)&&e.datepicker._adjustDate(t.target,-7,"D"),r=t.ctrlKey||t.metaKey;break;case 39:(t.ctrlKey||t.metaKey)&&e.datepicker._adjustDate(t.target,o?-1:1,"D"),r=t.ctrlKey||t.metaKey,t.originalEvent.altKey&&e.datepicker._adjustDate(t.target,t.ctrlKey?+e.datepicker._get(n,"stepBigMonths"):+e.datepicker._get(n,"stepMonths"),"M");break;case 40:(t.ctrlKey||t.metaKey)&&e.datepicker._adjustDate(t.target,7,"D"),r=t.ctrlKey||t.metaKey;break;default:r=!1}else 36===t.keyCode&&t.ctrlKey?e.datepicker._showDatepicker(this):r=!1;r&&(t.preventDefault(),t.stopPropagation())},_doKeyPress:function(i){var a,s,n=e.datepicker._getInst(i.target);return e.datepicker._get(n,"constrainInput")?(a=e.datepicker._possibleChars(e.datepicker._get(n,"dateFormat")),s=String.fromCharCode(null==i.charCode?i.keyCode:i.charCode),i.ctrlKey||i.metaKey||" ">s||!a||a.indexOf(s)>-1):t},_doKeyUp:function(t){var i,a=e.datepicker._getInst(t.target);if(a.input.val()!==a.lastVal)try{i=e.datepicker.parseDate(e.datepicker._get(a,"dateFormat"),a.input?a.input.val():null,e.datepicker._getFormatConfig(a)),i&&(e.datepicker._setDateFromField(a),e.datepicker._updateAlternate(a),e.datepicker._updateDatepicker(a))}catch(s){}return!0},_showDatepicker:function(t){if(t=t.target||t,"input"!==t.nodeName.toLowerCase()&&(t=e("input",t.parentNode)[0]),!e.datepicker._isDisabledDatepicker(t)&&e.datepicker._lastInput!==t){var i,a,n,r,o,u,c;i=e.datepicker._getInst(t),e.datepicker._curInst&&e.datepicker._curInst!==i&&(e.datepicker._curInst.dpDiv.stop(!0,!0),i&&e.datepicker._datepickerShowing&&e.datepicker._hideDatepicker(e.datepicker._curInst.input[0])),a=e.datepicker._get(i,"beforeShow"),n=a?a.apply(t,[t,i]):{},n!==!1&&(s(i.settings,n),i.lastVal=null,e.datepicker._lastInput=t,e.datepicker._setDateFromField(i),e.datepicker._inDialog&&(t.value=""),e.datepicker._pos||(e.datepicker._pos=e.datepicker._findPos(t),e.datepicker._pos[1]+=t.offsetHeight),r=!1,e(t).parents().each(function(){return r|="fixed"===e(this).css("position"),!r}),o={left:e.datepicker._pos[0],top:e.datepicker._pos[1]},e.datepicker._pos=null,i.dpDiv.empty(),i.dpDiv.css({position:"absolute",display:"block",top:"-1000px"}),e.datepicker._updateDatepicker(i),o=e.datepicker._checkOffset(i,o,r),i.dpDiv.css({position:e.datepicker._inDialog&&e.blockUI?"static":r?"fixed":"absolute",display:"none",left:o.left+"px",top:o.top+"px"}),i.inline||(u=e.datepicker._get(i,"showAnim"),c=e.datepicker._get(i,"duration"),i.dpDiv.zIndex(e(t).zIndex()+1),e.datepicker._datepickerShowing=!0,e.effects&&e.effects.effect[u]?i.dpDiv.show(u,e.datepicker._get(i,"showOptions"),c):i.dpDiv[u||"show"](u?c:null),e.datepicker._shouldFocusInput(i)&&i.input.focus(),e.datepicker._curInst=i))}},_updateDatepicker:function(t){this.maxRows=4,n=t,t.dpDiv.empty().append(this._generateHTML(t)),this._attachHandlers(t),t.dpDiv.find("."+this._dayOverClass+" a").mouseover();var i,a=this._getNumberOfMonths(t),s=a[1],r=17;t.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""),s>1&&t.dpDiv.addClass("ui-datepicker-multi-"+s).css("width",r*s+"em"),t.dpDiv[(1!==a[0]||1!==a[1]?"add":"remove")+"Class"]("ui-datepicker-multi"),t.dpDiv[(this._get(t,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl"),t===e.datepicker._curInst&&e.datepicker._datepickerShowing&&e.datepicker._shouldFocusInput(t)&&t.input.focus(),t.yearshtml&&(i=t.yearshtml,setTimeout(function(){i===t.yearshtml&&t.yearshtml&&t.dpDiv.find("select.ui-datepicker-year:first").replaceWith(t.yearshtml),i=t.yearshtml=null},0))},_shouldFocusInput:function(e){return e.input&&e.input.is(":visible")&&!e.input.is(":disabled")&&!e.input.is(":focus")},_checkOffset:function(t,i,a){var s=t.dpDiv.outerWidth(),n=t.dpDiv.outerHeight(),r=t.input?t.input.outerWidth():0,o=t.input?t.input.outerHeight():0,u=document.documentElement.clientWidth+(a?0:e(document).scrollLeft()),c=document.documentElement.clientHeight+(a?0:e(document).scrollTop());return i.left-=this._get(t,"isRTL")?s-r:0,i.left-=a&&i.left===t.input.offset().left?e(document).scrollLeft():0,i.top-=a&&i.top===t.input.offset().top+o?e(document).scrollTop():0,i.left-=Math.min(i.left,i.left+s>u&&u>s?Math.abs(i.left+s-u):0),i.top-=Math.min(i.top,i.top+n>c&&c>n?Math.abs(n+o):0),i},_findPos:function(t){for(var i,a=this._getInst(t),s=this._get(a,"isRTL");t&&("hidden"===t.type||1!==t.nodeType||e.expr.filters.hidden(t));)t=t[s?"previousSibling":"nextSibling"];return i=e(t).offset(),[i.left,i.top]},_hideDatepicker:function(t){var i,a,s,n,o=this._curInst;!o||t&&o!==e.data(t,r)||this._datepickerShowing&&(i=this._get(o,"showAnim"),a=this._get(o,"duration"),s=function(){e.datepicker._tidyDialog(o)},e.effects&&(e.effects.effect[i]||e.effects[i])?o.dpDiv.hide(i,e.datepicker._get(o,"showOptions"),a,s):o.dpDiv["slideDown"===i?"slideUp":"fadeIn"===i?"fadeOut":"hide"](i?a:null,s),i||s(),this._datepickerShowing=!1,n=this._get(o,"onClose"),n&&n.apply(o.input?o.input[0]:null,[o.input?o.input.val():"",o]),this._lastInput=null,this._inDialog&&(this._dialogInput.css({position:"absolute",left:"0",top:"-100px"}),e.blockUI&&(e.unblockUI(),e("body").append(this.dpDiv))),this._inDialog=!1)},_tidyDialog:function(e){e.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")},_checkExternalClick:function(t){if(e.datepicker._curInst){var i=e(t.target),a=e.datepicker._getInst(i[0]);(i[0].id!==e.datepicker._mainDivId&&0===i.parents("#"+e.datepicker._mainDivId).length&&!i.hasClass(e.datepicker.markerClassName)&&!i.closest("."+e.datepicker._triggerClass).length&&e.datepicker._datepickerShowing&&(!e.datepicker._inDialog||!e.blockUI)||i.hasClass(e.datepicker.markerClassName)&&e.datepicker._curInst!==a)&&e.datepicker._hideDatepicker()}},_adjustDate:function(t,i,a){var s=e(t),n=this._getInst(s[0]);this._isDisabledDatepicker(s[0])||(this._adjustInstDate(n,i+("M"===a?this._get(n,"showCurrentAtPos"):0),a),this._updateDatepicker(n))},_gotoToday:function(t){var i,a=e(t),s=this._getInst(a[0]);this._get(s,"gotoCurrent")&&s.currentDay?(s.selectedDay=s.currentDay,s.drawMonth=s.selectedMonth=s.currentMonth,s.drawYear=s.selectedYear=s.currentYear):(i=new Date,s.selectedDay=i.getDate(),s.drawMonth=s.selectedMonth=i.getMonth(),s.drawYear=s.selectedYear=i.getFullYear()),this._notifyChange(s),this._adjustDate(a)},_selectMonthYear:function(t,i,a){var s=e(t),n=this._getInst(s[0]);n["selected"+("M"===a?"Month":"Year")]=n["draw"+("M"===a?"Month":"Year")]=parseInt(i.options[i.selectedIndex].value,10),this._notifyChange(n),this._adjustDate(s)},_selectDay:function(t,i,a,s){var n,r=e(t);e(s).hasClass(this._unselectableClass)||this._isDisabledDatepicker(r[0])||(n=this._getInst(r[0]),n.selectedDay=n.currentDay=e("a",s).html(),n.selectedMonth=n.currentMonth=i,n.selectedYear=n.currentYear=a,this._selectDate(t,this._formatDate(n,n.currentDay,n.currentMonth,n.currentYear)))},_clearDate:function(t){var i=e(t);this._selectDate(i,"")},_selectDate:function(t,i){var a,s=e(t),n=this._getInst(s[0]);i=null!=i?i:this._formatDate(n),n.input&&n.input.val(i),this._updateAlternate(n),a=this._get(n,"onSelect"),a?a.apply(n.input?n.input[0]:null,[i,n]):n.input&&n.input.trigger("change"),n.inline?this._updateDatepicker(n):(this._hideDatepicker(),this._lastInput=n.input[0],"object"!=typeof n.input[0]&&n.input.focus(),this._lastInput=null)},_updateAlternate:function(t){var i,a,s,n=this._get(t,"altField");n&&(i=this._get(t,"altFormat")||this._get(t,"dateFormat"),a=this._getDate(t),s=this.formatDate(i,a,this._getFormatConfig(t)),e(n).each(function(){e(this).val(s)}))},noWeekends:function(e){var t=e.getDay();return[t>0&&6>t,""]},iso8601Week:function(e){var t,i=new Date(e.getTime());return i.setDate(i.getDate()+4-(i.getDay()||7)),t=i.getTime(),i.setMonth(0),i.setDate(1),Math.floor(Math.round((t-i)/864e5)/7)+1},parseDate:function(i,a,s){if(null==i||null==a)throw"Invalid arguments";if(a="object"==typeof a?""+a:a+"",""===a)return null;var n,r,o,u,c=0,h=(s?s.shortYearCutoff:null)||this._defaults.shortYearCutoff,l="string"!=typeof h?h:(new Date).getFullYear()%100+parseInt(h,10),d=(s?s.dayNamesShort:null)||this._defaults.dayNamesShort,p=(s?s.dayNames:null)||this._defaults.dayNames,g=(s?s.monthNamesShort:null)||this._defaults.monthNamesShort,m=(s?s.monthNames:null)||this._defaults.monthNames,f=-1,_=-1,v=-1,k=-1,y=!1,b=function(e){var t=i.length>n+1&&i.charAt(n+1)===e;return t&&n++,t},D=function(e){var t=b(e),i="@"===e?14:"!"===e?20:"y"===e&&t?4:"o"===e?3:2,s=RegExp("^\\d{1,"+i+"}"),n=a.substring(c).match(s);if(!n)throw"Missing number at position "+c;return c+=n[0].length,parseInt(n[0],10)},w=function(i,s,n){var r=-1,o=e.map(b(i)?n:s,function(e,t){return[[t,e]]}).sort(function(e,t){return-(e[1].length-t[1].length)});if(e.each(o,function(e,i){var s=i[1];return a.substr(c,s.length).toLowerCase()===s.toLowerCase()?(r=i[0],c+=s.length,!1):t}),-1!==r)return r+1;throw"Unknown name at position "+c},M=function(){if(a.charAt(c)!==i.charAt(n))throw"Unexpected literal at position "+c;c++};for(n=0;i.length>n;n++)if(y)"'"!==i.charAt(n)||b("'")?M():y=!1;else switch(i.charAt(n)){case"d":v=D("d");break;case"D":w("D",d,p);break;case"o":k=D("o");break;case"m":_=D("m");break;case"M":_=w("M",g,m);break;case"y":f=D("y");break;case"@":u=new Date(D("@")),f=u.getFullYear(),_=u.getMonth()+1,v=u.getDate();break;case"!":u=new Date((D("!")-this._ticksTo1970)/1e4),f=u.getFullYear(),_=u.getMonth()+1,v=u.getDate();break;case"'":b("'")?M():y=!0;break;default:M()}if(a.length>c&&(o=a.substr(c),!/^\s+/.test(o)))throw"Extra/unparsed characters found in date: "+o;if(-1===f?f=(new Date).getFullYear():100>f&&(f+=(new Date).getFullYear()-(new Date).getFullYear()%100+(l>=f?0:-100)),k>-1)for(_=1,v=k;;){if(r=this._getDaysInMonth(f,_-1),r>=v)break;_++,v-=r}if(u=this._daylightSavingAdjust(new Date(f,_-1,v)),u.getFullYear()!==f||u.getMonth()+1!==_||u.getDate()!==v)throw"Invalid date";return u},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:1e7*60*60*24*(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925)),formatDate:function(e,t,i){if(!t)return"";var a,s=(i?i.dayNamesShort:null)||this._defaults.dayNamesShort,n=(i?i.dayNames:null)||this._defaults.dayNames,r=(i?i.monthNamesShort:null)||this._defaults.monthNamesShort,o=(i?i.monthNames:null)||this._defaults.monthNames,u=function(t){var i=e.length>a+1&&e.charAt(a+1)===t;return i&&a++,i},c=function(e,t,i){var a=""+t;if(u(e))for(;i>a.length;)a="0"+a;return a},h=function(e,t,i,a){return u(e)?a[t]:i[t]},l="",d=!1;if(t)for(a=0;e.length>a;a++)if(d)"'"!==e.charAt(a)||u("'")?l+=e.charAt(a):d=!1;else switch(e.charAt(a)){case"d":l+=c("d",t.getDate(),2);break;case"D":l+=h("D",t.getDay(),s,n);break;case"o":l+=c("o",Math.round((new Date(t.getFullYear(),t.getMonth(),t.getDate()).getTime()-new Date(t.getFullYear(),0,0).getTime())/864e5),3);break;case"m":l+=c("m",t.getMonth()+1,2);break;case"M":l+=h("M",t.getMonth(),r,o);break;case"y":l+=u("y")?t.getFullYear():(10>t.getYear()%100?"0":"")+t.getYear()%100;break;case"@":l+=t.getTime();break;case"!":l+=1e4*t.getTime()+this._ticksTo1970;break;case"'":u("'")?l+="'":d=!0;break;default:l+=e.charAt(a)}return l},_possibleChars:function(e){var t,i="",a=!1,s=function(i){var a=e.length>t+1&&e.charAt(t+1)===i;return a&&t++,a};for(t=0;e.length>t;t++)if(a)"'"!==e.charAt(t)||s("'")?i+=e.charAt(t):a=!1;else switch(e.charAt(t)){case"d":case"m":case"y":case"@":i+="0123456789";break;case"D":case"M":return null;case"'":s("'")?i+="'":a=!0;break;default:i+=e.charAt(t)}return i},_get:function(e,i){return e.settings[i]!==t?e.settings[i]:this._defaults[i]},_setDateFromField:function(e,t){if(e.input.val()!==e.lastVal){var i=this._get(e,"dateFormat"),a=e.lastVal=e.input?e.input.val():null,s=this._getDefaultDate(e),n=s,r=this._getFormatConfig(e);try{n=this.parseDate(i,a,r)||s}catch(o){a=t?"":a}e.selectedDay=n.getDate(),e.drawMonth=e.selectedMonth=n.getMonth(),e.drawYear=e.selectedYear=n.getFullYear(),e.currentDay=a?n.getDate():0,e.currentMonth=a?n.getMonth():0,e.currentYear=a?n.getFullYear():0,this._adjustInstDate(e)}},_getDefaultDate:function(e){return this._restrictMinMax(e,this._determineDate(e,this._get(e,"defaultDate"),new Date))},_determineDate:function(t,i,a){var s=function(e){var t=new Date;return t.setDate(t.getDate()+e),t},n=function(i){try{return e.datepicker.parseDate(e.datepicker._get(t,"dateFormat"),i,e.datepicker._getFormatConfig(t))}catch(a){}for(var s=(i.toLowerCase().match(/^c/)?e.datepicker._getDate(t):null)||new Date,n=s.getFullYear(),r=s.getMonth(),o=s.getDate(),u=/([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,c=u.exec(i);c;){switch(c[2]||"d"){case"d":case"D":o+=parseInt(c[1],10);break;case"w":case"W":o+=7*parseInt(c[1],10);break;case"m":case"M":r+=parseInt(c[1],10),o=Math.min(o,e.datepicker._getDaysInMonth(n,r));break;case"y":case"Y":n+=parseInt(c[1],10),o=Math.min(o,e.datepicker._getDaysInMonth(n,r))}c=u.exec(i)}return new Date(n,r,o)},r=null==i||""===i?a:"string"==typeof i?n(i):"number"==typeof i?isNaN(i)?a:s(i):new Date(i.getTime());return r=r&&"Invalid Date"==""+r?a:r,r&&(r.setHours(0),r.setMinutes(0),r.setSeconds(0),r.setMilliseconds(0)),this._daylightSavingAdjust(r)},_daylightSavingAdjust:function(e){return e?(e.setHours(e.getHours()>12?e.getHours()+2:0),e):null},_setDate:function(e,t,i){var a=!t,s=e.selectedMonth,n=e.selectedYear,r=this._restrictMinMax(e,this._determineDate(e,t,new Date));e.selectedDay=e.currentDay=r.getDate(),e.drawMonth=e.selectedMonth=e.currentMonth=r.getMonth(),e.drawYear=e.selectedYear=e.currentYear=r.getFullYear(),s===e.selectedMonth&&n===e.selectedYear||i||this._notifyChange(e),this._adjustInstDate(e),e.input&&e.input.val(a?"":this._formatDate(e))},_getDate:function(e){var t=!e.currentYear||e.input&&""===e.input.val()?null:this._daylightSavingAdjust(new Date(e.currentYear,e.currentMonth,e.currentDay));return t},_attachHandlers:function(t){var i=this._get(t,"stepMonths"),a="#"+t.id.replace(/\\\\/g,"\\");t.dpDiv.find("[data-handler]").map(function(){var t={prev:function(){e.datepicker._adjustDate(a,-i,"M")},next:function(){e.datepicker._adjustDate(a,+i,"M")},hide:function(){e.datepicker._hideDatepicker()},today:function(){e.datepicker._gotoToday(a)},selectDay:function(){return e.datepicker._selectDay(a,+this.getAttribute("data-month"),+this.getAttribute("data-year"),this),!1},selectMonth:function(){return e.datepicker._selectMonthYear(a,this,"M"),!1},selectYear:function(){return e.datepicker._selectMonthYear(a,this,"Y"),!1}};e(this).bind(this.getAttribute("data-event"),t[this.getAttribute("data-handler")])})},_generateHTML:function(e){var t,i,a,s,n,r,o,u,c,h,l,d,p,g,m,f,_,v,k,y,b,D,w,M,C,x,I,N,T,A,E,S,Y,F,P,O,j,K,R,H=new Date,W=this._daylightSavingAdjust(new Date(H.getFullYear(),H.getMonth(),H.getDate())),L=this._get(e,"isRTL"),U=this._get(e,"showButtonPanel"),B=this._get(e,"hideIfNoPrevNext"),z=this._get(e,"navigationAsDateFormat"),q=this._getNumberOfMonths(e),G=this._get(e,"showCurrentAtPos"),J=this._get(e,"stepMonths"),Q=1!==q[0]||1!==q[1],V=this._daylightSavingAdjust(e.currentDay?new Date(e.currentYear,e.currentMonth,e.currentDay):new Date(9999,9,9)),$=this._getMinMaxDate(e,"min"),X=this._getMinMaxDate(e,"max"),Z=e.drawMonth-G,et=e.drawYear;if(0>Z&&(Z+=12,et--),X)for(t=this._daylightSavingAdjust(new Date(X.getFullYear(),X.getMonth()-q[0]*q[1]+1,X.getDate())),t=$&&$>t?$:t;this._daylightSavingAdjust(new Date(et,Z,1))>t;)Z--,0>Z&&(Z=11,et--);for(e.drawMonth=Z,e.drawYear=et,i=this._get(e,"prevText"),i=z?this.formatDate(i,this._daylightSavingAdjust(new Date(et,Z-J,1)),this._getFormatConfig(e)):i,a=this._canAdjustMonth(e,-1,et,Z)?"<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(L?"e":"w")+"'>"+i+"</span></a>":B?"":"<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(L?"e":"w")+"'>"+i+"</span></a>",s=this._get(e,"nextText"),s=z?this.formatDate(s,this._daylightSavingAdjust(new Date(et,Z+J,1)),this._getFormatConfig(e)):s,n=this._canAdjustMonth(e,1,et,Z)?"<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='"+s+"'><span class='ui-icon ui-icon-circle-triangle-"+(L?"w":"e")+"'>"+s+"</span></a>":B?"":"<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+s+"'><span class='ui-icon ui-icon-circle-triangle-"+(L?"w":"e")+"'>"+s+"</span></a>",r=this._get(e,"currentText"),o=this._get(e,"gotoCurrent")&&e.currentDay?V:W,r=z?this.formatDate(r,o,this._getFormatConfig(e)):r,u=e.inline?"":"<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>"+this._get(e,"closeText")+"</button>",c=U?"<div class='ui-datepicker-buttonpane ui-widget-content'>"+(L?u:"")+(this._isInRange(e,o)?"<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>"+r+"</button>":"")+(L?"":u)+"</div>":"",h=parseInt(this._get(e,"firstDay"),10),h=isNaN(h)?0:h,l=this._get(e,"showWeek"),d=this._get(e,"dayNames"),p=this._get(e,"dayNamesMin"),g=this._get(e,"monthNames"),m=this._get(e,"monthNamesShort"),f=this._get(e,"beforeShowDay"),_=this._get(e,"showOtherMonths"),v=this._get(e,"selectOtherMonths"),k=this._getDefaultDate(e),y="",D=0;q[0]>D;D++){for(w="",this.maxRows=4,M=0;q[1]>M;M++){if(C=this._daylightSavingAdjust(new Date(et,Z,e.selectedDay)),x=" ui-corner-all",I="",Q){if(I+="<div class='ui-datepicker-group",q[1]>1)switch(M){case 0:I+=" ui-datepicker-group-first",x=" ui-corner-"+(L?"right":"left");break;case q[1]-1:I+=" ui-datepicker-group-last",x=" ui-corner-"+(L?"left":"right");break;default:I+=" ui-datepicker-group-middle",x=""}I+="'>"}for(I+="<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix"+x+"'>"+(/all|left/.test(x)&&0===D?L?n:a:"")+(/all|right/.test(x)&&0===D?L?a:n:"")+this._generateMonthYearHeader(e,Z,et,$,X,D>0||M>0,g,m)+"</div><table class='ui-datepicker-calendar'><thead>"+"<tr>",N=l?"<th class='ui-datepicker-week-col'>"+this._get(e,"weekHeader")+"</th>":"",b=0;7>b;b++)T=(b+h)%7,N+="<th"+((b+h+6)%7>=5?" class='ui-datepicker-week-end'":"")+">"+"<span title='"+d[T]+"'>"+p[T]+"</span></th>";for(I+=N+"</tr></thead><tbody>",A=this._getDaysInMonth(et,Z),et===e.selectedYear&&Z===e.selectedMonth&&(e.selectedDay=Math.min(e.selectedDay,A)),E=(this._getFirstDayOfMonth(et,Z)-h+7)%7,S=Math.ceil((E+A)/7),Y=Q?this.maxRows>S?this.maxRows:S:S,this.maxRows=Y,F=this._daylightSavingAdjust(new Date(et,Z,1-E)),P=0;Y>P;P++){for(I+="<tr>",O=l?"<td class='ui-datepicker-week-col'>"+this._get(e,"calculateWeek")(F)+"</td>":"",b=0;7>b;b++)j=f?f.apply(e.input?e.input[0]:null,[F]):[!0,""],K=F.getMonth()!==Z,R=K&&!v||!j[0]||$&&$>F||X&&F>X,O+="<td class='"+((b+h+6)%7>=5?" ui-datepicker-week-end":"")+(K?" ui-datepicker-other-month":"")+(F.getTime()===C.getTime()&&Z===e.selectedMonth&&e._keyEvent||k.getTime()===F.getTime()&&k.getTime()===C.getTime()?" "+this._dayOverClass:"")+(R?" "+this._unselectableClass+" ui-state-disabled":"")+(K&&!_?"":" "+j[1]+(F.getTime()===V.getTime()?" "+this._currentClass:"")+(F.getTime()===W.getTime()?" ui-datepicker-today":""))+"'"+(K&&!_||!j[2]?"":" title='"+j[2].replace(/'/g,"&#39;")+"'")+(R?"":" data-handler='selectDay' data-event='click' data-month='"+F.getMonth()+"' data-year='"+F.getFullYear()+"'")+">"+(K&&!_?"&#xa0;":R?"<span class='ui-state-default'>"+F.getDate()+"</span>":"<a class='ui-state-default"+(F.getTime()===W.getTime()?" ui-state-highlight":"")+(F.getTime()===V.getTime()?" ui-state-active":"")+(K?" ui-priority-secondary":"")+"' href='#'>"+F.getDate()+"</a>")+"</td>",F.setDate(F.getDate()+1),F=this._daylightSavingAdjust(F);I+=O+"</tr>"}Z++,Z>11&&(Z=0,et++),I+="</tbody></table>"+(Q?"</div>"+(q[0]>0&&M===q[1]-1?"<div class='ui-datepicker-row-break'></div>":""):""),w+=I}y+=w}return y+=c,e._keyEvent=!1,y},_generateMonthYearHeader:function(e,t,i,a,s,n,r,o){var u,c,h,l,d,p,g,m,f=this._get(e,"changeMonth"),_=this._get(e,"changeYear"),v=this._get(e,"showMonthAfterYear"),k="<div class='ui-datepicker-title'>",y="";if(n||!f)y+="<span class='ui-datepicker-month'>"+r[t]+"</span>";else{for(u=a&&a.getFullYear()===i,c=s&&s.getFullYear()===i,y+="<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>",h=0;12>h;h++)(!u||h>=a.getMonth())&&(!c||s.getMonth()>=h)&&(y+="<option value='"+h+"'"+(h===t?" selected='selected'":"")+">"+o[h]+"</option>");y+="</select>"}if(v||(k+=y+(!n&&f&&_?"":"&#xa0;")),!e.yearshtml)if(e.yearshtml="",n||!_)k+="<span class='ui-datepicker-year'>"+i+"</span>";else{for(l=this._get(e,"yearRange").split(":"),d=(new Date).getFullYear(),p=function(e){var t=e.match(/c[+\-].*/)?i+parseInt(e.substring(1),10):e.match(/[+\-].*/)?d+parseInt(e,10):parseInt(e,10);
return isNaN(t)?d:t},g=p(l[0]),m=Math.max(g,p(l[1]||"")),g=a?Math.max(g,a.getFullYear()):g,m=s?Math.min(m,s.getFullYear()):m,e.yearshtml+="<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";m>=g;g++)e.yearshtml+="<option value='"+g+"'"+(g===i?" selected='selected'":"")+">"+g+"</option>";e.yearshtml+="</select>",k+=e.yearshtml,e.yearshtml=null}return k+=this._get(e,"yearSuffix"),v&&(k+=(!n&&f&&_?"":"&#xa0;")+y),k+="</div>"},_adjustInstDate:function(e,t,i){var a=e.drawYear+("Y"===i?t:0),s=e.drawMonth+("M"===i?t:0),n=Math.min(e.selectedDay,this._getDaysInMonth(a,s))+("D"===i?t:0),r=this._restrictMinMax(e,this._daylightSavingAdjust(new Date(a,s,n)));e.selectedDay=r.getDate(),e.drawMonth=e.selectedMonth=r.getMonth(),e.drawYear=e.selectedYear=r.getFullYear(),("M"===i||"Y"===i)&&this._notifyChange(e)},_restrictMinMax:function(e,t){var i=this._getMinMaxDate(e,"min"),a=this._getMinMaxDate(e,"max"),s=i&&i>t?i:t;return a&&s>a?a:s},_notifyChange:function(e){var t=this._get(e,"onChangeMonthYear");t&&t.apply(e.input?e.input[0]:null,[e.selectedYear,e.selectedMonth+1,e])},_getNumberOfMonths:function(e){var t=this._get(e,"numberOfMonths");return null==t?[1,1]:"number"==typeof t?[1,t]:t},_getMinMaxDate:function(e,t){return this._determineDate(e,this._get(e,t+"Date"),null)},_getDaysInMonth:function(e,t){return 32-this._daylightSavingAdjust(new Date(e,t,32)).getDate()},_getFirstDayOfMonth:function(e,t){return new Date(e,t,1).getDay()},_canAdjustMonth:function(e,t,i,a){var s=this._getNumberOfMonths(e),n=this._daylightSavingAdjust(new Date(i,a+(0>t?t:s[0]*s[1]),1));return 0>t&&n.setDate(this._getDaysInMonth(n.getFullYear(),n.getMonth())),this._isInRange(e,n)},_isInRange:function(e,t){var i,a,s=this._getMinMaxDate(e,"min"),n=this._getMinMaxDate(e,"max"),r=null,o=null,u=this._get(e,"yearRange");return u&&(i=u.split(":"),a=(new Date).getFullYear(),r=parseInt(i[0],10),o=parseInt(i[1],10),i[0].match(/[+\-].*/)&&(r+=a),i[1].match(/[+\-].*/)&&(o+=a)),(!s||t.getTime()>=s.getTime())&&(!n||t.getTime()<=n.getTime())&&(!r||t.getFullYear()>=r)&&(!o||o>=t.getFullYear())},_getFormatConfig:function(e){var t=this._get(e,"shortYearCutoff");return t="string"!=typeof t?t:(new Date).getFullYear()%100+parseInt(t,10),{shortYearCutoff:t,dayNamesShort:this._get(e,"dayNamesShort"),dayNames:this._get(e,"dayNames"),monthNamesShort:this._get(e,"monthNamesShort"),monthNames:this._get(e,"monthNames")}},_formatDate:function(e,t,i,a){t||(e.currentDay=e.selectedDay,e.currentMonth=e.selectedMonth,e.currentYear=e.selectedYear);var s=t?"object"==typeof t?t:this._daylightSavingAdjust(new Date(a,i,t)):this._daylightSavingAdjust(new Date(e.currentYear,e.currentMonth,e.currentDay));return this.formatDate(this._get(e,"dateFormat"),s,this._getFormatConfig(e))}}),e.fn.datepicker=function(t){if(!this.length)return this;e.datepicker.initialized||(e(document).mousedown(e.datepicker._checkExternalClick),e.datepicker.initialized=!0),0===e("#"+e.datepicker._mainDivId).length&&e("body").append(e.datepicker.dpDiv);var i=Array.prototype.slice.call(arguments,1);return"string"!=typeof t||"isDisabled"!==t&&"getDate"!==t&&"widget"!==t?"option"===t&&2===arguments.length&&"string"==typeof arguments[1]?e.datepicker["_"+t+"Datepicker"].apply(e.datepicker,[this[0]].concat(i)):this.each(function(){"string"==typeof t?e.datepicker["_"+t+"Datepicker"].apply(e.datepicker,[this].concat(i)):e.datepicker._attachDatepicker(this,t)}):e.datepicker["_"+t+"Datepicker"].apply(e.datepicker,[this[0]].concat(i))},e.datepicker=new i,e.datepicker.initialized=!1,e.datepicker.uuid=(new Date).getTime(),e.datepicker.version="1.10.4"})(jQuery);(function(t){var e=5;t.widget("ui.slider",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget"+" ui-widget-content"+" ui-corner-all"),this._refresh(),this._setOption("disabled",this.options.disabled),this._animateOff=!1},_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var e,i,s=this.options,n=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),a="<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",o=[];for(i=s.values&&s.values.length||1,n.length>i&&(n.slice(i).remove(),n=n.slice(0,i)),e=n.length;i>e;e++)o.push(a);this.handles=n.add(t(o.join("")).appendTo(this.element)),this.handle=this.handles.eq(0),this.handles.each(function(e){t(this).data("ui-slider-handle-index",e)})},_createRange:function(){var e=this.options,i="";e.range?(e.range===!0&&(e.values?e.values.length&&2!==e.values.length?e.values=[e.values[0],e.values[0]]:t.isArray(e.values)&&(e.values=e.values.slice(0)):e.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({left:"",bottom:""}):(this.range=t("<div></div>").appendTo(this.element),i="ui-slider-range ui-widget-header ui-corner-all"),this.range.addClass(i+("min"===e.range||"max"===e.range?" ui-slider-range-"+e.range:""))):(this.range&&this.range.remove(),this.range=null)},_setupEvents:function(){var t=this.handles.add(this.range).filter("a");this._off(t),this._on(t,this._handleEvents),this._hoverable(t),this._focusable(t)},_destroy:function(){this.handles.remove(),this.range&&this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"),this._mouseDestroy()},_mouseCapture:function(e){var i,s,n,a,o,r,l,h,u=this,c=this.options;return c.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),i={x:e.pageX,y:e.pageY},s=this._normValueFromMouse(i),n=this._valueMax()-this._valueMin()+1,this.handles.each(function(e){var i=Math.abs(s-u.values(e));(n>i||n===i&&(e===u._lastChangedValue||u.values(e)===c.min))&&(n=i,a=t(this),o=e)}),r=this._start(e,o),r===!1?!1:(this._mouseSliding=!0,this._handleIndex=o,a.addClass("ui-state-active").focus(),l=a.offset(),h=!t(e.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=h?{left:0,top:0}:{left:e.pageX-l.left-a.width()/2,top:e.pageY-l.top-a.height()/2-(parseInt(a.css("borderTopWidth"),10)||0)-(parseInt(a.css("borderBottomWidth"),10)||0)+(parseInt(a.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(e,o,s),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(t){var e={x:t.pageX,y:t.pageY},i=this._normValueFromMouse(e);return this._slide(t,this._handleIndex,i),!1},_mouseStop:function(t){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(t,this._handleIndex),this._change(t,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(t){var e,i,s,n,a;return"horizontal"===this.orientation?(e=this.elementSize.width,i=t.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(e=this.elementSize.height,i=t.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),s=i/e,s>1&&(s=1),0>s&&(s=0),"vertical"===this.orientation&&(s=1-s),n=this._valueMax()-this._valueMin(),a=this._valueMin()+s*n,this._trimAlignValue(a)},_start:function(t,e){var i={handle:this.handles[e],value:this.value()};return this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._trigger("start",t,i)},_slide:function(t,e,i){var s,n,a;this.options.values&&this.options.values.length?(s=this.values(e?0:1),2===this.options.values.length&&this.options.range===!0&&(0===e&&i>s||1===e&&s>i)&&(i=s),i!==this.values(e)&&(n=this.values(),n[e]=i,a=this._trigger("slide",t,{handle:this.handles[e],value:i,values:n}),s=this.values(e?0:1),a!==!1&&this.values(e,i))):i!==this.value()&&(a=this._trigger("slide",t,{handle:this.handles[e],value:i}),a!==!1&&this.value(i))},_stop:function(t,e){var i={handle:this.handles[e],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._trigger("stop",t,i)},_change:function(t,e){if(!this._keySliding&&!this._mouseSliding){var i={handle:this.handles[e],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._lastChangedValue=e,this._trigger("change",t,i)}},value:function(t){return arguments.length?(this.options.value=this._trimAlignValue(t),this._refreshValue(),this._change(null,0),undefined):this._value()},values:function(e,i){var s,n,a;if(arguments.length>1)return this.options.values[e]=this._trimAlignValue(i),this._refreshValue(),this._change(null,e),undefined;if(!arguments.length)return this._values();if(!t.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(e):this.value();for(s=this.options.values,n=arguments[0],a=0;s.length>a;a+=1)s[a]=this._trimAlignValue(n[a]),this._change(null,a);this._refreshValue()},_setOption:function(e,i){var s,n=0;switch("range"===e&&this.options.range===!0&&("min"===i?(this.options.value=this._values(0),this.options.values=null):"max"===i&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),t.isArray(this.options.values)&&(n=this.options.values.length),t.Widget.prototype._setOption.apply(this,arguments),e){case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue();break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),s=0;n>s;s+=1)this._change(null,s);this._animateOff=!1;break;case"min":case"max":this._animateOff=!0,this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_value:function(){var t=this.options.value;return t=this._trimAlignValue(t)},_values:function(t){var e,i,s;if(arguments.length)return e=this.options.values[t],e=this._trimAlignValue(e);if(this.options.values&&this.options.values.length){for(i=this.options.values.slice(),s=0;i.length>s;s+=1)i[s]=this._trimAlignValue(i[s]);return i}return[]},_trimAlignValue:function(t){if(this._valueMin()>=t)return this._valueMin();if(t>=this._valueMax())return this._valueMax();var e=this.options.step>0?this.options.step:1,i=(t-this._valueMin())%e,s=t-i;return 2*Math.abs(i)>=e&&(s+=i>0?e:-e),parseFloat(s.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var e,i,s,n,a,o=this.options.range,r=this.options,l=this,h=this._animateOff?!1:r.animate,u={};this.options.values&&this.options.values.length?this.handles.each(function(s){i=100*((l.values(s)-l._valueMin())/(l._valueMax()-l._valueMin())),u["horizontal"===l.orientation?"left":"bottom"]=i+"%",t(this).stop(1,1)[h?"animate":"css"](u,r.animate),l.options.range===!0&&("horizontal"===l.orientation?(0===s&&l.range.stop(1,1)[h?"animate":"css"]({left:i+"%"},r.animate),1===s&&l.range[h?"animate":"css"]({width:i-e+"%"},{queue:!1,duration:r.animate})):(0===s&&l.range.stop(1,1)[h?"animate":"css"]({bottom:i+"%"},r.animate),1===s&&l.range[h?"animate":"css"]({height:i-e+"%"},{queue:!1,duration:r.animate}))),e=i}):(s=this.value(),n=this._valueMin(),a=this._valueMax(),i=a!==n?100*((s-n)/(a-n)):0,u["horizontal"===this.orientation?"left":"bottom"]=i+"%",this.handle.stop(1,1)[h?"animate":"css"](u,r.animate),"min"===o&&"horizontal"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({width:i+"%"},r.animate),"max"===o&&"horizontal"===this.orientation&&this.range[h?"animate":"css"]({width:100-i+"%"},{queue:!1,duration:r.animate}),"min"===o&&"vertical"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({height:i+"%"},r.animate),"max"===o&&"vertical"===this.orientation&&this.range[h?"animate":"css"]({height:100-i+"%"},{queue:!1,duration:r.animate}))},_handleEvents:{keydown:function(i){var s,n,a,o,r=t(i.target).data("ui-slider-handle-index");switch(i.keyCode){case t.ui.keyCode.HOME:case t.ui.keyCode.END:case t.ui.keyCode.PAGE_UP:case t.ui.keyCode.PAGE_DOWN:case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(i.preventDefault(),!this._keySliding&&(this._keySliding=!0,t(i.target).addClass("ui-state-active"),s=this._start(i,r),s===!1))return}switch(o=this.options.step,n=a=this.options.values&&this.options.values.length?this.values(r):this.value(),i.keyCode){case t.ui.keyCode.HOME:a=this._valueMin();break;case t.ui.keyCode.END:a=this._valueMax();break;case t.ui.keyCode.PAGE_UP:a=this._trimAlignValue(n+(this._valueMax()-this._valueMin())/e);break;case t.ui.keyCode.PAGE_DOWN:a=this._trimAlignValue(n-(this._valueMax()-this._valueMin())/e);break;case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:if(n===this._valueMax())return;a=this._trimAlignValue(n+o);break;case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(n===this._valueMin())return;a=this._trimAlignValue(n-o)}this._slide(i,r,a)},click:function(t){t.preventDefault()},keyup:function(e){var i=t(e.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(e,i),this._change(e,i),t(e.target).removeClass("ui-state-active"))}}})})(jQuery);(function(t,e){var i="ui-effects-";t.effects={effect:{}},function(t,e){function i(t,e,i){var s=u[e.type]||{};return null==t?i||!e.def?null:e.def:(t=s.floor?~~t:parseFloat(t),isNaN(t)?e.def:s.mod?(t+s.mod)%s.mod:0>t?0:t>s.max?s.max:t)}function s(i){var s=h(),n=s._rgba=[];return i=i.toLowerCase(),f(l,function(t,a){var o,r=a.re.exec(i),l=r&&a.parse(r),h=a.space||"rgba";return l?(o=s[h](l),s[c[h].cache]=o[c[h].cache],n=s._rgba=o._rgba,!1):e}),n.length?("0,0,0,0"===n.join()&&t.extend(n,a.transparent),s):a[i]}function n(t,e,i){return i=(i+1)%1,1>6*i?t+6*(e-t)*i:1>2*i?e:2>3*i?t+6*(e-t)*(2/3-i):t}var a,o="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",r=/^([\-+])=\s*(\d+\.?\d*)/,l=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(t){return[t[1],t[2],t[3],t[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(t){return[2.55*t[1],2.55*t[2],2.55*t[3],t[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(t){return[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(t){return[parseInt(t[1]+t[1],16),parseInt(t[2]+t[2],16),parseInt(t[3]+t[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(t){return[t[1],t[2]/100,t[3]/100,t[4]]}}],h=t.Color=function(e,i,s,n){return new t.Color.fn.parse(e,i,s,n)},c={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},u={"byte":{floor:!0,max:255},percent:{max:1},degrees:{mod:360,floor:!0}},d=h.support={},p=t("<p>")[0],f=t.each;p.style.cssText="background-color:rgba(1,1,1,.5)",d.rgba=p.style.backgroundColor.indexOf("rgba")>-1,f(c,function(t,e){e.cache="_"+t,e.props.alpha={idx:3,type:"percent",def:1}}),h.fn=t.extend(h.prototype,{parse:function(n,o,r,l){if(n===e)return this._rgba=[null,null,null,null],this;(n.jquery||n.nodeType)&&(n=t(n).css(o),o=e);var u=this,d=t.type(n),p=this._rgba=[];return o!==e&&(n=[n,o,r,l],d="array"),"string"===d?this.parse(s(n)||a._default):"array"===d?(f(c.rgba.props,function(t,e){p[e.idx]=i(n[e.idx],e)}),this):"object"===d?(n instanceof h?f(c,function(t,e){n[e.cache]&&(u[e.cache]=n[e.cache].slice())}):f(c,function(e,s){var a=s.cache;f(s.props,function(t,e){if(!u[a]&&s.to){if("alpha"===t||null==n[t])return;u[a]=s.to(u._rgba)}u[a][e.idx]=i(n[t],e,!0)}),u[a]&&0>t.inArray(null,u[a].slice(0,3))&&(u[a][3]=1,s.from&&(u._rgba=s.from(u[a])))}),this):e},is:function(t){var i=h(t),s=!0,n=this;return f(c,function(t,a){var o,r=i[a.cache];return r&&(o=n[a.cache]||a.to&&a.to(n._rgba)||[],f(a.props,function(t,i){return null!=r[i.idx]?s=r[i.idx]===o[i.idx]:e})),s}),s},_space:function(){var t=[],e=this;return f(c,function(i,s){e[s.cache]&&t.push(i)}),t.pop()},transition:function(t,e){var s=h(t),n=s._space(),a=c[n],o=0===this.alpha()?h("transparent"):this,r=o[a.cache]||a.to(o._rgba),l=r.slice();return s=s[a.cache],f(a.props,function(t,n){var a=n.idx,o=r[a],h=s[a],c=u[n.type]||{};null!==h&&(null===o?l[a]=h:(c.mod&&(h-o>c.mod/2?o+=c.mod:o-h>c.mod/2&&(o-=c.mod)),l[a]=i((h-o)*e+o,n)))}),this[n](l)},blend:function(e){if(1===this._rgba[3])return this;var i=this._rgba.slice(),s=i.pop(),n=h(e)._rgba;return h(t.map(i,function(t,e){return(1-s)*n[e]+s*t}))},toRgbaString:function(){var e="rgba(",i=t.map(this._rgba,function(t,e){return null==t?e>2?1:0:t});return 1===i[3]&&(i.pop(),e="rgb("),e+i.join()+")"},toHslaString:function(){var e="hsla(",i=t.map(this.hsla(),function(t,e){return null==t&&(t=e>2?1:0),e&&3>e&&(t=Math.round(100*t)+"%"),t});return 1===i[3]&&(i.pop(),e="hsl("),e+i.join()+")"},toHexString:function(e){var i=this._rgba.slice(),s=i.pop();return e&&i.push(~~(255*s)),"#"+t.map(i,function(t){return t=(t||0).toString(16),1===t.length?"0"+t:t}).join("")},toString:function(){return 0===this._rgba[3]?"transparent":this.toRgbaString()}}),h.fn.parse.prototype=h.fn,c.hsla.to=function(t){if(null==t[0]||null==t[1]||null==t[2])return[null,null,null,t[3]];var e,i,s=t[0]/255,n=t[1]/255,a=t[2]/255,o=t[3],r=Math.max(s,n,a),l=Math.min(s,n,a),h=r-l,c=r+l,u=.5*c;return e=l===r?0:s===r?60*(n-a)/h+360:n===r?60*(a-s)/h+120:60*(s-n)/h+240,i=0===h?0:.5>=u?h/c:h/(2-c),[Math.round(e)%360,i,u,null==o?1:o]},c.hsla.from=function(t){if(null==t[0]||null==t[1]||null==t[2])return[null,null,null,t[3]];var e=t[0]/360,i=t[1],s=t[2],a=t[3],o=.5>=s?s*(1+i):s+i-s*i,r=2*s-o;return[Math.round(255*n(r,o,e+1/3)),Math.round(255*n(r,o,e)),Math.round(255*n(r,o,e-1/3)),a]},f(c,function(s,n){var a=n.props,o=n.cache,l=n.to,c=n.from;h.fn[s]=function(s){if(l&&!this[o]&&(this[o]=l(this._rgba)),s===e)return this[o].slice();var n,r=t.type(s),u="array"===r||"object"===r?s:arguments,d=this[o].slice();return f(a,function(t,e){var s=u["object"===r?t:e.idx];null==s&&(s=d[e.idx]),d[e.idx]=i(s,e)}),c?(n=h(c(d)),n[o]=d,n):h(d)},f(a,function(e,i){h.fn[e]||(h.fn[e]=function(n){var a,o=t.type(n),l="alpha"===e?this._hsla?"hsla":"rgba":s,h=this[l](),c=h[i.idx];return"undefined"===o?c:("function"===o&&(n=n.call(this,c),o=t.type(n)),null==n&&i.empty?this:("string"===o&&(a=r.exec(n),a&&(n=c+parseFloat(a[2])*("+"===a[1]?1:-1))),h[i.idx]=n,this[l](h)))})})}),h.hook=function(e){var i=e.split(" ");f(i,function(e,i){t.cssHooks[i]={set:function(e,n){var a,o,r="";if("transparent"!==n&&("string"!==t.type(n)||(a=s(n)))){if(n=h(a||n),!d.rgba&&1!==n._rgba[3]){for(o="backgroundColor"===i?e.parentNode:e;(""===r||"transparent"===r)&&o&&o.style;)try{r=t.css(o,"backgroundColor"),o=o.parentNode}catch(l){}n=n.blend(r&&"transparent"!==r?r:"_default")}n=n.toRgbaString()}try{e.style[i]=n}catch(l){}}},t.fx.step[i]=function(e){e.colorInit||(e.start=h(e.elem,i),e.end=h(e.end),e.colorInit=!0),t.cssHooks[i].set(e.elem,e.start.transition(e.end,e.pos))}})},h.hook(o),t.cssHooks.borderColor={expand:function(t){var e={};return f(["Top","Right","Bottom","Left"],function(i,s){e["border"+s+"Color"]=t}),e}},a=t.Color.names={aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",transparent:[null,null,null,0],_default:"#ffffff"}}(jQuery),function(){function i(e){var i,s,n=e.ownerDocument.defaultView?e.ownerDocument.defaultView.getComputedStyle(e,null):e.currentStyle,a={};if(n&&n.length&&n[0]&&n[n[0]])for(s=n.length;s--;)i=n[s],"string"==typeof n[i]&&(a[t.camelCase(i)]=n[i]);else for(i in n)"string"==typeof n[i]&&(a[i]=n[i]);return a}function s(e,i){var s,n,o={};for(s in i)n=i[s],e[s]!==n&&(a[s]||(t.fx.step[s]||!isNaN(parseFloat(n)))&&(o[s]=n));return o}var n=["add","remove","toggle"],a={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};t.each(["borderLeftStyle","borderRightStyle","borderBottomStyle","borderTopStyle"],function(e,i){t.fx.step[i]=function(t){("none"!==t.end&&!t.setAttr||1===t.pos&&!t.setAttr)&&(jQuery.style(t.elem,i,t.end),t.setAttr=!0)}}),t.fn.addBack||(t.fn.addBack=function(t){return this.add(null==t?this.prevObject:this.prevObject.filter(t))}),t.effects.animateClass=function(e,a,o,r){var l=t.speed(a,o,r);return this.queue(function(){var a,o=t(this),r=o.attr("class")||"",h=l.children?o.find("*").addBack():o;h=h.map(function(){var e=t(this);return{el:e,start:i(this)}}),a=function(){t.each(n,function(t,i){e[i]&&o[i+"Class"](e[i])})},a(),h=h.map(function(){return this.end=i(this.el[0]),this.diff=s(this.start,this.end),this}),o.attr("class",r),h=h.map(function(){var e=this,i=t.Deferred(),s=t.extend({},l,{queue:!1,complete:function(){i.resolve(e)}});return this.el.animate(this.diff,s),i.promise()}),t.when.apply(t,h.get()).done(function(){a(),t.each(arguments,function(){var e=this.el;t.each(this.diff,function(t){e.css(t,"")})}),l.complete.call(o[0])})})},t.fn.extend({addClass:function(e){return function(i,s,n,a){return s?t.effects.animateClass.call(this,{add:i},s,n,a):e.apply(this,arguments)}}(t.fn.addClass),removeClass:function(e){return function(i,s,n,a){return arguments.length>1?t.effects.animateClass.call(this,{remove:i},s,n,a):e.apply(this,arguments)}}(t.fn.removeClass),toggleClass:function(i){return function(s,n,a,o,r){return"boolean"==typeof n||n===e?a?t.effects.animateClass.call(this,n?{add:s}:{remove:s},a,o,r):i.apply(this,arguments):t.effects.animateClass.call(this,{toggle:s},n,a,o)}}(t.fn.toggleClass),switchClass:function(e,i,s,n,a){return t.effects.animateClass.call(this,{add:i,remove:e},s,n,a)}})}(),function(){function s(e,i,s,n){return t.isPlainObject(e)&&(i=e,e=e.effect),e={effect:e},null==i&&(i={}),t.isFunction(i)&&(n=i,s=null,i={}),("number"==typeof i||t.fx.speeds[i])&&(n=s,s=i,i={}),t.isFunction(s)&&(n=s,s=null),i&&t.extend(e,i),s=s||i.duration,e.duration=t.fx.off?0:"number"==typeof s?s:s in t.fx.speeds?t.fx.speeds[s]:t.fx.speeds._default,e.complete=n||i.complete,e}function n(e){return!e||"number"==typeof e||t.fx.speeds[e]?!0:"string"!=typeof e||t.effects.effect[e]?t.isFunction(e)?!0:"object"!=typeof e||e.effect?!1:!0:!0}t.extend(t.effects,{version:"1.10.4",save:function(t,e){for(var s=0;e.length>s;s++)null!==e[s]&&t.data(i+e[s],t[0].style[e[s]])},restore:function(t,s){var n,a;for(a=0;s.length>a;a++)null!==s[a]&&(n=t.data(i+s[a]),n===e&&(n=""),t.css(s[a],n))},setMode:function(t,e){return"toggle"===e&&(e=t.is(":hidden")?"show":"hide"),e},getBaseline:function(t,e){var i,s;switch(t[0]){case"top":i=0;break;case"middle":i=.5;break;case"bottom":i=1;break;default:i=t[0]/e.height}switch(t[1]){case"left":s=0;break;case"center":s=.5;break;case"right":s=1;break;default:s=t[1]/e.width}return{x:s,y:i}},createWrapper:function(e){if(e.parent().is(".ui-effects-wrapper"))return e.parent();var i={width:e.outerWidth(!0),height:e.outerHeight(!0),"float":e.css("float")},s=t("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),n={width:e.width(),height:e.height()},a=document.activeElement;try{a.id}catch(o){a=document.body}return e.wrap(s),(e[0]===a||t.contains(e[0],a))&&t(a).focus(),s=e.parent(),"static"===e.css("position")?(s.css({position:"relative"}),e.css({position:"relative"})):(t.extend(i,{position:e.css("position"),zIndex:e.css("z-index")}),t.each(["top","left","bottom","right"],function(t,s){i[s]=e.css(s),isNaN(parseInt(i[s],10))&&(i[s]="auto")}),e.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})),e.css(n),s.css(i).show()},removeWrapper:function(e){var i=document.activeElement;return e.parent().is(".ui-effects-wrapper")&&(e.parent().replaceWith(e),(e[0]===i||t.contains(e[0],i))&&t(i).focus()),e},setTransition:function(e,i,s,n){return n=n||{},t.each(i,function(t,i){var a=e.cssUnit(i);a[0]>0&&(n[i]=a[0]*s+a[1])}),n}}),t.fn.extend({effect:function(){function e(e){function s(){t.isFunction(a)&&a.call(n[0]),t.isFunction(e)&&e()}var n=t(this),a=i.complete,r=i.mode;(n.is(":hidden")?"hide"===r:"show"===r)?(n[r](),s()):o.call(n[0],i,s)}var i=s.apply(this,arguments),n=i.mode,a=i.queue,o=t.effects.effect[i.effect];return t.fx.off||!o?n?this[n](i.duration,i.complete):this.each(function(){i.complete&&i.complete.call(this)}):a===!1?this.each(e):this.queue(a||"fx",e)},show:function(t){return function(e){if(n(e))return t.apply(this,arguments);var i=s.apply(this,arguments);return i.mode="show",this.effect.call(this,i)}}(t.fn.show),hide:function(t){return function(e){if(n(e))return t.apply(this,arguments);var i=s.apply(this,arguments);return i.mode="hide",this.effect.call(this,i)}}(t.fn.hide),toggle:function(t){return function(e){if(n(e)||"boolean"==typeof e)return t.apply(this,arguments);var i=s.apply(this,arguments);return i.mode="toggle",this.effect.call(this,i)}}(t.fn.toggle),cssUnit:function(e){var i=this.css(e),s=[];return t.each(["em","px","%","pt"],function(t,e){i.indexOf(e)>0&&(s=[parseFloat(i),e])}),s}})}(),function(){var e={};t.each(["Quad","Cubic","Quart","Quint","Expo"],function(t,i){e[i]=function(e){return Math.pow(e,t+2)}}),t.extend(e,{Sine:function(t){return 1-Math.cos(t*Math.PI/2)},Circ:function(t){return 1-Math.sqrt(1-t*t)},Elastic:function(t){return 0===t||1===t?t:-Math.pow(2,8*(t-1))*Math.sin((80*(t-1)-7.5)*Math.PI/15)},Back:function(t){return t*t*(3*t-2)},Bounce:function(t){for(var e,i=4;((e=Math.pow(2,--i))-1)/11>t;);return 1/Math.pow(4,3-i)-7.5625*Math.pow((3*e-2)/22-t,2)}}),t.each(e,function(e,i){t.easing["easeIn"+e]=i,t.easing["easeOut"+e]=function(t){return 1-i(1-t)},t.easing["easeInOut"+e]=function(t){return.5>t?i(2*t)/2:1-i(-2*t+2)/2}})}()})(jQuery);(function(t){var e=/up|down|vertical/,i=/up|left|vertical|horizontal/;t.effects.effect.blind=function(s,n){var a,o,r,l=t(this),h=["position","top","bottom","left","right","height","width"],c=t.effects.setMode(l,s.mode||"hide"),u=s.direction||"up",d=e.test(u),p=d?"height":"width",f=d?"top":"left",g=i.test(u),m={},v="show"===c;l.parent().is(".ui-effects-wrapper")?t.effects.save(l.parent(),h):t.effects.save(l,h),l.show(),a=t.effects.createWrapper(l).css({overflow:"hidden"}),o=a[p](),r=parseFloat(a.css(f))||0,m[p]=v?o:0,g||(l.css(d?"bottom":"right",0).css(d?"top":"left","auto").css({position:"absolute"}),m[f]=v?r:o+r),v&&(a.css(p,0),g||a.css(f,r+o)),a.animate(m,{duration:s.duration,easing:s.easing,queue:!1,complete:function(){"hide"===c&&l.hide(),t.effects.restore(l,h),t.effects.removeWrapper(l),n()}})}})(jQuery);(function(t){t.effects.effect.bounce=function(e,i){var s,n,a,o=t(this),r=["position","top","bottom","left","right","height","width"],l=t.effects.setMode(o,e.mode||"effect"),h="hide"===l,c="show"===l,u=e.direction||"up",d=e.distance,p=e.times||5,f=2*p+(c||h?1:0),g=e.duration/f,m=e.easing,v="up"===u||"down"===u?"top":"left",_="up"===u||"left"===u,b=o.queue(),y=b.length;for((c||h)&&r.push("opacity"),t.effects.save(o,r),o.show(),t.effects.createWrapper(o),d||(d=o["top"===v?"outerHeight":"outerWidth"]()/3),c&&(a={opacity:1},a[v]=0,o.css("opacity",0).css(v,_?2*-d:2*d).animate(a,g,m)),h&&(d/=Math.pow(2,p-1)),a={},a[v]=0,s=0;p>s;s++)n={},n[v]=(_?"-=":"+=")+d,o.animate(n,g,m).animate(a,g,m),d=h?2*d:d/2;h&&(n={opacity:0},n[v]=(_?"-=":"+=")+d,o.animate(n,g,m)),o.queue(function(){h&&o.hide(),t.effects.restore(o,r),t.effects.removeWrapper(o),i()}),y>1&&b.splice.apply(b,[1,0].concat(b.splice(y,f+1))),o.dequeue()}})(jQuery);(function(t){t.effects.effect.clip=function(e,i){var s,n,a,o=t(this),r=["position","top","bottom","left","right","height","width"],l=t.effects.setMode(o,e.mode||"hide"),h="show"===l,c=e.direction||"vertical",u="vertical"===c,d=u?"height":"width",p=u?"top":"left",f={};t.effects.save(o,r),o.show(),s=t.effects.createWrapper(o).css({overflow:"hidden"}),n="IMG"===o[0].tagName?s:o,a=n[d](),h&&(n.css(d,0),n.css(p,a/2)),f[d]=h?a:0,f[p]=h?0:a/2,n.animate(f,{queue:!1,duration:e.duration,easing:e.easing,complete:function(){h||o.hide(),t.effects.restore(o,r),t.effects.removeWrapper(o),i()}})}})(jQuery);(function(t){t.effects.effect.drop=function(e,i){var s,n=t(this),a=["position","top","bottom","left","right","opacity","height","width"],o=t.effects.setMode(n,e.mode||"hide"),r="show"===o,l=e.direction||"left",h="up"===l||"down"===l?"top":"left",c="up"===l||"left"===l?"pos":"neg",u={opacity:r?1:0};t.effects.save(n,a),n.show(),t.effects.createWrapper(n),s=e.distance||n["top"===h?"outerHeight":"outerWidth"](!0)/2,r&&n.css("opacity",0).css(h,"pos"===c?-s:s),u[h]=(r?"pos"===c?"+=":"-=":"pos"===c?"-=":"+=")+s,n.animate(u,{queue:!1,duration:e.duration,easing:e.easing,complete:function(){"hide"===o&&n.hide(),t.effects.restore(n,a),t.effects.removeWrapper(n),i()}})}})(jQuery);(function(t){t.effects.effect.explode=function(e,i){function s(){b.push(this),b.length===u*d&&n()}function n(){p.css({visibility:"visible"}),t(b).remove(),g||p.hide(),i()}var a,o,r,l,h,c,u=e.pieces?Math.round(Math.sqrt(e.pieces)):3,d=u,p=t(this),f=t.effects.setMode(p,e.mode||"hide"),g="show"===f,m=p.show().css("visibility","hidden").offset(),v=Math.ceil(p.outerWidth()/d),_=Math.ceil(p.outerHeight()/u),b=[];for(a=0;u>a;a++)for(l=m.top+a*_,c=a-(u-1)/2,o=0;d>o;o++)r=m.left+o*v,h=o-(d-1)/2,p.clone().appendTo("body").wrap("<div></div>").css({position:"absolute",visibility:"visible",left:-o*v,top:-a*_}).parent().addClass("ui-effects-explode").css({position:"absolute",overflow:"hidden",width:v,height:_,left:r+(g?h*v:0),top:l+(g?c*_:0),opacity:g?0:1}).animate({left:r+(g?0:h*v),top:l+(g?0:c*_),opacity:g?1:0},e.duration||500,e.easing,s)}})(jQuery);(function(t){t.effects.effect.fade=function(e,i){var s=t(this),n=t.effects.setMode(s,e.mode||"toggle");s.animate({opacity:n},{queue:!1,duration:e.duration,easing:e.easing,complete:i})}})(jQuery);(function(t){t.effects.effect.fold=function(e,i){var s,n,a=t(this),o=["position","top","bottom","left","right","height","width"],r=t.effects.setMode(a,e.mode||"hide"),l="show"===r,h="hide"===r,c=e.size||15,u=/([0-9]+)%/.exec(c),d=!!e.horizFirst,p=l!==d,f=p?["width","height"]:["height","width"],g=e.duration/2,m={},v={};t.effects.save(a,o),a.show(),s=t.effects.createWrapper(a).css({overflow:"hidden"}),n=p?[s.width(),s.height()]:[s.height(),s.width()],u&&(c=parseInt(u[1],10)/100*n[h?0:1]),l&&s.css(d?{height:0,width:c}:{height:c,width:0}),m[f[0]]=l?n[0]:c,v[f[1]]=l?n[1]:0,s.animate(m,g,e.easing).animate(v,g,e.easing,function(){h&&a.hide(),t.effects.restore(a,o),t.effects.removeWrapper(a),i()})}})(jQuery);(function(t){t.effects.effect.highlight=function(e,i){var s=t(this),n=["backgroundImage","backgroundColor","opacity"],a=t.effects.setMode(s,e.mode||"show"),o={backgroundColor:s.css("backgroundColor")};"hide"===a&&(o.opacity=0),t.effects.save(s,n),s.show().css({backgroundImage:"none",backgroundColor:e.color||"#ffff99"}).animate(o,{queue:!1,duration:e.duration,easing:e.easing,complete:function(){"hide"===a&&s.hide(),t.effects.restore(s,n),i()}})}})(jQuery);(function(t){t.effects.effect.pulsate=function(e,i){var s,n=t(this),a=t.effects.setMode(n,e.mode||"show"),o="show"===a,r="hide"===a,l=o||"hide"===a,h=2*(e.times||5)+(l?1:0),c=e.duration/h,u=0,d=n.queue(),p=d.length;for((o||!n.is(":visible"))&&(n.css("opacity",0).show(),u=1),s=1;h>s;s++)n.animate({opacity:u},c,e.easing),u=1-u;n.animate({opacity:u},c,e.easing),n.queue(function(){r&&n.hide(),i()}),p>1&&d.splice.apply(d,[1,0].concat(d.splice(p,h+1))),n.dequeue()}})(jQuery);(function(t){t.effects.effect.puff=function(e,i){var s=t(this),n=t.effects.setMode(s,e.mode||"hide"),a="hide"===n,o=parseInt(e.percent,10)||150,r=o/100,l={height:s.height(),width:s.width(),outerHeight:s.outerHeight(),outerWidth:s.outerWidth()};t.extend(e,{effect:"scale",queue:!1,fade:!0,mode:n,complete:i,percent:a?o:100,from:a?l:{height:l.height*r,width:l.width*r,outerHeight:l.outerHeight*r,outerWidth:l.outerWidth*r}}),s.effect(e)},t.effects.effect.scale=function(e,i){var s=t(this),n=t.extend(!0,{},e),a=t.effects.setMode(s,e.mode||"effect"),o=parseInt(e.percent,10)||(0===parseInt(e.percent,10)?0:"hide"===a?0:100),r=e.direction||"both",l=e.origin,h={height:s.height(),width:s.width(),outerHeight:s.outerHeight(),outerWidth:s.outerWidth()},c={y:"horizontal"!==r?o/100:1,x:"vertical"!==r?o/100:1};n.effect="size",n.queue=!1,n.complete=i,"effect"!==a&&(n.origin=l||["middle","center"],n.restore=!0),n.from=e.from||("show"===a?{height:0,width:0,outerHeight:0,outerWidth:0}:h),n.to={height:h.height*c.y,width:h.width*c.x,outerHeight:h.outerHeight*c.y,outerWidth:h.outerWidth*c.x},n.fade&&("show"===a&&(n.from.opacity=0,n.to.opacity=1),"hide"===a&&(n.from.opacity=1,n.to.opacity=0)),s.effect(n)},t.effects.effect.size=function(e,i){var s,n,a,o=t(this),r=["position","top","bottom","left","right","width","height","overflow","opacity"],l=["position","top","bottom","left","right","overflow","opacity"],h=["width","height","overflow"],c=["fontSize"],u=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"],d=["borderLeftWidth","borderRightWidth","paddingLeft","paddingRight"],p=t.effects.setMode(o,e.mode||"effect"),f=e.restore||"effect"!==p,g=e.scale||"both",m=e.origin||["middle","center"],v=o.css("position"),_=f?r:l,b={height:0,width:0,outerHeight:0,outerWidth:0};"show"===p&&o.show(),s={height:o.height(),width:o.width(),outerHeight:o.outerHeight(),outerWidth:o.outerWidth()},"toggle"===e.mode&&"show"===p?(o.from=e.to||b,o.to=e.from||s):(o.from=e.from||("show"===p?b:s),o.to=e.to||("hide"===p?b:s)),a={from:{y:o.from.height/s.height,x:o.from.width/s.width},to:{y:o.to.height/s.height,x:o.to.width/s.width}},("box"===g||"both"===g)&&(a.from.y!==a.to.y&&(_=_.concat(u),o.from=t.effects.setTransition(o,u,a.from.y,o.from),o.to=t.effects.setTransition(o,u,a.to.y,o.to)),a.from.x!==a.to.x&&(_=_.concat(d),o.from=t.effects.setTransition(o,d,a.from.x,o.from),o.to=t.effects.setTransition(o,d,a.to.x,o.to))),("content"===g||"both"===g)&&a.from.y!==a.to.y&&(_=_.concat(c).concat(h),o.from=t.effects.setTransition(o,c,a.from.y,o.from),o.to=t.effects.setTransition(o,c,a.to.y,o.to)),t.effects.save(o,_),o.show(),t.effects.createWrapper(o),o.css("overflow","hidden").css(o.from),m&&(n=t.effects.getBaseline(m,s),o.from.top=(s.outerHeight-o.outerHeight())*n.y,o.from.left=(s.outerWidth-o.outerWidth())*n.x,o.to.top=(s.outerHeight-o.to.outerHeight)*n.y,o.to.left=(s.outerWidth-o.to.outerWidth)*n.x),o.css(o.from),("content"===g||"both"===g)&&(u=u.concat(["marginTop","marginBottom"]).concat(c),d=d.concat(["marginLeft","marginRight"]),h=r.concat(u).concat(d),o.find("*[width]").each(function(){var i=t(this),s={height:i.height(),width:i.width(),outerHeight:i.outerHeight(),outerWidth:i.outerWidth()};f&&t.effects.save(i,h),i.from={height:s.height*a.from.y,width:s.width*a.from.x,outerHeight:s.outerHeight*a.from.y,outerWidth:s.outerWidth*a.from.x},i.to={height:s.height*a.to.y,width:s.width*a.to.x,outerHeight:s.height*a.to.y,outerWidth:s.width*a.to.x},a.from.y!==a.to.y&&(i.from=t.effects.setTransition(i,u,a.from.y,i.from),i.to=t.effects.setTransition(i,u,a.to.y,i.to)),a.from.x!==a.to.x&&(i.from=t.effects.setTransition(i,d,a.from.x,i.from),i.to=t.effects.setTransition(i,d,a.to.x,i.to)),i.css(i.from),i.animate(i.to,e.duration,e.easing,function(){f&&t.effects.restore(i,h)})})),o.animate(o.to,{queue:!1,duration:e.duration,easing:e.easing,complete:function(){0===o.to.opacity&&o.css("opacity",o.from.opacity),"hide"===p&&o.hide(),t.effects.restore(o,_),f||("static"===v?o.css({position:"relative",top:o.to.top,left:o.to.left}):t.each(["top","left"],function(t,e){o.css(e,function(e,i){var s=parseInt(i,10),n=t?o.to.left:o.to.top;return"auto"===i?n+"px":s+n+"px"})})),t.effects.removeWrapper(o),i()}})}})(jQuery);(function(t){t.effects.effect.shake=function(e,i){var s,n=t(this),a=["position","top","bottom","left","right","height","width"],o=t.effects.setMode(n,e.mode||"effect"),r=e.direction||"left",l=e.distance||20,h=e.times||3,c=2*h+1,u=Math.round(e.duration/c),d="up"===r||"down"===r?"top":"left",p="up"===r||"left"===r,f={},g={},m={},v=n.queue(),_=v.length;for(t.effects.save(n,a),n.show(),t.effects.createWrapper(n),f[d]=(p?"-=":"+=")+l,g[d]=(p?"+=":"-=")+2*l,m[d]=(p?"-=":"+=")+2*l,n.animate(f,u,e.easing),s=1;h>s;s++)n.animate(g,u,e.easing).animate(m,u,e.easing);n.animate(g,u,e.easing).animate(f,u/2,e.easing).queue(function(){"hide"===o&&n.hide(),t.effects.restore(n,a),t.effects.removeWrapper(n),i()}),_>1&&v.splice.apply(v,[1,0].concat(v.splice(_,c+1))),n.dequeue()}})(jQuery);(function(t){t.effects.effect.slide=function(e,i){var s,n=t(this),a=["position","top","bottom","left","right","width","height"],o=t.effects.setMode(n,e.mode||"show"),r="show"===o,l=e.direction||"left",h="up"===l||"down"===l?"top":"left",c="up"===l||"left"===l,u={};t.effects.save(n,a),n.show(),s=e.distance||n["top"===h?"outerHeight":"outerWidth"](!0),t.effects.createWrapper(n).css({overflow:"hidden"}),r&&n.css(h,c?isNaN(s)?"-"+s:-s:s),u[h]=(r?c?"+=":"-=":c?"-=":"+=")+s,n.animate(u,{queue:!1,duration:e.duration,easing:e.easing,complete:function(){"hide"===o&&n.hide(),t.effects.restore(n,a),t.effects.removeWrapper(n),i()}})}})(jQuery);(function(t){t.effects.effect.transfer=function(e,i){var s=t(this),n=t(e.to),a="fixed"===n.css("position"),o=t("body"),r=a?o.scrollTop():0,l=a?o.scrollLeft():0,h=n.offset(),c={top:h.top-r,left:h.left-l,height:n.innerHeight(),width:n.innerWidth()},u=s.offset(),d=t("<div class='ui-effects-transfer'></div>").appendTo(document.body).addClass(e.className).css({top:u.top-r,left:u.left-l,height:s.innerHeight(),width:s.innerWidth(),position:a?"fixed":"absolute"}).animate(c,e.duration,e.easing,function(){d.remove(),i()})}})(jQuery);
define("slickgrid/lib/jquery-ui", ["jquery"], function(){});

/*! 
 * jquery.event.drag - v 2.2
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
// Created: 2008-06-04 
// Updated: 2012-05-21
// REQUIRES: jquery 1.7.x

;(function( $ ){

// add the jquery instance method
$.fn.drag = function( str, arg, opts ){
	// figure out the event type
	var type = typeof str == "string" ? str : "",
	// figure out the event handler...
	fn = $.isFunction( str ) ? str : $.isFunction( arg ) ? arg : null;
	// fix the event type
	if ( type.indexOf("drag") !== 0 ) 
		type = "drag"+ type;
	// were options passed
	opts = ( str == fn ? arg : opts ) || {};
	// trigger or bind event handler
	return fn ? this.bind( type, opts, fn ) : this.trigger( type );
};

// local refs (increase compression)
var $event = $.event, 
$special = $event.special,
// configure the drag special event 
drag = $special.drag = {
	
	// these are the default settings
	defaults: {
		which: 1, // mouse button pressed to start drag sequence
		distance: 0, // distance dragged before dragstart
		not: ':input', // selector to suppress dragging on target elements
		handle: null, // selector to match handle target elements
		relative: false, // true to use "position", false to use "offset"
		drop: true, // false to suppress drop events, true or selector to allow
		click: false // false to suppress click events after dragend (no proxy)
	},
	
	// the key name for stored drag data
	datakey: "dragdata",
	
	// prevent bubbling for better performance
	noBubble: true,
	
	// count bound related events
	add: function( obj ){ 
		// read the interaction data
		var data = $.data( this, drag.datakey ),
		// read any passed options 
		opts = obj.data || {};
		// count another realted event
		data.related += 1;
		// extend data options bound with this event
		// don't iterate "opts" in case it is a node 
		$.each( drag.defaults, function( key, def ){
			if ( opts[ key ] !== undefined )
				data[ key ] = opts[ key ];
		});
	},
	
	// forget unbound related events
	remove: function(){
		$.data( this, drag.datakey ).related -= 1;
	},
	
	// configure interaction, capture settings
	setup: function(){
		// check for related events
		if ( $.data( this, drag.datakey ) ) 
			return;
		// initialize the drag data with copied defaults
		var data = $.extend({ related:0 }, drag.defaults );
		// store the interaction data
		$.data( this, drag.datakey, data );
		// bind the mousedown event, which starts drag interactions
		$event.add( this, "touchstart mousedown", drag.init, data );
		// prevent image dragging in IE...
		if ( this.attachEvent ) 
			this.attachEvent("ondragstart", drag.dontstart ); 
	},
	
	// destroy configured interaction
	teardown: function(){
		var data = $.data( this, drag.datakey ) || {};
		// check for related events
		if ( data.related ) 
			return;
		// remove the stored data
		$.removeData( this, drag.datakey );
		// remove the mousedown event
		$event.remove( this, "touchstart mousedown", drag.init );
		// enable text selection
		drag.textselect( true ); 
		// un-prevent image dragging in IE...
		if ( this.detachEvent ) 
			this.detachEvent("ondragstart", drag.dontstart ); 
	},
		
	// initialize the interaction
	init: function( event ){ 
		// sorry, only one touch at a time
		if ( drag.touched ) 
			return;
		// the drag/drop interaction data
		var dd = event.data, results;
		// check the which directive
		if ( event.which != 0 && dd.which > 0 && event.which != dd.which ) 
			return; 
		// check for suppressed selector
		if ( $( event.target ).is( dd.not ) ) 
			return;
		// check for handle selector
		if ( dd.handle && !$( event.target ).closest( dd.handle, event.currentTarget ).length ) 
			return;

		drag.touched = event.type == 'touchstart' ? this : null;
		dd.propagates = 1;
		dd.mousedown = this;
		dd.interactions = [ drag.interaction( this, dd ) ];
		dd.target = event.target;
		dd.pageX = event.pageX;
		dd.pageY = event.pageY;
		dd.dragging = null;
		// handle draginit event... 
		results = drag.hijack( event, "draginit", dd );
		// early cancel
		if ( !dd.propagates )
			return;
		// flatten the result set
		results = drag.flatten( results );
		// insert new interaction elements
		if ( results && results.length ){
			dd.interactions = [];
			$.each( results, function(){
				dd.interactions.push( drag.interaction( this, dd ) );
			});
		}
		// remember how many interactions are propagating
		dd.propagates = dd.interactions.length;
		// locate and init the drop targets
		if ( dd.drop !== false && $special.drop ) 
			$special.drop.handler( event, dd );
		// disable text selection
		drag.textselect( false ); 
		// bind additional events...
		if ( drag.touched )
			$event.add( drag.touched, "touchmove touchend", drag.handler, dd );
		else 
			$event.add( document, "mousemove mouseup", drag.handler, dd );
		// helps prevent text selection or scrolling
		if ( !drag.touched || dd.live )
			return false;
	},	
	
	// returns an interaction object
	interaction: function( elem, dd ){
		var offset = $( elem )[ dd.relative ? "position" : "offset" ]() || { top:0, left:0 };
		return {
			drag: elem, 
			callback: new drag.callback(), 
			droppable: [],
			offset: offset
		};
	},
	
	// handle drag-releatd DOM events
	handler: function( event ){ 
		// read the data before hijacking anything
		var dd = event.data;	
		// handle various events
		switch ( event.type ){
			// mousemove, check distance, start dragging
			case !dd.dragging && 'touchmove': 
				event.preventDefault();
			case !dd.dragging && 'mousemove':
				//  drag tolerance, x≤ + y≤ = distance≤
				if ( Math.pow(  event.pageX-dd.pageX, 2 ) + Math.pow(  event.pageY-dd.pageY, 2 ) < Math.pow( dd.distance, 2 ) ) 
					break; // distance tolerance not reached
				event.target = dd.target; // force target from "mousedown" event (fix distance issue)
				drag.hijack( event, "dragstart", dd ); // trigger "dragstart"
				if ( dd.propagates ) // "dragstart" not rejected
					dd.dragging = true; // activate interaction
			// mousemove, dragging
			case 'touchmove':
				event.preventDefault();
			case 'mousemove':
				if ( dd.dragging ){
					// trigger "drag"		
					drag.hijack( event, "drag", dd );
					if ( dd.propagates ){
						// manage drop events
						if ( dd.drop !== false && $special.drop )
							$special.drop.handler( event, dd ); // "dropstart", "dropend"							
						break; // "drag" not rejected, stop		
					}
					event.type = "mouseup"; // helps "drop" handler behave
				}
			// mouseup, stop dragging
			case 'touchend': 
			case 'mouseup': 
			default:
				if ( drag.touched )
					$event.remove( drag.touched, "touchmove touchend", drag.handler ); // remove touch events
				else 
					$event.remove( document, "mousemove mouseup", drag.handler ); // remove page events	
				if ( dd.dragging ){
					if ( dd.drop !== false && $special.drop )
						$special.drop.handler( event, dd ); // "drop"
					drag.hijack( event, "dragend", dd ); // trigger "dragend"	
				}
				drag.textselect( true ); // enable text selection
				// if suppressing click events...
				if ( dd.click === false && dd.dragging )
					$.data( dd.mousedown, "suppress.click", new Date().getTime() + 5 );
				dd.dragging = drag.touched = false; // deactivate element	
				break;
		}
	},
		
	// re-use event object for custom events
	hijack: function( event, type, dd, x, elem ){
		// not configured
		if ( !dd ) 
			return;
		// remember the original event and type
		var orig = { event:event.originalEvent, type:event.type },
		// is the event drag related or drog related?
		mode = type.indexOf("drop") ? "drag" : "drop",
		// iteration vars
		result, i = x || 0, ia, $elems, callback,
		len = !isNaN( x ) ? x : dd.interactions.length;
		// modify the event type
		event.type = type;
		// remove the original event
		event.originalEvent = null;
		// initialize the results
		dd.results = [];
		// handle each interacted element
		do if ( ia = dd.interactions[ i ] ){
			// validate the interaction
			if ( type !== "dragend" && ia.cancelled )
				continue;
			// set the dragdrop properties on the event object
			callback = drag.properties( event, dd, ia );
			// prepare for more results
			ia.results = [];
			// handle each element
			$( elem || ia[ mode ] || dd.droppable ).each(function( p, subject ){
				// identify drag or drop targets individually
				callback.target = subject;
				// force propagtion of the custom event
				event.isPropagationStopped = function(){ return false; };
				// handle the event	
				result = subject ? $event.dispatch.call( subject, event, callback ) : null;
				// stop the drag interaction for this element
				if ( result === false ){
					if ( mode == "drag" ){
						ia.cancelled = true;
						dd.propagates -= 1;
					}
					if ( type == "drop" ){
						ia[ mode ][p] = null;
					}
				}
				// assign any dropinit elements
				else if ( type == "dropinit" )
					ia.droppable.push( drag.element( result ) || subject );
				// accept a returned proxy element 
				if ( type == "dragstart" )
					ia.proxy = $( drag.element( result ) || ia.drag )[0];
				// remember this result	
				ia.results.push( result );
				// forget the event result, for recycling
				delete event.result;
				// break on cancelled handler
				if ( type !== "dropinit" )
					return result;
			});	
			// flatten the results	
			dd.results[ i ] = drag.flatten( ia.results );	
			// accept a set of valid drop targets
			if ( type == "dropinit" )
				ia.droppable = drag.flatten( ia.droppable );
			// locate drop targets
			if ( type == "dragstart" && !ia.cancelled )
				callback.update(); 
		}
		while ( ++i < len )
		// restore the original event & type
		event.type = orig.type;
		event.originalEvent = orig.event;
		// return all handler results
		return drag.flatten( dd.results );
	},
		
	// extend the callback object with drag/drop properties...
	properties: function( event, dd, ia ){		
		var obj = ia.callback;
		// elements
		obj.drag = ia.drag;
		obj.proxy = ia.proxy || ia.drag;
		// starting mouse position
		obj.startX = dd.pageX;
		obj.startY = dd.pageY;
		// current distance dragged
		obj.deltaX = event.pageX - dd.pageX;
		obj.deltaY = event.pageY - dd.pageY;
		// original element position
		obj.originalX = ia.offset.left;
		obj.originalY = ia.offset.top;
		// adjusted element position
		obj.offsetX = obj.originalX + obj.deltaX; 
		obj.offsetY = obj.originalY + obj.deltaY;
		// assign the drop targets information
		obj.drop = drag.flatten( ( ia.drop || [] ).slice() );
		obj.available = drag.flatten( ( ia.droppable || [] ).slice() );
		return obj;	
	},
	
	// determine is the argument is an element or jquery instance
	element: function( arg ){
		if ( arg && ( arg.jquery || arg.nodeType == 1 ) )
			return arg;
	},
	
	// flatten nested jquery objects and arrays into a single dimension array
	flatten: function( arr ){
		return $.map( arr, function( member ){
			return member && member.jquery ? $.makeArray( member ) : 
				member && member.length ? drag.flatten( member ) : member;
		});
	},
	
	// toggles text selection attributes ON (true) or OFF (false)
	textselect: function( bool ){ 
		$( document )[ bool ? "unbind" : "bind" ]("selectstart", drag.dontstart )
			.css("MozUserSelect", bool ? "" : "none" );
		// .attr("unselectable", bool ? "off" : "on" )
		document.unselectable = bool ? "off" : "on"; 
	},
	
	// suppress "selectstart" and "ondragstart" events
	dontstart: function(){ 
		return false; 
	},
	
	// a callback instance contructor
	callback: function(){}
	
};

// callback methods
drag.callback.prototype = {
	update: function(){
		if ( $special.drop && this.available.length )
			$.each( this.available, function( i ){
				$special.drop.locate( this, i );
			});
	}
};

// patch $.event.$dispatch to allow suppressing clicks
var $dispatch = $event.dispatch;
$event.dispatch = function( event ){
	if ( $.data( this, "suppress."+ event.type ) - new Date().getTime() > 0 ){
		$.removeData( this, "suppress."+ event.type );
		return;
	}
	return $dispatch.apply( this, arguments );
};

// event fix hooks for touch events...
var touchHooks = 
$event.fixHooks.touchstart = 
$event.fixHooks.touchmove = 
$event.fixHooks.touchend =
$event.fixHooks.touchcancel = {
	props: "clientX clientY pageX pageY screenX screenY".split( " " ),
	filter: function( event, orig ) {
		if ( orig ){
			var touched = ( orig.touches && orig.touches[0] )
				|| ( orig.changedTouches && orig.changedTouches[0] )
				|| null; 
			// iOS webkit: touchstart, touchmove, touchend
			if ( touched ) 
				$.each( touchHooks.props, function( i, prop ){
					event[ prop ] = touched[ prop ];
				});
		}
		return event;
	}
};

// share the same special event configuration with related events...
$special.draginit = $special.dragstart = $special.dragend = drag;

})( jQuery );
define("slickgrid/lib/jquery.event.drag", ["jquery"], function(){});

/*! 
 * jquery.event.drop - v 2.2
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
// Created: 2008-06-04 
// Updated: 2012-05-21
// REQUIRES: jquery 1.7.x, event.drag 2.2

;(function($){ // secure $ jQuery alias

// Events: drop, dropstart, dropend

// add the jquery instance method
$.fn.drop = function( str, arg, opts ){
	// figure out the event type
	var type = typeof str == "string" ? str : "",
	// figure out the event handler...
	fn = $.isFunction( str ) ? str : $.isFunction( arg ) ? arg : null;
	// fix the event type
	if ( type.indexOf("drop") !== 0 ) 
		type = "drop"+ type;
	// were options passed
	opts = ( str == fn ? arg : opts ) || {};
	// trigger or bind event handler
	return fn ? this.bind( type, opts, fn ) : this.trigger( type );
};

// DROP MANAGEMENT UTILITY
// returns filtered drop target elements, caches their positions
$.drop = function( opts ){ 
	opts = opts || {};
	// safely set new options...
	drop.multi = opts.multi === true ? Infinity : 
		opts.multi === false ? 1 : !isNaN( opts.multi ) ? opts.multi : drop.multi;
	drop.delay = opts.delay || drop.delay;
	drop.tolerance = $.isFunction( opts.tolerance ) ? opts.tolerance : 
		opts.tolerance === null ? null : drop.tolerance;
	drop.mode = opts.mode || drop.mode || 'intersect';
};

// local refs (increase compression)
var $event = $.event, 
$special = $event.special,
// configure the drop special event
drop = $.event.special.drop = {

	// these are the default settings
	multi: 1, // allow multiple drop winners per dragged element
	delay: 20, // async timeout delay
	mode: 'overlap', // drop tolerance mode
		
	// internal cache
	targets: [], 
	
	// the key name for stored drop data
	datakey: "dropdata",
		
	// prevent bubbling for better performance
	noBubble: true,
	
	// count bound related events
	add: function( obj ){ 
		// read the interaction data
		var data = $.data( this, drop.datakey );
		// count another realted event
		data.related += 1;
	},
	
	// forget unbound related events
	remove: function(){
		$.data( this, drop.datakey ).related -= 1;
	},
	
	// configure the interactions
	setup: function(){
		// check for related events
		if ( $.data( this, drop.datakey ) ) 
			return;
		// initialize the drop element data
		var data = { 
			related: 0,
			active: [],
			anyactive: 0,
			winner: 0,
			location: {}
		};
		// store the drop data on the element
		$.data( this, drop.datakey, data );
		// store the drop target in internal cache
		drop.targets.push( this );
	},
	
	// destroy the configure interaction	
	teardown: function(){ 
		var data = $.data( this, drop.datakey ) || {};
		// check for related events
		if ( data.related ) 
			return;
		// remove the stored data
		$.removeData( this, drop.datakey );
		// reference the targeted element
		var element = this;
		// remove from the internal cache
		drop.targets = $.grep( drop.targets, function( target ){ 
			return ( target !== element ); 
		});
	},
	
	// shared event handler
	handler: function( event, dd ){ 
		// local vars
		var results, $targets;
		// make sure the right data is available
		if ( !dd ) 
			return;
		// handle various events
		switch ( event.type ){
			// draginit, from $.event.special.drag
			case 'mousedown': // DROPINIT >>
			case 'touchstart': // DROPINIT >>
				// collect and assign the drop targets
				$targets =  $( drop.targets );
				if ( typeof dd.drop == "string" )
					$targets = $targets.filter( dd.drop );
				// reset drop data winner properties
				$targets.each(function(){
					var data = $.data( this, drop.datakey );
					data.active = [];
					data.anyactive = 0;
					data.winner = 0;
				});
				// set available target elements
				dd.droppable = $targets;
				// activate drop targets for the initial element being dragged
				$special.drag.hijack( event, "dropinit", dd ); 
				break;
			// drag, from $.event.special.drag
			case 'mousemove': // TOLERATE >>
			case 'touchmove': // TOLERATE >>
				drop.event = event; // store the mousemove event
				if ( !drop.timer )
					// monitor drop targets
					drop.tolerate( dd ); 
				break;
			// dragend, from $.event.special.drag
			case 'mouseup': // DROP >> DROPEND >>
			case 'touchend': // DROP >> DROPEND >>
				drop.timer = clearTimeout( drop.timer ); // delete timer	
				if ( dd.propagates ){
					$special.drag.hijack( event, "drop", dd ); 
					$special.drag.hijack( event, "dropend", dd ); 
				}
				break;
				
		}
	},
		
	// returns the location positions of an element
	locate: function( elem, index ){ 
		var data = $.data( elem, drop.datakey ),
		$elem = $( elem ), 
		posi = $elem.offset() || {}, 
		height = $elem.outerHeight(), 
		width = $elem.outerWidth(),
		location = { 
			elem: elem, 
			width: width, 
			height: height,
			top: posi.top, 
			left: posi.left, 
			right: posi.left + width, 
			bottom: posi.top + height
		};
		// drag elements might not have dropdata
		if ( data ){
			data.location = location;
			data.index = index;
			data.elem = elem;
		}
		return location;
	},
	
	// test the location positions of an element against another OR an X,Y coord
	contains: function( target, test ){ // target { location } contains test [x,y] or { location }
		return ( ( test[0] || test.left ) >= target.left && ( test[0] || test.right ) <= target.right
			&& ( test[1] || test.top ) >= target.top && ( test[1] || test.bottom ) <= target.bottom ); 
	},
	
	// stored tolerance modes
	modes: { // fn scope: "$.event.special.drop" object 
		// target with mouse wins, else target with most overlap wins
		'intersect': function( event, proxy, target ){
			return this.contains( target, [ event.pageX, event.pageY ] ) ? // check cursor
				1e9 : this.modes.overlap.apply( this, arguments ); // check overlap
		},
		// target with most overlap wins	
		'overlap': function( event, proxy, target ){
			// calculate the area of overlap...
			return Math.max( 0, Math.min( target.bottom, proxy.bottom ) - Math.max( target.top, proxy.top ) )
				* Math.max( 0, Math.min( target.right, proxy.right ) - Math.max( target.left, proxy.left ) );
		},
		// proxy is completely contained within target bounds	
		'fit': function( event, proxy, target ){
			return this.contains( target, proxy ) ? 1 : 0;
		},
		// center of the proxy is contained within target bounds	
		'middle': function( event, proxy, target ){
			return this.contains( target, [ proxy.left + proxy.width * .5, proxy.top + proxy.height * .5 ] ) ? 1 : 0;
		}
	},	
	
	// sort drop target cache by by winner (dsc), then index (asc)
	sort: function( a, b ){
		return ( b.winner - a.winner ) || ( a.index - b.index );
	},
		
	// async, recursive tolerance execution
	tolerate: function( dd ){		
		// declare local refs
		var i, drp, drg, data, arr, len, elem,
		// interaction iteration variables
		x = 0, ia, end = dd.interactions.length,
		// determine the mouse coords
		xy = [ drop.event.pageX, drop.event.pageY ],
		// custom or stored tolerance fn
		tolerance = drop.tolerance || drop.modes[ drop.mode ];
		// go through each passed interaction...
		do if ( ia = dd.interactions[x] ){
			// check valid interaction
			if ( !ia )
				return; 
			// initialize or clear the drop data
			ia.drop = [];
			// holds the drop elements
			arr = []; 
			len = ia.droppable.length;
			// determine the proxy location, if needed
			if ( tolerance )
				drg = drop.locate( ia.proxy ); 
			// reset the loop
			i = 0;
			// loop each stored drop target
			do if ( elem = ia.droppable[i] ){ 
				data = $.data( elem, drop.datakey );
				drp = data.location;
				if ( !drp ) continue;
				// find a winner: tolerance function is defined, call it
				data.winner = tolerance ? tolerance.call( drop, drop.event, drg, drp ) 
					// mouse position is always the fallback
					: drop.contains( drp, xy ) ? 1 : 0; 
				arr.push( data );	
			} while ( ++i < len ); // loop 
			// sort the drop targets
			arr.sort( drop.sort );			
			// reset the loop
			i = 0;
			// loop through all of the targets again
			do if ( data = arr[ i ] ){
				// winners...
				if ( data.winner && ia.drop.length < drop.multi ){
					// new winner... dropstart
					if ( !data.active[x] && !data.anyactive ){
						// check to make sure that this is not prevented
						if ( $special.drag.hijack( drop.event, "dropstart", dd, x, data.elem )[0] !== false ){ 	
							data.active[x] = 1;
							data.anyactive += 1;
						}
						// if false, it is not a winner
						else
							data.winner = 0;
					}
					// if it is still a winner
					if ( data.winner )
						ia.drop.push( data.elem );
				}
				// losers... 
				else if ( data.active[x] && data.anyactive == 1 ){
					// former winner... dropend
					$special.drag.hijack( drop.event, "dropend", dd, x, data.elem ); 
					data.active[x] = 0;
					data.anyactive -= 1;
				}
			} while ( ++i < len ); // loop 		
		} while ( ++x < end ) // loop
		// check if the mouse is still moving or is idle
		if ( drop.last && xy[0] == drop.last.pageX && xy[1] == drop.last.pageY ) 
			delete drop.timer; // idle, don't recurse
		else  // recurse
			drop.timer = setTimeout(function(){ 
				drop.tolerate( dd ); 
			}, drop.delay );
		// remember event, to compare idleness
		drop.last = drop.event; 
	}
	
};

// share the same special event configuration with related events...
$special.dropinit = $special.dropstart = $special.dropend = drop;

})(jQuery); // confine scope	;
define("slickgrid/lib/jquery.event.drop", ["jquery"], function(){});

/***
 * Contains core SlickGrid classes.
 * @module Core
 * @namespace Slick
 */

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Event": Event,
      "EventData": EventData,
      "EventHandler": EventHandler,
      "Range": Range,
      "NonDataRow": NonDataItem,
      "Group": Group,
      "GroupTotals": GroupTotals,
      "EditorLock": EditorLock,

      /***
       * A global singleton editor lock.
       * @class GlobalEditorLock
       * @static
       * @constructor
       */
      "GlobalEditorLock": new EditorLock()
    }
  });

  /***
   * An event object for passing data to event handlers and letting them control propagation.
   * <p>This is pretty much identical to how W3C and jQuery implement events.</p>
   * @class EventData
   * @constructor
   */
  function EventData() {
    var isPropagationStopped = false;
    var isImmediatePropagationStopped = false;

    /***
     * Stops event from propagating up the DOM tree.
     * @method stopPropagation
     */
    this.stopPropagation = function () {
      isPropagationStopped = true;
    };

    /***
     * Returns whether stopPropagation was called on this event object.
     * @method isPropagationStopped
     * @return {Boolean}
     */
    this.isPropagationStopped = function () {
      return isPropagationStopped;
    };

    /***
     * Prevents the rest of the handlers from being executed.
     * @method stopImmediatePropagation
     */
    this.stopImmediatePropagation = function () {
      isImmediatePropagationStopped = true;
    };

    /***
     * Returns whether stopImmediatePropagation was called on this event object.\
     * @method isImmediatePropagationStopped
     * @return {Boolean}
     */
    this.isImmediatePropagationStopped = function () {
      return isImmediatePropagationStopped;
    }
  }

  /***
   * A simple publisher-subscriber implementation.
   * @class Event
   * @constructor
   */
  function Event() {
    var handlers = [];

    /***
     * Adds an event handler to be called when the event is fired.
     * <p>Event handler will receive two arguments - an <code>EventData</code> and the <code>data</code>
     * object the event was fired with.<p>
     * @method subscribe
     * @param fn {Function} Event handler.
     */
    this.subscribe = function (fn) {
      handlers.push(fn);
    };

    /***
     * Removes an event handler added with <code>subscribe(fn)</code>.
     * @method unsubscribe
     * @param fn {Function} Event handler to be removed.
     */
    this.unsubscribe = function (fn) {
      for (var i = handlers.length - 1; i >= 0; i--) {
        if (handlers[i] === fn) {
          handlers.splice(i, 1);
        }
      }
    };

    /***
     * Fires an event notifying all subscribers.
     * @method notify
     * @param args {Object} Additional data object to be passed to all handlers.
     * @param e {EventData}
     *      Optional.
     *      An <code>EventData</code> object to be passed to all handlers.
     *      For DOM events, an existing W3C/jQuery event object can be passed in.
     * @param scope {Object}
     *      Optional.
     *      The scope ("this") within which the handler will be executed.
     *      If not specified, the scope will be set to the <code>Event</code> instance.
     */
    this.notify = function (args, e, scope) {
      e = e || new EventData();
      scope = scope || this;

      var returnValue;
      for (var i = 0; i < handlers.length && !(e.isPropagationStopped() || e.isImmediatePropagationStopped()); i++) {
        returnValue = handlers[i].call(scope, e, args);
      }

      return returnValue;
    };
  }

  function EventHandler() {
    var handlers = [];

    this.subscribe = function (event, handler) {
      handlers.push({
        event: event,
        handler: handler
      });
      event.subscribe(handler);

      return this;  // allow chaining
    };

    this.unsubscribe = function (event, handler) {
      var i = handlers.length;
      while (i--) {
        if (handlers[i].event === event &&
            handlers[i].handler === handler) {
          handlers.splice(i, 1);
          event.unsubscribe(handler);
          return;
        }
      }

      return this;  // allow chaining
    };

    this.unsubscribeAll = function () {
      var i = handlers.length;
      while (i--) {
        handlers[i].event.unsubscribe(handlers[i].handler);
      }
      handlers = [];

      return this;  // allow chaining
    }
  }

  /***
   * A structure containing a range of cells.
   * @class Range
   * @constructor
   * @param fromRow {Integer} Starting row.
   * @param fromCell {Integer} Starting cell.
   * @param toRow {Integer} Optional. Ending row. Defaults to <code>fromRow</code>.
   * @param toCell {Integer} Optional. Ending cell. Defaults to <code>fromCell</code>.
   */
  function Range(fromRow, fromCell, toRow, toCell) {
    if (toRow === undefined && toCell === undefined) {
      toRow = fromRow;
      toCell = fromCell;
    }

    /***
     * @property fromRow
     * @type {Integer}
     */
    this.fromRow = Math.min(fromRow, toRow);

    /***
     * @property fromCell
     * @type {Integer}
     */
    this.fromCell = Math.min(fromCell, toCell);

    /***
     * @property toRow
     * @type {Integer}
     */
    this.toRow = Math.max(fromRow, toRow);

    /***
     * @property toCell
     * @type {Integer}
     */
    this.toCell = Math.max(fromCell, toCell);

    /***
     * Returns whether a range represents a single row.
     * @method isSingleRow
     * @return {Boolean}
     */
    this.isSingleRow = function () {
      return this.fromRow == this.toRow;
    };

    /***
     * Returns whether a range represents a single cell.
     * @method isSingleCell
     * @return {Boolean}
     */
    this.isSingleCell = function () {
      return this.fromRow == this.toRow && this.fromCell == this.toCell;
    };

    /***
     * Returns whether a range contains a given cell.
     * @method contains
     * @param row {Integer}
     * @param cell {Integer}
     * @return {Boolean}
     */
    this.contains = function (row, cell) {
      return row >= this.fromRow && row <= this.toRow &&
          cell >= this.fromCell && cell <= this.toCell;
    };

    /***
     * Returns a readable representation of a range.
     * @method toString
     * @return {String}
     */
    this.toString = function () {
      if (this.isSingleCell()) {
        return "(" + this.fromRow + ":" + this.fromCell + ")";
      }
      else {
        return "(" + this.fromRow + ":" + this.fromCell + " - " + this.toRow + ":" + this.toCell + ")";
      }
    }
  }


  /***
   * A base class that all special / non-data rows (like Group and GroupTotals) derive from.
   * @class NonDataItem
   * @constructor
   */
  function NonDataItem() {
    this.__nonDataRow = true;
  }


  /***
   * Information about a group of rows.
   * @class Group
   * @extends Slick.NonDataItem
   * @constructor
   */
  function Group() {
    this.__group = true;

    /**
     * Grouping level, starting with 0.
     * @property level
     * @type {Number}
     */
    this.level = 0;

    /***
     * Number of rows in the group.
     * @property count
     * @type {Integer}
     */
    this.count = 0;

    /***
     * Grouping value.
     * @property value
     * @type {Object}
     */
    this.value = null;

    /***
     * Formatted display value of the group.
     * @property title
     * @type {String}
     */
    this.title = null;

    /***
     * Whether a group is collapsed.
     * @property collapsed
     * @type {Boolean}
     */
    this.collapsed = false;

    /***
     * GroupTotals, if any.
     * @property totals
     * @type {GroupTotals}
     */
    this.totals = null;

    /**
     * Rows that are part of the group.
     * @property rows
     * @type {Array}
     */
    this.rows = [];

    /**
     * Sub-groups that are part of the group.
     * @property groups
     * @type {Array}
     */
    this.groups = null;

    /**
     * A unique key used to identify the group.  This key can be used in calls to DataView
     * collapseGroup() or expandGroup().
     * @property groupingKey
     * @type {Object}
     */
    this.groupingKey = null;
  }

  Group.prototype = new NonDataItem();

  /***
   * Compares two Group instances.
   * @method equals
   * @return {Boolean}
   * @param group {Group} Group instance to compare to.
   */
  Group.prototype.equals = function (group) {
    return this.value === group.value &&
        this.count === group.count &&
        this.collapsed === group.collapsed &&
        this.title === group.title;
  };

  /***
   * Information about group totals.
   * An instance of GroupTotals will be created for each totals row and passed to the aggregators
   * so that they can store arbitrary data in it.  That data can later be accessed by group totals
   * formatters during the display.
   * @class GroupTotals
   * @extends Slick.NonDataItem
   * @constructor
   */
  function GroupTotals() {
    this.__groupTotals = true;

    /***
     * Parent Group.
     * @param group
     * @type {Group}
     */
    this.group = null;

    /***
     * Whether the totals have been fully initialized / calculated.
     * Will be set to false for lazy-calculated group totals.
     * @param initialized
     * @type {Boolean}
     */
    this.initialized = false;
  }

  GroupTotals.prototype = new NonDataItem();

  /***
   * A locking helper to track the active edit controller and ensure that only a single controller
   * can be active at a time.  This prevents a whole class of state and validation synchronization
   * issues.  An edit controller (such as SlickGrid) can query if an active edit is in progress
   * and attempt a commit or cancel before proceeding.
   * @class EditorLock
   * @constructor
   */
  function EditorLock() {
    var activeEditController = null;

    /***
     * Returns true if a specified edit controller is active (has the edit lock).
     * If the parameter is not specified, returns true if any edit controller is active.
     * @method isActive
     * @param editController {EditController}
     * @return {Boolean}
     */
    this.isActive = function (editController) {
      return (editController ? activeEditController === editController : activeEditController !== null);
    };

    /***
     * Sets the specified edit controller as the active edit controller (acquire edit lock).
     * If another edit controller is already active, and exception will be thrown.
     * @method activate
     * @param editController {EditController} edit controller acquiring the lock
     */
    this.activate = function (editController) {
      if (editController === activeEditController) { // already activated?
        return;
      }
      if (activeEditController !== null) {
        throw "SlickGrid.EditorLock.activate: an editController is still active, can't activate another editController";
      }
      if (!editController.commitCurrentEdit) {
        throw "SlickGrid.EditorLock.activate: editController must implement .commitCurrentEdit()";
      }
      if (!editController.cancelCurrentEdit) {
        throw "SlickGrid.EditorLock.activate: editController must implement .cancelCurrentEdit()";
      }
      activeEditController = editController;
    };

    /***
     * Unsets the specified edit controller as the active edit controller (release edit lock).
     * If the specified edit controller is not the active one, an exception will be thrown.
     * @method deactivate
     * @param editController {EditController} edit controller releasing the lock
     */
    this.deactivate = function (editController) {
      if (activeEditController !== editController) {
        throw "SlickGrid.EditorLock.deactivate: specified editController is not the currently active one";
      }
      activeEditController = null;
    };

    /***
     * Attempts to commit the current edit by calling "commitCurrentEdit" method on the active edit
     * controller and returns whether the commit attempt was successful (commit may fail due to validation
     * errors, etc.).  Edit controller's "commitCurrentEdit" must return true if the commit has succeeded
     * and false otherwise.  If no edit controller is active, returns true.
     * @method commitCurrentEdit
     * @return {Boolean}
     */
    this.commitCurrentEdit = function () {
      return (activeEditController ? activeEditController.commitCurrentEdit() : true);
    };

    /***
     * Attempts to cancel the current edit by calling "cancelCurrentEdit" method on the active edit
     * controller and returns whether the edit was successfully cancelled.  If no edit controller is
     * active, returns true.
     * @method cancelCurrentEdit
     * @return {Boolean}
     */
    this.cancelCurrentEdit = function cancelCurrentEdit() {
      return (activeEditController ? activeEditController.cancelCurrentEdit() : true);
    };
  }
})(jQuery);



define("slickgrid/slick.core", ["slickgrid/lib/jquery-ui","slickgrid/lib/jquery.event.drag","slickgrid/lib/jquery.event.drop"], function(){});

/**
 * @license
 * (c) 2009-2013 Michael Leibman
 * michael{dot}leibman{at}gmail{dot}com
 * http://github.com/mleibman/slickgrid
 *
 * Distributed under MIT license.
 * All rights reserved.
 *
 * SlickGrid v2.2
 *
 * NOTES:
 *     Cell/row DOM manipulations are done directly bypassing jQuery's DOM manipulation methods.
 *     This increases the speed dramatically, but can only be done safely because there are no event handlers
 *     or data associated with any cell/row DOM nodes.  Cell editors must make sure they implement .destroy()
 *     and do proper cleanup.
 */

// make sure required JavaScript modules are loaded
if (typeof jQuery === "undefined") {
  throw "SlickGrid requires jquery module to be loaded";
}
if (!jQuery.fn.drag) {
  throw "SlickGrid requires jquery.event.drag module to be loaded";
}
if (typeof Slick === "undefined") {
  throw "slick.core.js not loaded";
}


(function ($) {
  // Slick.Grid
  $.extend(true, window, {
    Slick: {
      Grid: SlickGrid
    }
  });

  // shared across all grids on the page
  var scrollbarDimensions;
  var maxSupportedCssHeight;  // browser's breaking point

  //////////////////////////////////////////////////////////////////////////////////////////////
  // SlickGrid class implementation (available as Slick.Grid)

  /**
   * Creates a new instance of the grid.
   * @class SlickGrid
   * @constructor
   * @param {Node}              container   Container node to create the grid in.
   * @param {Array,Object}      data        An array of objects for databinding.
   * @param {Array}             columns     An array of column definitions.
   * @param {Object}            options     Grid options.
   **/
  function SlickGrid(container, data, columns, options) {
    // settings
    var defaults = {
      explicitInitialization: false,
      rowHeight: 25,
      defaultColumnWidth: 80,
      enableAddRow: false,
      leaveSpaceForNewRows: false,
      editable: false,
      autoEdit: true,
      enableCellNavigation: true,
      enableColumnReorder: true,
      asyncEditorLoading: false,
      asyncEditorLoadDelay: 100,
      forceFitColumns: false,
      enableAsyncPostRender: false,
      asyncPostRenderDelay: 50,
      autoHeight: false,
      editorLock: Slick.GlobalEditorLock,
      showHeaderRow: false,
      headerRowHeight: 25,
      showTopPanel: false,
      topPanelHeight: 25,
      formatterFactory: null,
      editorFactory: null,
      cellFlashingCssClass: "flashing",
      selectedCellCssClass: "selected",
      multiSelect: true,
      enableTextSelectionOnCells: false,
      dataItemColumnValueExtractor: null,
      fullWidthRows: false,
      multiColumnSort: false,
      defaultFormatter: defaultFormatter,
      forceSyncScrolling: false,
      addNewRowCssClass: "new-row"
    };

    var columnDefaults = {
      name: "",
      resizable: true,
      sortable: false,
      minWidth: 30,
      rerenderOnResize: false,
      headerCssClass: null,
      defaultSortAsc: true,
      focusable: true,
      selectable: true
    };

    // scroller
    var th;   // virtual height
    var h;    // real scrollable height
    var ph;   // page height
    var n;    // number of pages
    var cj;   // "jumpiness" coefficient

    var page = 0;       // current page
    var offset = 0;     // current page offset
    var vScrollDir = 1;

    // private
    var initialized = false;
    var $container;
    var uid = "slickgrid_" + Math.round(1000000 * Math.random());
    var self = this;
    var $focusSink, $focusSink2;
    var $headerScroller;
    var $headers;
    var $headerRow, $headerRowScroller, $headerRowSpacer;
    var $topPanelScroller;
    var $topPanel;
    var $viewport;
    var $canvas;
    var $style;
    var $boundAncestors;
    var stylesheet, columnCssRulesL, columnCssRulesR;
    var viewportH, viewportW;
    var canvasWidth;
    var viewportHasHScroll, viewportHasVScroll;
    var headerColumnWidthDiff = 0, headerColumnHeightDiff = 0, // border+padding
        cellWidthDiff = 0, cellHeightDiff = 0;
    var absoluteColumnMinWidth;

    var tabbingDirection = 1;
    var activePosX;
    var activeRow, activeCell;
    var activeCellNode = null;
    var currentEditor = null;
    var serializedEditorValue;
    var editController;

    var rowsCache = {};
    var renderedRows = 0;
    var numVisibleRows;
    var prevScrollTop = 0;
    var scrollTop = 0;
    var lastRenderedScrollTop = 0;
    var lastRenderedScrollLeft = 0;
    var prevScrollLeft = 0;
    var scrollLeft = 0;

    var selectionModel;
    var selectedRows = [];

    var plugins = [];
    var cellCssClasses = {};

    var columnsById = {};
    var sortColumns = [];
    var columnPosLeft = [];
    var columnPosRight = [];


    // async call handles
    var h_editorLoader = null;
    var h_render = null;
    var h_postrender = null;
    var postProcessedRows = {};
    var postProcessToRow = null;
    var postProcessFromRow = null;

    // perf counters
    var counter_rows_rendered = 0;
    var counter_rows_removed = 0;

    // These two variables work around a bug with inertial scrolling in Webkit/Blink on Mac.
    // See http://crbug.com/312427.
    var rowNodeFromLastMouseWheelEvent;  // this node must not be deleted while inertial scrolling
    var zombieRowNodeFromLastMouseWheelEvent;  // node that was hidden instead of getting deleted


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Initialization

    function init() {
      $container = $(container);
      if ($container.length < 1) {
        throw new Error("SlickGrid requires a valid container, " + container + " does not exist in the DOM.");
      }

      // calculate these only once and share between grid instances
      maxSupportedCssHeight = maxSupportedCssHeight || getMaxSupportedCssHeight();
      scrollbarDimensions = scrollbarDimensions || measureScrollbar();

      options = $.extend({}, defaults, options);
      validateAndEnforceOptions();
      columnDefaults.width = options.defaultColumnWidth;

      columnsById = {};
      for (var i = 0; i < columns.length; i++) {
        var m = columns[i] = $.extend({}, columnDefaults, columns[i]);
        columnsById[m.id] = i;
        if (m.minWidth && m.width < m.minWidth) {
          m.width = m.minWidth;
        }
        if (m.maxWidth && m.width > m.maxWidth) {
          m.width = m.maxWidth;
        }
      }

      // validate loaded JavaScript modules against requested options
      if (options.enableColumnReorder && !$.fn.sortable) {
        throw new Error("SlickGrid's 'enableColumnReorder = true' option requires jquery-ui.sortable module to be loaded");
      }

      editController = {
        "commitCurrentEdit": commitCurrentEdit,
        "cancelCurrentEdit": cancelCurrentEdit
      };

      $container
          .empty()
          .css("overflow", "hidden")
          .css("outline", 0)
          .addClass(uid)
          .addClass("ui-widget");

      // set up a positioning container if needed
      if (!/relative|absolute|fixed/.test($container.css("position"))) {
        $container.css("position", "relative");
      }

      $focusSink = $("<div tabIndex='0' hideFocus style='position:fixed;width:0;height:0;top:0;left:0;outline:0;'></div>").appendTo($container);

      $headerScroller = $("<div class='slick-header ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($container);
      $headers = $("<div class='slick-header-columns' style='left:-1000px' />").appendTo($headerScroller);
      $headers.width(getHeadersWidth());

      $headerRowScroller = $("<div class='slick-headerrow ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($container);
      $headerRow = $("<div class='slick-headerrow-columns' />").appendTo($headerRowScroller);
      $headerRowSpacer = $("<div style='display:block;height:1px;position:absolute;top:0;left:0;'></div>")
          .css("width", getCanvasWidth() + scrollbarDimensions.width + "px")
          .appendTo($headerRowScroller);

      $topPanelScroller = $("<div class='slick-top-panel-scroller ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($container);
      $topPanel = $("<div class='slick-top-panel' style='width:10000px' />").appendTo($topPanelScroller);

      if (!options.showTopPanel) {
        $topPanelScroller.hide();
      }

      if (!options.showHeaderRow) {
        $headerRowScroller.hide();
      }

      $viewport = $("<div class='slick-viewport-shadow' style='width:100%;height:100%;position:absolute;'></div>").appendTo($container);
      $viewport = $("<div class='slick-viewport' style='width:100%;overflow:auto;outline:0;position:relative;;'>").appendTo($container);
      $viewport.css("overflow-y", options.autoHeight ? "hidden" : "auto");

      $canvas = $("<div class='grid-canvas' />").appendTo($viewport);

      $focusSink2 = $focusSink.clone().appendTo($container);

      if (!options.explicitInitialization) {
        finishInitialization();
      }
    }

    function finishInitialization() {
      if (!initialized) {
        initialized = true;

        viewportW = parseFloat($.css($container[0], "width", true));

        // header columns and cells may have different padding/border skewing width calculations (box-sizing, hello?)
        // calculate the diff so we can set consistent sizes
        measureCellPaddingAndBorder();

        // for usability reasons, all text selection in SlickGrid is disabled
        // with the exception of input and textarea elements (selection must
        // be enabled there so that editors work as expected); note that
        // selection in grid cells (grid body) is already unavailable in
        // all browsers except IE
        disableSelection($headers); // disable all text selection in header (including input and textarea)

        if (!options.enableTextSelectionOnCells) {
          // disable text selection in grid cells except in input and textarea elements
          // (this is IE-specific, because selectstart event will only fire in IE)
          $viewport.bind("selectstart.ui", function (event) {
            return $(event.target).is("input,textarea");
          });
        }

        updateColumnCaches();
        createColumnHeaders();
        setupColumnSort();
        createCssRules();
        resizeCanvas();
        bindAncestorScrollEvents();

        $container
            .bind("resize.slickgrid", resizeCanvas);
        $viewport
            //.bind("click", handleClick)
            .bind("scroll", handleScroll);
        $headerScroller
            .bind("contextmenu", handleHeaderContextMenu)
            .bind("click", handleHeaderClick)
            .delegate(".slick-header-column", "mouseenter", handleHeaderMouseEnter)
            .delegate(".slick-header-column", "mouseleave", handleHeaderMouseLeave);
        $headerRowScroller
            .bind("scroll", handleHeaderRowScroll);
        $focusSink.add($focusSink2)
            .bind("keydown", handleKeyDown);
        $canvas
            .bind("keydown", handleKeyDown)
            .bind("click", handleClick)
            .bind("dblclick", handleDblClick)
            .bind("contextmenu", handleContextMenu)
            .bind("draginit", handleDragInit)
            .bind("dragstart", {distance: 3}, handleDragStart)
            .bind("drag", handleDrag)
            .bind("dragend", handleDragEnd)
            .delegate(".slick-cell", "mouseenter", handleMouseEnter)
            .delegate(".slick-cell", "mouseleave", handleMouseLeave);

        // Work around http://crbug.com/312427.
        if (navigator.userAgent.toLowerCase().match(/webkit/) &&
            navigator.userAgent.toLowerCase().match(/macintosh/)) {
          $canvas.bind("mousewheel", handleMouseWheel);
        }
      }
    }

    function registerPlugin(plugin) {
      plugins.unshift(plugin);
      plugin.init(self);
    }

    function unregisterPlugin(plugin) {
      for (var i = plugins.length; i >= 0; i--) {
        if (plugins[i] === plugin) {
          if (plugins[i].destroy) {
            plugins[i].destroy();
          }
          plugins.splice(i, 1);
          break;
        }
      }
    }

    function setSelectionModel(model) {
      if (selectionModel) {
        selectionModel.onSelectedRangesChanged.unsubscribe(handleSelectedRangesChanged);
        if (selectionModel.destroy) {
          selectionModel.destroy();
        }
      }

      selectionModel = model;
      if (selectionModel) {
        selectionModel.init(self);
        selectionModel.onSelectedRangesChanged.subscribe(handleSelectedRangesChanged);
      }
    }

    function getSelectionModel() {
      return selectionModel;
    }

    function getCanvasNode() {
      return $canvas[0];
    }

    function measureScrollbar() {
      var $c = $("<div style='position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;'></div>").appendTo("body");
      var dim = {
        width: $c.width() - $c[0].clientWidth,
        height: $c.height() - $c[0].clientHeight
      };
      $c.remove();
      return dim;
    }

    function getHeadersWidth() {
      var headersWidth = 0;
      for (var i = 0, ii = columns.length; i < ii; i++) {
        var width = columns[i].width;
        headersWidth += width;
      }
      headersWidth += scrollbarDimensions.width;
      return Math.max(headersWidth, viewportW) + 1000;
    }

    function getCanvasWidth() {
      var availableWidth = viewportHasVScroll ? viewportW - scrollbarDimensions.width : viewportW;
      var rowWidth = 0;
      var i = columns.length;
      while (i--) {
        rowWidth += columns[i].width;
      }
      return options.fullWidthRows ? Math.max(rowWidth, availableWidth) : rowWidth;
    }

    function updateCanvasWidth(forceColumnWidthsUpdate) {
      var oldCanvasWidth = canvasWidth;
      canvasWidth = getCanvasWidth();

      if (canvasWidth != oldCanvasWidth) {
        $canvas.width(canvasWidth);
        $headerRow.width(canvasWidth);
        $headers.width(getHeadersWidth());
        viewportHasHScroll = (canvasWidth > viewportW - scrollbarDimensions.width);
      }

      $headerRowSpacer.width(canvasWidth + (viewportHasVScroll ? scrollbarDimensions.width : 0));

      if (canvasWidth != oldCanvasWidth || forceColumnWidthsUpdate) {
        applyColumnWidths();
      }
    }

    function disableSelection($target) {
      if ($target && $target.jquery) {
        $target
            .attr("unselectable", "on")
            .css("MozUserSelect", "none")
            .bind("selectstart.ui", function () {
              return false;
            }); // from jquery:ui.core.js 1.7.2
      }
    }

    function getMaxSupportedCssHeight() {
      var supportedHeight = 1000000;
      // FF reports the height back but still renders blank after ~6M px
      var testUpTo = navigator.userAgent.toLowerCase().match(/firefox/) ? 6000000 : 1000000000;
      var div = $("<div style='display:none' />").appendTo(document.body);

      while (true) {
        var test = supportedHeight * 2;
        div.css("height", test);
        if (test > testUpTo || div.height() !== test) {
          break;
        } else {
          supportedHeight = test;
        }
      }

      div.remove();
      return supportedHeight;
    }

    // TODO:  this is static.  need to handle page mutation.
    function bindAncestorScrollEvents() {
      var elem = $canvas[0];
      while ((elem = elem.parentNode) != document.body && elem != null) {
        // bind to scroll containers only
        if (elem == $viewport[0] || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
          var $elem = $(elem);
          if (!$boundAncestors) {
            $boundAncestors = $elem;
          } else {
            $boundAncestors = $boundAncestors.add($elem);
          }
          $elem.bind("scroll." + uid, handleActiveCellPositionChange);
        }
      }
    }

    function unbindAncestorScrollEvents() {
      if (!$boundAncestors) {
        return;
      }
      $boundAncestors.unbind("scroll." + uid);
      $boundAncestors = null;
    }

    function updateColumnHeader(columnId, title, toolTip) {
      if (!initialized) { return; }
      var idx = getColumnIndex(columnId);
      if (idx == null) {
        return;
      }

      var columnDef = columns[idx];
      var $header = $headers.children().eq(idx);
      if ($header) {
        if (title !== undefined) {
          columns[idx].name = title;
        }
        if (toolTip !== undefined) {
          columns[idx].toolTip = toolTip;
        }

        trigger(self.onBeforeHeaderCellDestroy, {
          "node": $header[0],
          "column": columnDef
        });

        $header
            .attr("title", toolTip || "")
            .children().eq(0).html(title);

        trigger(self.onHeaderCellRendered, {
          "node": $header[0],
          "column": columnDef
        });
      }
    }

    function getHeaderRow() {
      return $headerRow[0];
    }

    function getHeaderRowColumn(columnId) {
      var idx = getColumnIndex(columnId);
      var $header = $headerRow.children().eq(idx);
      return $header && $header[0];
    }

    function createColumnHeaders() {
      function onMouseEnter() {
        $(this).addClass("ui-state-hover");
      }

      function onMouseLeave() {
        $(this).removeClass("ui-state-hover");
      }

      $headers.find(".slick-header-column")
        .each(function() {
          var columnDef = $(this).data("column");
          if (columnDef) {
            trigger(self.onBeforeHeaderCellDestroy, {
              "node": this,
              "column": columnDef
            });
          }
        });
      $headers.empty();
      $headers.width(getHeadersWidth());

      $headerRow.find(".slick-headerrow-column")
        .each(function() {
          var columnDef = $(this).data("column");
          if (columnDef) {
            trigger(self.onBeforeHeaderRowCellDestroy, {
              "node": this,
              "column": columnDef
            });
          }
        });
      $headerRow.empty();

      for (var i = 0; i < columns.length; i++) {
        var m = columns[i];

        var header = $("<div class='ui-state-default slick-header-column' />")
            .html("<span class='slick-column-name'>" + m.name + "</span>")
            .width(m.width - headerColumnWidthDiff)
            .attr("id", "" + uid + m.id)
            .attr("title", m.toolTip || "")
            .data("column", m)
            .addClass(m.headerCssClass || "")
            .appendTo($headers);

        if (options.enableColumnReorder || m.sortable) {
          header
            .on('mouseenter', onMouseEnter)
            .on('mouseleave', onMouseLeave);
        }

        if (m.sortable) {
          header.addClass("slick-header-sortable");
          header.append("<span class='slick-sort-indicator' />");
        }

        trigger(self.onHeaderCellRendered, {
          "node": header[0],
          "column": m
        });

        if (options.showHeaderRow) {
          var headerRowCell = $("<div class='ui-state-default slick-headerrow-column l" + i + " r" + i + "'></div>")
              .data("column", m)
              .appendTo($headerRow);

          trigger(self.onHeaderRowCellRendered, {
            "node": headerRowCell[0],
            "column": m
          });
        }
      }

      setSortColumns(sortColumns);
      setupColumnResize();
      if (options.enableColumnReorder) {
        setupColumnReorder();
      }
    }

    function setupColumnSort() {
      $headers.click(function (e) {
        // temporary workaround for a bug in jQuery 1.7.1 (http://bugs.jquery.com/ticket/11328)
        e.metaKey = e.metaKey || e.ctrlKey;

        if ($(e.target).hasClass("slick-resizable-handle")) {
          return;
        }

        var $col = $(e.target).closest(".slick-header-column");
        if (!$col.length) {
          return;
        }

        var column = $col.data("column");
        if (column.sortable) {
          if (!getEditorLock().commitCurrentEdit()) {
            return;
          }

          var sortOpts = null;
          var i = 0;
          for (; i < sortColumns.length; i++) {
            if (sortColumns[i].columnId == column.id) {
              sortOpts = sortColumns[i];
              sortOpts.sortAsc = !sortOpts.sortAsc;
              break;
            }
          }

          if (e.metaKey && options.multiColumnSort) {
            if (sortOpts) {
              sortColumns.splice(i, 1);
            }
          }
          else {
            if ((!e.shiftKey && !e.metaKey) || !options.multiColumnSort) {
              sortColumns = [];
            }

            if (!sortOpts) {
              sortOpts = { columnId: column.id, sortAsc: column.defaultSortAsc };
              sortColumns.push(sortOpts);
            } else if (sortColumns.length == 0) {
              sortColumns.push(sortOpts);
            }
          }

          setSortColumns(sortColumns);

          if (!options.multiColumnSort) {
            trigger(self.onSort, {
              multiColumnSort: false,
              sortCol: column,
              sortAsc: sortOpts.sortAsc}, e);
          } else {
            trigger(self.onSort, {
              multiColumnSort: true,
              sortCols: $.map(sortColumns, function(col) {
                return {sortCol: columns[getColumnIndex(col.columnId)], sortAsc: col.sortAsc };
              })}, e);
          }
        }
      });
    }

    function setupColumnReorder() {
      $headers.filter(":ui-sortable").sortable("destroy");
      $headers.sortable({
        containment: "parent",
        distance: 3,
        axis: "x",
        cursor: "default",
        tolerance: "intersection",
        helper: "clone",
        placeholder: "slick-sortable-placeholder ui-state-default slick-header-column",
        start: function (e, ui) {
          ui.placeholder.width(ui.helper.outerWidth() - headerColumnWidthDiff);
          $(ui.helper).addClass("slick-header-column-active");
        },
        beforeStop: function (e, ui) {
          $(ui.helper).removeClass("slick-header-column-active");
        },
        stop: function (e) {
          if (!getEditorLock().commitCurrentEdit()) {
            $(this).sortable("cancel");
            return;
          }

          var reorderedIds = $headers.sortable("toArray");
          var reorderedColumns = [];
          for (var i = 0; i < reorderedIds.length; i++) {
            reorderedColumns.push(columns[getColumnIndex(reorderedIds[i].replace(uid, ""))]);
          }
          setColumns(reorderedColumns);

          trigger(self.onColumnsReordered, {});
          e.stopPropagation();
          setupColumnResize();
        }
      });
    }

    function setupColumnResize() {
      var $col, j, c, pageX, columnElements, minPageX, maxPageX, firstResizable, lastResizable;
      columnElements = $headers.children();
      columnElements.find(".slick-resizable-handle").remove();
      columnElements.each(function (i, e) {
        if (columns[i].resizable) {
          if (firstResizable === undefined) {
            firstResizable = i;
          }
          lastResizable = i;
        }
      });
      if (firstResizable === undefined) {
        return;
      }
      columnElements.each(function (i, e) {
        if (i < firstResizable || (options.forceFitColumns && i >= lastResizable)) {
          return;
        }
        $col = $(e);
        $("<div class='slick-resizable-handle' />")
            .appendTo(e)
            .bind("dragstart", function (e, dd) {
              if (!getEditorLock().commitCurrentEdit()) {
                return false;
              }
              pageX = e.pageX;
              $(this).parent().addClass("slick-header-column-active");
              var shrinkLeewayOnRight = null, stretchLeewayOnRight = null;
              // lock each column's width option to current width
              columnElements.each(function (i, e) {
                columns[i].previousWidth = $(e).outerWidth();
              });
              if (options.forceFitColumns) {
                shrinkLeewayOnRight = 0;
                stretchLeewayOnRight = 0;
                // colums on right affect maxPageX/minPageX
                for (j = i + 1; j < columnElements.length; j++) {
                  c = columns[j];
                  if (c.resizable) {
                    if (stretchLeewayOnRight !== null) {
                      if (c.maxWidth) {
                        stretchLeewayOnRight += c.maxWidth - c.previousWidth;
                      } else {
                        stretchLeewayOnRight = null;
                      }
                    }
                    shrinkLeewayOnRight += c.previousWidth - Math.max(c.minWidth || 0, absoluteColumnMinWidth);
                  }
                }
              }
              var shrinkLeewayOnLeft = 0, stretchLeewayOnLeft = 0;
              for (j = 0; j <= i; j++) {
                // columns on left only affect minPageX
                c = columns[j];
                if (c.resizable) {
                  if (stretchLeewayOnLeft !== null) {
                    if (c.maxWidth) {
                      stretchLeewayOnLeft += c.maxWidth - c.previousWidth;
                    } else {
                      stretchLeewayOnLeft = null;
                    }
                  }
                  shrinkLeewayOnLeft += c.previousWidth - Math.max(c.minWidth || 0, absoluteColumnMinWidth);
                }
              }
              if (shrinkLeewayOnRight === null) {
                shrinkLeewayOnRight = 100000;
              }
              if (shrinkLeewayOnLeft === null) {
                shrinkLeewayOnLeft = 100000;
              }
              if (stretchLeewayOnRight === null) {
                stretchLeewayOnRight = 100000;
              }
              if (stretchLeewayOnLeft === null) {
                stretchLeewayOnLeft = 100000;
              }
              maxPageX = pageX + Math.min(shrinkLeewayOnRight, stretchLeewayOnLeft);
              minPageX = pageX - Math.min(shrinkLeewayOnLeft, stretchLeewayOnRight);
            })
            .bind("drag", function (e, dd) {
              var actualMinWidth, d = Math.min(maxPageX, Math.max(minPageX, e.pageX)) - pageX, x;
              if (d < 0) { // shrink column
                x = d;
                for (j = i; j >= 0; j--) {
                  c = columns[j];
                  if (c.resizable) {
                    actualMinWidth = Math.max(c.minWidth || 0, absoluteColumnMinWidth);
                    if (x && c.previousWidth + x < actualMinWidth) {
                      x += c.previousWidth - actualMinWidth;
                      c.width = actualMinWidth;
                    } else {
                      c.width = c.previousWidth + x;
                      x = 0;
                    }
                  }
                }

                if (options.forceFitColumns) {
                  x = -d;
                  for (j = i + 1; j < columnElements.length; j++) {
                    c = columns[j];
                    if (c.resizable) {
                      if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
                        x -= c.maxWidth - c.previousWidth;
                        c.width = c.maxWidth;
                      } else {
                        c.width = c.previousWidth + x;
                        x = 0;
                      }
                    }
                  }
                }
              } else { // stretch column
                x = d;
                for (j = i; j >= 0; j--) {
                  c = columns[j];
                  if (c.resizable) {
                    if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
                      x -= c.maxWidth - c.previousWidth;
                      c.width = c.maxWidth;
                    } else {
                      c.width = c.previousWidth + x;
                      x = 0;
                    }
                  }
                }

                if (options.forceFitColumns) {
                  x = -d;
                  for (j = i + 1; j < columnElements.length; j++) {
                    c = columns[j];
                    if (c.resizable) {
                      actualMinWidth = Math.max(c.minWidth || 0, absoluteColumnMinWidth);
                      if (x && c.previousWidth + x < actualMinWidth) {
                        x += c.previousWidth - actualMinWidth;
                        c.width = actualMinWidth;
                      } else {
                        c.width = c.previousWidth + x;
                        x = 0;
                      }
                    }
                  }
                }
              }
              applyColumnHeaderWidths();
              if (options.syncColumnCellResize) {
                applyColumnWidths();
              }
            })
            .bind("dragend", function (e, dd) {
              var newWidth;
              $(this).parent().removeClass("slick-header-column-active");
              for (j = 0; j < columnElements.length; j++) {
                c = columns[j];
                newWidth = $(columnElements[j]).outerWidth();

                if (c.previousWidth !== newWidth && c.rerenderOnResize) {
                  invalidateAllRows();
                }
              }
              updateCanvasWidth(true);
              render();
              trigger(self.onColumnsResized, {});
            });
      });
    }

    function getVBoxDelta($el) {
      var p = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"];
      var delta = 0;
      $.each(p, function (n, val) {
        delta += parseFloat($el.css(val)) || 0;
      });
      return delta;
    }

    function measureCellPaddingAndBorder() {
      var el;
      var h = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"];
      var v = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"];

      el = $("<div class='ui-state-default slick-header-column' style='visibility:hidden'>-</div>").appendTo($headers);
      headerColumnWidthDiff = headerColumnHeightDiff = 0;
      if (el.css("box-sizing") != "border-box" && el.css("-moz-box-sizing") != "border-box" && el.css("-webkit-box-sizing") != "border-box") {
        $.each(h, function (n, val) {
          headerColumnWidthDiff += parseFloat(el.css(val)) || 0;
        });
        $.each(v, function (n, val) {
          headerColumnHeightDiff += parseFloat(el.css(val)) || 0;
        });
      }
      el.remove();

      var r = $("<div class='slick-row' />").appendTo($canvas);
      el = $("<div class='slick-cell' id='' style='visibility:hidden'>-</div>").appendTo(r);
      cellWidthDiff = cellHeightDiff = 0;
      if (el.css("box-sizing") != "border-box" && el.css("-moz-box-sizing") != "border-box" && el.css("-webkit-box-sizing") != "border-box") {
        $.each(h, function (n, val) {
          cellWidthDiff += parseFloat(el.css(val)) || 0;
        });
        $.each(v, function (n, val) {
          cellHeightDiff += parseFloat(el.css(val)) || 0;
        });
      }
      r.remove();

      absoluteColumnMinWidth = Math.max(headerColumnWidthDiff, cellWidthDiff);
    }

    function createCssRules() {
      $style = $("<style type='text/css' rel='stylesheet' />").appendTo($("head"));
      var rowHeight = (options.rowHeight - cellHeightDiff);
      var rules = [
        "." + uid + " .slick-header-column { left: 1000px; }",
        "." + uid + " .slick-top-panel { height:" + options.topPanelHeight + "px; }",
        "." + uid + " .slick-headerrow-columns { height:" + options.headerRowHeight + "px; }",
        "." + uid + " .slick-cell { height:" + rowHeight + "px; }",
        "." + uid + " .slick-row { height:" + options.rowHeight + "px; }"
      ];

      for (var i = 0; i < columns.length; i++) {
        rules.push("." + uid + " .l" + i + " { }");
        rules.push("." + uid + " .r" + i + " { }");
      }

      if ($style[0].styleSheet) { // IE
        $style[0].styleSheet.cssText = rules.join(" ");
      } else {
        $style[0].appendChild(document.createTextNode(rules.join(" ")));
      }
    }

    function getColumnCssRules(idx) {
      if (!stylesheet) {
        var sheets = document.styleSheets;
        for (var i = 0; i < sheets.length; i++) {
          if ((sheets[i].ownerNode || sheets[i].owningElement) == $style[0]) {
            stylesheet = sheets[i];
            break;
          }
        }

        if (!stylesheet) {
          throw new Error("Cannot find stylesheet.");
        }

        // find and cache column CSS rules
        columnCssRulesL = [];
        columnCssRulesR = [];
        var cssRules = (stylesheet.cssRules || stylesheet.rules);
        var matches, columnIdx;
        for (var i = 0; i < cssRules.length; i++) {
          var selector = cssRules[i].selectorText;
          if (matches = /\.l\d+/.exec(selector)) {
            columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
            columnCssRulesL[columnIdx] = cssRules[i];
          } else if (matches = /\.r\d+/.exec(selector)) {
            columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
            columnCssRulesR[columnIdx] = cssRules[i];
          }
        }
      }

      return {
        "left": columnCssRulesL[idx],
        "right": columnCssRulesR[idx]
      };
    }

    function removeCssRules() {
      $style.remove();
      stylesheet = null;
    }

    function destroy() {
      getEditorLock().cancelCurrentEdit();

      trigger(self.onBeforeDestroy, {});

      var i = plugins.length;
      while(i--) {
        unregisterPlugin(plugins[i]);
      }

      if (options.enableColumnReorder) {
          $headers.filter(":ui-sortable").sortable("destroy");
      }

      unbindAncestorScrollEvents();
      $container.unbind(".slickgrid");
      removeCssRules();

      $canvas.unbind("draginit dragstart dragend drag");
      $container.empty().removeClass(uid);
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // General

    function trigger(evt, args, e) {
      e = e || new Slick.EventData();
      args = args || {};
      args.grid = self;
      return evt.notify(args, e, self);
    }

    function getEditorLock() {
      return options.editorLock;
    }

    function getEditController() {
      return editController;
    }

    function getColumnIndex(id) {
      return columnsById[id];
    }

    function autosizeColumns() {
      var i, c,
          widths = [],
          shrinkLeeway = 0,
          total = 0,
          prevTotal,
          availWidth = viewportHasVScroll ? viewportW - scrollbarDimensions.width : viewportW;

      for (i = 0; i < columns.length; i++) {
        c = columns[i];
        widths.push(c.width);
        total += c.width;
        if (c.resizable) {
          shrinkLeeway += c.width - Math.max(c.minWidth, absoluteColumnMinWidth);
        }
      }

      // shrink
      prevTotal = total;
      while (total > availWidth && shrinkLeeway) {
        var shrinkProportion = (total - availWidth) / shrinkLeeway;
        for (i = 0; i < columns.length && total > availWidth; i++) {
          c = columns[i];
          var width = widths[i];
          if (!c.resizable || width <= c.minWidth || width <= absoluteColumnMinWidth) {
            continue;
          }
          var absMinWidth = Math.max(c.minWidth, absoluteColumnMinWidth);
          var shrinkSize = Math.floor(shrinkProportion * (width - absMinWidth)) || 1;
          shrinkSize = Math.min(shrinkSize, width - absMinWidth);
          total -= shrinkSize;
          shrinkLeeway -= shrinkSize;
          widths[i] -= shrinkSize;
        }
        if (prevTotal <= total) {  // avoid infinite loop
          break;
        }
        prevTotal = total;
      }

      // grow
      prevTotal = total;
      while (total < availWidth) {
        var growProportion = availWidth / total;
        for (i = 0; i < columns.length && total < availWidth; i++) {
          c = columns[i];
          var currentWidth = widths[i];
          var growSize;

          if (!c.resizable || c.maxWidth <= currentWidth) {
            growSize = 0;
          } else {
            growSize = Math.min(Math.floor(growProportion * currentWidth) - currentWidth, (c.maxWidth - currentWidth) || 1000000) || 1;
          }
          total += growSize;
          widths[i] += growSize;
        }
        if (prevTotal >= total) {  // avoid infinite loop
          break;
        }
        prevTotal = total;
      }

      var reRender = false;
      for (i = 0; i < columns.length; i++) {
        if (columns[i].rerenderOnResize && columns[i].width != widths[i]) {
          reRender = true;
        }
        columns[i].width = widths[i];
      }

      applyColumnHeaderWidths();
      updateCanvasWidth(true);
      if (reRender) {
        invalidateAllRows();
        render();
      }
    }

    function applyColumnHeaderWidths() {
      if (!initialized) { return; }
      var h;
      for (var i = 0, headers = $headers.children(), ii = headers.length; i < ii; i++) {
        h = $(headers[i]);
        if (h.width() !== columns[i].width - headerColumnWidthDiff) {
          h.width(columns[i].width - headerColumnWidthDiff);
        }
      }

      updateColumnCaches();
    }

    function applyColumnWidths() {
      var x = 0, w, rule;
      for (var i = 0; i < columns.length; i++) {
        w = columns[i].width;

        rule = getColumnCssRules(i);
        rule.left.style.left = x + "px";
        rule.right.style.right = (canvasWidth - x - w) + "px";

        x += columns[i].width;
      }
    }

    function setSortColumn(columnId, ascending) {
      setSortColumns([{ columnId: columnId, sortAsc: ascending}]);
    }

    function setSortColumns(cols) {
      sortColumns = cols;

      var headerColumnEls = $headers.children();
      headerColumnEls
          .removeClass("slick-header-column-sorted")
          .find(".slick-sort-indicator")
              .removeClass("slick-sort-indicator-asc slick-sort-indicator-desc");

      $.each(sortColumns, function(i, col) {
        if (col.sortAsc == null) {
          col.sortAsc = true;
        }
        var columnIndex = getColumnIndex(col.columnId);
        if (columnIndex != null) {
          headerColumnEls.eq(columnIndex)
              .addClass("slick-header-column-sorted")
              .find(".slick-sort-indicator")
                  .addClass(col.sortAsc ? "slick-sort-indicator-asc" : "slick-sort-indicator-desc");
        }
      });
    }

    function getSortColumns() {
      return sortColumns;
    }

    function handleSelectedRangesChanged(e, ranges) {
      selectedRows = [];
      var hash = {};
      for (var i = 0; i < ranges.length; i++) {
        for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
          if (!hash[j]) {  // prevent duplicates
            selectedRows.push(j);
            hash[j] = {};
          }
          for (var k = ranges[i].fromCell; k <= ranges[i].toCell; k++) {
            if (canCellBeSelected(j, k)) {
              hash[j][columns[k].id] = options.selectedCellCssClass;
            }
          }
        }
      }

      setCellCssStyles(options.selectedCellCssClass, hash);

      trigger(self.onSelectedRowsChanged, {rows: getSelectedRows()}, e);
    }

    function getColumns() {
      return columns;
    }

    function updateColumnCaches() {
      // Pre-calculate cell boundaries.
      columnPosLeft = [];
      columnPosRight = [];
      var x = 0;
      for (var i = 0, ii = columns.length; i < ii; i++) {
        columnPosLeft[i] = x;
        columnPosRight[i] = x + columns[i].width;
        x += columns[i].width;
      }
    }

    function setColumns(columnDefinitions) {
      columns = columnDefinitions;

      columnsById = {};
      for (var i = 0; i < columns.length; i++) {
        var m = columns[i] = $.extend({}, columnDefaults, columns[i]);
        columnsById[m.id] = i;
        if (m.minWidth && m.width < m.minWidth) {
          m.width = m.minWidth;
        }
        if (m.maxWidth && m.width > m.maxWidth) {
          m.width = m.maxWidth;
        }
      }

      updateColumnCaches();

      if (initialized) {
        invalidateAllRows();
        createColumnHeaders();
        removeCssRules();
        createCssRules();
        resizeCanvas();
        applyColumnWidths();
        handleScroll();
      }
    }

    function getOptions() {
      return options;
    }

    function setOptions(args) {
      if (!getEditorLock().commitCurrentEdit()) {
        return;
      }

      makeActiveCellNormal();

      if (options.enableAddRow !== args.enableAddRow) {
        invalidateRow(getDataLength());
      }

      options = $.extend(options, args);
      validateAndEnforceOptions();

      $viewport.css("overflow-y", options.autoHeight ? "hidden" : "auto");
      render();
    }

    function validateAndEnforceOptions() {
      if (options.autoHeight) {
        options.leaveSpaceForNewRows = false;
      }
    }

    function setData(newData, scrollToTop) {
      data = newData;
      invalidateAllRows();
      updateRowCount();
      if (scrollToTop) {
        scrollTo(0);
      }
    }

    function getData() {
      return data;
    }

    function getDataLength() {
      if (data.getLength) {
        return data.getLength();
      } else {
        return data.length;
      }
    }

    function getDataLengthIncludingAddNew() {
      return getDataLength() + (options.enableAddRow ? 1 : 0);
    }

    function getDataItem(i) {
      if (data.getItem) {
        return data.getItem(i);
      } else {
        return data[i];
      }
    }

    function getTopPanel() {
      return $topPanel[0];
    }

    function setTopPanelVisibility(visible) {
      if (options.showTopPanel != visible) {
        options.showTopPanel = visible;
        if (visible) {
          $topPanelScroller.slideDown("fast", resizeCanvas);
        } else {
          $topPanelScroller.slideUp("fast", resizeCanvas);
        }
      }
    }

    function setHeaderRowVisibility(visible) {
      if (options.showHeaderRow != visible) {
        options.showHeaderRow = visible;
        if (visible) {
          $headerRowScroller.slideDown("fast", resizeCanvas);
        } else {
          $headerRowScroller.slideUp("fast", resizeCanvas);
        }
      }
    }

    function getContainerNode() {
      return $container.get(0);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Rendering / Scrolling

    function getRowTop(row) {
      return options.rowHeight * row - offset;
    }

    function getRowFromPosition(y) {
      return Math.floor((y + offset) / options.rowHeight);
    }

    function scrollTo(y) {
      y = Math.max(y, 0);
      y = Math.min(y, th - viewportH + (viewportHasHScroll ? scrollbarDimensions.height : 0));

      var oldOffset = offset;

      page = Math.min(n - 1, Math.floor(y / ph));
      offset = Math.round(page * cj);
      var newScrollTop = y - offset;

      if (offset != oldOffset) {
        var range = getVisibleRange(newScrollTop);
        cleanupRows(range);
        updateRowPositions();
      }

      if (prevScrollTop != newScrollTop) {
        vScrollDir = (prevScrollTop + oldOffset < newScrollTop + offset) ? 1 : -1;
        $viewport[0].scrollTop = (lastRenderedScrollTop = scrollTop = prevScrollTop = newScrollTop);

        trigger(self.onViewportChanged, {});
      }
    }

    function defaultFormatter(row, cell, value, columnDef, dataContext) {
      if (value == null) {
        return "";
      } else {
        return (value + "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      }
    }

    function getFormatter(row, column) {
      var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);

      // look up by id, then index
      var columnOverrides = rowMetadata &&
          rowMetadata.columns &&
          (rowMetadata.columns[column.id] || rowMetadata.columns[getColumnIndex(column.id)]);

      return (columnOverrides && columnOverrides.formatter) ||
          (rowMetadata && rowMetadata.formatter) ||
          column.formatter ||
          (options.formatterFactory && options.formatterFactory.getFormatter(column)) ||
          options.defaultFormatter;
    }

    function getEditor(row, cell) {
      var column = columns[cell];
      var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
      var columnMetadata = rowMetadata && rowMetadata.columns;

      if (columnMetadata && columnMetadata[column.id] && columnMetadata[column.id].editor !== undefined) {
        return columnMetadata[column.id].editor;
      }
      if (columnMetadata && columnMetadata[cell] && columnMetadata[cell].editor !== undefined) {
        return columnMetadata[cell].editor;
      }

      return column.editor || (options.editorFactory && options.editorFactory.getEditor(column));
    }

    function getDataItemValueForColumn(item, columnDef) {
      if (options.dataItemColumnValueExtractor) {
        return options.dataItemColumnValueExtractor(item, columnDef);
      }
      return item[columnDef.field];
    }

    function appendRowHtml(stringArray, row, range, dataLength) {
      var d = getDataItem(row);
      var dataLoading = row < dataLength && !d;
      var rowCss = "slick-row" +
          (dataLoading ? " loading" : "") +
          (row === activeRow ? " active" : "") +
          (row % 2 == 1 ? " odd" : " even");

      if (!d) {
        rowCss += " " + options.addNewRowCssClass;
      }

      var metadata = data.getItemMetadata && data.getItemMetadata(row);

      if (metadata && metadata.cssClasses) {
        rowCss += " " + metadata.cssClasses;
      }

      stringArray.push("<div class='ui-widget-content " + rowCss + "' style='top:" + getRowTop(row) + "px'>");

      var colspan, m;
      for (var i = 0, ii = columns.length; i < ii; i++) {
        m = columns[i];
        colspan = 1;
        if (metadata && metadata.columns) {
          var columnData = metadata.columns[m.id] || metadata.columns[i];
          colspan = (columnData && columnData.colspan) || 1;
          if (colspan === "*") {
            colspan = ii - i;
          }
        }

        // Do not render cells outside of the viewport.
        if (columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
          if (columnPosLeft[i] > range.rightPx) {
            // All columns to the right are outside the range.
            break;
          }

          appendCellHtml(stringArray, row, i, colspan, d);
        }

        if (colspan > 1) {
          i += (colspan - 1);
        }
      }

      stringArray.push("</div>");
    }

    function appendCellHtml(stringArray, row, cell, colspan, item) {
      var m = columns[cell];
      var cellCss = "slick-cell l" + cell + " r" + Math.min(columns.length - 1, cell + colspan - 1) +
          (m.cssClass ? " " + m.cssClass : "");
      if (row === activeRow && cell === activeCell) {
        cellCss += (" active");
      }

      // TODO:  merge them together in the setter
      for (var key in cellCssClasses) {
        if (cellCssClasses[key][row] && cellCssClasses[key][row][m.id]) {
          cellCss += (" " + cellCssClasses[key][row][m.id]);
        }
      }

      stringArray.push("<div class='" + cellCss + "'>");

      // if there is a corresponding row (if not, this is the Add New row or this data hasn't been loaded yet)
      if (item) {
        var value = getDataItemValueForColumn(item, m);
        stringArray.push(getFormatter(row, m)(row, cell, value, m, item));
      }

      stringArray.push("</div>");

      rowsCache[row].cellRenderQueue.push(cell);
      rowsCache[row].cellColSpans[cell] = colspan;
    }


    function cleanupRows(rangeToKeep) {
      for (var i in rowsCache) {
        if (((i = parseInt(i, 10)) !== activeRow) && (i < rangeToKeep.top || i > rangeToKeep.bottom)) {
          removeRowFromCache(i);
        }
      }
    }

    function invalidate() {
      updateRowCount();
      invalidateAllRows();
      render();
    }

    function invalidateAllRows() {
      if (currentEditor) {
        makeActiveCellNormal();
      }
      for (var row in rowsCache) {
        removeRowFromCache(row);
      }
    }

    function scrollToLastRendered() {
      if (lastRenderedScrollTop) {
        prevScrollTop = 0;
        scrollTo(lastRenderedScrollTop);
      }
    }

    function removeRowFromCache(row) {
      var cacheEntry = rowsCache[row];
      if (!cacheEntry) {
        return;
      }

      if (rowNodeFromLastMouseWheelEvent == cacheEntry.rowNode) {
        cacheEntry.rowNode.style.display = 'none';
        zombieRowNodeFromLastMouseWheelEvent = rowNodeFromLastMouseWheelEvent;
      } else {
        $canvas[0].removeChild(cacheEntry.rowNode);
      }

      delete rowsCache[row];
      delete postProcessedRows[row];
      renderedRows--;
      counter_rows_removed++;
    }

    function invalidateRows(rows) {
      var i, rl;
      if (!rows || !rows.length) {
        return;
      }
      vScrollDir = 0;
      for (i = 0, rl = rows.length; i < rl; i++) {
        if (currentEditor && activeRow === rows[i]) {
          makeActiveCellNormal();
        }
        if (rowsCache[rows[i]]) {
          removeRowFromCache(rows[i]);
        }
      }
    }

    function invalidateRow(row) {
      invalidateRows([row]);
    }

    function updateCell(row, cell) {
      var cellNode = getCellNode(row, cell);
      if (!cellNode) {
        return;
      }

      var m = columns[cell], d = getDataItem(row);
      if (currentEditor && activeRow === row && activeCell === cell) {
        currentEditor.loadValue(d);
      } else {
        cellNode.innerHTML = d ? getFormatter(row, m)(row, cell, getDataItemValueForColumn(d, m), m, d) : "";
        invalidatePostProcessingResults(row);
      }
    }

    function updateRow(row) {
      var cacheEntry = rowsCache[row];
      if (!cacheEntry) {
        return;
      }

      ensureCellNodesInRowsCache(row);

      var d = getDataItem(row);

      for (var columnIdx in cacheEntry.cellNodesByColumnIdx) {
        if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(columnIdx)) {
          continue;
        }

        columnIdx = columnIdx | 0;
        var m = columns[columnIdx],
            node = cacheEntry.cellNodesByColumnIdx[columnIdx];

        if (row === activeRow && columnIdx === activeCell && currentEditor) {
          currentEditor.loadValue(d);
        } else if (d) {
          node.innerHTML = getFormatter(row, m)(row, columnIdx, getDataItemValueForColumn(d, m), m, d);
        } else {
          node.innerHTML = "";
        }
      }

      invalidatePostProcessingResults(row);
    }

    function getViewportHeight() {
      return parseFloat($.css($container[0], "height", true)) -
          parseFloat($.css($container[0], "paddingTop", true)) -
          parseFloat($.css($container[0], "paddingBottom", true)) -
          parseFloat($.css($headerScroller[0], "height")) - getVBoxDelta($headerScroller) -
          (options.showTopPanel ? options.topPanelHeight + getVBoxDelta($topPanelScroller) : 0) -
          (options.showHeaderRow ? options.headerRowHeight + getVBoxDelta($headerRowScroller) : 0);
    }

    function resizeCanvas() {
      if (!initialized) { return; }
      if (options.autoHeight) {
        viewportH = options.rowHeight * getDataLengthIncludingAddNew();
      } else {
        viewportH = getViewportHeight();
      }

      numVisibleRows = Math.ceil(viewportH / options.rowHeight);
      viewportW = parseFloat($.css($container[0], "width", true));
      if (!options.autoHeight) {
        $viewport.height(viewportH);
      }

      if (options.forceFitColumns) {
        autosizeColumns();
      }

      updateRowCount();
      handleScroll();
      // Since the width has changed, force the render() to reevaluate virtually rendered cells.
      lastRenderedScrollLeft = -1;
      render();
    }

    function updateRowCount() {
      if (!initialized) { return; }

      var dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
      var numberOfRows = dataLengthIncludingAddNew +
          (options.leaveSpaceForNewRows ? numVisibleRows - 1 : 0);

      var oldViewportHasVScroll = viewportHasVScroll;
      // with autoHeight, we do not need to accommodate the vertical scroll bar
      viewportHasVScroll = !options.autoHeight && (numberOfRows * options.rowHeight > viewportH);

      makeActiveCellNormal();

      // remove the rows that are now outside of the data range
      // this helps avoid redundant calls to .removeRow() when the size of the data decreased by thousands of rows
      var l = dataLengthIncludingAddNew - 1;
      for (var i in rowsCache) {
        if (i >= l) {
          removeRowFromCache(i);
        }
      }

      if (activeCellNode && activeRow > l) {
        resetActiveCell();
      }

      var oldH = h;
      th = Math.max(options.rowHeight * numberOfRows, viewportH - scrollbarDimensions.height);
      if (th < maxSupportedCssHeight) {
        // just one page
        h = ph = th;
        n = 1;
        cj = 0;
      } else {
        // break into pages
        h = maxSupportedCssHeight;
        ph = h / 100;
        n = Math.floor(th / ph);
        cj = (th - h) / (n - 1);
      }

      if (h !== oldH) {
        $canvas.css("height", h);
        scrollTop = $viewport[0].scrollTop;
      }

      var oldScrollTopInRange = (scrollTop + offset <= th - viewportH);

      if (th == 0 || scrollTop == 0) {
        page = offset = 0;
      } else if (oldScrollTopInRange) {
        // maintain virtual position
        scrollTo(scrollTop + offset);
      } else {
        // scroll to bottom
        scrollTo(th - viewportH);
      }

      if (h != oldH && options.autoHeight) {
        resizeCanvas();
      }

      if (options.forceFitColumns && oldViewportHasVScroll != viewportHasVScroll) {
        autosizeColumns();
      }
      updateCanvasWidth(false);
    }

    function getVisibleRange(viewportTop, viewportLeft) {
      if (viewportTop == null) {
        viewportTop = scrollTop;
      }
      if (viewportLeft == null) {
        viewportLeft = scrollLeft;
      }

      return {
        top: getRowFromPosition(viewportTop),
        bottom: getRowFromPosition(viewportTop + viewportH) + 1,
        leftPx: viewportLeft,
        rightPx: viewportLeft + viewportW
      };
    }

    function getRenderedRange(viewportTop, viewportLeft) {
      var range = getVisibleRange(viewportTop, viewportLeft);
      var buffer = Math.round(viewportH / options.rowHeight);
      var minBuffer = 3;

      if (vScrollDir == -1) {
        range.top -= buffer;
        range.bottom += minBuffer;
      } else if (vScrollDir == 1) {
        range.top -= minBuffer;
        range.bottom += buffer;
      } else {
        range.top -= minBuffer;
        range.bottom += minBuffer;
      }

      range.top = Math.max(0, range.top);
      range.bottom = Math.min(getDataLengthIncludingAddNew() - 1, range.bottom);

      range.leftPx -= viewportW;
      range.rightPx += viewportW;

      range.leftPx = Math.max(0, range.leftPx);
      range.rightPx = Math.min(canvasWidth, range.rightPx);

      return range;
    }

    function ensureCellNodesInRowsCache(row) {
      var cacheEntry = rowsCache[row];
      if (cacheEntry) {
        if (cacheEntry.cellRenderQueue.length) {
          var lastChild = cacheEntry.rowNode.lastChild;
          while (cacheEntry.cellRenderQueue.length) {
            var columnIdx = cacheEntry.cellRenderQueue.pop();
            cacheEntry.cellNodesByColumnIdx[columnIdx] = lastChild;
            lastChild = lastChild.previousSibling;
          }
        }
      }
    }

    function cleanUpCells(range, row) {
      var totalCellsRemoved = 0;
      var cacheEntry = rowsCache[row];

      // Remove cells outside the range.
      var cellsToRemove = [];
      for (var i in cacheEntry.cellNodesByColumnIdx) {
        // I really hate it when people mess with Array.prototype.
        if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(i)) {
          continue;
        }

        // This is a string, so it needs to be cast back to a number.
        i = i | 0;

        var colspan = cacheEntry.cellColSpans[i];
        if (columnPosLeft[i] > range.rightPx ||
          columnPosRight[Math.min(columns.length - 1, i + colspan - 1)] < range.leftPx) {
          if (!(row == activeRow && i == activeCell)) {
            cellsToRemove.push(i);
          }
        }
      }

      var cellToRemove;
      while ((cellToRemove = cellsToRemove.pop()) != null) {
        cacheEntry.rowNode.removeChild(cacheEntry.cellNodesByColumnIdx[cellToRemove]);
        delete cacheEntry.cellColSpans[cellToRemove];
        delete cacheEntry.cellNodesByColumnIdx[cellToRemove];
        if (postProcessedRows[row]) {
          delete postProcessedRows[row][cellToRemove];
        }
        totalCellsRemoved++;
      }
    }

    function cleanUpAndRenderCells(range) {
      var cacheEntry;
      var stringArray = [];
      var processedRows = [];
      var cellsAdded;
      var totalCellsAdded = 0;
      var colspan;

      for (var row = range.top, btm = range.bottom; row <= btm; row++) {
        cacheEntry = rowsCache[row];
        if (!cacheEntry) {
          continue;
        }

        // cellRenderQueue populated in renderRows() needs to be cleared first
        ensureCellNodesInRowsCache(row);

        cleanUpCells(range, row);

        // Render missing cells.
        cellsAdded = 0;

        var metadata = data.getItemMetadata && data.getItemMetadata(row);
        metadata = metadata && metadata.columns;

        var d = getDataItem(row);

        // TODO:  shorten this loop (index? heuristics? binary search?)
        for (var i = 0, ii = columns.length; i < ii; i++) {
          // Cells to the right are outside the range.
          if (columnPosLeft[i] > range.rightPx) {
            break;
          }

          // Already rendered.
          if ((colspan = cacheEntry.cellColSpans[i]) != null) {
            i += (colspan > 1 ? colspan - 1 : 0);
            continue;
          }

          colspan = 1;
          if (metadata) {
            var columnData = metadata[columns[i].id] || metadata[i];
            colspan = (columnData && columnData.colspan) || 1;
            if (colspan === "*") {
              colspan = ii - i;
            }
          }

          if (columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
            appendCellHtml(stringArray, row, i, colspan, d);
            cellsAdded++;
          }

          i += (colspan > 1 ? colspan - 1 : 0);
        }

        if (cellsAdded) {
          totalCellsAdded += cellsAdded;
          processedRows.push(row);
        }
      }

      if (!stringArray.length) {
        return;
      }

      var x = document.createElement("div");
      x.innerHTML = stringArray.join("");

      var processedRow;
      var node;
      while ((processedRow = processedRows.pop()) != null) {
        cacheEntry = rowsCache[processedRow];
        var columnIdx;
        while ((columnIdx = cacheEntry.cellRenderQueue.pop()) != null) {
          node = x.lastChild;
          cacheEntry.rowNode.appendChild(node);
          cacheEntry.cellNodesByColumnIdx[columnIdx] = node;
        }
      }
    }

    function renderRows(range) {
      var parentNode = $canvas[0],
          stringArray = [],
          rows = [],
          needToReselectCell = false,
          dataLength = getDataLength();

      for (var i = range.top, ii = range.bottom; i <= ii; i++) {
        if (rowsCache[i]) {
          continue;
        }
        renderedRows++;
        rows.push(i);

        // Create an entry right away so that appendRowHtml() can
        // start populatating it.
        rowsCache[i] = {
          "rowNode": null,

          // ColSpans of rendered cells (by column idx).
          // Can also be used for checking whether a cell has been rendered.
          "cellColSpans": [],

          // Cell nodes (by column idx).  Lazy-populated by ensureCellNodesInRowsCache().
          "cellNodesByColumnIdx": [],

          // Column indices of cell nodes that have been rendered, but not yet indexed in
          // cellNodesByColumnIdx.  These are in the same order as cell nodes added at the
          // end of the row.
          "cellRenderQueue": []
        };

        appendRowHtml(stringArray, i, range, dataLength);
        if (activeCellNode && activeRow === i) {
          needToReselectCell = true;
        }
        counter_rows_rendered++;
      }

      if (!rows.length) { return; }

      var x = document.createElement("div");
      x.innerHTML = stringArray.join("");

      for (var i = 0, ii = rows.length; i < ii; i++) {
        rowsCache[rows[i]].rowNode = parentNode.appendChild(x.firstChild);
      }

      if (needToReselectCell) {
        activeCellNode = getCellNode(activeRow, activeCell);
      }
    }

    function startPostProcessing() {
      if (!options.enableAsyncPostRender) {
        return;
      }
      clearTimeout(h_postrender);
      h_postrender = setTimeout(asyncPostProcessRows, options.asyncPostRenderDelay);
    }

    function invalidatePostProcessingResults(row) {
      delete postProcessedRows[row];
      postProcessFromRow = Math.min(postProcessFromRow, row);
      postProcessToRow = Math.max(postProcessToRow, row);
      startPostProcessing();
    }

    function updateRowPositions() {
      for (var row in rowsCache) {
        rowsCache[row].rowNode.style.top = getRowTop(row) + "px";
      }
    }

    function render() {
      if (!initialized) { return; }
      var visible = getVisibleRange();
      var rendered = getRenderedRange();

      // remove rows no longer in the viewport
      cleanupRows(rendered);

      // add new rows & missing cells in existing rows
      if (lastRenderedScrollLeft != scrollLeft) {
        cleanUpAndRenderCells(rendered);
      }

      // render missing rows
      renderRows(rendered);

      postProcessFromRow = visible.top;
      postProcessToRow = Math.min(getDataLengthIncludingAddNew() - 1, visible.bottom);
      startPostProcessing();

      lastRenderedScrollTop = scrollTop;
      lastRenderedScrollLeft = scrollLeft;
      h_render = null;
    }

    function handleHeaderRowScroll() {
      var scrollLeft = $headerRowScroller[0].scrollLeft;
      if (scrollLeft != $viewport[0].scrollLeft) {
        $viewport[0].scrollLeft = scrollLeft;
      }
    }

    function handleScroll() {
      scrollTop = $viewport[0].scrollTop;
      scrollLeft = $viewport[0].scrollLeft;
      var vScrollDist = Math.abs(scrollTop - prevScrollTop);
      var hScrollDist = Math.abs(scrollLeft - prevScrollLeft);

      if (hScrollDist) {
        prevScrollLeft = scrollLeft;
        $headerScroller[0].scrollLeft = scrollLeft;
        $topPanelScroller[0].scrollLeft = scrollLeft;
        $headerRowScroller[0].scrollLeft = scrollLeft;
      }

      if (vScrollDist) {
        vScrollDir = prevScrollTop < scrollTop ? 1 : -1;
        prevScrollTop = scrollTop;

        // switch virtual pages if needed
        if (vScrollDist < viewportH) {
          scrollTo(scrollTop + offset);
        } else {
          var oldOffset = offset;
          if (h == viewportH) {
            page = 0;
          } else {
            page = Math.min(n - 1, Math.floor(scrollTop * ((th - viewportH) / (h - viewportH)) * (1 / ph)));
          }
          offset = Math.round(page * cj);
          if (oldOffset != offset) {
            invalidateAllRows();
          }
        }
      }

      if (hScrollDist || vScrollDist) {
        if (h_render) {
          clearTimeout(h_render);
        }

        if (Math.abs(lastRenderedScrollTop - scrollTop) > 20 ||
            Math.abs(lastRenderedScrollLeft - scrollLeft) > 20) {
          if (options.forceSyncScrolling || (
              Math.abs(lastRenderedScrollTop - scrollTop) < viewportH &&
              Math.abs(lastRenderedScrollLeft - scrollLeft) < viewportW)) {
            render();
          } else {
            h_render = setTimeout(render, 50);
          }

          trigger(self.onViewportChanged, {});
        }
      }

      trigger(self.onScroll, {scrollLeft: scrollLeft, scrollTop: scrollTop});
    }

    function asyncPostProcessRows() {
      var dataLength = getDataLength();
      while (postProcessFromRow <= postProcessToRow) {
        var row = (vScrollDir >= 0) ? postProcessFromRow++ : postProcessToRow--;
        var cacheEntry = rowsCache[row];
        if (!cacheEntry || row >= dataLength) {
          continue;
        }

        if (!postProcessedRows[row]) {
          postProcessedRows[row] = {};
        }

        ensureCellNodesInRowsCache(row);
        for (var columnIdx in cacheEntry.cellNodesByColumnIdx) {
          if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(columnIdx)) {
            continue;
          }

          columnIdx = columnIdx | 0;

          var m = columns[columnIdx];
          if (m.asyncPostRender && !postProcessedRows[row][columnIdx]) {
            var node = cacheEntry.cellNodesByColumnIdx[columnIdx];
            if (node) {
              m.asyncPostRender(node, row, getDataItem(row), m);
            }
            postProcessedRows[row][columnIdx] = true;
          }
        }

        h_postrender = setTimeout(asyncPostProcessRows, options.asyncPostRenderDelay);
        return;
      }
    }

    function updateCellCssStylesOnRenderedRows(addedHash, removedHash) {
      var node, columnId, addedRowHash, removedRowHash;
      for (var row in rowsCache) {
        removedRowHash = removedHash && removedHash[row];
        addedRowHash = addedHash && addedHash[row];

        if (removedRowHash) {
          for (columnId in removedRowHash) {
            if (!addedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
              node = getCellNode(row, getColumnIndex(columnId));
              if (node) {
                $(node).removeClass(removedRowHash[columnId]);
              }
            }
          }
        }

        if (addedRowHash) {
          for (columnId in addedRowHash) {
            if (!removedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
              node = getCellNode(row, getColumnIndex(columnId));
              if (node) {
                $(node).addClass(addedRowHash[columnId]);
              }
            }
          }
        }
      }
    }

    function addCellCssStyles(key, hash) {
      if (cellCssClasses[key]) {
        throw "addCellCssStyles: cell CSS hash with key '" + key + "' already exists.";
      }

      cellCssClasses[key] = hash;
      updateCellCssStylesOnRenderedRows(hash, null);

      trigger(self.onCellCssStylesChanged, { "key": key, "hash": hash });
    }

    function removeCellCssStyles(key) {
      if (!cellCssClasses[key]) {
        return;
      }

      updateCellCssStylesOnRenderedRows(null, cellCssClasses[key]);
      delete cellCssClasses[key];

      trigger(self.onCellCssStylesChanged, { "key": key, "hash": null });
    }

    function setCellCssStyles(key, hash) {
      var prevHash = cellCssClasses[key];

      cellCssClasses[key] = hash;
      updateCellCssStylesOnRenderedRows(hash, prevHash);

      trigger(self.onCellCssStylesChanged, { "key": key, "hash": hash });
    }

    function getCellCssStyles(key) {
      return cellCssClasses[key];
    }

    function flashCell(row, cell, speed) {
      speed = speed || 100;
      if (rowsCache[row]) {
        var $cell = $(getCellNode(row, cell));

        function toggleCellClass(times) {
          if (!times) {
            return;
          }
          setTimeout(function () {
                $cell.queue(function () {
                  $cell.toggleClass(options.cellFlashingCssClass).dequeue();
                  toggleCellClass(times - 1);
                });
              },
              speed);
        }

        toggleCellClass(4);
      }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Interactivity

    function handleMouseWheel(e) {
      var rowNode = $(e.target).closest(".slick-row")[0];
      if (rowNode != rowNodeFromLastMouseWheelEvent) {
        if (zombieRowNodeFromLastMouseWheelEvent && zombieRowNodeFromLastMouseWheelEvent != rowNode) {
          $canvas[0].removeChild(zombieRowNodeFromLastMouseWheelEvent);
          zombieRowNodeFromLastMouseWheelEvent = null;
        }
        rowNodeFromLastMouseWheelEvent = rowNode;
      }
    }

    function handleDragInit(e, dd) {
      var cell = getCellFromEvent(e);
      if (!cell || !cellExists(cell.row, cell.cell)) {
        return false;
      }

      var retval = trigger(self.onDragInit, dd, e);
      if (e.isImmediatePropagationStopped()) {
        return retval;
      }

      // if nobody claims to be handling drag'n'drop by stopping immediate propagation,
      // cancel out of it
      return false;
    }

    function handleDragStart(e, dd) {
      var cell = getCellFromEvent(e);
      if (!cell || !cellExists(cell.row, cell.cell)) {
        return false;
      }

      var retval = trigger(self.onDragStart, dd, e);
      if (e.isImmediatePropagationStopped()) {
        return retval;
      }

      return false;
    }

    function handleDrag(e, dd) {
      return trigger(self.onDrag, dd, e);
    }

    function handleDragEnd(e, dd) {
      trigger(self.onDragEnd, dd, e);
    }

    function handleKeyDown(e) {
      trigger(self.onKeyDown, {row: activeRow, cell: activeCell}, e);
      var handled = e.isImmediatePropagationStopped();

      if (!handled) {
        if (!e.shiftKey && !e.altKey && !e.ctrlKey) {
          if (e.which == 27) {
            if (!getEditorLock().isActive()) {
              return; // no editing mode to cancel, allow bubbling and default processing (exit without cancelling the event)
            }
            cancelEditAndSetFocus();
          } else if (e.which == 34) {
            navigatePageDown();
            handled = true;
          } else if (e.which == 33) {
            navigatePageUp();
            handled = true;
          } else if (e.which == 37) {
            handled = navigateLeft();
          } else if (e.which == 39) {
            handled = navigateRight();
          } else if (e.which == 38) {
            handled = navigateUp();
          } else if (e.which == 40) {
            handled = navigateDown();
          } else if (e.which == 9) {
            handled = navigateNext();
          } else if (e.which == 13) {
            if (options.editable) {
              if (currentEditor) {
                // adding new row
                if (activeRow === getDataLength()) {
                  navigateDown();
                } else {
                  commitEditAndSetFocus();
                }
              } else {
                if (getEditorLock().commitCurrentEdit()) {
                  makeActiveCellEditable();
                }
              }
            }
            handled = true;
          }
        } else if (e.which == 9 && e.shiftKey && !e.ctrlKey && !e.altKey) {
          handled = navigatePrev();
        }
      }

      if (handled) {
        // the event has been handled so don't let parent element (bubbling/propagation) or browser (default) handle it
        e.stopPropagation();
        e.preventDefault();
        try {
          e.originalEvent.keyCode = 0; // prevent default behaviour for special keys in IE browsers (F3, F5, etc.)
        }
        // ignore exceptions - setting the original event's keycode throws access denied exception for "Ctrl"
        // (hitting control key only, nothing else), "Shift" (maybe others)
        catch (error) {
        }
      }
    }

    function handleClick(e) {
      if (!currentEditor) {
        // if this click resulted in some cell child node getting focus,
        // don't steal it back - keyboard events will still bubble up
        // IE9+ seems to default DIVs to tabIndex=0 instead of -1, so check for cell clicks directly.
        if (e.target != document.activeElement || $(e.target).hasClass("slick-cell")) {
          setFocus();
        }
      }

      var cell = getCellFromEvent(e);
      if (!cell || (currentEditor !== null && activeRow == cell.row && activeCell == cell.cell)) {
        return;
      }

      trigger(self.onClick, {row: cell.row, cell: cell.cell}, e);
      if (e.isImmediatePropagationStopped()) {
        return;
      }

      if ((activeCell != cell.cell || activeRow != cell.row) && canCellBeActive(cell.row, cell.cell)) {
        if (!getEditorLock().isActive() || getEditorLock().commitCurrentEdit()) {
          scrollRowIntoView(cell.row, false);
          setActiveCellInternal(getCellNode(cell.row, cell.cell));
        }
      }
    }

    function handleContextMenu(e) {
      var $cell = $(e.target).closest(".slick-cell", $canvas);
      if ($cell.length === 0) {
        return;
      }

      // are we editing this cell?
      if (activeCellNode === $cell[0] && currentEditor !== null) {
        return;
      }

      trigger(self.onContextMenu, {}, e);
    }

    function handleDblClick(e) {
      var cell = getCellFromEvent(e);
      if (!cell || (currentEditor !== null && activeRow == cell.row && activeCell == cell.cell)) {
        return;
      }

      trigger(self.onDblClick, {row: cell.row, cell: cell.cell}, e);
      if (e.isImmediatePropagationStopped()) {
        return;
      }

      if (options.editable) {
        gotoCell(cell.row, cell.cell, true);
      }
    }

    function handleHeaderMouseEnter(e) {
      trigger(self.onHeaderMouseEnter, {
        "column": $(this).data("column")
      }, e);
    }

    function handleHeaderMouseLeave(e) {
      trigger(self.onHeaderMouseLeave, {
        "column": $(this).data("column")
      }, e);
    }

    function handleHeaderContextMenu(e) {
      var $header = $(e.target).closest(".slick-header-column", ".slick-header-columns");
      var column = $header && $header.data("column");
      trigger(self.onHeaderContextMenu, {column: column}, e);
    }

    function handleHeaderClick(e) {
      var $header = $(e.target).closest(".slick-header-column", ".slick-header-columns");
      var column = $header && $header.data("column");
      if (column) {
        trigger(self.onHeaderClick, {column: column}, e);
      }
    }

    function handleMouseEnter(e) {
      trigger(self.onMouseEnter, {}, e);
    }

    function handleMouseLeave(e) {
      trigger(self.onMouseLeave, {}, e);
    }

    function cellExists(row, cell) {
      return !(row < 0 || row >= getDataLength() || cell < 0 || cell >= columns.length);
    }

    function getCellFromPoint(x, y) {
      var row = getRowFromPosition(y);
      var cell = 0;

      var w = 0;
      for (var i = 0; i < columns.length && w < x; i++) {
        w += columns[i].width;
        cell++;
      }

      if (cell < 0) {
        cell = 0;
      }

      return {row: row, cell: cell - 1};
    }

    function getCellFromNode(cellNode) {
      // read column number from .l<columnNumber> CSS class
      var cls = /l\d+/.exec(cellNode.className);
      if (!cls) {
        throw "getCellFromNode: cannot get cell - " + cellNode.className;
      }
      return parseInt(cls[0].substr(1, cls[0].length - 1), 10);
    }

    function getRowFromNode(rowNode) {
      for (var row in rowsCache) {
        if (rowsCache[row].rowNode === rowNode) {
          return row | 0;
        }
      }

      return null;
    }

    function getCellFromEvent(e) {
      var $cell = $(e.target).closest(".slick-cell", $canvas);
      if (!$cell.length) {
        return null;
      }

      var row = getRowFromNode($cell[0].parentNode);
      var cell = getCellFromNode($cell[0]);

      if (row == null || cell == null) {
        return null;
      } else {
        return {
          "row": row,
          "cell": cell
        };
      }
    }

    function getCellNodeBox(row, cell) {
      if (!cellExists(row, cell)) {
        return null;
      }

      var y1 = getRowTop(row);
      var y2 = y1 + options.rowHeight - 1;
      var x1 = 0;
      for (var i = 0; i < cell; i++) {
        x1 += columns[i].width;
      }
      var x2 = x1 + columns[cell].width;

      return {
        top: y1,
        left: x1,
        bottom: y2,
        right: x2
      };
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Cell switching

    function resetActiveCell() {
      setActiveCellInternal(null, false);
    }

    function setFocus() {
      if (tabbingDirection == -1) {
        $focusSink[0].focus();
      } else {
        $focusSink2[0].focus();
      }
    }

    function scrollCellIntoView(row, cell, doPaging) {
      scrollRowIntoView(row, doPaging);

      var colspan = getColspan(row, cell);
      var left = columnPosLeft[cell],
        right = columnPosRight[cell + (colspan > 1 ? colspan - 1 : 0)],
        scrollRight = scrollLeft + viewportW;

      if (left < scrollLeft) {
        $viewport.scrollLeft(left);
        handleScroll();
        render();
      } else if (right > scrollRight) {
        $viewport.scrollLeft(Math.min(left, right - $viewport[0].clientWidth));
        handleScroll();
        render();
      }
    }

    function setActiveCellInternal(newCell, opt_editMode) {
      if (activeCellNode !== null) {
        makeActiveCellNormal();
        $(activeCellNode).removeClass("active");
        if (rowsCache[activeRow]) {
          $(rowsCache[activeRow].rowNode).removeClass("active");
        }
      }

      var activeCellChanged = (activeCellNode !== newCell);
      activeCellNode = newCell;

      if (activeCellNode != null) {
        activeRow = getRowFromNode(activeCellNode.parentNode);
        activeCell = activePosX = getCellFromNode(activeCellNode);

        if (opt_editMode == null) {
          opt_editMode = (activeRow == getDataLength()) || options.autoEdit;
        }

        $(activeCellNode).addClass("active");
        $(rowsCache[activeRow].rowNode).addClass("active");

        if (options.editable && opt_editMode && isCellPotentiallyEditable(activeRow, activeCell)) {
          clearTimeout(h_editorLoader);

          if (options.asyncEditorLoading) {
            h_editorLoader = setTimeout(function () {
              makeActiveCellEditable();
            }, options.asyncEditorLoadDelay);
          } else {
            makeActiveCellEditable();
          }
        }
      } else {
        activeRow = activeCell = null;
      }

      if (activeCellChanged) {
        trigger(self.onActiveCellChanged, getActiveCell());
      }
    }

    function clearTextSelection() {
      if (document.selection && document.selection.empty) {
        try {
          //IE fails here if selected element is not in dom
          document.selection.empty();
        } catch (e) { }
      } else if (window.getSelection) {
        var sel = window.getSelection();
        if (sel && sel.removeAllRanges) {
          sel.removeAllRanges();
        }
      }
    }

    function isCellPotentiallyEditable(row, cell) {
      var dataLength = getDataLength();
      // is the data for this row loaded?
      if (row < dataLength && !getDataItem(row)) {
        return false;
      }

      // are we in the Add New row?  can we create new from this cell?
      if (columns[cell].cannotTriggerInsert && row >= dataLength) {
        return false;
      }

      // does this cell have an editor?
      if (!getEditor(row, cell)) {
        return false;
      }

      return true;
    }

    function makeActiveCellNormal() {
      if (!currentEditor) {
        return;
      }
      trigger(self.onBeforeCellEditorDestroy, {editor: currentEditor});
      currentEditor.destroy();
      currentEditor = null;

      if (activeCellNode) {
        var d = getDataItem(activeRow);
        $(activeCellNode).removeClass("editable invalid");
        if (d) {
          var column = columns[activeCell];
          var formatter = getFormatter(activeRow, column);
          activeCellNode.innerHTML = formatter(activeRow, activeCell, getDataItemValueForColumn(d, column), column, d);
          invalidatePostProcessingResults(activeRow);
        }
      }

      // if there previously was text selected on a page (such as selected text in the edit cell just removed),
      // IE can't set focus to anything else correctly
      if (navigator.userAgent.toLowerCase().match(/msie/)) {
        clearTextSelection();
      }

      getEditorLock().deactivate(editController);
    }

    function makeActiveCellEditable(editor) {
      if (!activeCellNode) {
        return;
      }
      if (!options.editable) {
        throw "Grid : makeActiveCellEditable : should never get called when options.editable is false";
      }

      // cancel pending async call if there is one
      clearTimeout(h_editorLoader);

      if (!isCellPotentiallyEditable(activeRow, activeCell)) {
        return;
      }

      var columnDef = columns[activeCell];
      var item = getDataItem(activeRow);

      if (trigger(self.onBeforeEditCell, {row: activeRow, cell: activeCell, item: item, column: columnDef}) === false) {
        setFocus();
        return;
      }

      getEditorLock().activate(editController);
      $(activeCellNode).addClass("editable");

      // don't clear the cell if a custom editor is passed through
      if (!editor) {
        activeCellNode.innerHTML = "";
      }

      currentEditor = new (editor || getEditor(activeRow, activeCell))({
        grid: self,
        gridPosition: absBox($container[0]),
        position: absBox(activeCellNode),
        container: activeCellNode,
        column: columnDef,
        item: item || {},
        commitChanges: commitEditAndSetFocus,
        cancelChanges: cancelEditAndSetFocus
      });

      if (item) {
        currentEditor.loadValue(item);
      }

      serializedEditorValue = currentEditor.serializeValue();

      if (currentEditor.position) {
        handleActiveCellPositionChange();
      }
    }

    function commitEditAndSetFocus() {
      // if the commit fails, it would do so due to a validation error
      // if so, do not steal the focus from the editor
      if (getEditorLock().commitCurrentEdit()) {
        setFocus();
        if (options.autoEdit) {
          navigateDown();
        }
      }
    }

    function cancelEditAndSetFocus() {
      if (getEditorLock().cancelCurrentEdit()) {
        setFocus();
      }
    }

    function absBox(elem) {
      var box = {
        top: elem.offsetTop,
        left: elem.offsetLeft,
        bottom: 0,
        right: 0,
        width: $(elem).outerWidth(),
        height: $(elem).outerHeight(),
        visible: true};
      box.bottom = box.top + box.height;
      box.right = box.left + box.width;

      // walk up the tree
      var offsetParent = elem.offsetParent;
      while ((elem = elem.parentNode) != document.body) {
        if (box.visible && elem.scrollHeight != elem.offsetHeight && $(elem).css("overflowY") != "visible") {
          box.visible = box.bottom > elem.scrollTop && box.top < elem.scrollTop + elem.clientHeight;
        }

        if (box.visible && elem.scrollWidth != elem.offsetWidth && $(elem).css("overflowX") != "visible") {
          box.visible = box.right > elem.scrollLeft && box.left < elem.scrollLeft + elem.clientWidth;
        }

        box.left -= elem.scrollLeft;
        box.top -= elem.scrollTop;

        if (elem === offsetParent) {
          box.left += elem.offsetLeft;
          box.top += elem.offsetTop;
          offsetParent = elem.offsetParent;
        }

        box.bottom = box.top + box.height;
        box.right = box.left + box.width;
      }

      return box;
    }

    function getActiveCellPosition() {
      return absBox(activeCellNode);
    }

    function getGridPosition() {
      return absBox($container[0])
    }

    function handleActiveCellPositionChange() {
      if (!activeCellNode) {
        return;
      }

      trigger(self.onActiveCellPositionChanged, {});

      if (currentEditor) {
        var cellBox = getActiveCellPosition();
        if (currentEditor.show && currentEditor.hide) {
          if (!cellBox.visible) {
            currentEditor.hide();
          } else {
            currentEditor.show();
          }
        }

        if (currentEditor.position) {
          currentEditor.position(cellBox);
        }
      }
    }

    function getCellEditor() {
      return currentEditor;
    }

    function getActiveCell() {
      if (!activeCellNode) {
        return null;
      } else {
        return {row: activeRow, cell: activeCell};
      }
    }

    function getActiveCellNode() {
      return activeCellNode;
    }

    function scrollRowIntoView(row, doPaging) {
      var rowAtTop = row * options.rowHeight;
      var rowAtBottom = (row + 1) * options.rowHeight - viewportH + (viewportHasHScroll ? scrollbarDimensions.height : 0);

      // need to page down?
      if ((row + 1) * options.rowHeight > scrollTop + viewportH + offset) {
        scrollTo(doPaging ? rowAtTop : rowAtBottom);
        render();
      }
      // or page up?
      else if (row * options.rowHeight < scrollTop + offset) {
        scrollTo(doPaging ? rowAtBottom : rowAtTop);
        render();
      }
    }

    function scrollRowToTop(row) {
      scrollTo(row * options.rowHeight);
      render();
    }

    function scrollPage(dir) {
      var deltaRows = dir * numVisibleRows;
      scrollTo((getRowFromPosition(scrollTop) + deltaRows) * options.rowHeight);
      render();

      if (options.enableCellNavigation && activeRow != null) {
        var row = activeRow + deltaRows;
        var dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
        if (row >= dataLengthIncludingAddNew) {
          row = dataLengthIncludingAddNew - 1;
        }
        if (row < 0) {
          row = 0;
        }

        var cell = 0, prevCell = null;
        var prevActivePosX = activePosX;
        while (cell <= activePosX) {
          if (canCellBeActive(row, cell)) {
            prevCell = cell;
          }
          cell += getColspan(row, cell);
        }

        if (prevCell !== null) {
          setActiveCellInternal(getCellNode(row, prevCell));
          activePosX = prevActivePosX;
        } else {
          resetActiveCell();
        }
      }
    }

    function navigatePageDown() {
      scrollPage(1);
    }

    function navigatePageUp() {
      scrollPage(-1);
    }

    function getColspan(row, cell) {
      var metadata = data.getItemMetadata && data.getItemMetadata(row);
      if (!metadata || !metadata.columns) {
        return 1;
      }

      var columnData = metadata.columns[columns[cell].id] || metadata.columns[cell];
      var colspan = (columnData && columnData.colspan);
      if (colspan === "*") {
        colspan = columns.length - cell;
      } else {
        colspan = colspan || 1;
      }

      return colspan;
    }

    function findFirstFocusableCell(row) {
      var cell = 0;
      while (cell < columns.length) {
        if (canCellBeActive(row, cell)) {
          return cell;
        }
        cell += getColspan(row, cell);
      }
      return null;
    }

    function findLastFocusableCell(row) {
      var cell = 0;
      var lastFocusableCell = null;
      while (cell < columns.length) {
        if (canCellBeActive(row, cell)) {
          lastFocusableCell = cell;
        }
        cell += getColspan(row, cell);
      }
      return lastFocusableCell;
    }

    function gotoRight(row, cell, posX) {
      if (cell >= columns.length) {
        return null;
      }

      do {
        cell += getColspan(row, cell);
      }
      while (cell < columns.length && !canCellBeActive(row, cell));

      if (cell < columns.length) {
        return {
          "row": row,
          "cell": cell,
          "posX": cell
        };
      }
      return null;
    }

    function gotoLeft(row, cell, posX) {
      if (cell <= 0) {
        return null;
      }

      var firstFocusableCell = findFirstFocusableCell(row);
      if (firstFocusableCell === null || firstFocusableCell >= cell) {
        return null;
      }

      var prev = {
        "row": row,
        "cell": firstFocusableCell,
        "posX": firstFocusableCell
      };
      var pos;
      while (true) {
        pos = gotoRight(prev.row, prev.cell, prev.posX);
        if (!pos) {
          return null;
        }
        if (pos.cell >= cell) {
          return prev;
        }
        prev = pos;
      }
    }

    function gotoDown(row, cell, posX) {
      var prevCell;
      var dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
      while (true) {
        if (++row >= dataLengthIncludingAddNew) {
          return null;
        }

        prevCell = cell = 0;
        while (cell <= posX) {
          prevCell = cell;
          cell += getColspan(row, cell);
        }

        if (canCellBeActive(row, prevCell)) {
          return {
            "row": row,
            "cell": prevCell,
            "posX": posX
          };
        }
      }
    }

    function gotoUp(row, cell, posX) {
      var prevCell;
      while (true) {
        if (--row < 0) {
          return null;
        }

        prevCell = cell = 0;
        while (cell <= posX) {
          prevCell = cell;
          cell += getColspan(row, cell);
        }

        if (canCellBeActive(row, prevCell)) {
          return {
            "row": row,
            "cell": prevCell,
            "posX": posX
          };
        }
      }
    }

    function gotoNext(row, cell, posX) {
      if (row == null && cell == null) {
        row = cell = posX = 0;
        if (canCellBeActive(row, cell)) {
          return {
            "row": row,
            "cell": cell,
            "posX": cell
          };
        }
      }

      var pos = gotoRight(row, cell, posX);
      if (pos) {
        return pos;
      }

      var firstFocusableCell = null;
      var dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
      while (++row < dataLengthIncludingAddNew) {
        firstFocusableCell = findFirstFocusableCell(row);
        if (firstFocusableCell !== null) {
          return {
            "row": row,
            "cell": firstFocusableCell,
            "posX": firstFocusableCell
          };
        }
      }
      return null;
    }

    function gotoPrev(row, cell, posX) {
      if (row == null && cell == null) {
        row = getDataLengthIncludingAddNew() - 1;
        cell = posX = columns.length - 1;
        if (canCellBeActive(row, cell)) {
          return {
            "row": row,
            "cell": cell,
            "posX": cell
          };
        }
      }

      var pos;
      var lastSelectableCell;
      while (!pos) {
        pos = gotoLeft(row, cell, posX);
        if (pos) {
          break;
        }
        if (--row < 0) {
          return null;
        }

        cell = 0;
        lastSelectableCell = findLastFocusableCell(row);
        if (lastSelectableCell !== null) {
          pos = {
            "row": row,
            "cell": lastSelectableCell,
            "posX": lastSelectableCell
          };
        }
      }
      return pos;
    }

    function navigateRight() {
      return navigate("right");
    }

    function navigateLeft() {
      return navigate("left");
    }

    function navigateDown() {
      return navigate("down");
    }

    function navigateUp() {
      return navigate("up");
    }

    function navigateNext() {
      return navigate("next");
    }

    function navigatePrev() {
      return navigate("prev");
    }

    /**
     * @param {string} dir Navigation direction.
     * @return {boolean} Whether navigation resulted in a change of active cell.
     */
    function navigate(dir) {
      if (!options.enableCellNavigation) {
        return false;
      }

      if (!activeCellNode && dir != "prev" && dir != "next") {
        return false;
      }

      if (!getEditorLock().commitCurrentEdit()) {
        return true;
      }
      setFocus();

      var tabbingDirections = {
        "up": -1,
        "down": 1,
        "left": -1,
        "right": 1,
        "prev": -1,
        "next": 1
      };
      tabbingDirection = tabbingDirections[dir];

      var stepFunctions = {
        "up": gotoUp,
        "down": gotoDown,
        "left": gotoLeft,
        "right": gotoRight,
        "prev": gotoPrev,
        "next": gotoNext
      };
      var stepFn = stepFunctions[dir];
      var pos = stepFn(activeRow, activeCell, activePosX);
      if (pos) {
        var isAddNewRow = (pos.row == getDataLength());
        scrollCellIntoView(pos.row, pos.cell, !isAddNewRow);
        setActiveCellInternal(getCellNode(pos.row, pos.cell));
        activePosX = pos.posX;
        return true;
      } else {
        setActiveCellInternal(getCellNode(activeRow, activeCell));
        return false;
      }
    }

    function getCellNode(row, cell) {
      if (rowsCache[row]) {
        ensureCellNodesInRowsCache(row);
        return rowsCache[row].cellNodesByColumnIdx[cell];
      }
      return null;
    }

    function setActiveCell(row, cell) {
      if (!initialized) { return; }
      if (row > getDataLength() || row < 0 || cell >= columns.length || cell < 0) {
        return;
      }

      if (!options.enableCellNavigation) {
        return;
      }

      scrollCellIntoView(row, cell, false);
      setActiveCellInternal(getCellNode(row, cell), false);
    }

    function canCellBeActive(row, cell) {
      if (!options.enableCellNavigation || row >= getDataLengthIncludingAddNew() ||
          row < 0 || cell >= columns.length || cell < 0) {
        return false;
      }

      var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
      if (rowMetadata && typeof rowMetadata.focusable === "boolean") {
        return rowMetadata.focusable;
      }

      var columnMetadata = rowMetadata && rowMetadata.columns;
      if (columnMetadata && columnMetadata[columns[cell].id] && typeof columnMetadata[columns[cell].id].focusable === "boolean") {
        return columnMetadata[columns[cell].id].focusable;
      }
      if (columnMetadata && columnMetadata[cell] && typeof columnMetadata[cell].focusable === "boolean") {
        return columnMetadata[cell].focusable;
      }

      return columns[cell].focusable;
    }

    function canCellBeSelected(row, cell) {
      if (row >= getDataLength() || row < 0 || cell >= columns.length || cell < 0) {
        return false;
      }

      var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
      if (rowMetadata && typeof rowMetadata.selectable === "boolean") {
        return rowMetadata.selectable;
      }

      var columnMetadata = rowMetadata && rowMetadata.columns && (rowMetadata.columns[columns[cell].id] || rowMetadata.columns[cell]);
      if (columnMetadata && typeof columnMetadata.selectable === "boolean") {
        return columnMetadata.selectable;
      }

      return columns[cell].selectable;
    }

    function gotoCell(row, cell, forceEdit) {
      if (!initialized) { return; }
      if (!canCellBeActive(row, cell)) {
        return;
      }

      if (!getEditorLock().commitCurrentEdit()) {
        return;
      }

      scrollCellIntoView(row, cell, false);

      var newCell = getCellNode(row, cell);

      // if selecting the 'add new' row, start editing right away
      setActiveCellInternal(newCell, forceEdit || (row === getDataLength()) || options.autoEdit);

      // if no editor was created, set the focus back on the grid
      if (!currentEditor) {
        setFocus();
      }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // IEditor implementation for the editor lock

    function commitCurrentEdit() {
      var item = getDataItem(activeRow);
      var column = columns[activeCell];

      if (currentEditor) {
        if (currentEditor.isValueChanged()) {
          var validationResults = currentEditor.validate();

          if (validationResults.valid) {
            if (activeRow < getDataLength()) {
              var editCommand = {
                row: activeRow,
                cell: activeCell,
                editor: currentEditor,
                serializedValue: currentEditor.serializeValue(),
                prevSerializedValue: serializedEditorValue,
                execute: function () {
                  this.editor.applyValue(item, this.serializedValue);
                  updateRow(this.row);
                  trigger(self.onCellChange, {
                    row: activeRow,
                    cell: activeCell,
                    item: item
                  });
                },
                undo: function () {
                  this.editor.applyValue(item, this.prevSerializedValue);
                  updateRow(this.row);
                  trigger(self.onCellChange, {
                    row: activeRow,
                    cell: activeCell,
                    item: item
                  });
                }
              };

              if (options.editCommandHandler) {
                makeActiveCellNormal();
                options.editCommandHandler(item, column, editCommand);
              } else {
                editCommand.execute();
                makeActiveCellNormal();
              }

            } else {
              var newItem = {};
              currentEditor.applyValue(newItem, currentEditor.serializeValue());
              makeActiveCellNormal();
              trigger(self.onAddNewRow, {item: newItem, column: column});
            }

            // check whether the lock has been re-acquired by event handlers
            return !getEditorLock().isActive();
          } else {
            // Re-add the CSS class to trigger transitions, if any.
            $(activeCellNode).removeClass("invalid");
            $(activeCellNode).width();  // force layout
            $(activeCellNode).addClass("invalid");

            trigger(self.onValidationError, {
              editor: currentEditor,
              cellNode: activeCellNode,
              validationResults: validationResults,
              row: activeRow,
              cell: activeCell,
              column: column
            });

            currentEditor.focus();
            return false;
          }
        }

        makeActiveCellNormal();
      }
      return true;
    }

    function cancelCurrentEdit() {
      makeActiveCellNormal();
      return true;
    }

    function rowsToRanges(rows) {
      var ranges = [];
      var lastCell = columns.length - 1;
      for (var i = 0; i < rows.length; i++) {
        ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
      }
      return ranges;
    }

    function getSelectedRows() {
      if (!selectionModel) {
        throw "Selection model is not set";
      }
      return selectedRows;
    }

    function setSelectedRows(rows) {
      if (!selectionModel) {
        throw "Selection model is not set";
      }
      selectionModel.setSelectedRanges(rowsToRanges(rows));
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Debug

    this.debug = function () {
      var s = "";

      s += ("\n" + "counter_rows_rendered:  " + counter_rows_rendered);
      s += ("\n" + "counter_rows_removed:  " + counter_rows_removed);
      s += ("\n" + "renderedRows:  " + renderedRows);
      s += ("\n" + "numVisibleRows:  " + numVisibleRows);
      s += ("\n" + "maxSupportedCssHeight:  " + maxSupportedCssHeight);
      s += ("\n" + "n(umber of pages):  " + n);
      s += ("\n" + "(current) page:  " + page);
      s += ("\n" + "page height (ph):  " + ph);
      s += ("\n" + "vScrollDir:  " + vScrollDir);

      alert(s);
    };

    // a debug helper to be able to access private members
    this.eval = function (expr) {
      return eval(expr);
    };

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Public API

    $.extend(this, {
      "slickGridVersion": "2.1",

      // Events
      "onScroll": new Slick.Event(),
      "onSort": new Slick.Event(),
      "onHeaderMouseEnter": new Slick.Event(),
      "onHeaderMouseLeave": new Slick.Event(),
      "onHeaderContextMenu": new Slick.Event(),
      "onHeaderClick": new Slick.Event(),
      "onHeaderCellRendered": new Slick.Event(),
      "onBeforeHeaderCellDestroy": new Slick.Event(),
      "onHeaderRowCellRendered": new Slick.Event(),
      "onBeforeHeaderRowCellDestroy": new Slick.Event(),
      "onMouseEnter": new Slick.Event(),
      "onMouseLeave": new Slick.Event(),
      "onClick": new Slick.Event(),
      "onDblClick": new Slick.Event(),
      "onContextMenu": new Slick.Event(),
      "onKeyDown": new Slick.Event(),
      "onAddNewRow": new Slick.Event(),
      "onValidationError": new Slick.Event(),
      "onViewportChanged": new Slick.Event(),
      "onColumnsReordered": new Slick.Event(),
      "onColumnsResized": new Slick.Event(),
      "onCellChange": new Slick.Event(),
      "onBeforeEditCell": new Slick.Event(),
      "onBeforeCellEditorDestroy": new Slick.Event(),
      "onBeforeDestroy": new Slick.Event(),
      "onActiveCellChanged": new Slick.Event(),
      "onActiveCellPositionChanged": new Slick.Event(),
      "onDragInit": new Slick.Event(),
      "onDragStart": new Slick.Event(),
      "onDrag": new Slick.Event(),
      "onDragEnd": new Slick.Event(),
      "onSelectedRowsChanged": new Slick.Event(),
      "onCellCssStylesChanged": new Slick.Event(),

      // Methods
      "registerPlugin": registerPlugin,
      "unregisterPlugin": unregisterPlugin,
      "getColumns": getColumns,
      "setColumns": setColumns,
      "getColumnIndex": getColumnIndex,
      "updateColumnHeader": updateColumnHeader,
      "setSortColumn": setSortColumn,
      "setSortColumns": setSortColumns,
      "getSortColumns": getSortColumns,
      "autosizeColumns": autosizeColumns,
      "getOptions": getOptions,
      "setOptions": setOptions,
      "getData": getData,
      "getDataLength": getDataLength,
      "getDataItem": getDataItem,
      "setData": setData,
      "getSelectionModel": getSelectionModel,
      "setSelectionModel": setSelectionModel,
      "getSelectedRows": getSelectedRows,
      "setSelectedRows": setSelectedRows,
      "getContainerNode": getContainerNode,

      "render": render,
      "invalidate": invalidate,
      "invalidateRow": invalidateRow,
      "invalidateRows": invalidateRows,
      "invalidateAllRows": invalidateAllRows,
      "updateCell": updateCell,
      "updateRow": updateRow,
      "getViewport": getVisibleRange,
      "getRenderedRange": getRenderedRange,
      "resizeCanvas": resizeCanvas,
      "updateRowCount": updateRowCount,
      "scrollRowIntoView": scrollRowIntoView,
      "scrollRowToTop": scrollRowToTop,
      "scrollCellIntoView": scrollCellIntoView,
      "getCanvasNode": getCanvasNode,
      "focus": setFocus,
      "scrollToLastRendered": scrollToLastRendered,

      "getCellFromPoint": getCellFromPoint,
      "getCellFromEvent": getCellFromEvent,
      "getActiveCell": getActiveCell,
      "setActiveCell": setActiveCell,
      "getActiveCellNode": getActiveCellNode,
      "getActiveCellPosition": getActiveCellPosition,
      "resetActiveCell": resetActiveCell,
      "editActiveCell": makeActiveCellEditable,
      "getCellEditor": getCellEditor,
      "getCellNode": getCellNode,
      "getCellNodeBox": getCellNodeBox,
      "canCellBeSelected": canCellBeSelected,
      "canCellBeActive": canCellBeActive,
      "navigatePrev": navigatePrev,
      "navigateNext": navigateNext,
      "navigateUp": navigateUp,
      "navigateDown": navigateDown,
      "navigateLeft": navigateLeft,
      "navigateRight": navigateRight,
      "navigatePageUp": navigatePageUp,
      "navigatePageDown": navigatePageDown,
      "gotoCell": gotoCell,
      "getTopPanel": getTopPanel,
      "setTopPanelVisibility": setTopPanelVisibility,
      "setHeaderRowVisibility": setHeaderRowVisibility,
      "getHeaderRow": getHeaderRow,
      "getHeaderRowColumn": getHeaderRowColumn,
      "getGridPosition": getGridPosition,
      "flashCell": flashCell,
      "addCellCssStyles": addCellCssStyles,
      "setCellCssStyles": setCellCssStyles,
      "removeCellCssStyles": removeCellCssStyles,
      "getCellCssStyles": getCellCssStyles,

      "init": finishInitialization,
      "destroy": destroy,

      // IEditor implementation
      "getEditorLock": getEditorLock,
      "getEditController": getEditController
    });

    init();
  }
}(jQuery));

define("slickgrid/slick.grid", ["slickgrid/slick.core"], function(){});

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "RowSelectionModel": RowSelectionModel
    }
  });

  function RowSelectionModel(options) {
    var _grid;
    var _ranges = [];
    var _self = this;
    var _handler = new Slick.EventHandler();
    var _inHandler;
    var _options;
    var _defaults = {
      selectActiveRow: true
    };

    function init(grid) {
      _options = $.extend(true, {}, _defaults, options);
      _grid = grid;
      _handler.subscribe(_grid.onActiveCellChanged,
          wrapHandler(handleActiveCellChange));
      _handler.subscribe(_grid.onKeyDown,
          wrapHandler(handleKeyDown));
      _handler.subscribe(_grid.onClick,
          wrapHandler(handleClick));
    }

    function destroy() {
      _handler.unsubscribeAll();
    }

    function wrapHandler(handler) {
      return function () {
        if (!_inHandler) {
          _inHandler = true;
          handler.apply(this, arguments);
          _inHandler = false;
        }
      };
    }

    function rangesToRows(ranges) {
      var rows = [];
      for (var i = 0; i < ranges.length; i++) {
        for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
          rows.push(j);
        }
      }
      return rows;
    }

    function rowsToRanges(rows) {
      var ranges = [];
      var lastCell = _grid.getColumns().length - 1;
      for (var i = 0; i < rows.length; i++) {
        ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
      }
      return ranges;
    }

    function getRowsRange(from, to) {
      var i, rows = [];
      for (i = from; i <= to; i++) {
        rows.push(i);
      }
      for (i = to; i < from; i++) {
        rows.push(i);
      }
      return rows;
    }

    function getSelectedRows() {
      return rangesToRows(_ranges);
    }

    function setSelectedRows(rows) {
      setSelectedRanges(rowsToRanges(rows));
    }

    function setSelectedRanges(ranges) {
      _ranges = ranges;
      _self.onSelectedRangesChanged.notify(_ranges);
    }

    function getSelectedRanges() {
      return _ranges;
    }

    function handleActiveCellChange(e, data) {
      if (_options.selectActiveRow && data.row != null) {
        setSelectedRanges([new Slick.Range(data.row, 0, data.row, _grid.getColumns().length - 1)]);
      }
    }

    function handleKeyDown(e) {
      var activeRow = _grid.getActiveCell();
      if (activeRow && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && (e.which == 38 || e.which == 40)) {
        var selectedRows = getSelectedRows();
        selectedRows.sort(function (x, y) {
          return x - y
        });

        if (!selectedRows.length) {
          selectedRows = [activeRow.row];
        }

        var top = selectedRows[0];
        var bottom = selectedRows[selectedRows.length - 1];
        var active;

        if (e.which == 40) {
          active = activeRow.row < bottom || top == bottom ? ++bottom : ++top;
        } else {
          active = activeRow.row < bottom ? --bottom : --top;
        }

        if (active >= 0 && active < _grid.getDataLength()) {
          _grid.scrollRowIntoView(active);
          _ranges = rowsToRanges(getRowsRange(top, bottom));
          setSelectedRanges(_ranges);
        }

        e.preventDefault();
        e.stopPropagation();
      }
    }

    function handleClick(e) {
      var cell = _grid.getCellFromEvent(e);
      if (!cell || !_grid.canCellBeActive(cell.row, cell.cell)) {
        return false;
      }

      if (!_grid.getOptions().multiSelect || (
          !e.ctrlKey && !e.shiftKey && !e.metaKey)) {
        return false;
      }

      var selection = rangesToRows(_ranges);
      var idx = $.inArray(cell.row, selection);

      if (idx === -1 && (e.ctrlKey || e.metaKey)) {
        selection.push(cell.row);
        _grid.setActiveCell(cell.row, cell.cell);
      } else if (idx !== -1 && (e.ctrlKey || e.metaKey)) {
        selection = $.grep(selection, function (o, i) {
          return (o !== cell.row);
        });
        _grid.setActiveCell(cell.row, cell.cell);
      } else if (selection.length && e.shiftKey) {
        var last = selection.pop();
        var from = Math.min(cell.row, last);
        var to = Math.max(cell.row, last);
        selection = [];
        for (var i = from; i <= to; i++) {
          if (i !== last) {
            selection.push(i);
          }
        }
        selection.push(last);
        _grid.setActiveCell(cell.row, cell.cell);
      }

      _ranges = rowsToRanges(selection);
      setSelectedRanges(_ranges);
      e.stopImmediatePropagation();

      return true;
    }

    $.extend(this, {
      "getSelectedRows": getSelectedRows,
      "setSelectedRows": setSelectedRows,

      "getSelectedRanges": getSelectedRanges,
      "setSelectedRanges": setSelectedRanges,

      "init": init,
      "destroy": destroy,

      "onSelectedRangesChanged": new Slick.Event()
    });
  }
})(jQuery);
define("slickgrid/plugins/slick.rowselectionmodel", function(){});

(function ($) {
  function SlickColumnPicker(columns, grid, options) {
    var $menu;
    var columnCheckboxes;

    var defaults = {
      fadeSpeed:250
    };

    function init() {
      grid.onHeaderContextMenu.subscribe(handleHeaderContextMenu);
      grid.onColumnsReordered.subscribe(updateColumnOrder);
      options = $.extend({}, defaults, options);

      $menu = $("<span class='slick-columnpicker' style='display:none;position:absolute;z-index:20;' />").appendTo(document.body);

      $menu.bind("mouseleave", function (e) {
        $(this).fadeOut(options.fadeSpeed)
      });
      $menu.bind("click", updateColumn);

    }

    function destroy() {
      grid.onHeaderContextMenu.unsubscribe(handleHeaderContextMenu);
      grid.onColumnsReordered.unsubscribe(updateColumnOrder);
      $menu.remove();
    }

    function handleHeaderContextMenu(e, args) {
      e.preventDefault();
      $menu.empty();
      updateColumnOrder();
      columnCheckboxes = [];

      var $li, $input;
      for (var i = 0; i < columns.length; i++) {
        $li = $("<li />").appendTo($menu);
        $input = $("<input type='checkbox' />").data("column-id", columns[i].id);
        columnCheckboxes.push($input);

        if (grid.getColumnIndex(columns[i].id) != null) {
          $input.attr("checked", "checked");
        }

        $("<label />")
            .text(columns[i].name)
            .prepend($input)
            .appendTo($li);
      }

      $("<hr/>").appendTo($menu);
      $li = $("<li />").appendTo($menu);
      $input = $("<input type='checkbox' />").data("option", "autoresize");
      $("<label />")
          .text("Force fit columns")
          .prepend($input)
          .appendTo($li);
      if (grid.getOptions().forceFitColumns) {
        $input.attr("checked", "checked");
      }

      $li = $("<li />").appendTo($menu);
      $input = $("<input type='checkbox' />").data("option", "syncresize");
      $("<label />")
          .text("Synchronous resize")
          .prepend($input)
          .appendTo($li);
      if (grid.getOptions().syncColumnCellResize) {
        $input.attr("checked", "checked");
      }

      $menu
          .css("top", e.pageY - 10)
          .css("left", e.pageX - 10)
          .fadeIn(options.fadeSpeed);
    }

    function updateColumnOrder() {
      // Because columns can be reordered, we have to update the `columns`
      // to reflect the new order, however we can't just take `grid.getColumns()`,
      // as it does not include columns currently hidden by the picker.
      // We create a new `columns` structure by leaving currently-hidden
      // columns in their original ordinal position and interleaving the results
      // of the current column sort.
      var current = grid.getColumns().slice(0);
      var ordered = new Array(columns.length);
      for (var i = 0; i < ordered.length; i++) {
        if ( grid.getColumnIndex(columns[i].id) === undefined ) {
          // If the column doesn't return a value from getColumnIndex,
          // it is hidden. Leave it in this position.
          ordered[i] = columns[i];
        } else {
          // Otherwise, grab the next visible column.
          ordered[i] = current.shift();
        }
      }
      columns = ordered;
    }

    function updateColumn(e) {
      if ($(e.target).data("option") == "autoresize") {
        if (e.target.checked) {
          grid.setOptions({forceFitColumns:true});
          grid.autosizeColumns();
        } else {
          grid.setOptions({forceFitColumns:false});
        }
        return;
      }

      if ($(e.target).data("option") == "syncresize") {
        if (e.target.checked) {
          grid.setOptions({syncColumnCellResize:true});
        } else {
          grid.setOptions({syncColumnCellResize:false});
        }
        return;
      }

      if ($(e.target).is(":checkbox")) {
        var visibleColumns = [];
        $.each(columnCheckboxes, function (i, e) {
          if ($(this).is(":checked")) {
            visibleColumns.push(columns[i]);
          }
        });

        if (!visibleColumns.length) {
          $(e.target).attr("checked", "checked");
          return;
        }

        grid.setColumns(visibleColumns);
      }
    }

    function getAllColumns() {
      return columns;
    }

    init();

    return {
      "getAllColumns": getAllColumns,
      "destroy": destroy
    };
  }

  // Slick.Controls.ColumnPicker
  $.extend(true, window, { Slick:{ Controls:{ ColumnPicker:SlickColumnPicker }}});
})(jQuery);

define("slickgrid/controls/slick.columnpicker", function(){});

define('slickgrid-all',[
  'slickgrid/slick.core',
  'slickgrid/slick.grid',
  'slickgrid/plugins/slick.rowselectionmodel',
  'slickgrid/controls/slick.columnpicker'
],
function() {
  return window.Slick;
});
define('collection/GridSelection',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'collection/Selection',
  'slickgrid-all'
],

function($, _, Backbone, Plumage, Selection, Slick) {


  /**
   * Adapts a Plumage Selection to the slickgrid RowSelection interface.
   *
   * Doesn't support cmd, shift selection.
   *
   * @constructs Plumage.collection.GridSelection
   */
  var GridSelection = function(selection) {
    this.selection = selection;
    this.initialize.apply(this, arguments);
  };

  _.extend(GridSelection.prototype, Backbone.Events,
  /** @lends Plumage.collection.GridSelection.prototype */
  {
    /** wrapped Selection */
    selection: undefined,

    /** SlickGrid grid instance*/
    grid: undefined,

    // Optionss
    selectActiveRow: false,

    initialize: function(options) {
      options = options || {};
      _.extend(this, options);

      this.selection.on('change', this.onSelectionChange, this);
      this.selection.on('add', this.onSelectionChange, this);
      this.selection.on('remove', this.onSelectionChange, this);
      this.selection.on('reset', this.onSelectionChange, this);
    },

    /** SlickGrid init */
    init: function(grid) {
      this.grid = grid;
      this.handler = new Slick.EventHandler();
      this.handler.subscribe(this.grid.onActiveCellChanged, this.onActiveCellChanged.bind(this));
      this.onSelectedRangesChanged = new Slick.Event();
    },

    /** SlickGrid destroy */
    destroy: function() {
      this.handler.unsubscribeAll();
      this.selection.off('change', this.onSelectionChange, this);
      this.selection.off('reset', this.onSelectionChange, this);
    },

    // SlickGrid getters and setters

    getSelectedRows: function () {
      return this.selection.getSelectedIndices();
    },

    setSelectedRows: function (rows) {
      this.selection.setSelectedIndices(rows);
    },

    setSelectedRanges: function (ranges) {
      this.setSelectedRows(this.rangesToRows(ranges));
    },

    getSelectedRanges: function () {
      return this.rowsToRanges(this.getSelectedRows());
    },

    // Event handlers

    onActiveCellChanged: function(e, data) {
      if (this.selectActiveRow && data.row !== null) {
        this.setSelectedRows([data.row]);
      }
    },

    onSelectionChange: function() {
      this.onSelectedRangesChanged.notify(this.getSelectedRanges());
    },

    // SlickGrid helpers

    rowsToRanges: function(rows) {
      var ranges = [];
      var lastCell = this.grid.getColumns().length - 1;
      for (var i = 0; i < rows.length; i++) {
        ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
      }
      return ranges;
    },

    rangesToRows: function(ranges) {
      var rows = [];
      for (var i = 0; i < ranges.length; i++) {
        for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
          rows.push(j);
        }
      }
      return rows;
    }
  });

  return Plumage.collection.GridSelection = GridSelection;
});

define('collection/UserCollection',[
  'jquery',
  'backbone',
  'PlumageRoot',
  'collection/Collection',
  'model/User'
], function($, Backbone, Plumage, Collection) {

  return Plumage.collection.UserCollection = Collection.extend({
    model: 'model/User'
  });
});
define('controller/BaseController',[
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
define('controller/ModelController',[
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
define('model/SearchResults',['jquery', 'underscore', 'backbone', 'PlumageRoot',
        'model/Model',
        'collection/DataCollection'],
function($, _, Backbone, Plumage, Model) {

  return Plumage.model.SearchResults = Model.extend({

    urlRoot: '/search',

    relationships: {
      'results': {
        modelCls: 'collection/DataCollection',
        forceCreate: true,
        reverse: 'searchResult'
      }
    },

    getSearchResultCount: function() {
      return this.getRelated('results').size();
    },

    /**
     * Override to trim whitespace from the query
     */
    set: function(attrs, options) {
      if (attrs.attributes) { attrs = attrs.attributes; }
      if (attrs && attrs.query) {
        attrs.query = $.trim(attrs.query);
      }
      return Model.prototype.set.apply(this, arguments);
    },

    url: function() {
      return this.urlRoot + '/' + this.get('model') + '/' + encodeURIComponent(this.get('query'));
    },

    onLoad: function(options, visited) {
      Model.prototype.onLoad.apply(this, arguments);
      if (window.piwikTracker) {
        window.piwikTracker.trackSiteSearch(this.get('query'), false, this.getSearchResultCount());
      }
    }
  });
});
define('History',['jquery', 'underscore', 'backbone', 'PlumageRoot'],
function($, _, Backbone, Plumage) {
  Plumage.History = Backbone.History.extend(
  /** @lends Plumage.History.prototype */
  {
    /**
     * Need to override Backbone.History to stop it from
      * doing nothing if only query params have changed, which started in 1.1
     *
     * @constructs
     */
    constructor: function() {
      Backbone.History.apply(this, arguments);
    },

    /**
     * Overridden to stop it from doing nothing if only query params have changed.
     */
    navigate: function(fragment, options) {
      if (!Backbone.History.started) {
        return false;
      }
      if (!options || options === true) {
        options = {trigger: !!options};
      }

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the fragment of the query and hash for matching.

      //CHANGE
      //fragment = fragment.replace(pathStripper, '');
      ////////////

      if (this.fragment === fragment) {
        return;
      }
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') {
        url = url.slice(0, -1);
      }

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) {
            this.iframe.document.open().close();
          }
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) {
        return this.loadUrl(fragment);
      }
    },

  });
  return Plumage.History;
});

define('Router',['jquery', 'underscore', 'backbone', 'PlumageRoot', 'History', 'util/ModelUtil'],
function($, _, Backbone, Plumage, History, ModelUtil) {
  return Plumage.Router = Backbone.Router.extend(
  /** @lends Plumage.Router.prototype */
  {
    /** Routes config. Array of pairs [pattern, options]. Options must include controller and method */
    controllerRoutes: undefined,

    /** reference to the controllerManager for access to Controller instances*/
    controllerManager: undefined,

    /** Root url of the application. Passed on to History */
    rootUrl: '/',

    /** If a route is not recognized, redirect to defaultUrl */
    defaultUrl: '/',

    /** use html5 push state? If false, falls back to using # for deep urls. */
    pushState: true,

    /**
     * Routes requests to Controller handler methods.
     *
     * @extends external:Backbone.Router
     * @constructs
     */
    initialize: function(options) {
      options = options || {};
      if (options.app !== undefined) {
        this.app = options.app;
      }
      if (options.defaultUrl !== undefined) {
        this.defaultUrl = options.defaultUrl;
      }
      if (options.rootUrl !== undefined) {
        this.rootUrl = options.rootUrl;
      }
      if (options.pushState !== undefined) {
        this.pushState = options.pushState;
      }
      if (options.history !== undefined) {
        this.history = options.history;
      } else {
        this.history = new Plumage.History();
      }


      this.route('*path', 'defaultRoute', function(path){
        if (window.location.pathname !== this.defaultUrl) {
          window.location.pathname = this.defaultUrl;
        }
      });

      if (this.controllerRoutes) {
        for (var i = 0; i < this.controllerRoutes.length; i++) {
          var route = this.controllerRoutes[i];
          var routeOptions = route[1],
            name = routeOptions.controller + '.' + routeOptions.method,
            handler = _.bind(this.routeToController, this, routeOptions);
          this.route(route[0], name, handler);
        }
      }
    },

    start: function() {
      this.history.start({pushState: this.pushState, root: this.rootUrl});
    },

    /** Route handler that forwards to method 'options.method'
     * in Controller 'options.controller'
     */
    routeToController: function(options, queryParams){
      if (this.app.navView) {
        this.app.navView.select(options.nav);
      }
      var ctrl = this.app.controllerManager.getController(options.controller);
      ctrl[options.method].apply(ctrl, Array.prototype.slice.call(arguments, 1));
    },

    /**
     * Override to switch to this.history
     */
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) {
        route = this._routeToRegExp(route);
      }
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) {
        callback = this[name];
      }
      var router = this;
      this.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        router.history.trigger('route', router, name, args);
        router.logNavigationAction(window.location.href, window.location.pathname);
      });

      return this;
    },

    navigate: function(url, options) {
      if (url === null || url === undefined) {
        throw new Error('A "url" must be specified');
      }

      //remove host and protocol if it's local
      if (url.indexOf(window.location.origin) === 0) {
        url = url.slice(window.location.origin.length);
      }

      //remove url prefix
      if (url.indexOf(this.rootUrl) === 0) {
        url = url.slice(this.rootUrl.length);
      }
      this.history.navigate(url, options);
    },

    /** Special navigate method for working around Backbone's ignoring of query params. */
    navigateWithQueryParams: function(url, options) {
      if (url === window.location.pathname + window.location.search) {
        //already there
        return;
      }

      this.navigate(url, options);
    },

    /**
     * Template method hook for logging, eg post to google analytics
     */
    logNavigationAction: function(url, pageName) {
      // do nothing
    },

    /**
     * Override to parse query string
     */
    execute: function(callback, args) {
      var queryParams = ModelUtil.parseQueryString(args.pop());
      if (queryParams) {
        args.push(queryParams);
      }
      if (callback) {
        callback.apply(this, args);
      }
    }
  });
});
define('util/ArrayUtil',[
  'jquery',
  'moment',
  'PlumageRoot'
], function($, moment, Plumage) {
  return Plumage.util.ArrayUtil = {
    /**
     * Similar to _.sortedIndex, but doesn't apply iterator to target value
     */
    findClosestIndexToValue: function(array, value, getValue, context) {
      var low = 0, high = array.length;
      while (low < high) {
        var mid = Math.floor((low + high)/2);
        if (getValue.call(context, array[mid]) < value) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return low;
    }
  };
});
define('util/D3Util',[
  'jquery',
  'moment',
  'PlumageRoot'
], function($, moment, Plumage) {
  return Plumage.util.D3Util = {
    /**
     * Similar to _.sortedIndex, but doesn't apply iterator to target value
     */
    applyConfig: function(d3El, config, context) {
      for (var key in config) {
        if (!config.hasOwnProperty(key)) { return; }
        d3El.attr(key, Plumage.util.D3Util.getAccessor(config[key], context));
      }
    },

    /**
     * Wrap accessor to add context as 3rd param.
     * @param attr existing accessor function or value
     * @returns wrapped accessor
     */
    getAccessor: function(attr, context) {
      if (typeof(attr) === 'function') {
        return function (d, i) {
          return attr(d, i, context);
        };
      }
      return attr;
    }
  };
});
define('util/DateTimeUtil',[
  'jquery',
  'moment',
  'PlumageRoot'
], function($, moment, Plumage) {

  Plumage.util.defaultDateFormat = 'MMM Do YYYY, HH:mm:ss';

  return Plumage.util.DateTimeUtil = {

    parseRelativeDate: function(date, utc) {
      var today = utc ? moment.utc({hour: 0}) : moment({hour: 0});
      if (date === 'today') {
        date = today;
      } else if ($.isPlainObject(date)) {
        date = today.clone().add(date);
      }
      return date;
    },

    isSameDay: function(date1, date2, isUtc) {
      if (!date1 || !date2) {
        return false;
      }
      if ($.isNumeric(date1)) {
        date1 = isUtc ? moment.utc(date1) : moment(date1);
      }
      if ($.isNumeric(date2)) {
        date2 = isUtc ? moment.utc(date2) : moment(date2);
      }
      return date1.format('YYYY-MM-DD') === date2.format('YYYY-MM-DD');
    },

    isDateInRange: function(date, minDate, maxDate, isUtc) {
      if ($.isNumeric(date)) {
        date = isUtc ? moment.utc(date) : moment(date);
      }

      return !((minDate && ! Plumage.util.DateTimeUtil.isSameDay(date, minDate) && date.isBefore(minDate)) || (
          maxDate && ! Plumage.util.DateTimeUtil.isSameDay(date, maxDate, isUtc) && date.isAfter(maxDate)));
    },

    formatDate: function(timestamp, dateFormat) {
      dateFormat = dateFormat || Plumage.util.defaultDateFormat;
      return new moment(Number(timestamp)).format(dateFormat);
    },

    formatDateUTC: function(timestamp, dateFormat) {
      dateFormat = dateFormat || Plumage.util.defaultDateFormat;
      return new moment(Number(timestamp)).utc().format(dateFormat);
    },

    formatDateFromNow: function(timestamp) {
      return moment(Number(timestamp)).fromNow();
    },

    formatDuration: function(millis) {
      if (millis <= 0) {
        return 'None';
      }
      var d = moment.duration(millis), result = '',
        days = Math.floor(d.valueOf()/(3600000*24)),
        hours = d.hours(),
        minutes = d.minutes(),
        started = false;

      if (millis < 60000) {
        return d.seconds() + ' seconds';
      }
      if(days > 0) {
        started = true;
        result += days + (days === 1 ? ' day ' : ' days ');
      }

      if(hours > 0 || started) {
        started = true;
        result += hours + (hours === 1 ? ' hour ' : ' hours ');
      }

      if(minutes > 0 || started) {
        started = true;
        result += minutes + (minutes === 1 ? ' minute' : ' minutes');
      }

      return result;
    },

    formatDurationShort: function(millis) {
      if (millis <= 0) {
        return 'None';
      }
      var d = moment.duration(millis), result = '',
        days = Math.floor(d.valueOf()/(3600000*24)),
        hours = d.hours(),
        minutes = d.minutes(),
        started = false;

      if (millis < 60000) {
        return d.seconds() + 's';
      }

      if(days > 0) {
        started = true;
        result += days + 'd ';
      }

      if(hours > 0 || started) {
        started = true;
        result += hours + 'h ';
      }

      if(minutes > 0 || started) {
        started = true;
        result += minutes + 'm';
      }
      return result;
    }
  };
});

define('view/View',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'spinjs',
  'PlumageRoot'
], function($, _, Backbone, Handlebars, Spinner, Plumage) {

  return Plumage.view.View = Backbone.View.extend(
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

    pathRegex: /^(\S*\/)\S+?\.[^.]*$/,

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
        if (template.slice(0, 'text!'.length) === 'text!') {
          throw 'Don\'t include text! in template path';
        }
        if (template.match(this.pathRegex)) {
          template = require('text!' + template);
        }
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
      var a = $(e.target).closest('a');
      if (!a.hasClass('outlink')) {
        e.preventDefault();
        e.stopPropagation();
        var url = a.prop('pathname') + a.prop('search');
        window.router.navigateWithQueryParams(url, {trigger:true});
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
    showLoadingAnimation: function() {
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

      var offset = $(this.el).offset();
      if(!this.loader){
        this.loader = $('<div class="loader"> <div class="spinner-box"></div> </div>');
        $('body').append(this.loader);
        this.spinner = new Spinner(opts);
      }
      this.spinner.spin($('.spinner-box', this.loader)[0]);
      this.loader.css({
        left: offset.left,
        top: offset.top,
        width: $(this.el).width(),
        height: $(this.el).height()
      });
      this.loader.show();
      this.spinner.spin($('.spinner-box', this.loader)[0]);
      this.isLoading = true;
    },

    /** Hide the loading animation. */
    hideLoadingAnimation: function() {
      if(this.loader){
        this.loader.fadeOut('fast', function() {
          this.spinner.stop();
        }.bind(this));
      }
      this.isLoading = false;
    }
  });
});
define('view/ContainerView',[
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

define('ViewBuilder',[ 'jquery', 'underscore', 'backbone',
  'PlumageRoot', 'view/View'
], function($, _, Backbone, Plumage,
  View
) {

  var ViewBuilder = function() {
    this.initialize.apply(this, arguments);
  };

  _.extend(ViewBuilder.prototype,
  /** @lends Plumage.ViewBuilder.prototype */
  {
    defaultViewCls: undefined,
    defaultViewOptions: undefined,

    initialize: function(options) {
      options = options || {};
      _.extend(this, options);

      this.defaultViewCls = this.defaultViewCls || 'view/ModelView';
      if (typeof(this.defaultViewCls) === 'string') {
        this.defaultViewCls = require(this.defaultViewCls);
      }
    },

    buildView: function(config) {
      if (config instanceof View) {
        return config;
      }

      config = _.extend({}, this.defaultViewOptions, config);

      var viewCls = config.viewCls || this.defaultViewCls;
      delete config.viewCls;
      if(typeof(viewCls) === 'string') {
        viewCls = require(viewCls);
      }

      return new viewCls(config);
    }
  });


  return Plumage.ViewBuilder = ViewBuilder;
});



define('text!view/templates/LoadError.html',[],function () { return '\n<div class="load-error {{#message}}with-message{{/message}}">\n  <div class="error-icon">&times;</div>\n  <div class="error-text">\n    <div>Error loading resource</div>\n    {{#message}}\n      <div class="message">{{.}}</div>\n    {{/message}}\n  </div>\n</div>';});

define('view/ModelView',[
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
define('view/CollectionView',[
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
      if (typeof(this.itemViewCls) === 'string') {
        this.itemViewCls = requirejs(this.itemViewCls);
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
define('view/form/Form',[
  'jquery',
  'backbone',
  'underscore',
  'PlumageRoot',
  'view/ModelView',
  'util/ModelUtil'
], function($, Backbone, _, Plumage, ModelView, ModelUtil) {

  /**
   * Container for a field subviews.
   *
   * Uses dom form events to detect changes and submits in fields.
   */

  return Plumage.view.form.Form = ModelView.extend({

    tagName: 'form',

    template: '<div class="fields"></div><input type="submit" value="{{actionLabel}}"/>',

    actionLabel: 'Submit',

    updateModelOnChange: false,

    events: {
      'submit': 'onSubmit',
      'change': 'onChange'
    },

    initialize: function(options) {
      ModelView.prototype.initialize.apply(this, arguments);
    },

    getTemplateData: function() {
      var data = ModelView.prototype.getTemplateData.apply(this, arguments);
      return _.extend(data, {
        actionLabel: this.getActionLabel()
      });
    },

    getActionLabel: function() {
      return this.actionLabel ? this.actionLabel : 'Submit';
    },

    setMessage: function(message, messageCls) {
      var messageView = this.getSubView('message');
      if (messageView) {
        messageView.setMessage(message, messageCls);
      }
    },

    //
    // actions
    //

    submit: function() {
      if (!this.model) {
        var ModelCls = ModelUtil.loadClass(this.modelCls);
        this.model = new ModelCls();
      }
      if(this.isValid()) {
        this.updateModel(this.rootModel);
        var error;
        if (this.model.validate) {
          error = this.model.validate(this.model.attributes);
        }
        if(!error) {
          this.model.save(null, {success: this.onSaveSuccess.bind(this)});
        }
      }
    },

    //
    // Events
    //

    onChange: function(e) {
      if (this.updateModelOnChange) {
        this.onSubmit(e);
      }
      this.trigger('change', this, e);
    },

    onSubmit: function(e) {
      e.preventDefault();
      this.submit();
    },

    onSaveSuccess: function(model, resp, xhr) {
      if (resp.meta.success) {
        this.trigger('save', this, model);
      } else {
        if (resp.meta.message) {
          this.setMessage(resp.meta.message, resp.meta.message_class);
        }
      }
    },

    onModelInvalid: function(model, validationError, message, messageCls) {
      if (message) {
        this.setMessage(message, messageCls);
      }
    }
  });
});

define('text!view/form/fields/templates/Field.html',[],function () { return '{{#if label}}\n<label class="control-label" for="{{valueAttr}}">{{label}}</label>\n<div class="controls">\n  <span class="field">{{> field}}</span>\n  <span class="help-inline">{{#if message}}{{message}}{{/if}}</span>\n</div>\n{{else}}\n  {{> field}}\n  <span class="help-inline">{{#if message}}{{message}}{{/if}}</span>\n{{/if}}\n';});


define('view/form/fields/Field',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/View',
  'view/ModelView',
  'text!view/form/fields/templates/Field.html'
], function($, _, Backbone, Handlebars, Plumage, View, ModelView, template) {



  return Plumage.view.form.fields.Field = ModelView.extend(
  /** @lends Plumage.view.form.fields.Field.prototype */
  {
    className: 'control-group',

    template: template,

    /**
     * Template for html input element.
     * This template is separate so that it can be reused by subclasses.
     */
    fieldTemplate: '<input type="text" name="{{valueAttr}}" {{#placeholder}}placeholder="{{.}}"{{/placeholder}} value="{{value}}" {{#readonly}}readonly="readonly"{{/readonly}} {{#disabled}}disabled=1{{/disabled}}/>',

    /**
     * optional. model attribute to display as label
     */
    labelAttr: undefined,

    /**
     * Value to display as label if no labelAttr
     */
    label: undefined,

    /**
     * model attribute to display and edit
     */
    valueAttr: undefined,

    /**
     * input's name attribute
     */
    fieldName: undefined,

    /**
     * If updateModelOnChange is set, the model is updated on every change
     */
    updateModelOnChange: false,

    /**
     * The view value. It's separate from the model value, and used for rerendering.
     *
     * Because it comes from the dom, value is always a string.
     */
    value: '',

    /** Text to show when blank */
    placeholder: undefined,

    /** required, minLength, maxLength, email, cc etc.*/
    validationRules: undefined,

    /** Template to show when validation fails */
    validationMessages: {
      required: 'required',
      minLength: 'Must be at least {{param0}} chars',
      maxLength: 'Must not be more than {{param0}} chars',
      email: 'Not a valid email address',
      number: 'Must be a number',
      minValue: 'Must be >= {{param0}}',
      maxValue: 'Must be <= {{param0}}'
    },

    /** error, warning, success. Cleared on model load */
    validationState: undefined,

    /** message to display next to field, eg error message */
    message: undefined,


    constructor: function(options){
      options = options || {};

      this.validationMessages = _.extend({},this.validationMessages, options.validationMessages);
      delete options.validationMessages;

      View.apply(this, arguments);
    },

    /**
     * An editable view for displaying and editing a single value of a model.
     *
     * The value displayed (the view value) is allowed to differ from the model's value
     * until updateModel is called.
     *
     * To automatically update the model on change set updateModelOnChange = true.
     *
     * Notes:
     *  - In order to be used in a Form, Field subclasses must render an input element.
     *  - The rendered dom also has state. The view value *must* be kept in sync with the
     *    DOM value in case the field needs to be rerendered. By default this is done by setting
     *    the view value to the result of getValueFromDom when the DOM value changes.
     *     - Make sure to override getValueFromDom if your rendered DOM is not an input tag.
     *  - When triggering a change event, make sure both DOM and backbone events are triggered.
     *    Since a DOM event triggers a backbone event, do this by triggering a DOM event.
     *
     * @constructs
     * @extends Plumage.view.ModelView
     */
    initialize: function(options) {
      this.validationMessages = _.extend({},this.validationMessages, options.validationMessages);
      delete options.validationMessages;

      ModelView.prototype.initialize.apply(this, arguments);
      this.className = this.className ? this.className + ' field' : 'field';
    },

    onRender: function() {
      var inputEl = this.getInputEl();
      var hasFocus = inputEl ? inputEl.is(':focus') : false;
      Handlebars.registerPartial('field', this.fieldTemplate);
      ModelView.prototype.onRender.apply(this, arguments);

      this.$el.addClass(this.validationState);

      inputEl = this.getInputEl();
      if (inputEl && hasFocus) {
        inputEl.focus();
      }
    },

    // This implementation avoids rerendering (and losing cursor position),
    // however, it has to be overridden frequently.
    // Maybe move this into a subclass TextField?
    update: function(isLoad) {
      if (this.isRendered) {
        var val = this.getInputEl().val(),
          newVal = this.getValueString(this.getValue());
        if (val !== newVal) {
          this.getInputEl().val(newVal);
        }
      } else {
        this.render();
      }
    },

    //
    // Init Events
    //

    delegateEvents: function(events) {
      events = events || _.result(this, 'events');
      var selector = this.getInputSelector();
      if (selector) {
        events = _.clone(events || {});
        events['blur ' +selector] = 'onBlur';
        events['focus ' +selector] = 'onFocus';
        events['submit ' +selector] = 'onSubmit';
        events['change ' +selector] = 'onChange';
        events['input ' +selector] = 'onInput'; //for text fields
        events['keydown ' +selector] = 'onKeyDown'; //detect enter/escape etc
        events['mouseup ' +selector] = 'onChange'; //for select/checkbox etc
      }
      Backbone.View.prototype.delegateEvents.apply(this, [events]);
    },

    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
      var inputEl = this.getInputEl();
      if (inputEl) {
        inputEl.off('.field');
      }
    },

    getInputSelector: function() {
      return this.$el.is(':input') ? '' : ':input:first';
    },

    getInputEl: function() {
      var selector = this.getInputSelector();
      return selector ? this.$(selector).first() : this.$el;
    },

    hasValue: function() {
      var value = this.getValue();
      return value !== null && value !== undefined && value !== '';
    },

    //
    // Modifiers
    //

    focus: function() {
      this.getInputEl().focus();
    },

    setDisabled: function(disabled) {
      if (this.disabled !== disabled) {
        this.disabled = disabled;
        this.render();
      }
    },

    //
    // Overrides
    //

    getTemplateData: function() {
      var data = {
        label: this.getLabel(),
        valueAttr: this.valueAttr,
        value: this.getValueString(this.getValue()),
        hasValue: this.hasValue(),
        placeholder: this.placeholder,
        readonly: this.readonly,
        disabled: this.disabled,
        validationState: this.validationState,
        message: this.message
      };
      return data;
    },

    setModel: function() {
      ModelView.prototype.setModel.apply(this, arguments);
      this.setValidationState(null, null);
      this.updateValueFromModel();
    },

    ensureData: function() {
      ModelView.prototype.ensureData.apply(this, arguments);
    },

    //
    // Attributes
    //

    getValue: function() {
      return this.value;
    },

    getValueString: function(value) {
      return value;
    },

    /**
     * updates the field value, and triggers change (both plumage and dom events)
     *
     * Note: This is not the only path to change the field value. The field value can also be changed by
     * updateValueFromModel, so do not update non-model view state here. Do that in valueChanged.
     */
    setValue: function(newValue, options) {
      options = options || {};
      if (this.getValue() === newValue) {
        return;
      }
      this.value = newValue;

      if (this.updateModelOnChange && this.model) {
        this.updateModel(this.rootModel);
      } else {
        this.update();
      }

      this.valueChanged();

      if (!options.silent) {
        this.changing = true;
        this.trigger('change', this, this.getValue());

        //for catching in form
        this.triggerChange();
        this.changing = false;
      }
    },

    getLabel: function() {
      if (this.labelAttr) {
        return this.model ? this.model.get(this.labelAttr) : null;
      }
      return this.label;
    },

    blur: function() {
      this.$el.blur();
    },

    onShow: function() {
      ModelView.prototype.onShow.apply(this, arguments);
    },

    //
    // Validation
    //

    validators: {
      required: function(value, params) {
        return value !== undefined && value !== null && value !== '';
      },
      minLength: function(value, params) {
        return value.length >= params;
      },
      maxLength: function(value, params) {
        return value.length <= params;
      },
      email: function(value) {
        return value ? (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/).test(value) : true;
      },
      number: function(value) {
        return !isNaN(value) && !isNaN(Number(value));
      },
      minValue: function(value, params) {
        return value >= params[0];
      },
      maxValue: function(value, params) {
        return value <= params[0];
      }
    },

    setValidationState: function(state, message) {
      if (this.validationState) {
        this.$el.removeClass(this.validationState);
      }
      this.validationState = state;
      this.message = message;

      this.$el.addClass(this.validationState);
      this.$('.help-inline').html(this.message);
    },

    validate: function() {
      return this.validateValue(this.getValue());
    },

    validateValue: function(value) {
      var rules = this.validationRules;

      if (rules) {
        if (!$.isPlainObject(rules)) {
          //eg 'required'
          var newRules = {};
          newRules[rules] = true;
          rules = newRules;
        }

        var success = true;
        //check required first
        if (rules.required) {
          success = this.applyValidator(value, rules.required, 'required');
        }
        if (success) {
          _.keys(rules).every(function(k) {
            if (k === 'required') {
              return true;
            }
            return success = this.applyValidator(value, rules[k], k);
          }.bind(this));
        }
        if (success) {
          this.setValidationState(null,null);
        }
        return success;
      }
      return true;
    },

    applyValidator: function(value, params, name) {
      var validator;
      if ($.isFunction(params)) {
        validator = params;
        params = [];
      } else {
        params = $.isArray(params) ? params : [params];
        validator = this.validators[name];
      }

      if (!validator(value, params)) {
        var message = this.getValidationMessage(name, params);
        this.setValidationState('error', message);
        return false;
      }
      return true;
    },

    getValidationMessage: function(name, params) {
      var message = this.validationMessages[name] || 'invalid';
      return Handlebars.compile(message)(_.object(_.map(params, function(x, i) {return ['param' + i, x];})));
    },

    ////
    //
    // Helpers
    //
    ////


    //
    // View value <--> Model
    //

    isValid: function() {
      return this.validate();
    },

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.disabled ? null : this.getValue();
      return model.set(this.valueAttr, value) !== false;
    },

    updateValueFromModel: function() {
      this.value = '';
      if (this.model) {
        this.value = this.getValueFromModel();
        this.valueChanged(true);

        if (this.isRendered) {
          this.update();
        }
      }
    },

    getValueFromModel: function() {
      if (this.model) {
        var result = this.model.get(this.valueAttr);
        return result === undefined ? '' : result;
      }
    },

    //
    // View value <--> DOM value
    //

    getValueFromDom: function() {
      var inputEl = this.getInputEl();
      if (inputEl && inputEl.val) {
        return inputEl.val();
      }
    },

    processDomValue: function(value) {
      return value;
    },

    //
    // Gets current value from model
    //

    triggerChange: function(query) {
      //trigger change by blurring to prevent 2nd change event on blur
      var el = this.getInputEl();
      if (el.is(':focus')) {
        el.blur();
        el.focus();
      } else {
        el.change();
      }
    },

    /**
     * Use this to completely disallow invalid values from being set.
     * this is different from validationRules. If a value doesn't pass isDomValueValid, it will be reverted before
     * validation happens.
     */
    isDomValueValid: function(value) {
      if (this.updateModelOnChange) {
        return this.validateValue(value);
      }
      return true;
    },

    updateValueFromDom: function() {
      var newValue = this.getValueFromDom();

      if (this.isDomValueValid(newValue)) {
        newValue = this.processDomValue(newValue);
        if (!this.changing) {
          this.setValue(newValue, {silent: true});
        }
        this.trigger('change', this, this.getValue());
      } else {
        this.update();
      }
    },

    /**
     * Hook called when value changes. Useful for keeping view state in sync.
     * @param {Boolean} fromModel Being called from updateValueFromModel?
     */
    valueChanged: function(fromModel) {
      return;
    },

    //
    // Event handlers
    //

    onChange: function(e) {
      this.updateValueFromDom();
    },

    onInput: function(e) {
      this.updateValueFromDom();
    },

    onKeyDown: function(e) {
      //do nothing
    },

    onBlur: function(e) {
      this.updateValueFromDom();
      this.validate();
      this.trigger('blur', this);
    },

    onFocus: function(e){
      //do nothing
    },

    onSubmit: function(e) {
      this.trigger('submit', this);
    },

    onModelChange: function (e) {
      if (e.changed[this.valueAttr] !== undefined) {
        this.updateValueFromModel();
      }
    },

    onModelLoad: function () {
      this.setValidationState(null, null);
      this.updateValueFromModel();
    },

    onModelInvalid: function(model, validationError) {
      if (validationError) {
        var message = validationError[this.valueAttr];
        if (message) {
          if ($.isArray(message)) {
            message = message[0];
          }
          this.setValidationState('error', message);
        }
      }
    }
  });
});

define('view/form/fields/TextArea',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field'
], function($, Backbone, Handlebars, Plumage, Field) {
  return Plumage.view.form.fields.TextArea = Field.extend({
    template: Handlebars.compile('<textarea {{#fieldName}}name="{{fieldName}}"{{/fieldName}}>{{value}}</textarea>'),

    update: function(isLoad) {
      return this.$('textarea').val(this.getValue());
    }
  });
});

define('view/comment/CommentForm',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/Form',
  'view/form/fields/TextArea',
  'model/Comment'
], function($, Backbone, Handlebars, Plumage, Form, TextArea) {

  return Plumage.view.comment.CommentForm = Form.extend({

    modelCls: 'model/Comment',

    actionLabel: 'Comment',

    initialize: function(options) {
      Form.prototype.initialize.apply(this, arguments);
      options = options || {};
      this.subViews = [
        new TextArea({
          selector: '.fields',
          valueAttr: 'body'
        })
      ];
    }
  });
});


define('text!view/comment/templates/CommentsSection.html',[],function () { return '{{#expandable}}\n<a href="#" class="comments-toggle">{{label}}</a>\n{{/expandable}}\n{{^expandable}}\n{{#title}}\n<h4>{{.}}</h4>\n{{/title}}\n{{/expandable}}\n\n<div class="comments-wrap{{^expanded}} hidden{{/expanded}}">\n  <div class="comments">\n  </div>\n\n  <div class="comment-form">\n  </div>\n  <div class="clear"></div>\n</div>';});


define('text!view/comment/templates/CommentView.html',[],function () { return '<h5 class="item-author-header">\n  <img class="avatar" src="{{ user.image_thumb }}" />\n  <span class="name">{{user.first_name}} {{user.last_name}}</span>\n  <span class="screenname muted"> @{{user.screenname}}</span>\n  <span class="timestamp">&mdash; {{created_at}}</span>\n</h5>\n<div class="comment-text">\n  {{#can_delete}}\n    <a class=\'btn btn-mini btn-danger pull-right delete\'>Delete</a>\n  {{/can_delete}}\n  <p class="comment-body">\n  {{{body}}}\n  </p>\n</div>\n';});

function recursiveLinkify(element, match, replacer) {

    // For each content node in the given element,
    $.each(
        element.contents(),
        function(index, element) {
            element = $(element);

            // Replace it's content if it's a text node
            if (element.get(0).nodeType == document.TEXT_NODE) {
                element.after($("<div />").text(element.text()).html().replace(match, replacer)).remove();
            }

            // Or recurse down into it if it's not an anchor or a button
            else if (element.prop("tagName") != "A" && element.prop("tagName") != "BUTTON") {
                recursiveLinkify(element, match, replacer);
            }
        }
    );
}

(function($) {
    $.fn.linkify = function(opts) {
        return this.each(function() {

            // Regex from http://daringfireball.net/2010/07/improved_regex_for_matching_urls
            var matchURLs = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/;
            var replaceURLs = function(str) {
                return "<a href='"+(str.indexOf("://") === -1 ? "http://" : "")+str+"'>"+str+"</a>";
            }
            recursiveLinkify($(this), matchURLs, replaceURLs);

            // Regex from http://www.regular-expressions.info/email.html
            var matchEmails = /\b[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ig;
            var replaceEmails = function(str) {
                return "<a href='mailto:"+str+"'>"+str+"</a>";
            }
            recursiveLinkify($(this), matchEmails, replaceEmails);
        });
    }
})(jQuery);

define("linkify", function(){});

define('view/comment/CommentView',[
  'jquery',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/ModelView',
  'text!view/comment/templates/CommentView.html',
  'linkify'
], function($, Backbone, Handlebars, moment, Plumage, ModelView, template) {

  return Plumage.view.comment.CommentView = ModelView.extend({
    className: 'comment',

    modelCls: 'model/Comment',

    template: Handlebars.compile(template),

    events: {
      'click .delete': 'onDeleteClick'
    },

    getTemplateData: function() {
      if (this.model) {
        var result = this.model.toViewJSON();
        result.body = result.body.replace(/\n/g, '<br/>');
        result.created_at = moment(result.created_at).fromNow();
        result.can_delete = result.user.account === window.currentUser;
        return result;
      }
      return {};
    },

    onRender: function() {
      ModelView.prototype.onRender.apply(this, arguments);
      var body = this.$('.comment-body');
      body.linkify();
      $('a', body).addClass('outlink').attr('target', '_');
    },

    onDeleteClick: function(e) {
      e.preventDefault();
      var collection = this.model.collection;
      this.model.destroy();
    }
  });
});

define('view/comment/CommentsSection',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'view/comment/CommentForm',
  'model/Comment',
  'view/CollectionView',
  'text!view/comment/templates/CommentsSection.html',
  'view/comment/CommentView'
], function($, Backbone, Handlebars, Plumage, ModelView, CommentForm, Comment, CollectionView, template) {

  return Plumage.view.comment.CommentsSection = ModelView.extend({

    expandable: false,

    expanded: false,

    template: Handlebars.compile(template),

    title: 'Comments',

    events: {
      'click .comments-toggle': 'onClickToggle'
    },

    getTemplateData: function() {
      var label = 'No Comments';
      if (this.model) {
        var comments = this.model.getRelated('comments');
        var count = comments ? comments.size() : 0;
        if (count === 1) {
          label = '1 Comment';
        } else if (count > 1){
          label = count + ' Comments';
        }
      }
      return {
        title: this.title,
        expandable: this.expandable,
        expanded: this.expandable ? this.expanded : true,
        label: label
      };
    },

    initialize: function(options) {
      ModelView.prototype.initialize.apply(this, arguments);
      options = options || {};
      var emptyTemplate;
      if (!this.expandable) {
        emptyTemplate = '<div class="comment no-comments">No comments yet. Leave the first one.</div>';
      }

      //lazy init subviews
      if (!this.expandable || this.expanded) {
        this.initSubViews();
      }
    },

    initSubViews: function() {
      var emptyTemplate;
      if (!this.expandable) {
        emptyTemplate = '<div class="comment no-comments">No comments yet. Leave the first one.</div>';
      }
      this.subViews = [
        this.commentsView = new CollectionView({
          selector: '.comments',
          itemViewCls: 'view/comment/CommentView',
          relationship: 'comments',
          emptyTemplate: emptyTemplate
        }),
        this.commentForm = new CommentForm({selector: '.comment-form'})
      ];
      this.commentForm.on('save', this.onCommentFormSave.bind(this));
      if (this.model) {
        this.commentsView.setModel(this.model);
        this.resetCommentForm();
      }
    },

    setModel: function(rootModel, parentModel) {
      ModelView.prototype.setModel.apply(this, arguments);
      this.resetCommentForm();
    },

    getCommentableId: function(model) {
      return model ? model.id : undefined;
    },

    getSubject: function(model) {
      return undefined;
    },

    /**
     * Event Handlers
     */

    onModelLoad: function() {
      this.resetCommentForm();
    },

    onCommentFormSave: function(form, model) {
      if (this.getSubject) {
        model.set('subject', this.getSubject(model));
      }
      this.resetCommentForm();
      this.model.getRelated('comments').add(model);
      this.render();
    },

    onClickToggle: function(e) {
      e.preventDefault();
      if(!this.commentsView) {
        this.initSubViews();
        //let event propagation finish before re-rendering
        setTimeout(function() {
          this.render();
          this.toggleComments();
        }.bind(this), 0);
      } else {
        this.toggleComments();
      }
    },


    /**
     * Helpers
     */

    toggleComments: function() {
      this.$('.comments-wrap').animate({'height': 'toggle'}, 200);
      this.expanded = !this.expanded;
    },

    resetCommentForm: function() {
      if (this.commentForm) {
        this.commentForm.setModel(new Comment({
          commentable_type: this.model.commentableType,
          commentable_url: this.model.url(),
          body: '',
          subject: this.getSubject(this.model)
        }));
      }
    }

  });
});


define('text!view/comment/templates/ExpandableComments.html',[],function () { return '<a class="comments-action" href="#">{{actionLabel}}</a>\n<div class="floater-wrapper comment-wrapper hidden">\n  <a href="#" class="close comment-close">&times;</a>\n  <div class="comments">\n    {{#each comments}}\n    <div class="comment">\n\t    <h5 class="item-author-header">\n\t\t    <img class="avatar" src="{{user.image_thumb}}" />\n\t\t    <span class="name">{{user.first_name}} {{user.last_name}}</span>\n\t\t    <span class="screenname muted"> @{{user.screenname}}</span>\n\t\t    <span class="timestamp">{{created_at}}</span>\n\t\t  </h5>\n\t\t\t<p class="comment-text">\n\t\t\t  {{body}}\n\t\t\t</p>\n    </div>\n    {{/each}}\n  </div>\n\n  <form accept-charset="UTF-8" action="/create_question" method="post">\n    <input id="id" name="id" type="hidden" value="649">\n    <textarea class="comment-text" id="comment_649" name="content"></textarea>\n    <input class="btn comment_submit_button" name="commit" type="submit" value="Comment">\n  </form>\n</div>\n';});

define('view/comment/ExpandableComments',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'text!view/comment/templates/ExpandableComments.html',
  'view/comment/CommentView'
], function($, Backbone, Handlebars, Plumage, ModelView, template) {

  return Plumage.view.comment.ExpandableComments = ModelView.extend({

    template: Handlebars.compile(template),

    itemViewCls: 'view/comment/CommentView',

    events: {
      'click .comments-action': 'onActionClick'
    },

    getTemplateData: function() {
      return {
        comments: ModelView.prototype.getTemplateData.apply(this, arguments),
        actionLabel: this.getActionLabel()
      };
    },

    getActionLabel: function() {
      var size = this.model.size();
      if (size === 0) {
        return 'comment';
      } else if (size === 1) {
        return '1 comment';
      } else {
        return this.model.size() + ' comments';
      }
    },

    onActionClick: function() {
      var el = this.$('.comment-wrapper');
      if (el.hasClass('hidden')) {
        el.removeClass('hidden');
        el.find('.comment-text').focus();
        window.setTimeout(function() { el.addClass('open'); }, 50);
      } else {
        el.removeClass('open');
        window.setTimeout(function() { el.addClass('hidden'); }, 200);
      }
    }
  });
});


define('text!view/templates/MessageView.html',[],function () { return '\n{{#body}}\n<div class="message-body {{../cls}}">\n{{{.}}}\n</div>\n{{/body}}\n';});

define('view/MessageView',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'text!view/templates/MessageView.html'
], function($, Backbone, Handlebars, Plumage, ModelView, template) {

  /**
   * lists with selections need two models:
   *  - one for list contents
   *  - one for list selection
   *
   * The selection model, populated by the model hierarchy. The list model needs to be populated manually.
   */
  return Plumage.view.MessageView = ModelView.extend({

    className: 'message',

    template: template,

    updateOnMessage: true,

    fadeOutTime: 2500,

    events: {
      'click a': 'onLinkClick'
    },

    initialize: function() {
      ModelView.prototype.initialize.apply(this, arguments);
      if (this.updateOnMessage && typeof theApp !== 'undefined') {
        theApp.dispatch.on('message', this.setMessage.bind(this));
      }
    },

    onRender: function() {
      ModelView.prototype.onRender.apply(this, arguments);
      this.updateClass();
    },

    getTemplateData: function() {
      var data = {
        body: this.messageBody,
        cls: this.messageCls
      };
      return data;
    },

    updateClass: function() {
      var show = Boolean(this.messageBody);
      this.$el.toggleClass('show', show);
      if (this.fadeOutTime && show) {
        setTimeout(function() {
          this.$el.removeClass('show');
          this.messageBody = undefined;
        }.bind(this), this.fadeOutTime);
      }
    },
    setMessage: function(messageBody, messageCls) {
      this.messageBody = messageBody;
      this.messageCls = messageCls;
      if (this.shown) {
        this.render();
      }
    },

    onShow: function() {
      ModelView.prototype.onShow.apply(this, arguments);
      this.render();
    },

    setModel: function() {
      this.messageBody = undefined;
      this.messageCls = undefined;
      ModelView.prototype.setModel.apply(this, arguments);
    }
  });
});
define('view/controller/IndexView',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ModelView',
  'view/MessageView'
], function($, _, Backbone, Plumage, ModelView, MessageView) {

  return Plumage.view.controller.IndexView = ModelView.extend({

    className: 'content container-fluid index-view',

    template: '<div class="filter-view"></div><div class="grid-view"></div>',

    gridViewCls: undefined,

    filterViewCls: undefined,

    gridOptions: undefined,

    subViews: [{
      viewCls: MessageView,
      selector: '.message',
      updateOnMessage: true,
      replaceEl: true
    }],

    initialize:function (options) {
      ModelView.prototype.initialize.apply(this, arguments);

      if (typeof(this.gridViewCls) === 'string') {
        this.gridViewCls = require(this.gridViewCls);
      }

      if (typeof(this.filterViewCls) === 'string') {
        this.filterViewCls = require(this.filterViewCls);
      }

      this.subViews = this.subViews || [];

      var gridView = this.getGridView();
      if (gridView) {
        this.subViews.push(gridView);
        gridView.on('itemSelected', function(model) {
          this.trigger('itemSelected', model);
        }.bind(this));
      }

      var filterView = this.getFilterView();
      if (filterView) { this.subViews.push(filterView); }
    },

    getGridView: function() {
      if (!this.gridView && this.gridViewCls) {
        this.gridView = new this.gridViewCls(
          _.extend({selector: '.grid-view', filterView: this.getFilterView()}, this.gridOptions || {}));
      }
      return this.gridView;
    },

    getFilterView: function() {
      if (!this.filterView && this.filterViewCls) {
        this.filterView = new this.filterViewCls({selector: '.filter-view'});
      }
      return this.filterView;
    },

    onRender: function() {
      $(this.el).html(this.template());
    },

    update: function(isLoad) {
      //do nothing
    },

    onModelChange: function() {
      //do nothing
    }
  });
});


define('text!view/form/fields/templates/Select.html',[],function () { return '<select name="{{valueAttr}}" {{#selectSize}}size="{{.}}"{{/selectSize}}>\n{{#if noSelectionText}}\n<option value="{{noSelectionValue}}" {{^hasSelection}}selected="true"{{/hasSelection}}>{{noSelectionText}}</option>\n{{/if}}\n\n{{#listValues}}\n<option value="{{value}}" class="{{value}}" {{#selected}}selected{{/selected}}>{{label}}</option>\n{{/listValues}}\n</select>';});

define('view/form/fields/Select',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'view/form/fields/Field',
  'text!view/form/fields/templates/Select.html'
], function($, _, Backbone, Handlebars, Plumage, ModelView, Field, template) {


  return Plumage.view.form.fields.Select = Field.extend(
  /** @lends Plumage.view.form.fields.Select.prototype */
  {
    /**
     * List of {label:"", value:""} objects to use as select choices.
     * Use either this, listModel or listRelationship
     */
    listValues: undefined,

    /**
     * Model to get select choices from. Which attributes are used label and value are determined by
     * listLabelAttr and listValueAttr.
     * Use either this, or listValues, or listRelationship
     */
    listModel: undefined,

    /**
     * Relationship of this.model to use as listModel.
     * Use either this, or listValues, or listRelationship
     */
    listRelationship: undefined,

    /**
     * Attribute from listModel items to use as the selection value
     */
    listValueAttr: undefined,

    /**
     * Attribute from listModel items to render as the item label
     */
    listLabelAttr: undefined,

    selectSize: undefined,

    noSelectionText: undefined,
    noSelectionValue: '',

    noItemsText: 'No Items',

    fieldTemplate: template,

    defaultToFirst: false,

    /**
     * Field with extra listModel for possible selections.
     *
     * This class is the base class for all fields that allow choosing from a list.
     *  eg. checkbox, radio, select, combobox, tabs etc
     *
     * By default renders <select> but there are a large number of possible representations.
     *
     * The regular model (representing the selection) is normally, populated by the model hierarchy.
     * The list model needs to be populated manually.
     *
     * @constructs
     * @extends Plumage.view.form.fields.Field
     */
    initialize: function() {
      Field.prototype.initialize.apply(this, arguments);
      this.updateDefault();
    },

    /**
     * Rendering
     **************/

    onRender: function() {
      Field.prototype.onRender.apply(this, arguments);
    },

    update: function(isLoad) {
      ModelView.prototype.update.apply(this, arguments);
    },

    getTemplateData: function() {
      var data = Field.prototype.getTemplateData.apply(this, arguments);

      _.extend(data, {
        valueLabel: this.getValueLabel(data.value),
        noSelectionValue: this.noSelectionValue,
        noSelectionText: this.noSelectionText,
        noItemsText: this.noItemsText,
        hasSelection: this.hasSelection(),
        defaultToFirst: this.defaultToFirst,
        selectSize: this.selectSize,
        listValues: this.getListValues(this.model)
      });

      return data;
    },

    getListValues: function(model) {
      if (this.listModel) {
        return this.listModel.map(function(model){
          return this.getItemData(model);
        }, this);
      } else {
        return this.listValues;
      }
    },

    getValueLabel: function(value) {
      var i,
        listValues = this.getListValues(this.model);
      if (listValues) {
        for (i=0;i<listValues.length;i++) {
          if (listValues[i].value === value) {
            return listValues[i].label;
          }
        }
      }
    },

    setValue: function(value) {
      Field.prototype.setValue.apply(this, arguments);
    },

    onShow: function() {
      Field.prototype.onShow.apply(this, arguments);
      this.ensureListData();
    },

    /** Ensure listModel is loaded */
    ensureListData: function() {
      if (this.listModel && this.listModel.deferLoad && !this.listModel.fetched) {
        this.listModel.fetchIfAvailable();
      }
    },

    /**
     * Rendering Helpers/Hooks
     * - override these as needed
     */

    getItemData: function(item) {
      var data = {
        value: this.getListItemValue(item),
        label: this.getListItemLabel(item)
      };
      data.selected = this.isValueSelected(data.value);
      return data;
    },

    isValueSelected: function(value) {
      return value === this.getValue();
    },


    getListItemValue: function(item) {
      return item.get(this.listValueAttr);
    },

    getListItemLabel: function(item) {
      return item.get(this.listLabelAttr);
    },

    hasSelection: function() {
      var value = this.getValue();
      return value !== null && value !== undefined && value !== this.noSelectionValue;
    },

    updateDefault: function() {
      var listValues = this.getListValues(this.model);
      if (!this.hasSelection() && this.defaultToFirst && listValues && listValues.length) {
        this.setValue(listValues[0].value, {silent: true});
      }
    },


    /**
     * List Model
     **************/

    setModel: function(rootModel, parentModel) {
      Field.prototype.setModel.apply(this, arguments);
      if (this.listRelationship) {
        var listModel = this.getModelFromRoot(this.listRelationship, rootModel, parentModel);
        if (listModel) {
          this.setListModel(listModel);
          if (this.shown) {
            this.ensureListData();
          }
        }
      }
      this.updateDefault();
    },

    setListModel: function(listModel) {
      if (this.listModel) {
        this.listModel.off(null,null,this);
      }
      this.listModel = listModel;
      if (this.listModel) {
        this.listModel.on('change', this.onListModelChange, this);
        this.listModel.on('load', this.onListModelLoad, this);
        this.listModel.on('destroy', this.onListModelDestroy, this);
        this.listModel.on('error', this.onListModelError, this);
      }

      if (this.listModel.size()) {
        this.onListModelLoad(this.listModel);
      }
    },

    getListItemForValue: function(value) {
      var items = this.listModel.select(function(item){return this.getListItemValue(item) === value;}.bind(this));
      return items && items[0];
    },

    /**
     * Event Handlers
     *****************/

    onListModelChange: function(model, options) {
      this.update();
    },

    onListModelLoad: function(model, options) {
      if (this.getValue() === '' && this.defaultToFirst && this.listModel.size() > 0) {
        this.setValue(this.getListItemValue(this.listModel.at(0)));
      } else {
        this.update();
      }
    },

    onListModelDestroy: function(model, options) {
    },

    onListModelError: function(model, response, options) {
      this.onModelError(model, response, options);
    }
  });
});

define('text!view/form/fields/templates/CategorySelect.html',[],function () { return '<input type="hidden" {{#fieldName}}name="{{fieldName}}"{{/fieldName}} value="{{value}}">\n<ul class="nav nav-pills">\n{{#if noSelectionText}}\n<li data-category="" {{^hasSelection}}class="active"{{/hasSelection}}>\n  <a href="{{noSelectionValue}}">\n    {{noSelectionText}}\n  </a>\n</li>\n{{/if}}\n\n{{#listValues}}\n  <li data-value="{{value}}" class="{{value}}{{#selected}} active{{/selected}}"><a href="#">{{label}}</a></li>\n{{/listValues}}\n</ul>';});

define('view/form/fields/CategorySelect',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Select',
  'text!view/form/fields/templates/CategorySelect.html'
], function($, Backbone, Handlebars, Plumage, Select, template) {

  return Plumage.view.form.fields.CategorySelect = Select.extend({

    className: 'category-select field',

    template: Handlebars.compile(template),

    listValueAttr: 'name',
    listLabelAttr: 'label',
    modelAttr: 'filter',

    itemTemplate: '<li data-value="{{value}}" class="{{value}}{{#selected}} active{{/selected}}"><a href="#">{{label}}</a></li>',

    noSelectionText: 'All',

    noSelectionValue: '',

    events:{
      'click a': 'onItemClick'
    },

    initialize: function() {
      Select.prototype.initialize.apply(this, arguments);
    },

    setModel: function() {
      Select.prototype.setModel.apply(this, arguments);
    },

    /**
     * Overrides
     */
    onListModelLoad: function(model, options) {
      this.render();
    },

    onItemClick: function(e) {
      e.preventDefault();
      var li = $(e.target).closest('li'),
        value = li && li.data('value');

      this.setValue(value);
    },

    getItemData: function(item) {
      return Select.prototype.getItemData.apply(this, arguments);
    }
  });
});

define('text!view/form/fields/templates/ButtonGroupSelect.html',[],function () { return '<input type="hidden" {{#fieldName}}name="{{fieldName}}"{{/fieldName}} value="{{value}}"/>\n<ul class="btn-group">\n{{#listValues}}\n  <li data-value="{{value}}" class="btn {{value}}{{#selected}} active{{/selected}}">{{label}}</li>\n{{/listValues}}\n</ul>\n';});

define('view/form/fields/ButtonGroupSelect',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/CategorySelect',
  'text!view/form/fields/templates/ButtonGroupSelect.html'
], function($, Backbone, Handlebars, Plumage, CategorySelect, template) {

  return Plumage.view.form.fields.ButtonGroupSelect = CategorySelect.extend({

    className: 'button-group-select',

    template: Handlebars.compile(template),

    events:{
      'click li': 'onItemClick'
    },

    initialize: function() {
      CategorySelect.prototype.initialize.apply(this, arguments);
      this.$el.data('toggle', 'buttons-radio');
    }
  });
});

define('text!view/form/fields/templates/Calendar.html',[],function () { return '<table cellpadding="0" cellspacing="0">\n<thead>\n<tr>\n\t{{#if showWeekNumbers}}\n\t  <th></th>\n\t{{/if}}\n\t{{#if prevAvailable}}\n\t  <th class="prev available"><i class="icon-arrow-left"></i></th>\n\t{{else}}\n\t  <th></th>\n\t{{/if}}\n  <th colspan="5" style="width: auto">{{month}} {{year}}</th>\n  {{#if nextAvailable}}\n    <th class="next available"><i class="icon-arrow-right"></i></th>\n  {{else}}\n    <th></th>\n  {{/if}}\n</tr>\n<tr>\n\t{{#if showWeekNumbers}}\n\t  <th class="week">{{weekLabel}}</th>\n\t{{/if}}\n\t{{#each locale.daysOfWeek}}\n\t  <th>{{.}}</th>\n\t{{/each}}\n</tr>\n</thead>\n<tbody>\n{{#each calendar}}\n{{setIndex @index}}\n<tr>\n  {{#if showWeekNumbers}}\n    <td class="week">?</td>\n  {{/if}}\n  {{#each .}}\n    <td class="{{cls}}" data-row="{{../index}}" data-col="{{@index}}">\n\t    <div class="day {{cname}}">{{number}}</div>\n\t  </td>\n  {{/each}}\n</tr>\n{{/each}}\n\n</tbody>\n</table>';});

define('view/form/fields/Calendar',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/Field',
  'util/DateTimeUtil',
  'text!view/form/fields/templates/Calendar.html'
], function($, _, Backbone, Handlebars, moment, Plumage, Field, DateTimeUtil, template) {

  return Plumage.view.form.fields.Calendar = Field.extend(
  /** @lends Plumage.view.calendar.Calendar.prototype */
  {
    template: template,

    className: 'calendar-view',

    /** Which month to show. 0 indexed number */
    month: undefined,

    /** Which year to show. eg 2014 */
    year: undefined,

    minDateAttr: 'minDate',

    /** min selectable date, inclusive. Set minDate with setMinDate */
    minDate: undefined,

    maxDateAttr: 'maxDate',

    /** max selectable date, inclusive. Set maxDate with setMaxDate */
    maxDate: undefined,

    /** for showing selected range */
    fromAttr: undefined,

    /** for showing selected range */
    toAttr: undefined,

    /** Show week index in a column on the left? */
    showWeekNumbers: false,

    utc: false,

    locale: {
      weekLabel: 'W',
      customRangeLabel: 'Custom Range',
      daysOfWeek: moment()._lang._weekdaysMin.slice(),
      monthNames: moment()._lang._monthsShort.slice(),
      firstDay: 0
    },

    events: {
      'click .prev': 'onPrevClick',
      'click .next': 'onNextClick',
      'click .day': 'onDayClick'
    },

    /**
     * View that renders a selectable calendar.
     *
     * Useful when incoporated in fields like [DateField]{@link Plumage.view.form.fields.DateField}
     * and [DateRangeField]{@link Plumage.view.form.fields.DateRangeField}.
     *
     * Not a [ModelView]{@link Plumage.view.ModelView}, but keeps and updates its own view state
     * ([selectedDate]{@link Plumage.view.calendar.Calendar#selectedDate}, [month]{@link Plumage.view.calendar.Calendar#month},
     * [year]{@link Plumage.view.calendar.Calendar#year},
     *
     * Calendar can also limit selectable dates with [minDate]{@link Plumage.view.calendar.Calendar#minDate} and
     * [maxDate]{@link Plumage.view.calendar.Calendar#maxDate}, and highlight a selected range (useful in a date range picker)
     * with [fromDate]{@link Plumage.view.calendar.Calendar#fromDate} and
     * [toDate]{@link Plumage.view.calendar.Calendar#toDate}.
     *
     * Emitted events: prevclick, nextclick, dayclick
     *
     * @constructs
     * @extends Plumage.view.View
     */
    initialize: function() {
      Field.prototype.initialize.apply(this, arguments);

      var now = this.utc ? moment.utc() : moment();
      this.month = this.month !== undefined ? this.month : now.month();
      this.year = this.year ? this.year : now.year();
    },

    getTemplateData: function() {
      var data = _.clone(this.locale);

      var calendar = this.getCalendarDates(this.month, this.year);

      for(var i=0;i<calendar.length;i++) {
        var week = calendar[i];
        for(var j=0;j<week.length;j++) {
          var day = week[j];
          _.extend(day, {
            number: day.date[2],
            cls: this.getClassesForDate(day.date, i, j).join(' ')
          });
        }
      }
      return {
        locale: this.locale,
        month: this.locale.monthNames[this.month],
        year: this.year,
        prevAvailable: this.isPrevMonthAvailable(),
        nextAvailable: this.isNextMonthAvailable(),
        showWeekNumbers: this.showWeekNumbers,
        calendar: calendar
      };
    },

    update: function(isLoad) {
      if (this.isRendered && this.shouldRender(isLoad)) {
        this.render();
      }
    },

    getValueFromModel: function() {
      var result = Field.prototype.getValueFromModel.apply(this, arguments);
      if ($.isNumeric(result)) {
        return result;
      }
    },

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue();

      var modelValue = model.get(this.valueAttr);
      if (modelValue) {
        //don't change hour
        var m = this.utc ? moment.utc(modelValue) : moment(modelValue);
        var date = this.getSelectedDate();
        m.year(date[0]);
        m.month(date[1]);
        m.date(date[2]);
        value = m.valueOf();
      }
      return model.set(this.valueAttr, value);
    },

    /**
     * Set the month to display (view state), and update.
     */
    setMonth: function(month, year) {
      this.month = month;
      this.year = year;
      this.update();
    },

    setValue: function(value, options) {
      if (!this.isDateInMinMax(this.toDateTuple(value))) {
        return;
      }
      Field.prototype.setValue.apply(this, arguments);
      this.update();
    },

    valueChanged: function() {
      var value = this.getValue();
      if (value) {
        var m = this.utc ? moment.utc(value) : moment(value);
        this.month = m.month();
        this.year = m.year();
      }
    },

    /**
     * Get the minimum selectable date (inclusive)
     */
    getMinDate: function() {
      if (this.minDate) {
        return this.minDate;
      }
      if (this.model && this.minDateAttr) {
        return this.toDateTuple(this.model.get(this.minDateAttr));
      }
      return null;
    },

    setMinDate: function(minDate) {
      this.minDate = this.toDateTuple(minDate);
    },

    /**
     * Set the maximum selectable date (inclusive)
     */
    getMaxDate: function() {
      if (this.maxDate) {
        return this.maxDate;
      }
      if (this.model && this.maxDateAttr) {
        return this.toDateTuple(this.model.get(this.maxDateAttr));
      }
      return null;
    },

    setMaxDate: function(maxDate) {
      this.maxDate = this.toDateTuple(maxDate);
    },

    //
    // Helpers
    //

    toDateTuple: function(date) {
      if (!date) {
        return null;
      }
      date = DateTimeUtil.parseRelativeDate(date);
      if ($.isArray(date)) {
        return date;
      }
      var m = date;
      if ($.isNumeric(m)) {
        m = this.utc ? moment.utc(m) : moment(m);
      } else {
        m = moment(m);
      }
      return [m.year(), m.month(), m.date()];
    },

    getSelectedDate: function() {
      var value = this.getValue();
      if (value) {
        return this.toDateTuple(this.getValue());
      }
      return null;
    },

    getFromDate: function() {
      if (this.model && this.fromAttr) {
        return this.toDateTuple(this.model.get(this.fromAttr));
      }
      return null;
    },

    getToDate: function() {
      if (this.model && this.toAttr) {
        return this.toDateTuple(this.model.get(this.toAttr));
      }
      return null;
    },

    /**
     * Helper: Get 2d array of days
     */
    getCalendarDates: function (month, year) {
      var calendar = [];
      var curDate = this.getFirstDate(month, year);
      for(var i=0;i<6;i++) {
        var week = [];
        for(var j=0;j<7;j++) {
          week.push({
            date: curDate,
          });
          var m = moment(curDate).add('day', 1);
          curDate = [m.year(), m.month(), m.date()];
        }
        calendar.push(week);
      }
      return calendar;
    },

    /**
     * Helper: Get first day on calendar page for month, year
     */
    getFirstDate: function(month, year) {
      var firstDay = moment([year, month, 1]),
        monthAgo = moment(firstDay).subtract('month', 1);

      var daysInLastMonth = monthAgo.daysInMonth(),
        dayOfWeek = firstDay.day(),
        firstDate = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;

      if (firstDate > daysInLastMonth) {
        firstDate -= 7;
      }
      if (dayOfWeek === this.locale.firstDay) {
        firstDate = daysInLastMonth - 6;
      }
      return [monthAgo.year(), monthAgo.month(), firstDate];
    },

    /**
     * Helper: Get CSS classes for a day element.
     */
    getClassesForDate: function(date, row, col) {
      var inMonth = this.isDateTupleInMonth(date);
      var classes = [
        this.isDateInMinMax(date) ? 'active' : 'disabled',
        inMonth ? null : 'off',
        _.isEqual(date, this.getSelectedDate()) ? 'selected' : null,
        inMonth && _.isEqual(date, this.getFromDate()) ? 'start-date' : null,
        inMonth && _.isEqual(date, this.getToDate()) ? 'end-date' : null,
        this.isDateInSelectedRange(date) ? 'in-range' : null,
        this.getShadowClass(date, row, col)
      ];

      return _.compact(classes);
    },

    /**
     * Helper: Get box shadow class for dates off the current month.
     */
    getShadowClass: function(date, row, col) {
      if (!this.isDateTupleInMonth(date)) {
        if (row < 2) {
          var nextWeek = this.toDateTuple(moment(date).add('day', 7)),
            tomorrow = this.toDateTuple(moment(date).add('day', 1));
          if (this.isDateTupleInMonth(nextWeek)) {
            if (col < 6 && this.isDateTupleInMonth(tomorrow)) {
              return 'shadow-bottom-right';
            } else {
              return 'shadow-bottom';
            }
          }
        } else {
          var lastWeek = this.toDateTuple(moment(date).subtract('day', 7)),
            yesterday = this.toDateTuple(moment(date).subtract('day', 1));
          if (this.isDateTupleInMonth(lastWeek)) {
            if (col > 0 && this.isDateTupleInMonth(yesterday)) {
              return 'shadow-top-left';
            } else {
              return 'shadow-top';
            }
          }
        }
      }
      return null;
    },

    isDateTupleInRange: function(date, minDate, maxDate) {
      return (!minDate || moment(date) >= moment(minDate)) && (!maxDate || moment(date) <= moment(maxDate));
    },

    isDateInSelectedRange: function(date) {
      var fromDate = this.getFromDate(),
        toDate = this.getToDate();
      if (!fromDate || !toDate) {
        return false;
      }
      return this.isDateTupleInRange(date, fromDate, toDate);
    },

    isDateInMinMax: function(date) {
      date = this.toDateTuple(date);
      return this.isDateTupleInRange(date, this.getMinDate(), this.getMaxDate());
    },

    isDateTupleInMonth: function(date) {
      return date[1] === this.month;
    },

    isPrevMonthAvailable: function() {
      var m = moment([this.year, this.month, 1]).subtract('day', 1);
      return this.isDateInMinMax(this.toDateTuple(m));
    },

    isNextMonthAvailable: function() {
      var firstDate = moment([this.year, this.month, 1]),
        m = moment([this.year, this.month, firstDate.daysInMonth()]).add('day', 1);
      return this.isDateInMinMax(this.toDateTuple(m));
    },

    getDateFromDayEl: function(el) {
      el = $(el);
      var td = el.parent();
      var dateNumber = Number(el.text());

      if (td.hasClass('off')) {
        var offMonth = moment([this.year, this.month, 1]);
        if (td.data('row') < 3) {
          offMonth = offMonth.subtract('month', 1);
        } else {
          offMonth = offMonth.add('month', 1);
        }
        return this.toDateTuple(offMonth.date(dateNumber));
      }
      return [this.year, this.month, dateNumber];
    },

    //
    // EventHandlers
    //

    onModelChange: function (e) {
      if (e.changed[this.valueAttr] !== undefined || e.changed[this.minDateAttr] !== undefined || e.changed[this.maxDateAttr] !== undefined) {
        this.updateValueFromModel();
      }
    },

    onPrevClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var lastMonth = moment([this.year, this.month, 1]).subtract('month', 1);
      this.setMonth(lastMonth.month(), lastMonth.year());

      this.trigger('prevclick', this);
    },

    onNextClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var nextMonth = moment([this.year, this.month, 1]).add('month', 1);
      this.setMonth(nextMonth.month(), nextMonth.year());

      this.trigger('nextclick', this);
    },

    onDayClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var td = $(e.target).parent();
      if (!td.hasClass('disabled')) {
        var date = this.getDateFromDayEl(e.target),
          m = this.utc ? moment.utc(date) : moment(date);
        this.setValue(m.valueOf());
      }
    }
  });
});

define('text!view/form/fields/templates/Checkbox.html',[],function () { return '{{#if checkboxLabel}}\n<label class="{{cls}}">\n{{/if}}\n  <input type="checkbox" name="{{../fieldName}}" {{#selected}}checked="true"{{/selected}} value="true">\n{{#if checkboxLabel}}\n  <span>{{checkboxLabel}}</span>\n</label>\n{{/if}}\n';});

define('view/form/fields/Checkbox',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/form/fields/Field',
  'text!view/form/fields/templates/Checkbox.html'
], function($, _, Backbone, Plumage, Field, template) {
  return Plumage.view.form.fields.Checkbox = Field.extend({

    fieldTemplate: template,

    checkboxLabel: '',

    getTemplateData: function() {
      var data = Field.prototype.getTemplateData.apply(this, arguments);
      data.checkboxLabel = this.checkboxLabel;
      if (this.getValue()) {
        data.selected = true;
      }
      return data;
    },

    //override to ignore other non-relevant events
    delegateEvents: function(events) {
      events = events || _.result(this, 'events');
      var selector = this.getInputSelector();
      if (selector) {
        events = _.clone(events || {});
        events['change ' +selector] = 'onChange';
      }
      Backbone.View.prototype.delegateEvents.apply(this, [events]);
    },

    getValueFromDom: function() {
      return this.$('input:checked').val();
    },

    processDomValue: function(value) {
      return value === 'true' ? true : false;
    },

    update: function() {
      if (this.rendered) {
        this.render();
      }
    }
  });
});

define('view/form/fields/picker/Picker',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ModelView',
], function($, _, Backbone, Plumage, ModelView) {

  return  Plumage.view.form.fields.picker.Picker = ModelView.extend(
  /** @lends Plumage.view.form.fields.picker.Picker.prototype */
  {


    modelCls: false, //never bind via setModel

    className: 'dropdown-menu',

    pickerModelAttr: 'value',

    opens: 'right',

    applyOnChange: false,

    events: {
      'mousedown': 'onMouseDown'
    },

    defaultSubViewOptions: {
      updateModelOnChange: true,
    },

    /**
     * @constructs
     * @extends Plumage.view.ModelView
     */
    initialize: function(options) {
      this.defaultSubViewOptions = {
        updateModelOnChange: true,
        valueAttr: options.pickerModelAttr || this.pickerModelAttr
      };
      ModelView.prototype.initialize.apply(this, arguments);
      this.setModel(new Plumage.model.Model({}, {urlRoot: '/'}), null, true);
    },

    onModelChange: function() {
      ModelView.prototype.onModelChange.apply(this, arguments);
      if (this.applyOnChange) {
        this.trigger('apply', this, this.model);
      }
    },

    getValue: function() {
      return this.model.get(this.pickerModelAttr);
    },

    setValue: function(value) {
      this.model.set(this.pickerModelAttr, value);
    },

    onRender: function() {
      ModelView.prototype.onRender.apply(this, arguments);
      this.$el.addClass('opens' + this.opens);
    },

    getTemplateData: function() {
      return ModelView.prototype.getTemplateData.apply(this, arguments);
    },

    update: function() {
      ModelView.prototype.update.apply(this, arguments);
    },

    //
    // Events
    //

    onMouseDown: function(e) {
      //do nothing so input doesn't lose focus
      e.preventDefault();
      e.stopPropagation();
    },

    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.close();
        this.updateValueFromDom();
      } else if(e.keyCode === 27) {
        this.close();
        this.update();
      }
    }
  });
});

define('text!view/form/fields/templates/FieldWithPicker.html',[],function () { return '{{#if label}}\n<div class="control-group">\n  <label class="control-label" for="{{valueAttr}}">{{label}}</label>\n  <div class="controls">\n    <span class="field">\n\t    <span class="dropdown">\n\t      {{> field}}\n\t      <div class="picker"></div>\n\t    </span>\n    </span>\n    <span class="help-inline">{{#if message}}{{message}}{{/if}}</span>\n  </div>\n</div>\n{{else}}\n<span class="field">\n<span class="dropdown picker-dropdown">\n  {{> field}}\n  <div class="picker"></div>\n</span>\n</span>\n{{/if}}\n';});

define('view/form/fields/FieldWithPicker',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/Field',
  'view/form/fields/picker/Picker',
  'text!view/form/fields/templates/FieldWithPicker.html'
], function($, _, Backbone, Handlebars, moment, Plumage, Field, Picker, template) {

  return  Plumage.view.form.fields.FieldWithPicker = Field.extend(
  /** @lends Plumage.view.form.fields.FieldWithPicker.prototype */
  {

    template: template,

    /** Options to instantiate the Picker with. You can even pass in subViews, so you don't have to subclass Picker. */
    pickerCls: Picker,

    /** Options to instantiate the Picker with. You can even pass in subViews, so you don't have to subclass Picker. */
    pickerOptions: undefined,

    events: {
      'click input:first': 'onInputClick',
      'click button:first': 'onButtonClick',
    },

    /**
     * Base class for fields that show a picker (eg date picker, color picker etc.) when focused.
     *
     * Pass your Picker subclass as pickerCls, or customize the base Picker class by passing in pickerOptions (or do both).
     *
     * @constructs
     * @extends Plumage.view.form.fields.Field
     */
    initialize:function(options) {
      this.subViews = this.subViews.concat([_.extend({
        viewCls: this.pickerCls,
        name: 'picker',
        selector: '.picker',
        replaceEl: true
      }, this.pickerOptions)]);

      Field.prototype.initialize.apply(this, arguments);

      var picker = this.getPicker();

      picker.on('apply', this.onPickerApply, this);
      picker.on('close', this.onPickerClose, this);
    },

    getPicker: function() {
      return this.getSubView('picker');
    },

    getInputSelector: function() {
      // skip the button
      return 'input:first';
    },

    //update the picker model
    valueChanged: function() {
      this.getPicker().setValue(this.getValue());
    },

    //
    // Dropdown
    //

    /** Is the dropdown open? */
    isOpen: function() {
      return this.$('.dropdown').hasClass('open');
    },

    /** Toggle dropdown open/closed */
    toggle: function() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function() {
      this.update();
      this.$('.dropdown:first').addClass('open');
    },

    /** Close the dropdown */
    close: function() {
      this.$('.dropdown').removeClass('open');
    },

    /** hook */
    processPickerValue: function(value) {
      return value;
    },

    //
    // overrides
    //

    updateValueFromModel: function (model) {
      Field.prototype.updateValueFromModel.apply(this, arguments);
    },

    //
    // Events
    //
    onChange: function(e) {
      //disable automatic updating from Field
    },

    onModelChange: function (e) {
      Field.prototype.onModelChange.apply(this, arguments);
    },

    onModelLoad: function (e) {
      this.updateValueFromModel();
    },

    onSubmit: function(e) {
      this.updateValueFromDom();
      Field.prototype.onSubmit.apply(this, arguments);
    },

    onInputClick: function(e) {
      this.open();
    },

    onButtonClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.getInputEl().focus();
    },

    onFocus: function(e) {
      this.open();
    },

    onBlur: function(e) {
      this.close();
      //don't update value from DOM if picker apply was clicked
      if(this.applying) {
        this.applying = false;
      } else {
        this.updateValueFromDom();
      }
      this.trigger('blur', this);
    },

    onPickerApply: function(picker, model) {
      this.applying = true;
      this.setValue(this.processPickerValue(picker.getValue()));
      this.close();
    },

    onPickerClose: function() {
      this.close();
    }
  });
});

define('text!view/form/fields/templates/DropdownSelect.html',[],function () { return '\n{{#if label}}\n<div class="control-group">\n  <label class="control-label" for="{{valueAttr}}">{{label}}</label>\n  <div class="controls">\n{{/if}}\n\n<span class="dropdown-select dropdown">\n<input type="hidden" {{#if fieldName}}name="{{fieldName}}"{{/if}} value="{{value}}"/>\n<a class="btn dropdown-toggle {{buttonCls}}" data-toggle="dropdown" href="#">\n  {{#iconCls}}\n    <i class="{{.}} icon-white"></i>\n  {{/iconCls}}\n  {{#if hasSelection}}\n    {{valueLabel}}\n  {{else}}\n    {{noSelectionText}}\n  {{/if}}\n  <span class="caret"></span>\n</a>\n<ul class="dropdown-menu opens{{opens}}">\n{{#listValues}}\n  <li data-value="{{value}}" class="{{value}}{{#selected}} active{{/selected}} {{#disabled}}disabled{{/disabled}} {{classes}}">\n    <a href="#">{{label}}</a>\n  </li>\n{{/listValues}}\n</ul>\n</span>\n\n{{#if label}}\n  </div>\n</div>\n{{/if}}';});

define('view/form/fields/DropdownSelect',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Select',
  'text!view/form/fields/templates/DropdownSelect.html',
  'bootstrap'
], function($, _, Backbone, Handlebars, Plumage, Select, template) {

  return Plumage.view.form.fields.DropdownSelect = Select.extend({

    template: template,

    modelAttr: 'filter',

    noSelectionText: 'Click to select',

    noSelectionValue: '',

    buttonCls: undefined,

    iconCls: undefined,

    opens: 'right',

    preventFocus: false,


    events:{
      'click li a': 'onItemClick',
      'click .dropdown-toggle': 'onToggleClick'
    },

    initialize: function() {
      Select.prototype.initialize.apply(this, arguments);
    },

    onRender: function() {
      Select.prototype.onRender.apply(this, arguments);
    },

    getTemplateData: function() {
      var data = Select.prototype.getTemplateData.apply(this, arguments);
      data = _.extend(data, {
        buttonCls: this.buttonCls,
        iconCls: this.iconCls,
        opens: this.opens
      });
      return data;
    },

    onToggleClick: function(e) {
      if (this.preventFocus) {
        e.preventDefault();
        e.stopPropagation();
        this.$('.dropdown').toggleClass('open');
      }
    },

    onItemClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var li = $(e.target).closest('li'),
        value = li && li.data('value');

      this.$el.removeClass('open');
      this.setValue(value);
    }
  });
});
define('view/form/fields/HourSelect',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/DropdownSelect',
  'bootstrap'
], function($, _, Backbone, Handlebars, moment, Plumage, DropdownSelect, template) {

  return Plumage.view.form.fields.HourSelect = DropdownSelect.extend({
    className: 'hour-select',

    minDate: undefined,
    maxDate: undefined,

    minDateAttr: undefined,
    maxDateAttr: undefined,

    /** optional. For displaying a selected range. */
    fromAttr: undefined,

    /** optional. For displaying a selected range. */
    toAttr: undefined,

    hourFormat: 'ha',

    utc: false,

    initialize: function(options) {
      this.listValues = _.map(_.range(24), function(x){
        return {
          value: x,
          label: moment({hour: x}).format(this.hourFormat)
        };
      }.bind(this));
      DropdownSelect.prototype.initialize.apply(this, arguments);
    },



    getTemplateData: function() {
      var data = DropdownSelect.prototype.getTemplateData.apply(this, arguments);
      _.each(data.listValues, function(x) {
        x.classes = this.getClassesForHour(x.value).join(' ');
      }, this);
      return data;
    },

    getValueFromModel: function() {
      if (this.model) {
        var result = this.model.get(this.valueAttr);
        if (result > 1000) {
          var m = this.utc ? moment.utc(result) : moment(result);
          result = m.hour();
        }
        return result === undefined ? '' : result;
      }
    },

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue();

      var modelValue = model.get(this.valueAttr);
      var m = this.utc ? moment.utc(modelValue) : moment(modelValue);
      value = m.hour(value).valueOf();

      return model.set(this.valueAttr, value);
    },

    getMinDate: function() {
      if (this.model && this.minDateAttr) {
        return this.model.get(this.minDateAttr);
      }
      return this.minDate;
    },

    setMinDate: function(minDate) {
      this.minDate = minDate;
      this.update();
    },

    /**
     * Set the maximum selectable date (inclusive)
     */
    getMaxDate: function() {
      if (this.model && this.maxDateAttr) {
        return this.model.get(this.maxDateAttr);
      }
      return this.maxDate;
    },

    setMaxDate: function(maxDate) {
      this.maxDate = maxDate;
      this.update();
    },

    setValue: function(value) {
      if (!this.isHourInMinMax(value)) {
        return;
      }
      DropdownSelect.prototype.setValue.apply(this, arguments);
    },

    //
    // Helpers
    //

    getClassesForHour: function(hour) {
      var m = this.getDate(hour);
      var classes = [
        this.isHourInMinMax(hour) ? null : 'disabled',
        hour === this.getValue() ? 'selected' : null,
        this.isHourInSelectedRange(hour) ? 'in-range' : null,
        this.isHourOtherSelection(hour) ? 'other-selected' : null
      ];
      return _.compact(classes);
    },

    isHourInMinMax: function(hour) {
      if (!this.model) {
        return true;
      }

      var minDate = this.getMinDate(),
        maxDate = this.getMaxDate();

      var m = this.getDate(hour);

      return (!minDate || m >= moment(minDate)) && (!maxDate || m <= moment(maxDate));
    },

    isHourInSelectedRange: function(hour) {
      if (!this.model || !this.fromAttr || !this.toAttr) {
        return false;
      }
      var fromDate = this.model.get(this.fromAttr),
        toDate = this.model.get(this.toAttr);

      if (!fromDate || !toDate) {
        return false;
      }

      var m = this.getDate(hour);
      return m.valueOf() >= fromDate &&  m.valueOf() <= toDate;
    },

    isHourOtherSelection: function(hour) {
      if (!this.model || !this.fromAttr || !this.toAttr || hour === this.getValue()) {
        return false;
      }
      var fromDate = this.model.get(this.fromAttr),
        toDate = this.model.get(this.toAttr);

      if (!fromDate || !toDate) {
        return false;
      }
      var m = this.getDate(hour);
      return m.valueOf() === fromDate ||  m.valueOf() === toDate;
    },

    getDate: function(hour) {
      var modelValue = this.model && this.model.get(this.valueAttr), m;
      if (modelValue !== undefined) {
        m = this.utc ? moment.utc(modelValue) : moment(modelValue);
      } else {
        m = this.utc ? moment.utc() : moment();
      }
      return m.hour(hour);
    },


    onModelChange: function (e) {
      if (e.changed[this.valueAttr] !== undefined || e.changed[this.minDateAttr] !== undefined || e.changed[this.maxDateAttr] !== undefined) {
        this.updateValueFromModel();
      }
    },
  });
});
define('view/form/fields/DateField',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'util/DateTimeUtil',
  'view/form/fields/Field',
  'view/form/fields/FieldWithPicker',
  'view/form/fields/Calendar',
  'view/form/fields/HourSelect',
], function($, _, Backbone, Handlebars, moment, Plumage, DateTimeUtil, Field, FieldWithPicker, Calendar, HourSelect) {

  return Plumage.view.form.fields.DateField = FieldWithPicker.extend(
  /** @lends Plumage.view.form.fields.DateField.prototype */
  {

    fieldTemplate: '<div class="input-prepend"><button class="btn" data-toggle="dropdown" data-target="#"><i class="icon-calendar"></i></button>'+FieldWithPicker.prototype.fieldTemplate+'</div>',

    className: 'date-field',

    /** format string for showing the selected date. See moment.js */
    format: 'MMM D, YYYY',

    events: {
      'click input': 'onInputClick',
      'click button': 'onButtonClick',
    },

    pickerOptions: {
      applyOnChange: true,
      subViews: [{
        viewCls: Calendar,
        name: 'calendar',
        minDateAttr: 'minDate',
        maxDateAttr: 'maxDate'
      }]
    },

    subViews: [{
      viewCls: HourSelect,
      name: 'hourSelect',
      selector: '.field',
      opens: 'right',
      tagName: 'span'
    }],

    utc: false,

    keepTime: false,

    minDate: undefined,
    maxDate: undefined,

    minDateAttr: undefined,
    maxDateAttr: undefined,

    showHourSelect: false,

    /**
     * Field with a popover calendar for selecting a date.
     *
     * The value can also be set by editing the text field directly, as long as it can be parsed back into a date.
     *
     * See a live demo in the [Kitchen Sink example]{@link /examples/kitchen_sink/form/FieldsAndForms}.
     *
     * @constructs
     * @extends Plumage.view.form.fields.Field
     */
    initialize: function(options) {

      FieldWithPicker.prototype.initialize.apply(this, arguments);
      var calendar = this.getCalendar();
      calendar.utc = this.utc;

      var hourSelect = this.getSubView('hourSelect');
      hourSelect.utc = this.utc;
      hourSelect.valueAttr = this.valueAttr;
      hourSelect.updateModelOnChange = this.updateModelOnChange;
      hourSelect.relationship = this.relationship;
      this.setShowHourSelect(this.showHourSelect);

      if (this.minDate) {
        this.setMinDate(this.minDate);
      }
      if (this.maxDate) {
        this.setMaxDate(this.maxDate);
      }
    },

    getCalendar: function() {
      return this.getPicker().getSubView('calendar');
    },

    setMinDate: function(minDate) {
      minDate = DateTimeUtil.parseRelativeDate(minDate);
      this.getPicker().model.set('minDate', minDate);
      this.getSubView('hourSelect').setMinDate(minDate);
    },

    setMaxDate: function(maxDate) {
      maxDate = DateTimeUtil.parseRelativeDate(maxDate);
      this.getPicker().model.set('maxDate', maxDate);
      this.getSubView('hourSelect').setMaxDate(maxDate);
    },

    setShowHourSelect: function(showHourSelect) {
      this.showHourSelect = showHourSelect;
      this.$el.toggleClass('show-hour-select', this.showHourSelect);
      if(this.isRendered) {
        this.render();
      }
    },


    //
    // Overrides
    //

    onInput: function(e) {
      //do nothing on typing. Wait for blur
    },

    getValueString: function(value) {
      if (value) {
        var m = this.utc ? moment.utc(value) : moment(value);
        return m.format(this.format);
      }
      return '';
    },

    isDomValueValid: function(value) {
      var m = this.utc ? moment.utc(value) : moment(value);
      return !value || m.isValid && m.isValid() && this.getCalendar().isDateInMinMax(value);
    },

    processDomValue: function(value) {
      if (value) {
        var m = this.utc ? moment.utc(value) : moment(value);
        var oldValue = this.getValue();
        if (oldValue && (this.keepTime || this.showHourSelect)) {
          var oldM = this.utc ? moment.utc(oldValue) : moment(oldValue);
          m.hour(oldM.hour()).minute(oldM.minute()).second(oldM.second()).millisecond(oldM.millisecond());
        }
        return m.valueOf();
      }
      return null;
    },

    processPickerValue: function(value) {
      return this.processDomValue(value);
    },

    onModelChange: function(e) {
      FieldWithPicker.prototype.onModelChange.apply(this, arguments);
      this.updateValueFromModel();
    },


    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.updateValueFromDom();
      } else if(e.keyCode === 27) {
        this.update();
      }
    },

    updateValueFromModel: function() {
      FieldWithPicker.prototype.updateValueFromModel.apply(this, arguments);
      if (this.minDateAttr) {
        this.setMinDate(this.model.get(this.minDateAttr));
      }
      if (this.maxDateAttr) {
        this.setMaxDate(this.model.get(this.maxDateAttr));
      }
    }
  });
});


define('text!view/form/fields/picker/templates/DateRangePicker.html',[],function () { return '<div class="calendar-wrap">\n  <div class="date-field">\n    <label class="control-label" for="daterangepicker_from">From</label>\n    <span class="from-date"></span>\n    {{#if showHourSelect}}<span class="from-hour"></span>{{/if}}\n  </div>\n  <div class="from-calendar"></div>\n</div>\n\n<div class="calendar-wrap">\n  <div class="date-field">\n    <label class="control-label" for="daterangepicker_to">To</label>\n    <span class="to-date"></span>\n    {{#if showHourSelect}}<span class="to-hour"></span>{{/if}}\n  </div>\n  <div class="to-calendar"></div>\n</div>\n\n<div class="ranges-wrap">\n  <ul class="ranges">\n    {{#ranges}}\n      <li><a href="#">{{name}}</a></li>\n    {{/ranges}}\n  </ul>\n  <button class="btn btn-small apply">Apply</button>\n  <a href="#" class="cancel">cancel</a>\n</div>\n';});

define('view/form/fields/picker/DateRangePicker',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/picker/Picker',
  'view/form/fields/Field',
  'view/form/fields/HourSelect',
  'view/form/fields/Calendar',
  'text!view/form/fields/picker/templates/DateRangePicker.html',
], function($, _, Backbone, Handlebars, moment, Plumage, Picker, Field, HourSelect, Calendar, template) {

  return  Plumage.view.form.fields.picker.DateRangePicker = Picker.extend(
  /** @lends Plumage.view.form.fields.picker.DateRangePicker.prototype */
  {
    template: template,

    className: 'date-range-picker dropdown-menu form-inline',

    showHourSelect: false,

    /** min selectable date, inclusive. */
    minDate: undefined,

    /** min selectable date, inclusive. */
    maxDate: undefined,

    /**
     * Date format for text fields. Other formats can be typed into the main field, as long it can be
     * parsed by moment.js
     */
    dateFormat: 'MMM D, YYYY',

    utc: false,

    /**
     * Preset ranges. Shown as buttons on the side.
     * Array of json objects with attributes:
     *  - name: Text of the button
     *  - from: moment date object for the start of the range.
     *  - to: moment date object for the end of the range.
     *
     *  from and to can also be 'today' or 'yesterday'
     */
    ranges: [
      {name: 'Today', from:'today', to:'today'},
      {name: 'Yesterday', from:{day: -1}, to:{day: -1}},
      {name: 'Last 7 Days', from:{day: -6}, to:'today'},
      {name: 'Last 30 Days', from:{day: -29}, to:'today'},
      {name: 'Last 90 Days', from:{day: -89}, to:'today'}
    ],

    events: {
      'click .ranges a': 'onRangeClick',
      'click .apply': 'onApplyClick',
      'click .cancel': 'onCancelClick',
      'mousedown': 'onMouseDown'
    },

    subViews: [{
      viewCls: Calendar,
      name: 'fromCal',
      selector: '.from-calendar',
      valueAttr: 'fromDate',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      minDateAttr: 'minDate',
      maxDateAttr: 'toDate',
    }, {
      viewCls: Calendar,
      name: 'toCal',
      selector: '.to-calendar',
      valueAttr: 'toDate',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      minDateAttr: 'fromDate',
      maxDateAttr: 'maxDate',
    }, {
      viewCls: Field,
      selector: '.from-date',
      name: 'fromDate',
      valueAttr: 'fromDate',
      readonly: true,
      replaceEl: true
    }, {
      viewCls: Field,
      selector: '.to-date',
      name: 'toDate',
      valueAttr: 'toDate',
      readonly: true,
      replaceEl: true
    }, {
      viewCls: HourSelect,
      name: 'fromHour',
      selector: '.from-hour',
      valueAttr: 'fromDate',
      minDateAttr: 'minDate',
      maxDateAttr: 'toDate',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      preventFocus: true,
      replaceEl: true
    }, {
      viewCls: HourSelect,
      name: 'toHour',
      selector: '.to-hour',
      valueAttr: 'toDate',
      minDateAttr: 'fromDate',
      maxDateAttr: 'maxDate',
      fromAttr: 'fromDate',
      toAttr: 'toDate',
      preventFocus: true,
      replaceEl: true
    }],

    /**
     * @constructs
     * @extends Plumage.view.ModelView
     */
    initialize: function(options) {
      if (this.utc) {
        this.subViews = _.map(this.subViews, _.clone);
        _.each(this.subViews, function(x){x.utc = true;});
      }

      Picker.prototype.initialize.apply(this, arguments);

      var formatDate = function(date) {
        var m = this.utc ? moment.utc(date) : moment(date);
        return m.format(this.dateFormat);
      }.bind(this);

      this.getSubView('fromDate').getValueString = formatDate;
      this.getSubView('toDate').getValueString = formatDate;
    },

    onRender: function() {
      Picker.prototype.onRender.apply(this, arguments);
      this.$el.toggleClass('show-hour-select', this.showHourSelect);
    },

    getTemplateData: function() {
      var data = Picker.prototype.getTemplateData.apply(this, arguments);

      return _.extend(data, {
        ranges: this.ranges,
        opens: this.opens,
        showHourSelect: this.showHourSelect
      });
    },

    setShowHourSelect: function(showHourSelect) {
      this.showHourSelect = showHourSelect;
      if(this.isRendered) {
        this.render();
      }
    },

    //
    // override Picker
    //

    getValue: function() {
      return [this.model.get('fromDate'), this.model.get('toDate')];
    },

    setValue: function(value) {
      var data = {fromDate: undefined, toDate: undefined};
      if (value && value.length) {
        data = {fromDate: value[0], toDate: value[1]};
      }
      this.model.set(data);
    },

    //
    // Helpers
    //

    /** Helper: select the specified preset (value from [ranges]{@link Plumage.view.form.fields.DateRangePicker#ranges}) */
    selectPresetRange: function(range) {
      var value = [range.from, range.to];
      var today = this.utc ? moment.utc({hour: 0}) : moment({hour: 0});
      for (var i=0; i<value.length; i++) {
        if (value[i] === 'today') {
          value[i] = today;
        } else {
          value[i] = today.clone().add(value[i]);
        }
      }
      this.setValue([value[0].startOf('day').valueOf(), value[1].endOf('day').valueOf()]);
      this.update();
    },

    //
    // Events
    //

    onRangeClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var range = _.findWhere(this.ranges, {name: e.target.text});
      this.selectPresetRange(range);
    },

    onApplyClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.trigger('apply', this, this.model);
    },

    onCancelClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.trigger('close');
    },
  });
});
define('view/form/fields/DateRangeField',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'PlumageRoot',
  'view/form/fields/FieldWithPicker',
  'view/form/fields/picker/DateRangePicker',
], function($, _, Backbone, Handlebars, moment, Plumage, FieldWithPicker, DateRangePicker) {

  return  Plumage.view.form.fields.DateRangeField = FieldWithPicker.extend(
  /** @lends Plumage.view.form.fields.DateRangeField.prototype */
  {

    fieldTemplate: '<div class="input-prepend"><button class="btn" data-toggle="dropdown" data-target="#"><i class="icon-calendar"></i></button>'+FieldWithPicker.prototype.fieldTemplate+'</div>',

    className: 'date-range-field',

    /** model attribute used as the start of the selected date range. */
    fromAttr: undefined,

    /** model attribute used as the end of the selected date range. */
    toAttr: undefined,

    /** min selectable date, inclusive. */
    minDate: undefined,

    /** min selectable date, inclusive. */
    maxDate: undefined,

    pickerCls: DateRangePicker,

    /** Options to pass on to contained [DateRangePicker]{@link Plumage.view.form.fields.picker.DateRangePicker} object. */
    pickerOptions: undefined,

    /** Which side to open the picker on*/
    opens: 'right',

    /**
     * Date format for text fields. Other formats can be typed into the main field, as long it can be
     * parsed by moment.js
     */
    format: 'MMM D, YYYY',

    formatWithHour: 'MMM D ha, YYYY',

    /**
     * Field for selecting a date range.
     *
     * DateRangeField uses two model attributes to get and store its selection, unlike a normal
     * field that only uses one. The two attribute names are specified by [fromAttr]{@link Plumage.view.form.fields.DateRangeField#fromAttr}
     * and [toAttr]{@link Plumage.view.form.fields.DateRangeField#toAttr}, for the start
     * and end of the range respectively.
     *
     * The user can either select from and to dates from the left and right calendars respectively, or they
     * can choose from a list of presets. In either 'apply' must be clicked before the field's value is set.
     *
     * The value can also be set by editing the text field directly, as long as it can be parsed back into dates.
     *
     * See a live demo in the [Kitchen Sink example]{@link /examples/kitchen_sink/form/FieldsAndForms}
     *
     * @constructs
     * @extends Plumage.view.form.fields.Field
     */
    initialize:function(options) {
      FieldWithPicker.prototype.initialize.apply(this, arguments);
    },

    setShowHourSelect: function(showHourSelect) {
      this.getPicker().setShowHourSelect(showHourSelect);
    },

    setMaxDate: function(maxDate) {
      this.getPicker().model.set('maxDate', maxDate);
    },

    setMinDate: function(minDate) {
      this.getPicker().model.set('minDate', minDate);
    },

    //
    // Value
    //

    getValueString: function(value) {
      if (value && value.length) {
        var picker = this.getPicker();
        var format = picker.showHourSelect ? this.formatWithHour : this.format;
        var m0 = picker.utc ? moment.utc(value[0]) : moment(value[0]);
        var m1 = picker.utc ? moment.utc(value[1]) : moment(value[1]);
        return m0.format(format) + ' - ' + m1.format(format);
      }
      return '';
    },

    //
    // View value <--> DOM
    //

    isDomValueValid: function(value) {
      if (!value) {
        return true;
      }
      var values = value.split('-');
      if (values.length !== 2) {
        return false;
      }
      var utc = this.getPicker().utc,
        fromDate = utc ? moment.utc(values[0].trim()) : moment(values[0].trim()),
        toDate = utc ? moment.utc(values[1].trim()) : moment(values[1].trim());

      if (!fromDate.isValid() || !toDate.isValid()) {
        return false;
      }

      if (fromDate > toDate) {
        return false;
      }

      return Plumage.util.DateTimeUtil.isDateInRange(fromDate, this.minDate, this.maxDate) &&
        Plumage.util.DateTimeUtil.isDateInRange(toDate, this.minDate, this.maxDate);
    },

    processDomValue: function(value) {
      if (!value) {
        return null;
      }
      var format = this.getPicker().showHourSelect ? this.formatWithHour : this.format;
      var values = value.split('-'),
        utc = this.getPicker().utc,
        m0 = utc ? moment.utc(values[0].trim(), format) : moment(values[0].trim()),
        m1 = utc ? moment.utc(values[1].trim(), format) : moment(values[1].trim()),
        fromDate = m0.valueOf(),
        toDate = m1.valueOf();
      return [fromDate, toDate];
    },

    //
    // View value <--> Model
    //

    getValueFromModel: function() {
      if (this.model) {
        var from = this.model.get(this.fromAttr),
          to = this.model.get(this.toAttr);
        return [from, to];
      }
    },

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue();

      var newValues = {};
      newValues[this.fromAttr] = value[0];
      newValues[this.toAttr] = value[1];
      return model.set(newValues);
    },

    valueChanged: function() {
      FieldWithPicker.prototype.valueChanged.apply(this, arguments);
      this.getPicker().model.set({
        minDate: this.minDate,
        maxDate: this.maxDate
      });
    },

    //
    // Events
    //

    onModelChange: function (e) {
      if (e.changed[this.fromAttr] !== undefined || e.changed[this.toAttr] !== undefined) {
        this.updateValueFromModel();
      }
    },

    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.updateValueFromDom();
      } else if(e.keyCode === 27) {
        this.update();
      }
    },
  });
});

define('text!view/form/fields/templates/MultiSelect.html',[],function () { return '<select {{#if fieldName}}name="{{fieldName}}{{/if}}" multiple="multiple">\n{{#if noSelectionText}}\n<option value="{{noSelectionValue}}" {{^hasSelection}}selected="true"{{/hasSelection}}>{{noSelectionText}}</option>\n{{/if}}\n\n{{#listValues}}\n<option value="{{value}}" class="{{value}}" {{#selected}}selected{{/selected}}>{{label}}</option>\n{{/listValues}}\n</select>';});

define('view/form/fields/MultiSelect',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/form/fields/Select',
  'text!view/form/fields/templates/MultiSelect.html',
], function($, _, Backbone, Plumage, Select, template) {
  /**
   * Like a normal field, except value is an array of selected values.
   */
  return Plumage.view.form.fields.MultiSelect = Select.extend({

    template: template,

    showSelectAll: false,

    allLabel: 'All',

    initialize: function() {
      this.value = [];
      Select.prototype.initialize.apply(this, arguments);
    },

    /** overrides **/

    getTemplateData: function() {
      var data = Select.prototype.getTemplateData.apply(this, arguments);
      data.showSelectAll = this.showSelectAll;
      data.allSelected = _.all(data.listValues, function(x){ return x.selected;});
      return data;
    },

    onRender: function() {
      Select.prototype.onRender.apply(this, arguments);
    },

    getValue: function() {
      var value = Select.prototype.getValue.apply(this, arguments);
      if (value !== undefined) {
        return $.isArray(value) ? _.clone(value) : [value];
      }
      return [];
    },

    getValueLabel: function(value) {
      if (!this.listModel) {
        return '';
      }

      var labels = [];
      if (value && value.length) {
        this.listModel.each(function(item) {
          if (this.isValueSelected(this.getListItemValue(item))) {
            labels.push(this.getListItemLabel(item));
          }
        }.bind(this));
      }

      if (labels.length === this.listModel.size()) {
        return this.allLabel;
      }
      return labels.join(', ');
    },

    isValueSelected: function(value) {
      return _.contains(this.getValue(), value);
    },

    hasSelection: function() {
      var value = this.getValue();
      return Boolean(value && (value.length > 1 || value.length === 1 && value[0] !== this.noSelectionValue));
    },

    /** methods **/

    toggleValue: function(value, options) {
      var me = this;
      var currentValue = this.getValue();
      var index = currentValue.indexOf(value);
      if (index < 0) {
        index = _.sortedIndex(currentValue, value, function(value) {
          var item = me.listModel.find(function(x){
            return me.getListItemValue(x) === value;
          });
          return me.listModel.indexOf(item);
        });
        currentValue.splice(index, 0, value);
        this.setValue(currentValue, options);
      } else {
        currentValue.splice(index, 1);
        this.setValue(currentValue, options);
      }
    },

    setValueSelected: function(value, selected) {
      if (selected === undefined) {
        selected = true;
      }
      var currentValue = this.getValue();
      if (this.isValueSelected(value) !== selected) {
        this.toggleValue(value);
      }
    },

    selectAll: function() {
      var newValues = this.listModel.map(function(item){
        return this.getListItemValue(item);
      }.bind(this));
      this.setValue(newValues);
    },

    selectNone: function() {
      this.setValue([]);
    },

    toggleSelectAll: function() {
      var value = this.getValue();
      if (value && value.length === this.listModel.size()) {
        this.selectNone();
      } else {
        this.selectAll();
      }
    }
  });
});


define('text!view/form/fields/templates/DropdownMultiSelect.html',[],function () { return '<div class="dropdown-multiselect dropdown">\n<select {{#if fieldName}}name="{{fieldName}}"{{/if}} style="display: none">\n{{#if noSelectionText}}\n<option value="{{noSelectionValue}}" {{^hasSelection}}selected="true"{{/hasSelection}}>{{noSelectionText}}</option>\n{{/if}}\n{{#listValues}}\n<option value="{{value}}" {{#selected}}selected{{/selected}}>{{label}}</option>\n{{/listValues}}\n</select>\n\n<a class="btn dropdown-toggle {{buttonCls}}" data-toggle="dropdown" href="#">\n  {{#iconCls}}\n    <i class="{{.}} icon-white"></i>\n  {{/iconCls}}\n  {{#if hasSelection}}\n    {{valueLabel}}\n  {{else}}\n    {{noSelectionText}}\n  {{/if}}\n  <span class="caret"></span>\n</a>\n<ul class="dropdown-menu {{#if showSelectOnly}}show-select-only{{/if}}">\n  {{#if showSelectAll}}\n  <li class="select-all {{#allSelected}}active{{/allSelected}}">\n      <a><input type="checkbox" {{#allSelected}} checked{{/allSelected}}/>Select All</a>\n  </li>\n  {{/if}}\n  {{#listValues}}\n  <li data-value="{{value}}" class="{{value}}{{#selected}} active{{/selected}}">\n      {{#if ../showSelectOnly}}\n        <a href="#" class="only-link">only</a>\n      {{/if}}\n      <a class="item"><input type="checkbox" {{#selected}} checked{{/selected}}/>{{label}}</a>\n  </li>\n  {{/listValues}}\n</ul>\n</div>';});

define('view/form/fields/DropdownMultiSelect',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/MultiSelect',
  'text!view/form/fields/templates/DropdownMultiSelect.html',
], function($, _, Backbone, Handlebars, Plumage, MultiSelect, template) {
  /**
   * Like a normal field, except value is an array of selected values.
   */
  return Plumage.view.form.fields.DropdownMultiSelect = MultiSelect.extend({

    template: template,

    showSelectOnly: true,

    events:{
      'click li a': 'onItemClick',
      'click li input': 'onItemClick',
      'click li.select-all a': 'onSelectAllClick',
      'click li.select-all input': 'onSelectAllClick'
    },

    initialize: function() {
      this.value = [];
      MultiSelect.prototype.initialize.apply(this, arguments);
    },

    /** overrides **/

    getTemplateData: function() {
      var data = MultiSelect.prototype.getTemplateData.apply(this, arguments);
      data.showSelectOnly = this.showSelectOnly;
      return data;
    },

    onRender: function() {
      MultiSelect.prototype.onRender.apply(this, arguments);
    },

    update: function(isLoad) {
      var open = this.$('.dropdown').hasClass('open');
      this.render();
      if (open) {
        this.$('.dropdown').addClass('open');
      }
    },

    /** Event Handlers **/

    onItemClick: function(e) {

      var li = $(e.target).closest('li'),
        value = li && li.data('value');

      if (value !== undefined) {
        e.preventDefault();
        e.stopPropagation();
        if ($(e.target).hasClass('only-link')) {
          this.setValue(value);
        } else {
          this.toggleValue(value);
        }
      }
    },

    onSelectAllClick: function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.toggleSelectAll();
    }
  });


});


define('text!view/form/fields/templates/DurationField.html',[],function () { return '<input type="text" name="{{valueAttr}}" {{#placeholder}}placeholder="{{.}}"{{/placeholder}} value="{{value}}" {{#readonly}}readonly="readonly"{{/readonly}} {{#disabled}}disabled="true"{{/disabled}}/>\n<select {{#readonly}}readonly="readonly"{{/readonly}} {{#disabled}}disabled="true"{{/disabled}}>\n{{#units}}\n    <option value="{{value}}" class="{{value}}" {{#selected}}selected{{/selected}}>{{label}}</option>\n{{/units}}\n</select>';});

define('view/form/fields/DurationField',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/form/fields/Field',
  'text!view/form/fields/templates/DurationField.html'
], function($, _, Backbone, Plumage, Field, template) {
  return Plumage.view.form.fields.DurationField = Field.extend({

    className: 'duration-field control-group',

    fieldTemplate: template,

    units: [
      {label: 'minutes', value: 60000},
      {label: 'hours', value: 3600000},
      {label: 'days', value: 86400000}
    ],

    validationRules: {number: true, minValue: 0},

    events: {
      'change select': 'onUnitChange'
    },

    /**
     * View state. Value of selected unit.
     */
    selectedUnit: undefined,

    initialize: function() {
      Field.prototype.initialize.apply(this, arguments);
      if (!this.selectedUnit) {
        this.selectedUnit = this.units[0].value;
      }
    },

    getTemplateData: function() {
      var data = Field.prototype.getTemplateData.apply(this, arguments);

      data.units = _.map(this.units, function (unit) {
        var result =  _.clone(unit);
        if (this.selectedUnit !== undefined && result.value === this.selectedUnit) {
          result.selected = true;
        }
        return result;
      }.bind(this));

      return data;
    },

    getValueString: function(value) {
      if (!isNaN(Number(value))) {
        if (value && this.selectedUnit !== undefined) {
          return value/this.selectedUnit;
        }
      }
      return value;
    },

    getUnitForValue: function(value) {
      var selectedIndex = 0;
      for (var i = 0; i < this.units.length; i++) {
        if (value % this.units[i].value === 0) {
          selectedIndex = i;
        }
      }
      return this.units[selectedIndex].value;
    },

    getValueFromDom: function() {
      var value = Field.prototype.getValueFromDom.apply(this, arguments);
      if ($.isNumeric(value)) {
        return value * this.selectedUnit;
      }
      return value;
    },

    valueChanged: function(fromModel) {
      if (fromModel) {
        this.autoSelectUnit();
      }
    },

    autoSelectUnit: function() {
      this.selectedUnit = this.getUnitForValue(this.getValue());
    },

    update: function(isLoad) {
      Plumage.view.form.fields.Field.prototype.update.apply(this, arguments);
      if (this.isRendered) {
        this.$('select').val(this.selectedUnit);
      }
    },

    //
    // Events
    //

    onUnitChange: function() {
      this.selectedUnit = Number($(arguments[0].target).val());
      this.update();
    }
  });
});

define('view/form/fields/FilterCheckbox',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Checkbox'
], function($, Backbone, Handlebars, Plumage, Checkbox) {


  return Plumage.view.form.fields.FilterCheckbox = Checkbox.extend({

    filterKey: undefined,

    filterValue: true,

    invertMatch: false,

    checkboxLabel: undefined,

    comparison: 'equals',

    updateModelOnChange: true,

    processFilterValue: function(value) {
      return ((value === this.filterValue) !== this.invertMatch) ? true : false;
    },

    processValueForFilter: function(value) {
      return (value !== this.invertMatch) ? this.filterValue : undefined;
    },

    getValueFromModel: function() {
      if (this.model) {
        var filters = this.model.getFilters(this.filterKey),
          value;
        if (filters && filters.length) {
          value = filters[0].get('value');
        }
        return this.processFilterValue(value);
      }
      return undefined;
    },

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.processValueForFilter(this.getValue()),
        filters = this.model.getFilters(this.filterKey);

      if (model) {
        if (filters && filters.length) {
          if (value === undefined || String(value) === '') {
            this.model.removeFilter(filters[0]);
          } else {
            filters[0].set('value', value);
          }
        } else {
          if (value !== undefined && String(value) !== '') {
            model.addFilter(new Plumage.model.Filter({key: this.filterKey, comparison: this.comparison, value: value}));
          }
        }
      }
    }
  });
});

define('text!view/form/fields/templates/TypeAhead.html',[],function () { return '<span class="typeahead-select {{#if menuShown}}open{{/if}}">\n<span class="input-append">\n  <input type="text" placeholder="{{noSelectionText}}" value="{{value}}">\n  <button class="btn cancel-typeahead"><i class="icon-remove"></i></button>\n</span>\n\n<ul class="dropdown-menu">\n</ul>\n</span>';});


define('text!view/form/fields/templates/TypeAheadMenu.html',[],function () { return '\n{{#if loading}}\n<li class="loading"></li>\n{{else}}\n{{#listValues}}\n  <li data-value="{{value}}" class="{{value}}{{#selected}} active{{/selected}}"><a href="#">{{label}}</a></li>\n{{/listValues}}\n{{^listValues}}\n<li class="no-results"><a>No Results</a></li>\n{{/listValues}}\n{{/if}}';});

define('view/form/fields/TypeAhead',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field',
  'view/form/fields/Select',
  'RequestManager',
  'text!view/form/fields/templates/TypeAhead.html',
  'text!view/form/fields/templates/TypeAheadMenu.html'
], function($, _, Backbone, Handlebars, Plumage, Field, Select, requestManager, template, menuTemplate) {

  return Plumage.view.form.fields.TypeAhead = Select.extend(
  /** @lends Plumage.view.form.fields.TypeAhead.prototype */
  {

    template: template,

    menuTemplate: menuTemplate,

    tagName: 'span',

    valueAttr: 'name',
    labelAttr: 'name',

    itemTemplate: '<li data-value="{{value}}" class="{{value}}{{#selected}} active{{/selected}}"><a href="#">{{label}}</a></li>',

    shown: false,

    /**
     * @constructs
     * @extends Plumage.view.form.fields.Select
     */
    initialize:function() {
      Select.prototype.initialize.apply(this, arguments);
      this.menuTemplate = this.initTemplate(menuTemplate);
    },

    events: {
      'keypress input': 'onKeyPress',
      'click button': 'onClearClick'
    },

    getTemplateData: function() {
      var data = Select.prototype.getTemplateData.apply(this, arguments),
        listModel = this.listModel,
        query = listModel ? listModel.get('query') : undefined;
      if (query) {
        data.value = query;
      }
      data.menuShown = this.menuShown;
      data.loading = this.loading;
      return data;
    },

    onRender:function () {
      Select.prototype.onRender.apply(this, arguments);
      this.renderMenu();
      this.updateCancelButton();
    },

    setValue: function(value) {
      Select.prototype.setValue.apply(this, arguments);
      this.listModel.set('query', undefined);
    },

    /*
     * SelectedId represents the current selection in the menu, not the current value
     */
    setSelectedId: function(newId) {
      if (newId !== this.selectedId) {
        this.selectedId = newId;
        this.updateMenu();
      }
    },

    update: function(isLoad) {
      Select.prototype.update.apply(this, arguments);
      if(this.listModel) {
        this.updateCancelButton();
      }
    },

    delegateEvents: function(events) {

      events = events || _.result(this, 'events');
      var selector = '.dropdown-menu';
      events = _.clone(events || {});
      events['mousedown ' +selector] = 'onMenuMouseDown';
      events['click ' +selector] = 'onMenuClick';

      Field.prototype.delegateEvents.apply(this, [events]);
    },

    undelegateEvents: function(events) {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
    },

    /*
     * Menu
     *****************/

    renderMenu: function() {
      var data = this.getTemplateData();
      this.$('.dropdown-menu').html(this.menuTemplate(data));
    },

    updateMenu: function() {
      if (this.listModel) {
        var liEls = this.$('.dropdown-menu').find('li');
        liEls.removeClass('active');
        if (this.selectedId) {
          var index = this.listModel.indexOf(this.listModel.getById(this.selectedId));
          if (index !== -1) {
            $(liEls[index]).addClass('active');
          } else {
            this.selectedId = undefined;
          }
        }
      }
    },

    showMenu: function() {
      this.$('> span').addClass('open');
      this.menuShown = true;
    },

    hideMenu: function() {
      this.$('> span').removeClass('open');
      this.menuShown = false;
    },

    getItemData: function(instance) {
      return {
        value: instance.id,
        label: instance.get(this.labelAttr),
        selected: instance.id === this.selectedId
      };
    },

    next: function (event) {
      var listModel = this.listModel,
        index = 0;

      if (listModel && listModel.size()) {
        if (this.selectedId) {
          index = listModel.indexOf(listModel.getById(this.selectedId));
          index = (index+1) % listModel.size();
        }
        this.setSelectedId(listModel.at(index).get('name'));
      }
    },

    prev: function (event) {
      var listModel = this.listModel,
        index = 0;

      if (listModel && listModel.size()) {
        if (this.selectedId) {
          index = listModel.indexOf(listModel.getById(this.selectedId));
          index -= 1;
          index = index < 0 ? index + listModel.size() : index;
        }
        this.setSelectedId(listModel.at(index).get('name'));
      }
    },

    select: function () {
      this.setValue(this.selectedId);
      this.listModel.set('query', undefined);
      this.getInputEl().blur();
      this.hideMenu();
      this.triggerChange();
    },

    resetInput: function() {
      this.$('input').val(this.getValue());
    },

    /*
     * Event Handlers
     *****************/

    onModelLoad: function (collection, resp) {
      Select.prototype.onModelLoad.apply(this, arguments);
      this.update(true);
    },

    onKeyDown: function (e) {
      this.suppressKeyPressRepeat = !$.inArray(e.keyCode, [40,38,9,13,27]);

      if (!this.shown) { return; }

      e.stopPropagation();
      switch(e.keyCode)
      {
      case 9: // tab
        e.preventDefault();
        break;
      case 13: // enter
        if (this.shown || this.loading) {
          e.preventDefault();
          this.select();
        }
        break;
      case 27: // escape
        if (this.shown) {
          e.preventDefault();
          this.resetInput();
          this.hideMenu();
        }
        break;
      case 38: // up arrow
        e.preventDefault();
        this.prev();
        break;
      case 40: // down arrow
        e.preventDefault();
        this.next();
        break;
      }
    },

    onChange: function (e) {
      //do nothing
    },

    onInput: function (e) {
      this.listModel.set({query: this.getValueFromDom()});
      this.updateQuery();
      this.showMenu();
    },

    onFocus: function (e) {
      this.updateQuery();
      this.showMenu();
    },

    onBlur: function (e) {
      this.hideMenu();
      this.resetInput();
    },

    /**
     * Prevent onBlur when clicking the menu.
     */
    onMenuMouseDown: function(e) {
      e.preventDefault();
      e.stopPropagation();
    },

    onMenuClick: function (e) {
      e.preventDefault();
      e.stopPropagation();
      var li = $(e.target).parent('li');
      if (li.length) {
        var value = li.data('value');
        if (value) {
          this.setSelectedId(value);
          this.select();
        }
      }
    },

    updateQuery: function() {
      if (!this.listModel) {
        return;
      }
      requestManager.loadModel(this.listModel, {
        data: {
          limit: 10, //change this to actual value
          offset: 0
        }
      });
      this.loading = true;
    },

    updateCancelButton: function() {
      if (!this.$input) {
        return;
      }
      var value = this.$input.val();
      if (value.length === 0) {
        this.$('button').attr('disabled', 'disabled');
      } else {
        this.$('button').removeAttr('disabled');
      }

    },

    onClearClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var value = this.getValue();
      if (value && value.length > 0) {
        this.setValue('');
        this.updateQuery();
        this.hideMenu();
        this.blur();
        this.update();
        this.triggerChange();
      }
      this.updateCancelButton();
    },

    /**
     * For override
     */

    setModel: function(rootModel, parentModel) {
      Select.prototype.setModel.apply(this, arguments);
    },

    /*
     * Override Select
     ********************************/

    onListModelChange: function(event, model) {
      //don't update, just rerender the menu
      this.renderMenu();
    },

    onListModelLoad: function(listModel, request) {
      var query = listModel.get('query') ? listModel.get('query') : '';

      //discard result if query has already changed
      if (query !== this.$('input').val()) {
        return;
      }

      if (this.listModel.size() && (!this.selectedId || this.listModel.getById(this.selectedId) === undefined) ) {
        this.selectedId = this.listModel.at(0).id;
        console.log('autoselecting: ' + this.selectedId);
      }
      this.loading = false;
      this.renderMenu();
    }
  });
});
define('view/form/fields/FilterTypeAhead',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/TypeAhead',
  'model/Filter'
], function($, Backbone, Handlebars, Plumage, TypeAhead, Filter) {


  return Plumage.view.form.fields.FilterTypeAhead = TypeAhead.extend(
  /** @lends Plumage.view.form.fields.FilterTypeAhead.prototype */
  {

    filterKey: undefined,

    comparison: 'equals',

    updateModelOnChange: true,

    /**
     * TypeAhead that uses this.model's filters on as its model.
     *
     * @constructs
     * @extends Plumage.view.form.fields.TypeAhead
     */
    initialize: function() {
      TypeAhead.prototype.initialize.apply(this, arguments);
    },

    //Currently copy-paste to-from FilterField. Move to mixin?
    getValueFromModel: function() {
      if (this.model) {
        var filters = this.model.getFilters(this.filterKey);
        if (filters && filters.length) {
          return filters[0].get('value');
        }
      }
      return undefined;
    },

    setModel: function() {
      TypeAhead.prototype.setModel.apply(this, arguments);
    },

    //Currently copy-paste to-from FilterField. Move to mixin?
    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue(),
        filters = this.model.getFilters(this.filterKey);

      if (model) {
        if (filters && filters.length) {
          if (value === undefined || String(value) === '') {
            this.model.removeFilter(filters[0]);
          } else {
            filters[0].set('value', value);
          }
        } else {
          if (value !== undefined && String(value) !== '') {
            model.addFilter(new Filter({key: this.filterKey, comparison: this.comparison, value: value}));
          }
        }
      }
      return true;
    }
  });
});

define('text!view/form/fields/templates/InPlaceTextField.html',[],function () { return '<div class="control-group {{#if validationState}}{{validationState}}{{/if}}">\n{{#if label}}\n  <label class="control-label" for="{{valueAttr}}">{{label}}</label>\n  <div class="controls">\n{{/if}}\n    <div class="field-value {{#unless hasValue}}no-value{{/unless}}">\n      <i class="icon-pencil"></i>\n      <span>{{#if hasValue}}{{value}}{{else}}{{placeholder}}{{/if}}</span>\n\t  </div>\n    {{> field}}\n    <span class="help-inline">{{#if message}}{{message}}{{/if}}</span>\n{{#if label}}\n  </div>\n{{/if}}\n</div>\n';});

define('view/form/fields/InPlaceTextField',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field',
  'text!view/form/fields/templates/InPlaceTextField.html'
], function($, Backbone, Handlebars, Plumage, Field, template) {
  return Plumage.view.form.fields.InPlaceTextField = Field.extend({
    template: template,

    className: 'inplace-field',

    events: {
      'click .field-value': 'onFieldValueClick'
    },

    update: function() {
      Field.prototype.update.apply(this, arguments);
      if (!this.isEditing()) {
        this.render();
      }
    },

    //
    // helpers
    //

    commit: function() {
      this.updateValueFromDom();
      this.hideField();
      this.update();
    },

    cancel: function() {
      this.hideField();
      this.update();
    },

    isEditing: function() {
      return this.$el.hasClass('editing');
    },

    showField: function() {
      this.$el.addClass('editing');
      this.getInputEl().focus();
    },

    hideField: function() {
      this.$el.removeClass('editing');
    },

    //
    // handlers
    //

    onChange: function(e) {
      //do nothing. commit on hide instead of change.
    },

    onInput: function(e) {
      //do nothing. commit on hide instead of change.
    },

    onFieldValueClick: function() {
      this.showField();
    },

    onBlur: function() {
      this.commit();
    },

    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.commit();
      } else if (e.keyCode === 27) { //on escape
        this.cancel();
      }
    }
  });
});


define('text!view/form/fields/templates/Radio.html',[],function () { return '{{#items}}\n<label class="radio {{cls}}">\n  <input type="radio" name="{{../fieldName}}" {{#selected}}checked="true"{{/selected}} value="{{value}}">\n  <span>{{label}}</span>\n</label>\n{{/items}}\n';});

define('view/form/fields/Radio',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field',
  'text!view/form/fields/templates/Radio.html'
], function($, _, Backbone, Handlebars, Plumage, Field, template) {
  return Plumage.view.form.fields.Radio = Field.extend({

    template: Handlebars.compile(template),

    //value, label, cls
    items: [],

    getTemplateData: function() {
      var data = Field.prototype.getTemplateData.apply(this, arguments);
      data.items = [];
      for (var i=0; i < this.items.length; i++) {
        var item = _.clone(this.items[i]);
        data.items.push(item);
        if (this.getValue() === item.value) {
          item.selected = true;
        }
      }
      return data;
    },

    updateValue: function() {
      this.value = this.getValueFromModel();
      if (this.isRendered) {
        this.render();
      }
    },

    getValueFromDom: function() {
      return this.$('input:checked').val();
    }
  });
});


define('text!view/form/fields/templates/RadioButtonGroup.html',[],function () { return '<div class="btn-group">\n{{#items}}\n  <button type="button" class="btn {{#selected}}active{{/selected}}" data-value="{{value}}">{{label}}</button>\n{{/items}}\n</div>';});

define('view/form/fields/RadioButtonGroup',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Radio',
  'text!view/form/fields/templates/RadioButtonGroup.html'
], function($, Backbone, Handlebars, Plumage, Radio, template) {
  return Plumage.view.form.fields.RadioButtonGroup = Radio.extend({

    template: Handlebars.compile(template),

    events: {
      'click button': 'onChange'
    },

    onChange: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var newValue = $(e.target).data('value');
      if (!this.changing) {
        this.setValue(newValue, {silent: true});
      }
      this.trigger('change', this, this.getValue());
    }
  });
});


define('text!view/form/fields/templates/SearchField.html',[],function () { return '{{> field}}\n<button><i class="icon-search"></i></button>\n';});

define('view/form/fields/SearchField',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field',
  'text!view/form/fields/templates/SearchField.html'
], function($, Backbone, Handlebars, Plumage, Field, template) {

  return Plumage.view.form.SearchField = Field.extend(
  /** @lends Plumage.view.form.fields.SearchField.prototype */
  {
    template: template,

    className: 'search-field',

    //need to add bootstrap search-query class
    fieldTemplate: '<input type="text" class="search-query" name="{{valueAttr}}" {{#placeholder}}placeholder="{{.}}"{{/placeholder}} value="{{value}}"/>',

    valueAttr: 'query',

    updateModelOnChange: true,

    events: {
      'click button': 'onSubmitClick'
    },

    onKeyDown: function(e) {
      if (e.keyCode === 13) { //on enter
        e.preventDefault();
        this.trigger('submit', this, this.getValue());
      }
    },

    onSubmitClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.trigger('submit', this, this.getValue());
    }
  });
});

define('text!view/form/templates/SelectField.html',[],function () { return '<option value="{{noSelectionValue}}" {{^hasSelection}}selected="true"{{/hasSelection}}>{{noSelectionText}}</option>\n{{#items}}\n<option {{#selected}}selected="true"{{/selected}} value="{{value}}">{{label}}</option>\n{{/items}}';});

define('view/form/SelectField',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Select',
  'text!view/form/templates/SelectField.html'
], function($, Backbone, Handlebars, Plumage, Select, template) {

  return Plumage.view.form.SelectField = Select.extend({

    tagName: 'select',

    className: 'select-field',

    template: Handlebars.compile(template),

    // attribute of the list items used as the key of available selections
    listValueAttr: undefined,

    // attribute of the list items used as the label of available selections
    listLabelAttr: undefined,

    // attribute of the model representing the selection
    modelAttr: undefined,

    noSelectionText: '',

    value: '',

    events: {
      'change': 'onChange'
    },

    initialize:function() {
      Select.prototype.initialize.apply(this, arguments);
    }
  });
});
define('view/form/fields/FilterField',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field',
  'model/Filter'
], function($, Backbone, Handlebars, Plumage, Field, Filter) {


  return Plumage.view.form.fields.FilterField = Field.extend({

    className: 'filter-text-field',

    filterKey: undefined,

    comparison: 'contains',

    updateModelOnChange: true,

    getValueFromModel: function() {
      if (this.model) {
        var filters = this.model.getFilters(this.filterKey);
        if (filters && filters.length) {
          return filters[0].get('value');
        }
      }
      return undefined;
    },

    updateModel: function(rootModel, parentModel) {
      var model = this.getModelFromRoot(this.relationship, rootModel, parentModel),
        value = this.getValue(),
        filters = this.model.getFilters(this.filterKey);

      if (model) {
        if (filters && filters.length) {
          if (value === undefined || String(value) === '') {
            this.model.removeFilter(filters[0]);
          } else {
            filters[0].set('value', value);
          }
        } else {
          if (value !== undefined && String(value) !== '') {
            model.addFilter(new Filter({key: this.filterKey, comparison: this.comparison, value: value}));
          }
        }
      }
      return true;
    }
  });
});

define('text!view/menu/templates/DropdownMenu.html',[],function () { return '\n<a class="dropdown-toggle {{#buttonStyle}}btn{{/buttonStyle}}" data-toggle="dropdown" href="#">\n\t{{#iconCls}}<i class="{{.}}"></i>{{/iconCls}}\n\t{{label}}\n  {{#showCaret}}<b class="caret"/>{{/showCaret}}\n</a>\n<ul class="dropdown-menu {{dropdownCls}}" role="menu">\n  {{#menuItems}}\n  <li>\n    <a data-value="{{value}}">{{#icon}}<i class="icon-{{.}}"></i>{{/icon}}{{label}}</a>\n  </li>\n  {{/menuItems}}\n</ul>\n';});

define('view/menu/DropdownMenu',[
  'jquery',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/View',
  'text!view/menu/templates/DropdownMenu.html',
  'bootstrap'
], function($, Backbone, Handlebars, Plumage, View, template) {

  return Plumage.view.menu.DropdownMenu = View.extend({
    template: template,

    className: 'dropdown',

    buttonStyle: false,

    menuItems: [],

    iconCls: undefined,

    showCaret: true,

    opens: 'right',

    events: {
      'click li a': 'onItemClick'
    },

    getTemplateData: function() {
      return {
        label: this.label,
        iconCls: this.iconCls,
        menuItems: this.menuItems,
        showCaret: this.showCaret,
        buttonStyle: this.buttonStyle,
        dropdownCls: this.opens === 'left' ? 'pull-right' : ''
      };
    },

    setLabel: function(label) {
      this.label = label;
      this.render();
    },

    /** Methods **/

    open: function() {
      this.$el.addClass('open');
    },

    close: function() {
      this.$el.removeClass('open');
    },

    /** Event Handlers **/

    onItemClick: function(e) {
      this.trigger('itemClick', this, $(e.target).data('value'));
    }
  });
});


define('text!view/grid/templates/FilterView.html',[],function () { return '\n{{#if hasFilters}}<span>Filter by:</span>{{/if}}\n\n<span class="filters"></span>\n\n<span class="actions"></span>\n\n\n<span class="more-menu"></span>\n\n<span class="actions-right"></span>\n\n<span class="search"></span>\n';});

define('view/grid/FilterView',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/Form',
  'view/ModelView',
  'view/form/fields/FilterField',
  'view/form/fields/SearchField',
  'view/menu/DropdownMenu',
  'util/ModelUtil',
  'text!view/grid/templates/FilterView.html'
], function($, _, Backbone, Handlebars, Plumage, Form, ModelView, FilterField, SearchField,
    DropdownMenu, ModelUtil, template) {

  /**
   * Contains special fields defined declaratively that collectively affect a collection's filter meta attribute.
   *
   * Currently each field must be customized to update the filter in updateModel. Maybe this aspect could me
   * moved down into FilterView.
   */
  return Plumage.view.grid.FilterView = Form.extend({

    className: 'form-inline filter-view',

    template: Handlebars.compile(template),

    showSearch: true,

    searchEmptyText: 'Search',

    filterConfigs: [],

    defaultFieldCls: FilterField,

    moreMenuItems: [{value: 'download', label: 'Download', icon: 'arrow-down'}],

    initialize: function(options) {
      var me = this;

      Form.prototype.initialize.apply(this, arguments);
      options = options || {};

      this.filterFields = [];
      this.subViews = _.clone(this.subViews);

      _.each(this.filterConfigs, function(config){
        var filterConfig = _.extend({}, {
          selector: '.filters',
          className: 'filter-field',
          relationship: this.relationship
        }, config);
        var fieldCls = config.fieldCls || this.defaultFieldCls;
        var filter = new fieldCls(filterConfig);
        this.subViews.push(filter);
        this.filterFields.push(filter);
      }, this);

      if (this.showSearch) {
        this.searchField = new SearchField({
          selector: '.search',
          noSelectionText: this.searchEmptyText,
          modelAttr: 'query'
        });
        this.subViews.push(this.searchField);
      }

      this.subViews.push(this.moreMenu = new DropdownMenu({
        selector: '.more-menu',
        buttonStyle: true,
        iconCls: 'icon-cog',
        label: '',
        menuItems: this.moreMenuItems,
        opens: 'left',
        replaceEl: true
      }));

      this.subViews.concat(options.subViews || []);

      _.each(this.filterFields, function(filterField){
        if (filterField.listModelCls) {
          var ListModelCls = ModelUtil.loadClass(filterField.listModelCls);
          var listModelParams = filterField.listModelParams || {};
          var model = this.createFilterListModel(ListModelCls, listModelParams);
          filterField.setListModel(model);
        }
      }, this);
    },

    getTemplateData: function() {
      var data = Form.prototype.getTemplateData.apply(this, arguments);
      data.hasFilters = this.filterConfigs.length > 0;
      return data;
    },

    createFilterListModel: function(listModelCls, listModelParams) {
      return new listModelCls(null, listModelParams);
    },

    onRender: function() {
      $(this.el).html(this.template({
        searchQuery: ''
      }));
    },

    update: function(isLoad) {
      //don't rerender nothing
    },

    setModel: function() {
      Plumage.view.ModelView.prototype.setModel.apply(this, arguments);
    },
  });
});

define('view/grid/Formatters',[
  'jquery',
  'backbone',
  'moment',
  'PlumageRoot',
  'util/DateTimeUtil'
], function($, Backbone, moment, Plumage, DateTimeUtil) {

  return Plumage.view.grid.Formatters = {

    MoneyFormatter: function(row, cell, value, columnDef, dataContext) {
      if (value && value.toFixed) {
        return value.toFixed(2);
      }
      return value;
    },

    DateFromNowFormatter: function(row, cell, value, columnDef, dataContext) {
      return DateTimeUtil.formatDateFromNow(value);
    },

    DateFormatter: function(row, cell, value, columnDef, dataContext) {
      return DateTimeUtil.formatDate(value, columnDef.dateFormat);
    },

    DateFormatterUTC: function(row, cell, value, columnDef, dataContext) {
      return DateTimeUtil.formatDateUTC(value, columnDef.dateFormat);
    },

    DurationFormatter: function(row, cell, value, columnDef, dataContext) {
      return DateTimeUtil.formatDurationShort(Number(value));
    },

    NameWithCommentsFormatter: function(row, cell, value, columnDef, dataContext) {
      var count = dataContext.get('comments_count');
      if (count > 0) {
        return value + '<span class="comments-count-icon">' + count + '</span>';
      } else {
        return value;
      }
    }
  };
});
define('view/grid/GridData',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot'
],

function($, _, Backbone, Plumage) {


  /**
   * Adapts a backbone Collection to the slickgrid data interface.
   * @constructs Plumage.collection.GridData
   */
  var GridData = function() {
    this.initialize.apply(this, arguments);
  };

  _.extend(GridData.prototype, Backbone.Events,
  /** @lends Plumage.collection.GridData.prototype */
  {

    /** List of events to forward from the Collection */
    relayEventNames: ['reset'],

    /** The wrapped collection */
    collection: undefined,

    /** Initializtion logic */
    initialize: function(collection, options) {
      _.extend(this, options);
      this.collection = collection;
      this.collection.on('all', this.relayEvent, this);
    },

    ensureData: function(from, to) {
      if (this.collection.ensureData) {
        this.collection.ensureData(from, to);
      }
    },

    /** calls setSort on Collection */
    setSort: function(sortField, sortDir){
      this.collection.setSort(sortField, sortDir, true);
    },

    /** gets size of collection  */
    getLength: function() {
      return this.collection.size();
    },

    /** get the model at the given index. */
    getItem: function(index) {
      return this.collection.at(index);
    },

    /** Can be overridden to provide row specific options for slickgrid */
    getItemMetadata: function(index) {
      return null;
    },

    /** Get the indes of the model with the given id. */
    getIndexForId: function (id) {
      var model = this.collection.getById(id);
      return this.collection.indexOf(model);
    },

    /**
     * Forwards events from Collection as if they were triggered on GridData
     * @private
     */
    relayEvent: function(eventName) {
      if (_.contains(this.relayEventNames, eventName)) {
        this.trigger.apply(this, arguments);
      }
    }
  });

  GridData.extend = Backbone.Model.extend;

  return Plumage.view.grid.GridData = GridData;
});
define('view/grid/GridView',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ModelView',
  'view/grid/GridData',
  'collection/BufferedCollection',
  'collection/GridSelection',
  'slickgrid-all'
], function($, _, Backbone, Plumage, ModelView, GridData, BufferedCollection, GridSelection, Slick) {

  return Plumage.view.grid.GridView = ModelView.extend({

    className: 'grid-view',

    columns: undefined,

    gridOptions: {},

    gridDataCls: GridData,

    defaultGridOptions: {
      editable: false,
      multiSelect: false,
      explicitInitialization: true,
      rowHeight: 34,
      dataItemColumnValueExtractor: function(item, columnDef) {
        return item.get(columnDef.field);
      }
    },

    selection: undefined,

    firstShow: true,

    infiniteScroll: true,

    checkboxSelect: false,

    checkboxColumn: {
      id: 'checkbox-select',
      cssClass: 'checkbox-select',
      field: 'sel',
      width: 30,
      resizable: false,
      sortable: false
    },

    noDataText: 'No Rows Found',

    saveViewState: true,

    filterView: undefined,

    initialize: function () {
      var me = this;
      ModelView.prototype.initialize.apply(this, arguments);

      //checkbox select
      if (this.checkboxSelect) {
        this.columns = _.clone(this.columns);
        this.columns.unshift(_.extend({
          formatter: function(row, cell, value, columnDef, dataContext) {
            if (dataContext) {
              var selected = this.selection.isSelectedId(dataContext.id);
              return selected ? '<input type="checkbox" checked="checked">' : '<input type="checkbox">';
            }
            return null;
          }.bind(this)
        }, this.checkboxColumn));
      }

      var gridData = this.createGridData();

      this.gridEl = $('<div class="grid"></div>');
      this.grid = new Slick.Grid(this.gridEl, gridData, this.columns, _.extend({}, this.defaultGridOptions, this.gridOptions));
      this.grid.onClick.subscribe(this.onGridClick.bind(this));

      this.grid.onSort.subscribe(this.onSort.bind(this));

      if (this.infiniteScroll) {
        this.grid.onViewportChanged.subscribe(function (e, args) {
          var vp = this.grid.getViewport();
          this.ensureGridData(vp.top, vp.bottom);
        }.bind(this));
      }

      if (this.filterView) {
        this.setFilterView(this.filterView);
      }

      this.onResize = _.debounce(this.onResize, 50);
    },

    delegateEvents: function(events) {
      ModelView.prototype.delegateEvents.apply(this, arguments);
      $(window).on('resize.delegateEvents'+ this.cid, this.onResize.bind(this));
    },

    undelegateEvents: function(events) {
      ModelView.prototype.undelegateEvents.apply(this, arguments);
      $('window').off('.delegateEvents'+ this.cid);
    },

    onRender: function () {
//      this.grid.scrollToLastRendered();
      $(this.el).append(this.gridEl);
    },

    setModel: function(rootModel, parentModel) {
      var oldModel = this.model;
      ModelView.prototype.setModel.apply(this, arguments);
      if (this.model && this.model !== oldModel) {
        this.grid.setData(this.createGridData(this.model));
        if (this.shown) {
          var vp = this.grid.getViewport();
          this.ensureGridData(vp.top, vp.bottom);
          this.grid.updateRowCount();
          this.grid.render();
        }
      }
    },

    setSelection: function(selection) {
      if (this.selection) {
        this.selection.off('all', this.onSelectionChanged, this);
      }
      this.selection = selection;
      this.selection.on('all', this.onSelectionChanged, this);

      this.grid.setSelectionModel(new GridSelection(selection));
    },

    setFilterView: function(filterView) {
      if (this.filterView) {
        this.filterView.moreMenu.off('itemClick', this.onMoreMenuItemClick, this);
      }
      this.filterView = filterView;
      this.filterView.moreMenu.on('itemClick', this.onMoreMenuItemClick, this);
    },

    /**
     * Helpers
     */

    createGridData: function(model) {
      if (model) {
        if (this.infiniteScroll) {
          model = new BufferedCollection(model);
          model.on('pageLoad', this.onPageLoad.bind(this));
        }
        return new this.gridDataCls(model);
      }
      return [];
    },

    ensureGridData: _.debounce(function(from, to) {
      this.grid.getData().ensureData(from, to);
    }, 200),

    downloadCSV: function() {
      if (!this.model) {
        return;
      }
      var total = this.model.get('total');
      if (!this.model.hasMore()) {
        this._doDownloadCSV(this.model);
      } else {
        var model = this.model.clone();
        model.set({page: 0, pageSize: total});
        this.showLoadingAnimation();
        model.load({success: function() {
          this.hideLoadingAnimation();
          this._doDownloadCSV(model);
        }.bind(this)});
      }
    },

    _doDownloadCSV: function(model) {
      var data = [],
        columns = this.grid.getColumns(),
        titles = _.map(columns, function(column){ return column.name; });
      model.each(function(item, iRow){
        var rowData = [];
        for (var iCol = 0; iCol < columns.length; iCol++) {
          var column = columns[iCol];
          var value = item.get(column.field);
          if (column.formatter) {
            value = column.formatter(iRow, iCol, value, column, item);
            if (typeof(value) === 'string') {
              value = value.replace(/<(?:.|\n)*?>/gm, ''); //strip html
            }
          }
          rowData.push(value);
        }
        data.push(rowData);
      });

      var csv = titles.join(',') + '\n';
      csv += _.map(data, function(rowData) { return rowData.join(','); }).join('\n');

      window.location = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    },

    /*
     * Event Handlers
     *********************/

    onModelLoad: function(models, options) {
      if (!this.infiniteScroll) {
        this.onDoneLoad();
        this.grid.invalidate();
        this.updateNoData();
        this.grid.scrollRowToTop(0);
      }
      if (models && models.get && models.get('sortField')) {
        this.grid.setSortColumn(models.get('sortField'), String(models.get('sortDir')) === '1');
      }
    },

    onModelChange: function(models, options) {
    },

    onShow: function() {
      ModelView.prototype.onShow.apply(this, arguments);
      if (this.gridEl.closest('html').length === 0) {
        $(this.el).append(this.gridEl);
      }
      if (this.firstShow) {
        this.firstShow = false;
        this.grid.init();
      } else {
        this.grid.scrollToLastRendered();
      }
      this.grid.resizeCanvas();
    },

    onHide: function() {
      ModelView.prototype.onHide.apply(this, arguments);
      $(this.gridEl).detach();
    },

    onGridClick: function(e, args) {
      var target = e.target;

      if (target.tagName === 'A' && $(target).attr('href')) {
        if (!$(target).hasClass('outlink')) {
          e.preventDefault();
          window.router.navigateWithQueryParams($(target).attr('href'), {trigger: true});
        }
        return false;
      }

      if (this.grid.getColumns()[args.cell].id === 'checkbox-select') {
        if (this.selection) {
          this.toggleRowSelected(args.row);
        }
        e.stopPropagation();
        return;
      }

      var cell = this.grid.getCellFromEvent(e);
      var item = this.grid.getDataItem(cell.row);
      if (item) {
        var id = this.grid.getDataItem(cell.row).id,
        data = this.grid.getData(),
        model = data.getItem(data.getIndexForId(id));
        this.trigger('itemSelected',  model);
      }
    },

    toggleRowSelected: function(index) {
      this.selection.toggleIndex(index);
    },

    onSelectionChanged: function(event, selection, model, options) {
      if (event === 'add' || event === 'remove') {
        this.grid.invalidateRow(this.grid.getData().getIndexForId(model.id));
      } else if (event === 'reset') {
        this.grid.invalidate();
      }
      if (this.rendered) {
        this.grid.render();
      }
    },

    onResize: function() {
      if (this.shown) {
        this.grid.resizeCanvas();
      }
    },

    onSort: function (e, options) {
      var sortDir = options.sortAsc ? 1 : -1,
        sortField = options.sortCol.field;

      this.model.setSort(sortField, sortDir, false);
    },

    onMoreMenuItemClick: function(menu, value) {
      if (value === 'download') {
        this.downloadCSV();
      }
    },

    /**
     * Infinite scroll events
     */

    onBeginPageLoad: function() {
      this.showLoadingAnimation();
    },

    onPageLoad: function(gridData, from, to) {
      for (var i = from; i < to; i++) {
        this.grid.invalidateRow(i);
      }

      this.grid.updateRowCount();
      this.grid.render();

      this.hideLoadingAnimation();
      this.updateNoData();
    },

    /**
     * Loading animation
     */

    updateNoData: function() {
      if (!this.noDataEl) {
        this.noDataEl = $('<div class="no-data">' + this.noDataText + '</div>');
        $(this.el).append(this.noDataEl);
      }
      if (this.grid && this.grid.getData() && this.grid.getData().getLength && this.grid.getData().getLength() === 0) {
        this.noDataEl.show();
      } else {
        this.noDataEl.hide();
      }
    },

    onDoneLoad: function(){
      this.hideLoadingAnimation();
    },

    onModelBeginLoad: function () {
      ModelView.prototype.onModelBeginLoad.apply(this, arguments);
      this.showLoadingAnimation();
    }
  });
});


define('text!view/grid/templates/Pager.html',[],function () { return '<ul class="pager">\n  <li class="previous {{#if atFirstPage}}disabled{{/if}}"><a href="#">&larr;Previous</a></li>\n  <li class="next {{#if atLastPage}}disabled{{/if}}"><a href="#">Next &rarr;</a></li>\n</ul>';});

define('view/grid/Pager',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ModelView',
  'text!view/grid/templates/Pager.html'
], function($, _, Backbone, Plumage, ModelView, template) {

  return Plumage.view.grid.Pager = ModelView.extend({

    className: 'pager',

    template: template,

    events: {
      'click .pager .previous a': 'onPreviousClick',
      'click .pager .next a': 'onNextClick',
    },

    getTemplateData: function() {
      return {
        atFirstPage: this.atFirstPage(),
        atLastPage: this.atLastPage()
      };
    },

    atFirstPage: function() {
      if (this.model) {
        return this.model.get('page') === 0;
      }
      return false;
    },

    atLastPage: function() {
      if (this.model) {
        return this.model.size() < this.model.get('pageSize');
      }
      return false;
    },

    onPreviousClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!this.atFirstPage()) {
        var page = this.model.get('page');
        this.model.set('page', Math.max(page-1, 0));
        this.model.load();
      }
    },

    onNextClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var page = this.model.get('page'),
        pageSize = this.model.get('pageSize'),
        atLastPage = this.model.size() < pageSize;

      if (!this.atLastPage()) {
        this.model.set('page', page+1);
        this.model.load();
      }
    }
  });
});

define('view/ListItemView',[ 'jquery', 'underscore', 'backbone',
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

define('view/ListView',[ 'jquery', 'underscore', 'backbone',
  'PlumageRoot',
  'collection/Selection',
  'view/CollectionView','view/ListItemView' ], function($, _, Backbone, Plumage,
      Selection, CollectionView, ListItemView) {

  /**
   * ListView is a CollectionView that renders a selectable, navigable UL.
   */
  return Plumage.view.ListView = CollectionView.extend({

    tagName : 'ul',

    selection : undefined,

    selectionAttr: 'selectionId',

    className : 'list-view',

    itemViewCls: ListItemView,

    selectable : true,

    /**
     * Select first item by default
     */
    autoselect: true,

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

    /** Overrides */
    renderItem: function() {
      var itemView = CollectionView.prototype.renderItem.apply(this, arguments);
      itemView.on('select', this.onItemViewSelect.bind(this));
      return itemView;
    },

    update: function() {
      CollectionView.prototype.update.apply(this, arguments);
      this.autoSelectFirst();
    },

    /** Event Handlers */

    onSelectionChange: function() {
      if (this.selectable) {
        this.updateSelection();
        this.trigger('selectionChange', this.selection.get(this.selectionAttr));
      }
    },

    onItemViewSelect: function(view, model) {
      this.select(model.id);
    },

    /** Helpers */

    autoSelectFirst: function() {
      if (this.selection.get(this.selectionAttr) === undefined && this.autoselect) {
        this.selectFirst();
      }
    },

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

define('view/ListAndDetailView',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'view/ListView'
], function($, _, Backbone, Handlebars, Plumage, ModelView, ListView) {

  /**
   * A selectable list and corresponding detail view.
   */
  return Plumage.view.ListAndDetailView = ModelView.extend({

    className: 'list-and-detail-view',

    template: '<div class="list"></div><div class="detail"></div>',

    listOptions: {},

    detailViewCls: undefined,

    events: {
      'click .select': 'onSelect'
    },

    initialize:function(options) {
      options = options || {};
      this.subViews = [
        this.listView = new ListView(_.extend({
          selector: '.list',
          className: 'list-view'
        }, this.listOptions)),
        this.detailView = this.createDetailView()
      ].concat(options.subViews || []);
      ModelView.prototype.initialize.apply(this, arguments);

      this.listView.on('selectionChange', this.onSelect.bind(this));
    },

    createDetailView: function() {
      return new this.detailViewCls({selector: '.detail', replaceEl: true});
    },

    onRender: function(){
      $(this.el).html(this.template());
    },

    onSelect: function(selectedId) {
      var selectedModel = this.listView.model.getById(selectedId);
      this.detailView.setModel(selectedModel);
    },

    update: function() {
      //do nothing
    }
  });
});

define('text!view/templates/ModalDialog.html',[],function () { return '<div class="modal hide fade" tabindex="-1" role="dialog" aria-hidden="true">\n  <div class="modal-header">\n    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>\n    <h3 id="myModalLabel">{{> header}}</h3>\n  </div>\n  <div class="modal-body">\n    <div class="modal-content"></div>\n  </div>\n  <div class="modal-footer">\n    {{#if showCancel}}\n      <a class="cancel" data-dismiss="modal" aria-hidden="true">Cancel</a>\n    {{else}}\n      <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>\n    {{/if}}\n    {{#if showSubmit}}\n      <button class="btn submit" {{#if canSubmit}}{{else}}disabled="true"{{/if}}>Submit</button>\n    {{/if}}\n  </div>\n</div>';});

define('view/ModalDialog',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'text!view/templates/ModalDialog.html'
], function($, _, Backbone, Handlebars, Plumage, ModelView, template) {

  return Plumage.view.ModalDialog = ModelView.extend({

    template: template,

    contentView: undefined,

    headerTemplate: '',

    showCancel: false,

    showSubmit: false,

    modalOptions: {
      show:false
    },

    events: {
      'click .submit': 'onSubmitClick'
    },

    initialize: function(options) {
      options = options || {};
      options.modalOptions = _.extend(this.modalOptions, options.modalOptions || {});
      if (this.contentView) {
        this.subViews = [this.contentView].concat(options.subViews || []);
        this.contentView.selector = '.modal-content';
        this.contentView.name = 'contentView';
      }

      ModelView.prototype.initialize.apply(this, arguments);

      if (this.contentView) {
        this.contentView = this.getSubView('contentView');
      }
    },

    onRender: function() {
      Handlebars.registerPartial('header', this.headerTemplate);
      ModelView.prototype.onRender.apply(this, arguments);
      if (this.$el.closest('html').length === 0) {
        $('body').append(this.$el);
        this.$('.modal').modal(this.modalOptions);
      }
    },

    getTemplateData: function() {
      var data = ModelView.prototype.getTemplateData.apply(this, arguments);
      return _.extend(data,{
        header: this.header,
        showCancel: this.showCancel,
        showSubmit: this.showSubmit,
        canSubmit: this.canSubmit()
      });
    },

    show: function() {
      this.render();
      this.$('.modal').modal('show');
      ModelView.prototype.onShow.apply(this, arguments);
    },

    hide: function() {
      this.$('.modal').modal('hide');
      ModelView.prototype.onHide.apply(this, arguments);
    },

    canSubmit: function(model) {
      return true;
    },

    onSubmitClick: function() {
      this.trigger('submit', this);
    }
  });
});



define('text!view/templates/ConfirmationDialog.html',[],function () { return '<div class="modal hide fade" tabindex="-1" role="dialog" aria-hidden="true">\n  <div class="modal-header">\n    <div class="message"></div>\n    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>\n    <h3 id="myModalLabel">{{> header}}</h3>\n\n  </div>\n  <div class="modal-body">\n\n    <div class="modal-content">\n\t    {{{bodyTemplate}}}\n    </div>\n  </div>\n  <div class="modal-footer">\n  <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>\n    <button class="btn confirm {{buttonCls}}">{{buttonText}}</button>\n  </div>\n</div>';});

define('view/ConfirmationDialog',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModalDialog',
  'view/MessageView',
  'text!view/templates/ConfirmationDialog.html'
], function($, _, Backbone, Handlebars, Plumage, ModalDialog, MessageView, template) {

  return Plumage.view.ConfirmationDialog = ModalDialog.extend({

    template: template,

    headerTemplate: 'Confirmation Dialog',

    message: undefined,

    messageCls: undefined,

    bodyTemplate: 'Are you sure you want to do this?',

    buttonText: 'Confirm',

    buttonCls: 'btn-success',

    events: {
      'click .confirm': 'onConfirmClick'
    },

    subViews: [{
      viewCls: MessageView,
      name: 'message',
      selector: '.message',
      updateOnMessage: false,
      replaceEl: true,
    }],

    initialize: function(options) {
      options = options || {};
      ModalDialog.prototype.initialize.apply(this, arguments);
      this.bodyTemplate = this.initTemplate(this.bodyTemplate);
    },

    getTemplateData: function() {
      var data = ModalDialog.prototype.getTemplateData.apply(this, arguments);
      return _.extend(data, {
        bodyTemplate: this.bodyTemplate(data),
        buttonText: this.buttonText,
        buttonCls: this.buttonCls,
        message:  this.message,
        messageCls: this.messageCls
      });
    },

    setMessage: function(message, messageCls) {
      this.getSubView('message').setMessage(message, messageCls);
    },

    onConfirmClick: function(e) {
      $(e.target).attr('disabled', '');
      this.trigger('confirm');
    }
  });
});



define('text!view/templates/DisplayField.html',[],function () { return '{{#if label}}\n<div class="control-group">\n  {{#label}}\n  <label class="control-label">{{.}}</label>\n  {{/label}}\n  <div class="controls">\n{{/if}}\n    <div class="field-value">\n      {{#if loading}}\n        <span class="loading">loading...</span>\n      {{else}}\n        {{value}}\n      {{/if}}\n    </div>\n{{#if label}}\n  </div>\n</div>\n{{/if}}';});


define('view/DisplayField',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'text!view/templates/DisplayField.html'
], function($, _, Backbone, Handlebars, Plumage, ModelView, template) {

  /**
   * Displays a non-editable value with an optional label.
   *
   * Useful for detail views with lists of fields.
   *
   */
  return Plumage.view.DisplayField = ModelView.extend({

    className: 'display-field',

    template: template,

    /**
     * optional. model attribute to display as label
     */
    labelAttr: undefined,

    /**
     * optional. String to use as label. Overrides labelAttr
     */
    label: undefined,

    /**
     * model attribute to display
     */
    valueAttr: undefined,

    /**
     * string to display. Overrides valueAttr.
     */
    value: undefined,

    /**
     * Used when value is null/undefined
     */
    defaultValue: '',

    getTemplateData: function() {
      var data = {
        label: this.label ,
        value: this.getValue(),
      };
      if (this.model) {
        if (!data.label) {
          if (this.labelAttr) {
            data.label = this.model.get(this.labelAttr);
          }
        }
        data.loading = !this.model.fetched;
      }
      return data;
    },

    getValue: function() {
      var value = this.value;
      if (this.model && !value) {
        if (this.valueAttr) {
          if (this.model.fetched) {
            value = this.model.get(this.valueAttr);
          }
        }
      }
      if (value) {
        return this.processValue(value);
      } else {
        return this.defaultValue;
      }
    },

    processValue: function(value) {
      return value;
    }
  });
});


define('text!view/templates/NavView.html',[],function () { return '\n<div id="nav-top">\n  <a class="brand" href="/">\n    <span class="nav-title">{{title}}</span>\n    {{#subtitle}}<span class="nav-subtitle">{{.}}</span>{{/subtitle}}\n  </a>\n  <div id="extra-links">\n  {{#if aboutUrl}}\n    <a class="outlink" href="{{aboutUrl}}" target="_">{{aboutLabel}}</a>\n  {{/if}}\n\n  {{#if helpUrl}}\n    <a class="outlink" href="{{helpUrl}}" target="_">{{helpLabel}}</a>\n  {{/if}}\n  </div>\n\n  <div id="nav-top-right" class="nav pull-right">\n    <div class="nav-search"></div>\n  </div>\n  <div class="clear"></div>\n</div>\n\n{{#if navItems}}\n<div id="main-nav" class="navbar">\n  <div class="navbar-inner">\n    <ul class="nav-menu nav menu">\n      {{#navItems}}\n      <li class="{{className}}"><a href="{{url}}">{{label}}</a></li>\n      {{/navItems}}\n    </ul>\n\n    <ul class="nav right-nav pull-right">\n      <li class="user-menu"></li>\n    </ul>\n  </div>\n</div>\n{{/if}}';});

define('view/NavView',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ContainerView',
  'view/menu/DropdownMenu',
  'view/form/fields/SearchField',
  'model/SearchResults',
  'text!view/templates/NavView.html',
  'bootstrap'
], function($, _, Backbone, Plumage, ContainerView, DropdownMenu, SearchField, SearchResults, template) {

  return Plumage.view.NavView = ContainerView.extend(
  /** @lends Plumage.view.NavView.prototype */
  {

    template: template,

    /**
     *
     */
    title: undefined,

    subtitle: undefined,

    showSearch: true,

    navItems: [{
      className: 'home-menu',
      label: 'Home',
      url: '/home'
    }],

    userMenuItems: [
      {
        label: 'logout',
        value: 'logout'
      }
    ],

    logoutUrl: '/logout',

    aboutUrl: undefined,

    aboutLabel: 'About',

    helpUrl: undefined,

    helpLabel: 'Help',

    events: {
      'click .nav-menu a': 'onNavClick',
      'click a.brand': 'onLinkClick'
    },

    initialize: function () {
      this.subViews = [];

      if (this.userMenuItems) {
        this.subViews.push(this.userMenu = new DropdownMenu({
          selector: '.user-menu',
          iconCls: 'icon-user',
          label: window.currentUser,
          menuItems: this.userMenuItems,
          replaceEl: true
        }));
      }

      if (this.showSearch) {
        this.searchField = new SearchField({
          selector: '.nav-search',
          placeholder: 'Search'
        });
        this.subViews.push(this.searchField);
      }

      if (this.userMenu) {
        this.userMenu.on('itemClick', this.onUserMenuClick.bind(this));
      }

      ContainerView.prototype.initialize.apply(this, arguments);

      if (this.searchField) {
        this.searchField.on('change', this.onSearchValueChange.bind(this));
        this.searchField.on('blur', this.onSearchBlur.bind(this));
        this.searchField.on('submit', this.onSearchSubmit.bind(this));
      }
    },

    getUrl: function(navItem) {
      return navItem.url;
    },

    onRender: function () {
      var data = this.getTemplateData();
      $(this.el).html(this.template(data));
      this.$('.dropdown-toggle').dropdown();
      if (this.currentNav) {
        this.select(this.currentNav);
      }
    },

    getTemplateData: function() {
      var navItems = [];
      for (var i=0;i<this.navItems.length;i++) {
        var navItem =  _.clone(this.navItems[i]);
        navItem.url = this.getUrl(navItem);
        navItems.push(navItem);
      }
      return {
        title: this.title,
        subtitle: this.subtitle,
        navItems: navItems,
        showAbout: this.aboutTemplate !== undefined,
        showSearch: this.showSearch,
        aboutUrl: this.aboutUrl,
        aboutLabel: this.aboutLabel,
        helpUrl: this.helpUrl,
        helpLabel: this.helpLabel
      };
    },

    processUrl: function(url) {
      return url;
    },

    /**
     * Helpers
     */

    select: function(menuItem) {
      this.currentNav = menuItem;
      this.$('.nav li').removeClass('active');
      this.$('.' + menuItem).addClass('active');
    },

    expandSearchField: function() {
      var el = this.$('.right-nav');
      if (!el.hasClass('expand-search')) {
        el.addClass('expand-search');
        this.searchField.$el.attr('placeholder', '');
      }

    },

    contractSearchField: function() {
      var el = this.$('.right-nav');
      if (el.hasClass('expand-search')) {
        el.removeClass('expand-search');
        this.searchField.$el.attr('placeholder', this.searchField.noSelectionText);
      }
    },

    createSearchModel: function(query) {
      return new SearchResults({query: query, model: 'all'});
    },

    /**
     * Event Handlers
     */

    onNavClick: function(e) {
      var a = e.target;
      e.preventDefault();
    },

    onUserMenuClick: function(menu, value) {
      if (value === 'logout') {
        window.location = this.logoutUrl;
      }
    },

    onSearchValueChange: function(field, value) {
      this.expandSearchField();
    },

    onSearchBlur: function() {
      this.contractSearchField();
    },

    onSearchSubmit: function(field, value) {
      var searchModel = this.createSearchModel(value);
      searchModel.navigate();
      this.contractSearchField();
    }
  });
});


define('text!view/templates/Popover.html',[],function () { return '<div class="arrow"></div>\n{{#hasTitle}}\n<h3 class="popover-title"></h3>\n{{/hasTitle}}\n<div class="popover-content"></div>\n';});

define('view/Popover',[
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ModelView',
  'view/View',
  'text!view/templates/Popover.html'
], function($, _, Backbone, Plumage, ModelView, View, template) {

  return Plumage.view.Popover = ModelView.extend({

    template: template,

    className: 'popover fade',

    title: undefined,

    content: undefined,

    targetEl: undefined,

    /**
     * overrides automatic positioning. Values relative to targetEl's offset
     * eg [x, y]
     */
    position: undefined,

    placement: 'right',

    dynamicPlacement: true,

    events: {
      'mouseover': 'onMouseOver',
      'mouseout': 'onMouseOut',
      'click a': 'onLinkClick'
    },

    initialize: function(options) {


      ModelView.prototype.initialize.apply(this, arguments);

      if (this.title) {
        this.subViews = [
          new ModelView({selector: '.popover-title', template: this.title, replaceEl: true})
        ].concat(this.subViews || []);
      }

      if (this.content) {
        this.setContent(this.content);
      }
      if (this.targetEl) {
        var  targetEl = this.targetEl;
        delete this.targetEl;
        this.setTargetEl(targetEl);
      }
    },

    getTemplateData: function() {
      var data = ModelView.prototype.getTemplateData.apply(this, arguments);
      data.hasTitle = this.title !== undefined;
      return data;
    },

    setTargetEl: function(targetEl) {
      if (this.targetEl) {
        this.targetEl.removeClass('popovered');
      }
      this.targetEl = $(targetEl);
      if (this.$el.is(':visible')) {
        this.targetEl.addClass('popovered');
      }
    },

    setContent: function(content) {
      if (this.content && this.content.off) {
        this.content.off('afterRender', this.onAfterContentRender);
        this.subViews = _.select(this.subViews, function(view){
          return view.selector !== '.popover-content';
        });
      }

      if (typeof content === 'string') {
        content = new View({template: content});
      } else {
        content = new Plumage.ViewBuilder().buildView(content);
      }
      content.selector = '.popover-content';
      content.on('afterRender', this.onAfterContentRender.bind(this));
      this.content = content;

      this.subViews.push(this.content);
    },

    onRender: function() {
      ModelView.prototype.onRender.apply(this, arguments);

      if (this.$el.closest('html').length === 0) {
        $('body').append(this.$el);
      }
    },

    render: function() {
      ModelView.prototype.render.apply(this, arguments);
      this.updatePosition();
    },

    show: function() {
      this.cancelHide();
      this.render();
      if (!this.$el.hasClass('in')) {
        this.targetEl.addClass('popovered');
        this.$el.show();
        this.$el.addClass('in');
        this.onShow();
      }
    },

    cancelHide: function() {
      clearTimeout(this.hideTimeout);
      clearTimeout(this.fadeTimeout);
    },

    hide: function() {
      var el = this.$el, me = this;
      if (el.hasClass('in')) {
        this.cancelHide();
        this.fadeTimeout = setTimeout(function() {
          me.targetEl.removeClass('popovered');
          el.removeClass('in');
          me.onHide();
          me.hideTimeout = setTimeout(function() {
            el.hide();

          },200);
          me.trigger('hide', me);
        }, 300);
      }
    },

    hideIfOut: function(el, newEl) {
      el = $(el);
      newEl = $(newEl);

      if ($.contains(el, newEl) ||  // if newEl is a child element, it's not really out
        newEl.closest('.popover').is(this.$el)  //  don't hide if mouse moved to popover
      ) {
        return;
      }
      if (!newEl.is(this.targetEl)) {
        this.hide();
      }
    },

    /**
     * Event Handlers
     */
    update: function () {
      //do nothing
    },

    onMouseOver: function() {
      this.cancelHide();
    },

    onMouseOut: function(e) {
      var newEl = $(e.toElement || e.relatedTarget);
      if ($(this.targetEl).has(newEl).length > 0 || newEl.closest('.popover').is(this.$el)) {
        return;
      }

      $(this.targetEl).removeClass('active');
      this.hide();
    },

    onAfterContentRender: function() {
      this.updatePosition();
    },

    /**
     * Helpers
     */

    updatePosition: function () {
      var targetEl = this.targetEl;
      var placement = this.placement;

      var screenHeight = $(window).height();
      var screenWidth = $(window).width();

      var position = this.getPosition(targetEl, placement);

      //switch sides if not enough room
      if (this.dynamicPlacement &&
          ((placement === 'left' || placement === 'right') &&
          (position.left < 0 || position.left + this.$el.width() > screenWidth) ||
          (placement === 'top' || placement === 'bottom') &&
          (position.top < 0 || position.top + this.$el.height() > screenHeight))
      ) {
        placement = this.getOppositePlacement(placement);
        position = this.getPosition(targetEl, placement);
      }

      this.$el.removeClass('top right bottom left');
      this.$el.addClass(placement);

      this.$el.css({top: position.top, left: position.left});
      if (position.arrowLeft  !== undefined) {
        this.$('.arrow').css({left: position.arrowLeft});
      }
      if (position.arrowTop  !== undefined) {
        this.$('.arrow').css({top: position.arrowTop});
      }
    },

    getPosition: function(targetEl, placement) {
      var el = $(targetEl), elOffset = el.offset(), left, top, arrowTop, arrowLeft;

      var bbox = el[0].getBoundingClientRect(),
        targetWidth = bbox.width,
        targetHeight = bbox.height,
        screenWidth = $(window).width(),
        screenHeight = $(window).height(),
        width = this.$el.width(),
        height = this.$el.height();


      if (placement === 'top' || placement === 'bottom') {
        if (placement === 'top') {
          top = elOffset.top - this.$el.height();
        } else {
          top = elOffset.top + targetHeight;
        }
        left = elOffset.left + targetWidth/2 - width/2;
        if (left > screenWidth - width || left < 0) {
          var newLeft = Math.max(Math.min(left, screenWidth - width), 0);
          arrowTop = left - newLeft + width/2;
          left = newLeft;
        }
      } else if (placement === 'left' || placement === 'right') {

        if (placement === 'left') {
          left = elOffset.left - width;
        } else {
          left = elOffset.left + targetWidth;
        }
        top = elOffset.top + targetHeight/2 - height/2;
        if (top > screenHeight - height || top < 0) {
          var newTop = Math.max(Math.min(top, screenHeight - height), 0);
          arrowTop = top - newTop + height/2;
          top = newTop;
        }
      } else {
        throw 'Invalid placement';
      }

      var position = this.position;
      if (position) {
        if (placement === 'top' || placement === 'bottom') {
          left += position[0] - targetWidth/2;
          top += position[1];
        } else {
          left += position[0];
          top += position[1] - targetHeight/2;
        }
      }

      return {top: top, left: left, arrowTop: arrowTop, arrowLeft: arrowLeft};
    },

    getOppositePlacement: function(placement) {
      switch(placement)
      {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      }
      throw 'Invalid placement';
    }
  });
});



define('text!view/templates/TabView.html',[],function () { return '<div class="tabs">\n  <ul>\n    {{#tabs}}\n    <li class="{{id}} {{#active}}active{{/active}}"><a data-tab="#{{id}}-tab">{{label}}</a></li>\n    {{/tabs}}\n  </ul>\n</div>\n\n<div class="tab-content">\n  {{#tabs}}\n  <div class="tab-pane {{#active}}active{{/active}}" id="{{id}}-tab"></div>\n  {{/tabs}}\n</div>';});

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define('jquery.cookie',['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

define('view/TabView',[
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/View',
  'view/ModelView',
  'text!view/templates/TabView.html',
  'jquery.cookie'
], function($, _, Backbone, Handlebars, Plumage, View, ModelView, template) {

  return Plumage.view.TabView = ModelView.extend({
    /** @lends Plumage.view.ModelView.prototype */

    className: 'tab-view tab-theme',

    template: Handlebars.compile(template),

    viewStateAttr: 'tab',

    cookieName: undefined,

    events: {
      'click .tabs a': 'onTabClick'
    },

    /**
     * If set, call [router.logNavigationAction]{@link Plumage.Router#logNavigationAction}nAction on tab change.
     */
    logTabNavigation: false,

    /**
     * Tabbed view with subviews as tab panes.
     *
     * Tabs are generated from subViews with the tabId and tabLabel attributes.
     *
     * @extends Plumage.view.ModelView
     * @constructs
     */
    initialize: function() {
      ModelView.prototype.initialize.apply(this, arguments);
      this.eachTabSubView(function(subView) {
        subView.selector = '#' + subView.tabId + '-tab';
      }, this);
    },

    onRender: function() {
      var data = this.getTemplateData();
      $(this.el).html(this.template(data));
      this.updateActiveTab();
    },

    setModel: function() {
      ModelView.prototype.setModel.apply(this, arguments);
      var tab = this.model.get(this.viewStateAttr);
      if (!tab) {
        tab = this.getTabCookie();
        if (tab === undefined) {
          tab = _.find(this.subViews, function(subView){ return subView.tabId !== undefined;}).tabId;
        }
        this.model.set(this.viewStateAttr, tab);
        this.model.updateUrl();
      }
    },

    getActiveTab: function() {
      if (this.model) {
        return this.model.get(this.viewStateAttr);
      }
    },

    setActiveTab: function(tabId) {
      if (this.model && tabId !== this.getActiveTab()) {
        this.model.set(this.viewStateAttr, tabId);
        this.model.updateUrl();
        this.updateTabCookie();
        if (this.logTabNavigation) {
          if (window.router) {
            window.router.logNavigationAction(window.location.href, window.location.pathname);
          }
        }
      }
    },

    getTemplateData: function() {
      var tabs = [];
      this.eachTabSubView(function(subView) {
        var tab = {
          id: subView.tabId,
          active: subView.tabId === this.getActiveTab(),
          label: subView.tabLabel
        };
        tabs.push(tab);
      }, this);
      return {tabs: tabs};
    },

    updateActiveTab: function() {
      var activeTab = this.getActiveTab();
      if (activeTab === undefined) {
        activeTab = this.subViews[0].tabId;
      }
      var cssId = activeTab +'-tab';
      var tab = this.$('a[data-tab=#'+ cssId + ']');

      this.$('.tabs li').removeClass('active');
      tab.parent('li').addClass('active');

      if (tab) {
        this.eachTabSubView(function(subView) {
          if (subView.tabId === this.getActiveTab()) {
            this.$el.addClass(subView.tabId + '-tab-selected');
            this.$('#'+subView.tabId+'-tab').addClass('active');
            if (this.shown) {
              subView.onShow();
            }
          } else {
            this.$el.removeClass(subView.tabId + '-tab-selected');
            this.$('#'+subView.tabId+'-tab').removeClass('active');
            if (this.shown) {
              subView.onHide();
            }
          }
        }, this);
      }
    },

    getTabCookie: function() {
      if (this.cookieName) {
        return $.cookie('tabview.' + this.cookieName);
      }
    },

    updateTabCookie: function() {
      if (this.cookieName) {
        $.cookie('tabview.' + this.cookieName, this.getActiveTab(), { expires: 7 });
      }
    },

    onTabClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var tab = $(e.target);
      var tabId = this.cleanTabId(tab.data('tab'));
      e.preventDefault();
      this.setActiveTab(tabId);
    },

    eachTabSubView: function(callback, scope) {
      _.each(this.subViews, function(subView) {
        if (subView.tabId) {
          if (scope) {
            return callback.call(this, subView);
          } else {
            callback(subView);
          }
        }
      }, this);
    },

    /**
     * Override subview behavior. Don't call ModelView's versions
     */
    onModelLoad: function() {
      this.updateActiveTab();
    },

    onModelChange: function() {
      this.updateActiveTab();
    },

    onShow: function() {
      View.prototype.onShow.apply(this, arguments);
      this.updateActiveTab();

      this.eachSubView(function(subView) {
        if (subView.tabId === this.getActiveTab() || subView.tabId === undefined) {
          subView.onShow();
        }
      }, this);
    },

    onHide: function() {
      View.prototype.onHide.apply(this, arguments);
      this.eachSubView(function(subView) {
        if (subView.tabId === this.getActiveTab() || subView.tabId === undefined) {
          subView.onHide();
        }
      }, this);
    },

    /**
     * Helpers
     */

    cleanTabId: function(tabId) {
      return tabId.replace(/^#/, '').replace(/-tab$/, '');
    }

  });
});
define('plumage',[
  'PlumageRoot',
  'App',
  'collection/ActivityCollection',
  'collection/BufferedCollection',
  'collection/Collection',
  'collection/CommentCollection',
  'collection/DataCollection',
  'collection/Selection',
  'collection/GridSelection',
  'collection/UserCollection',
  'controller/BaseController',
  'controller/ModelController',
  'ControllerManager',
  'model/Activity',
  'model/Model',
  'model/Comment',
  'model/Data',
  'model/SearchResults',
  'model/User',
  'RequestManager',
  'Router',
  'slickgrid-all',
  'util/ArrayUtil',
  'util/D3Util',
  'util/DateTimeUtil',
  'util/Logger',
  'util/ModelUtil',
  'view/View',
  'view/CollectionView',
  'view/comment/CommentForm',
  'view/comment/CommentsSection',
  'view/comment/CommentView',
  'view/comment/ExpandableComments',
  'view/ContainerView',
  'view/controller/IndexView',
  'view/form/fields/ButtonGroupSelect',
  'view/form/fields/Calendar',
  'view/form/fields/CategorySelect',
  'view/form/fields/Checkbox',
  'view/form/fields/DateField',
  'view/form/fields/DateRangeField',
  'view/form/fields/DropdownMultiSelect',
  'view/form/fields/DropdownSelect',
  'view/form/fields/DurationField',
  'view/form/fields/Field',
  'view/form/fields/FieldWithPicker',
  'view/form/fields/FilterCheckbox',
  'view/form/fields/FilterTypeAhead',
  'view/form/fields/HourSelect',
  'view/form/fields/InPlaceTextField',
  'view/form/fields/MultiSelect',
  'view/form/fields/Radio',
  'view/form/fields/RadioButtonGroup',
  'view/form/fields/SearchField',
  'view/form/fields/Select',
  'view/form/fields/TextArea',
  'view/form/fields/TypeAhead',
  'view/form/fields/picker/DateRangePicker',
  'view/form/fields/picker/Picker',
  'view/form/Form',
  'view/form/SelectField',
  'view/grid/FilterView',
  'view/grid/Formatters',
  'view/grid/GridView',
  'view/grid/GridData',
  'view/grid/Pager',
  'view/ListAndDetailView',
  'view/ListItemView',
  'view/ListView',
  'view/menu/DropdownMenu',
  'view/ConfirmationDialog',
  'view/DisplayField',
  'view/MessageView',
  'view/ModalDialog',
  'view/ModelView',
  'view/NavView',
  'view/Popover',
  'view/TabView'
],
function(Plumage) {
  return Plumage;
});

