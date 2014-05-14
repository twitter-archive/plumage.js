/*jshint -W020 */

theApp = null;

require([
  'jquery',
  'backbone',
  'plumage',
  'kitchen_sink/KitchenSinkRouter',
  'kitchen_sink/KitchenSinkNavView',
  'kitchen_sink/controller/KitchenSinkController',
],

function($, Backbone, Plumage, KitchenSinkRouter, KitchenSinkNavView) {
  var navView = new KitchenSinkNavView();
  theApp = new Plumage.App({
    controllers: [
      'kitchen_sink/controller/KitchenSinkController'
    ],
    navView: navView
  });
  $('#nav').html(navView.render().el);

  var rootUrl = '/examples/kitchen_sink';
  window.router = new KitchenSinkRouter({app: theApp, defaultUrl: rootUrl + '/model', rootUrl: rootUrl});
  window.router.start();
});
