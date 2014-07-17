define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ModelView',
  'collection/GridData',
  'collection/BufferedCollection',
  'collection/GridSelection',
  'slickgrid-all'
], function($, _, Backbone, Plumage, ModelView, GridData, BufferedCollection, GridSelection, Slick) {

  return Plumage.view.grid.GridView = ModelView.extend({

    className: 'grid-view',

    columns: undefined,

    gridOptions: {},

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

    noDataText: 'No Rows Found',

    saveViewState: true,

    filterView: undefined,

    initialize: function () {
      var me = this;
      ModelView.prototype.initialize.apply(this, arguments);
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

      this.onResize = _.debounce(this.onResize, 50);

      if (this.filterView) {
        this.filterView.moreMenu.on('itemClick', this.onMoreMenuItemClick.bind(this));
      }
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
      this.grid.setSelectionModel(new GridSelection(selection));
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
        return new GridData(model);
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

    onGridClick: function(e) {
      var target = e.target;

      if (target.tagName === 'A' && $(target).attr('href')) {
        if (!$(target).hasClass('outlink')) {
          e.preventDefault();
          window.router.navigateWithQueryParams($(target).attr('href'), {trigger: true});
        }
        return false;
      }

      var cell = this.grid.getCellFromEvent(e);
      if (!cell || !this.grid.canCellBeActive(cell.row, cell.cell)) {
        return false;
      }
      var id = this.grid.getDataItem(cell.row).id,
        data = this.grid.getData(),
        model = data.getItem(data.getIndexForId(id));

      this.trigger('itemSelected',  model);
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
