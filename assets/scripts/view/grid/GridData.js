define([
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