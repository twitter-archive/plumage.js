/*jshint -W020 */

theApp = null;

require([
  'jquery',
  'backbone',
  'plumage',
  'countries/CountriesRouter',
  'countries/controller/CountryController',
],

function($, Backbone, Plumage, CountriesRouter) {
  theApp = new Plumage.App({
    controllers: [
      'countries/controller/CountryController'
    ],
  });

  var rootUrl = '/examples/countries';
  window.router = new CountriesRouter({app: theApp, defaultUrl: rootUrl, rootUrl: rootUrl});
  window.router.start();
});
