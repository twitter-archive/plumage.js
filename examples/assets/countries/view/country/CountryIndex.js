define([
  'jquery',
  'backbone',
  'plumage',
  'countries/view/country/CountryGrid',
  'countries/view/country/CountryFilterView',
  'text!countries/view/country/templates/CountryIndex.html'
], function($, Backbone, Plumage, CountryGrid, CountryFilterView, template) {

  return Plumage.view.controller.IndexView.extend({

    template: template,

    gridViewCls: CountryGrid,
    filterViewCls: CountryFilterView
  });
});