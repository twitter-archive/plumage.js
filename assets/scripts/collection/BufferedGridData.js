define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'collection/GridData'
],

function($, _, Backbone, Plumage, GridData) {

  return Plumage.collection.BufferedGridData = GridData.extend(
  /** @lends Plumage.collection.BufferedGridData.prototype */
  {
    /** Loaded data is stored here, instead of in the Collection */
    data: undefined,

    /** Map of id to index for everything in .data */
    idToIndex: undefined,

    /** Running requests */
    requests: undefined,

    /** Total rows on the server. */
    total: undefined,

    /**
     * Adapts a backbone Collection to the slickgrid dataview interface.
     *
     * Performs paging on the collection when ensureData is called for data outside the current page.
     *
     * Data is stored in BufferedGridData and the Collection is mostly used for loading.
     * @constructs
     * @extends Plumage.collection.GridData
     */
    initialize: function(collection, options) {
      _.extend(this, options);
      this.data = [];
      this.idToIndex = {};
      this.requests = {};

      this.collection = collection;
      this.collection.on('load', this.onLoad, this);
      this.collection.on('beginLoad', function() {
        this.trigger('dataBeginLoad', this);
      }, this);

      if (this.collection.fetched) {
        this.onLoad(this.collection);
      }
      //this.collection.on('all', this.relayEvent, this);
    },

    /** Sets sort field and direction */
    setSort: function(sortField, sortDir){
      this.collection.setSort(sortField, sortDir, true);
    },

    /** gets size of collection  */
    getLength: function() {
      if (this.total) {
        return this.total;
      }
      return 0;
    },

    getItem: function(index) {
      return this.data[index];
    },

    getItemMetadata: function(index) {
      return null;
    },

    getIndexForId: function (id) {
      return this.idToIndex[id];
    },

    //Buffering

    /** Have rows from 'from' to 'to' already been loaded? */
    isDataBuffered: function(from, to) {
      for (var i = from; i <= to; i++) {
        if (this.data[i] === undefined || this.data[i] === null) {
          return false;
        }
      }
      return true;
    },

    /** resets the buffer. */
    clearBuffer: function() {
      this.data = [];
      this.idToIndex = {};
    },

    /** Load data from 'from' to 'to' if it hasn't already been. */
    ensureData: function(from, to) {
      if (!this.collection.fetched) {
        //load first to get meta data
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

      while (this.data[fromPage * pageSize] !== undefined && fromPage < toPage) {
        fromPage += 1;
      }

      while (this.data[toPage * pageSize] !== undefined && fromPage < toPage) {
        toPage -= 1;
      }

      if (fromPage > toPage || ((fromPage === toPage) && this.data[fromPage * pageSize] !== undefined)) {
        // already have it
        return;
      }

      this.trigger('dataBeginLoad', this, from, to);

      for (var i=fromPage;i<=toPage;i++) {
        this.loadPage(i);
      }
    },

    /** Load page number 'page' */
    loadPage: function(page) {
      if (this.requests[page] !== undefined) {
        return;
      }
      var options = {
        data: _.extend(this.collection.getQueryParams(), {page: page, noTotal: true}),
        success: function (resp) {
          //silent because so we don't trigger this.onLoad
          this.collection.reset(resp, {parse: true, silent: true});
          this.onBufferLoad(this.collection, page);
        }.bind(this)
      };
      //calling sync directly instead of load so we don't trigger load event
      this.requests[page] = this.collection.sync('read', this.collection, options);
    },

    /** Loads models into the buffer after a page load request. */
    onBufferLoad: function(collection, page) {
      delete this.requests[page];

      this.addModelsToBuffer(collection.models, page, this.collection.get('pageSize'));
    },

    /**
     * Clears the buffer and adds the collection's models when the Collection emits the load event.
     * Does not occur when loading subsequent pages.
     * @param {Plumage.collection.Collection} collection The emiting collection.
     */
    onLoad: function(collection) {
      this.clearBuffer();
      var models = [];
      for (var i=0; i<collection.size();i++) {
        models.push(collection.at(i));
      }
      this.total = collection.get('total') || collection.size();
      this.addModelsToBuffer(models, collection.get('page'), collection.get('pageSize'));
    },

    /**
     * Helper that adds a list of models to the buffer.
     * @private
     */
    addModelsToBuffer: function(models, page, pageSize) {
      for (var i=0; i<models.length;i++) {
        var model = models[i];
        var index = page * pageSize + i;
        this.data[index] = model;
        this.idToIndex[model.id] = index;
      }
      var from = page * pageSize;
      var to = from + models.length;
      this.trigger('dataLoaded', this, from, to);
    }
  });
});