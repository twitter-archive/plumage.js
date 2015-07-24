var Plumage = require('plumage');

module.exports = Plumage.Router.extend({
  controllerRoutes: [
    ['', {controller: 'kitchenSinkController', method: 'home'}],
    [':section', {controller: 'kitchenSinkController', method: 'showSection'}],
    [':section/:example', {controller: 'kitchenSinkController', method: 'showSectionWithExample'}]
  ]
});