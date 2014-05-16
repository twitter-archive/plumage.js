define([
  'jquery',
  'backbone',
  'plumage',
], function($, Backbone, Plumage) {

  function capitalFormatter(row, cell, value, columnDef, dataContext) {
    var capital = dataContext.getRelated('capital');
    if (capital) {
      return capital.get('accentcity');
    }
  }

  return Plumage.view.grid.GridView.extend({

    modelCls: 'example/collection/CountryCollection',

    infiniteScroll: false,

    columns: [
      {id: 'name', name: 'Name', field: 'name', sortable: true},
      {id: 'region', name: 'Region', field: 'region', sortable: true},
      {id: 'capital', name: 'Capital', field: 'capital', sortable: true, formatter: capitalFormatter},
      {id: 'population', name: 'Population', field: 'population', sortable: true, cssClass: 'number', defaultSortAsc: false}
    ],

    gridOptions: {
      enableColumnReorder: false,
      forceFitColumns: true
    }
  });
});