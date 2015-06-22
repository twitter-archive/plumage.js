define(['jquery', 'underscore', 'backbone', 'plumage'],
function($, _, Backbone, Plumage) {

  return Plumage.Router.extend({

    controllerRoutes: [
      ['', {controller: 'countryController', method: 'showIndex'}],
      [':id', {controller: 'countryController', method: 'showDetail'}]
    ]
  });
});