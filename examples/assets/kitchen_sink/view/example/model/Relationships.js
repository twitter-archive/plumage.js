/* global $, _ */
var Plumage = require('plumage');
var BaseExample = require('kitchen_sink/view/example/BaseExample');

var template = require('kitchen_sink/view/example/model/templates/Relationships.html');

module.exports = BaseExample.extend({

  template: template,

  initialize: function(options) {
    options = options || {};
    BaseExample.prototype.initialize.apply(this, arguments);
  }
});