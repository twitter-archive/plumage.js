define(['jquery', 'underscore', 'backbone',
        'PlumageRoot', 'collection/Collection'],
function($, _, Backbone, Plumage, Collection) {

  return Plumage.collection.Selection = Collection.extend({

    multi: false,

    model: Plumage.model.Model.extend({idAttribute: 'id'}),

    collection: undefined,

    initialize: function(data, options) {
      Plumage.collection.Collection.prototype.initialize.apply(this, arguments);
      if (options && options.collection) {
        this.collection = options.collection;
        this.collection.on('load', this.onCollectionLoad, this);
      }
    },

    getTotalSize: function() {
      return this.collection.size();
    },

    isSelectedId: function(id) {
      return this.getById(id) !== null;
    },

    isSelectedIndex: function(index) {
      return this.getById(this.collection.at(index).id) !== undefined;
    },

    getSelectedIndices: function() {
      return this.map(function(selectionItem) {
        var item = this.collection.getById(selectionItem.id);
        return this.collection.indexOf(item);
      }.bind(this));
    },

    setSelectedIndices: function(indices) {
      var ids = _.map(indices, function(index) {
        return this.collection.at(index).id;
      }.bind(this));
      this.setSelectedIds(ids);
    },

    getSelectedIds: function(ids) {
      return this.map(function(item) {return item.id;});
    },

    setSelectedIds: function(ids) {
      var data = _.map(ids, function(id) {return {id: id};});
      this.reset(data);
    },

    selectIndex: function(index) {
      var item = this.collection.at(index);

      if (this.getById(item.id) === undefined) {
        if (!this.multi) {
          this.deselectAll();
        }
        this.add(new Plumage.model.Data({id: item.id}));
      }
    },

    deselectIndex: function(index) {
      var item = this.collection.at(index),
        selectionItem = this.getById(item.id);

      if (selectionItem) {
        this.remove(selectionItem);
      }
    },

    selectAll: function() {
      var data = this.collection.map(function(item) {
        return {id: item.id};
      });
      this.reset(data);
    },

    deselectAll: function() {
      this.reset([]);
    },

    // Event handlers

    onCollectionLoad: function() {
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