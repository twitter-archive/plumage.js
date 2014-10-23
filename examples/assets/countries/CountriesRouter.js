define(['jquery', 'underscore', 'backbone', 'plumage'],
function($, _, Backbone, Plumage) {
  return Plumage.Router.extend({
    controllerRoutes: [
      ['', {controller: 'countries/controller/CountryController', method: 'showIndex'}],
      [':id', {controller: 'countries/controller/CountryController', method: 'showDetail'}]
    ]
  });
});