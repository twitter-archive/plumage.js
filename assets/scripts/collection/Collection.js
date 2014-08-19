define([
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