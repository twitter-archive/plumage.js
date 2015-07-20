define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ModelView',
  'view/grid/GridData',
  'collection/BufferedCollection',
  'collection/GridSelection',
  'slickgrid-all'
], function($, _, Backbone, Plumage, ModelView, GridData, BufferedCollection, GridSelection, Slick) {

  return Plumage.view.grid.GridView = ModelView.extend({

    className: 'grid-view',

    columns: undefined,

    gridOptions: {},

    gridDataCls: GridData,

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

    checkboxSelect: false,

    checkboxColumn: {
      id: 'checkbox-select',
      cssClass: 'checkbox-select',
      field: 'sel',
      width: 30,
      resizable: false,
      sortable: false
    },

    noDataText: 'No Rows Found',

    saveViewState: true,

    filterView: undefined,

    initialize: function () {
      var me = this;
      ModelView.prototype.initialize.apply(this, arguments);

      //checkbox select
      if (this.checkboxSelect) {
        this.columns = _.clone(this.columns);
        this.columns.unshift(_.extend({
          formatter: function(row, cell, value, columnDef, dataContext) {
            if (dataContext) {
              var selected = this.selection.isSelectedId(dataContext.id);
              return selected ? '<input type="checkbox" checked="checked">' : '<input type="checkbox">';
            }
            return null;
          }.bind(this)
        }, this.checkboxColumn));
      }

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

      if (this.filterView) {
        this.setFilterView(this.filterView);
      }

      this.onResize = _.debounce(this.onResize, 50);
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
      if (this.selection) {
        this.selection.off('all', this.onSelectionChanged, this);
      }
      this.selection = selection;
      this.selection.on('all', this.onSelectionChanged, this);

      this.grid.setSelectionModel(new GridSelection(selection));
    },

    setFilterView: function(filterView) {
      if (this.filterView) {
        this.filterView.moreMenu.off('itemClick', this.onMoreMenuItemClick, this);
      }
      this.filterView = filterView;
      this.filterView.moreMenu.on('itemClick', this.onMoreMenuItemClick, this);
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
        return new this.gridDataCls(model);
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
        if (this.isRendered) {
          this.grid.invalidate();
          this.updateNoData();
          this.grid.scrollRowToTop(0);
        }
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
      if (this.isRendered) {
        if (this.firstShow) {
          this.firstShow = false;
          this.grid.init();
        } else {
          this.grid.scrollToLastRendered();
        }
        this.grid.resizeCanvas();
        }
    },

    onHide: function() {
      ModelView.prototype.onHide.apply(this, arguments);
      $(this.gridEl).detach();
    },

    onGridClick: function(e, args) {
      var target = e.target;

      if (target.tagName === 'A' && $(target).attr('href')) {
        if (!$(target).hasClass('outlink')) {
          e.preventDefault();
          window.router.navigateWithQueryParams($(target).attr('href'), {trigger: true});
        }
        return false;
      }

      if (this.grid.getColumns()[args.cell].id === 'checkbox-select') {
        if (this.selection) {
          this.toggleRowSelected(args.row);
        }
        e.stopPropagation();
        return;
      }

      var cell = this.grid.getCellFromEvent(e);
      var item = this.grid.getDataItem(cell.row);
      if (item) {
        var id = this.grid.getDataItem(cell.row).id,
        data = this.grid.getData(),
        model = data.getItem(data.getIndexForId(id));
        this.trigger('itemSelected',  model);
      }
    },

    toggleRowSelected: function(index) {
      this.selection.toggleIndex(index);
    },

    onSelectionChanged: function(event, selection, model, options) {
      if (event === 'add' || event === 'remove') {
        this.grid.invalidateRow(this.grid.getData().getIndexForId(model.id));
      } else if (event === 'reset') {
        this.grid.invalidate();
      }
      if (this.rendered) {
        this.grid.render();
      }
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
