define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
  'example/collection/CountryCollection',
  'kitchen_sink/view/example/BaseExample',
  'kitchen_sink/view/example/grid/templates/Grids.html',
  'data/country_data.json'
], function($, _, Backbone, Plumage, CountryCollection, BaseExample, template, countryData) {

  return BaseExample.extend({

    modelCls: CountryCollection,

    template: template,

    subViews: [{
      viewCls: Plumage.view.grid.GridView,
      selector: '.grid-view',
      infiniteScroll: false,
      columns: [
        {id: 'name', name: 'Name', field: 'name', sortable: true},
        {id: 'region', name: 'Region', field: 'region', sortable: true},
        {id: 'population', name: 'Population', field: 'population', sortable: true, cssClass: 'number', defaultSortAsc: false}
      ],
      gridOptions: {
        forceFitColumns: true
      }
    }],

    initialize:function(options) {
      BaseExample.prototype.initialize.apply(this, arguments);
      var model =  new CountryCollection(countryData);
      this.setModel(model);
      model.onLoad();
    }
  });
});