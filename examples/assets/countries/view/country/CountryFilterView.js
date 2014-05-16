define([
  'jquery',
  'backbone',
  'plumage',
], function($, Backbone, Plumage) {


  return Plumage.view.grid.FilterView.extend({

    tagName: 'form',

    className: 'form-inline',

    filterConfigs: [
      {
        placeholder: 'Name',
        filterKey: 'name'
      },
      {
        placeholder: 'Region',
        filterKey: 'region'
      }
    ],

    showSearch: true,

    searchEmptyText: 'Search'
  });
});