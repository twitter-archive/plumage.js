var Model = require('model/Model');
var Data = require('model/Data');

module.exports = Model.extend({
  urlRoot: '/users',
  relationships: {
    company: {
      modelCls: Data
    }
  }
});