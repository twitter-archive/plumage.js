var Plumage = require('plumage');

module.exports = Plumage.model.Model.extend({

  modelName: 'Vacation',

  urlRoot: '/vacations',

  queryAttrs: ['name']
});