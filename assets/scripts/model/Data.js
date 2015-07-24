/* globals $, _ */
var Plumage = require('PlumageRoot');
var Model = require('model/Model');

module.exports =  Plumage.model.Data = Model.extend({
  idAttribute: 'name'
});