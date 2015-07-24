var Collection = require('collection/Collection');

var User = require('example/model/User');

module.exports = Collection.extend({
  modelName: 'UserCollection',

  urlRoot: User.prototype.urlRoot,
  model: User,

  sortField: 'name',
  sortDir: '1'
});