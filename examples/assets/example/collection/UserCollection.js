define([
  'collection/Collection',
  'example/model/User'
], function(Collection, User) {

  return Collection.extend({
    modelName: 'UserCollection',

    urlRoot: User.prototype.urlRoot,
    model: User,

    sortField: 'name',
    sortDir: '1',
  });
});