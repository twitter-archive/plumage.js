define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
], function($, _, Backbone, Plumage) {

  return Plumage.model.Model.extend({
    urlRoot: '/cities',
    idAttribute: 'name'
  });
});