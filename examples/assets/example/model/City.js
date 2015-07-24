var Plumage = require('plumage');

module.exports = Plumage.model.Model.extend({
  urlRoot: '/cities',
  urlIdAttribute: 'name'
});