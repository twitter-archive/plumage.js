var _ = require('underscore');
var Backbone = require('backbone');
var Plumage = require('PlumageRoot');

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
  }
);

var passThroughMethods = ['getRelated', 'setSort'];
_.each(passThroughMethods, function(method) {
  BufferedCollection.prototype[method] = function() {this.collection[method].apply(this.collection, arguments);};
});

module.exports = Plumage.collection.BufferedCollection = BufferedCollection;