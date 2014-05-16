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

  var isStatic = Boolean(window.isStatic);
  var rootUrl = '/examples/kitchen_sink.html';

  window.router = new KitchenSinkRouter({
    app: theApp,
    defaultUrl: rootUrl,
    rootUrl: rootUrl,
    pushState: !Boolean(window.isStatic)
  });
  window.router.start();
});
