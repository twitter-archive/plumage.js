define(['jquery', 'underscore', 'backbone', 'plumage'],
function($, _, Backbone, Plumage) {
  return Plumage.Router.extend({
    controllerRoutes: {
      ':section': {controller: 'kitchen_sink/controller/KitchenSinkController', method: 'showSection'},
      ':section/:example': {controller: 'kitchen_sink/controller/KitchenSinkController', method: 'showSectionWithExample'},
    }
  });
});