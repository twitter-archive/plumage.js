var Plumage = require('plumage');
var CountryGrid = require('countries/view/country/CountryGrid');
var CountryFilterView = require('countries/view/country/CountryFilterView');

var template = require('countries/view/country/templates/CountryIndex.html');

module.exports = Plumage.view.controller.IndexView.extend({
  template: template,

  gridViewCls: CountryGrid,
  filterViewCls: CountryFilterView
});