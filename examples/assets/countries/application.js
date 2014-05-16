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

  var isStatic = Boolean(window.isStatic);
  var rootUrl = '/examples/countries.html';

  window.router = new CountriesRouter({
    app: theApp,
    rootUrl: rootUrl,
    defaultUrl: rootUrl,
    pushState: !Boolean(window.isStatic)
  });
  window.router.start();
});
