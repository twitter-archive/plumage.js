/*jshint -W020 */

theApp = null;

var $ = require('jquery');

var Backbone = require('backbone');
var Plumage = require('plumage');
var CountriesRouter = require('countries/CountriesRouter');
var CountryController = require('countries/controller/CountryController');

Backbone.$ = $;


$(function() {
  theApp = new Plumage.App();


  var isStatic = Boolean(window.isStatic);
  var rootUrl = '/examples/countries.html';
  var controllers = {
    'countryController': new CountryController(theApp)
  };


  window.router = new CountriesRouter({
    app: theApp,
    controllers: controllers,
    rootUrl: rootUrl,
    defaultUrl: rootUrl,
    pushState: !Boolean(window.isStatic)
  });
  window.router.start();
});
