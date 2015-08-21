var _ = require('underscore');
var Backbone = require('backbone');
var Plumage = require('PlumageRoot');
var Collection = require('collection/Collection');

module.exports = Plumage.collection.Selection = Collection.extend(
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