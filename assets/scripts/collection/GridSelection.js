define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'collection/Selection',
  'slickgrid-all'
],

function($, _, Backbone, Plumage, Selection, Slick) {


  /**
   * Adapts a Plumage Selection to the slickgrid RowSelection interface.
   *
   * Doesn't support cmd, shift selection.
   *
   * @constructs Plumage.collection.GridSelection
   */
  var GridSelection = function(selection) {
    this.selection = selection;
    this.initialize.apply(this, arguments);
  };

  _.extend(GridSelection.prototype, Backbone.Events,
  /** @lends Plumage.collection.GridSelection.prototype */
  {
    /** wrapped Selection */
    selection: undefined,

    /** SlickGrid grid instance*/
    grid: undefined,

    // Optionss
    selectActiveRow: false,

    initialize: function(options) {
      options = options || {};
      _.extend(this, options);

      this.selection.on('change', this.onSelectionChange, this);
      this.selection.on('add', this.onSelectionChange, this);
      this.selection.on('remove', this.onSelectionChange, this);
      this.selection.on('reset', this.onSelectionChange, this);
    },

    /** SlickGrid init */
    init: function(grid) {
      this.grid = grid;
      this.handler = new Slick.EventHandler();
      this.handler.subscribe(this.grid.onActiveCellChanged, this.onActiveCellChanged.bind(this));
      this.onSelectedRangesChanged = new Slick.Event();
    },

    /** SlickGrid destroy */
    destroy: function() {
      this.handler.unsubscribeAll();
      this.selection.off('change', this.onSelectionChange, this);
      this.selection.off('reset', this.onSelectionChange, this);
    },

    // SlickGrid getters and setters

    getSelectedRows: function () {
      return this.selection.getSelectedIndices();
    },

    setSelectedRows: function (rows) {
      this.selection.setSelectedIndices(rows);
    },

    setSelectedRanges: function (ranges) {
      this.setSelectedRows(this.rangesToRows(ranges));
    },

    getSelectedRanges: function () {
      return this.rowsToRanges(this.getSelectedRows());
    },

    // Event handlers

    onActiveCellChanged: function(e, data) {
      if (this.selectActiveRow && data.row !== null) {
        this.setSelectedRows([data.row]);
      }
    },

    onSelectionChange: function() {
      this.onSelectedRangesChanged.notify(this.getSelectedRanges());
    },

    // SlickGrid helpers

    rowsToRanges: function(rows) {
      var ranges = [];
      var lastCell = this.grid.getColumns().length - 1;
      for (var i = 0; i < rows.length; i++) {
        ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
      }
      return ranges;
    },

    rangesToRows: function(ranges) {
      var rows = [];
      for (var i = 0; i < ranges.length; i++) {
        for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
          rows.push(j);
        }
      }
      return rows;
    }
  });

  return Plumage.collection.GridSelection = GridSelection;
});
