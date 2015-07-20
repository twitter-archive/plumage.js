define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
  'kitchen_sink/view/example/BaseExample',
  'example/collection/CountryCollection',
  'kitchen_sink/view/example/grid/templates/Filters.html',
  'data/country_data.json'
], function($, _, Backbone, Plumage, BaseExample, CountryCollection, template, countryData) {

  return BaseExample.extend({

    modelCls: CountryCollection,

    template: template,

    subViews: [{
      viewCls: Plumage.view.grid.FilterView,
      selector: '.filter-view',
      filterConfigs: [{
        placeholder: 'Name',
        filterKey: 'name'
      }, {
        placeholder: 'Region',
        filterKey: 'region'
      }]
    }, {
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

      var model =  new CountryCollection(countryData, {processInMemory: true});
      model.on('change', function() {
        model.load();
      });

      this.setModel(model);
      model.onLoad();
    }
  });
});