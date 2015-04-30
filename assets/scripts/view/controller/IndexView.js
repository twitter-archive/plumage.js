define([
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
