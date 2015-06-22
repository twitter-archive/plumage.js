define(['jquery', 'underscore', 'backbone', 'plumage'],
function($, _, Backbone, Plumage) {
  return Plumage.Router.extend({
    controllerRoutes: [
      ['', {controller: 'kitchenSinkController', method: 'home'}],
      [':section', {controller: 'kitchenSinkController', method: 'showSection'}],
      [':section/:example', {controller: 'kitchenSinkController', method: 'showSectionWithExample'}]
    ]
  });
});