/*jshint -W020 */

theApp = null;

var $ = require('jquery');

var Backbone = require('backbone');
var Plumage = require('plumage');
var KitchenSinkRouter = require('kitchen_sink/KitchenSinkRouter');
var KitchenSinkNavView = require('kitchen_sink/KitchenSinkNavView');
var KitchenSinkController = require('kitchen_sink/controller/KitchenSinkController');

//Backbone.$ = $;

$(function() {
  var navView = new KitchenSinkNavView();
  theApp = new Plumage.App({
    navView: navView
  });

  var controllers = {
    'kitchenSinkController': new KitchenSinkController(theApp)
  };

  $('#nav').html(navView.render().el);

  var rootUrl = '/kitchen_sink.html';

  window.router = new KitchenSinkRouter({
    app: theApp,
    controllers: controllers,
    defaultUrl: rootUrl,
    rootUrl: rootUrl,
    pushState: false
  });
  window.router.start();
});
