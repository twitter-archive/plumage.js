define(['jquery', 'underscore', 'backbone',
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
     *  - remote: The related model needs to be loaded after the current model loads. Can be of the values:
     *     - 'autoload' => Load as soon as url is available.
     *     - 'loadOnShow' => Load when first shown in a view.
     *     - 'manual' => Loaded manually.
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

    /** Criterium for uniqueness is always href */
    idAttribute: 'href',

    /** field use of for url when href is undefined, ie urlRoot + '/' + urlId */
    urlIdAttribute: 'id',


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

    /** set view state
     * @param {Object} viewState
     */
    setViewState: function(viewState, options) {
      this.set(this.processViewState(viewState), options);
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
        if (relationship.remote && ['autoload', 'loadOnShow', 'manual'].indexOf(relationship.remote) === -1) {
          throw 'invalid remote relationship param';
        }
        var RelatedClass = ModelUtil.loadClass(relationship.modelCls);

        if (RelatedClass.prototype instanceof Plumage.collection.Collection) {
          related = this.createRelatedCollection(RelatedClass, relationship, data);
        } else {
          related = this.createRelatedModel(RelatedClass, relationship, data);
        }
        if (relationship.remote === 'loadOnShow') {
          related.loadOnShow = true;
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
      if (model instanceof Plumage.collection.Collection) {
        if ($.isArray(data)) {
          data = {models: data};
        }
      }
      model.set(data, {silent: true}); //silent to prevent double render with subsequent load event.
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

    getUrlId: function() {
      var urlId = this.get(this.urlIdAttribute);
      if (urlId) {
        return encodeURIComponent(urlId);
      }
    },

    /**
     * Generate the url for this model from its attributes. By default this returns
     * urlRoot/urlIdAttribute. If no urlRoot is specified it returns null. This is so prevent loading models
     * whose urls' can't be derived from attributed. (eg when url depends a parent model's url)
     *
     * Override this method if you have custom urls.
     * Return null if attributes for url are not yet available.
     * @returns {string} Url or null
     */
    urlFromAttributes: function() {
       //no url so do nothing
      if (!this.urlRoot) {
        return null;
      }

      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url');
      if (!base) {
        throw new Error('A "url" property or function must be specified');
      }
      if (this.isNew()) {
        return this.newUrl();
      }
      return base.replace(/([^\/])$/, '$1/') + this.getUrlId();
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
      return !this.getUrlId() || this.get('href') && this.get('href').match(/\/new$/) !== null;
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
      return this.fetch(options).then(function(resp, result, xhr) {
        return $.Deferred().resolve(this, resp).promise();
      }.bind(this));
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
      Backbone.Model.prototype.save.apply(this, [attrs, options]).then(function(resp){
        return $.Deferred().resolve(this, resp).promise();
      }.bind(this));
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
            if (relationship.remote === 'autoload' || relationship.remote === 'loadOnShow' && !rel.loadOnShow) {
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
        if (rel && relationship.remote === 'autoload') {
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
        result.url = this.viewUrlWithParams();
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
