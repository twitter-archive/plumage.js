/* globals $, _ */
var Plumage = require('PlumageRoot');
var ModelView = require('view/ModelView');
var MessageView = require('view/MessageView');

module.exports = Plumage.view.controller.IndexView = ModelView.extend({

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
        _.extend({selector: '.grid-view', filterView: this.getFilterView(), replaceEl: true}, this.gridOptions || {}));
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
