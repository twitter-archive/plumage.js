var Plumage = require('plumage');

module.exports = Plumage.Router.extend({

  controllerRoutes: [
    ['', {controller: 'countryController', method: 'showIndex'}],
    [':id', {controller: 'countryController', method: 'showDetail'}]
  ]
});