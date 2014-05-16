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
  var rootUrl = isStatic ? '/examples/countries.html' : '/examples/countries';


  var rootUrl = '/examples/countries';
  window.router = new CountriesRouter({
    app: theApp,
    rootUrl: rootUrl,
    pushState: !Boolean(window.isStatic)
  });
  window.router.start();
});
