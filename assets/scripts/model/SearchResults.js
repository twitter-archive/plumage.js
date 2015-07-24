/* globals $, _ */
var Backbone = require('backbone');
var Plumage = require('PlumageRoot');
var Model = require('model/Model');
var DataCollection = require('collection/DataCollection');

module.exports = Plumage.model.SearchResults = Model.extend(
/** @lends Plumage.model.SearchResults */
{

  urlRoot: '/search',

  relationships: {
    'results': {
      modelCls: DataCollection,
      forceCreate: true,
      reverse: 'searchResult'
    }
  },

  getSearchResultCount: function() {
    return this.getRelated('results').size();
  },

  /**
   * Override to trim whitespace from the query
   */
  set: function(attrs, options) {
    if (attrs.attributes) { attrs = attrs.attributes; }
    if (attrs && attrs.query) {
      attrs.query = $.trim(attrs.query);
    }
    return Model.prototype.set.apply(this, arguments);
  },

  url: function() {
    return this.urlRoot + '/' + this.get('model') + '/' + encodeURIComponent(this.get('query'));
  },

  onLoad: function(options, visited) {
    Model.prototype.onLoad.apply(this, arguments);
    if (window.piwikTracker) {
      window.piwikTracker.trackSiteSearch(this.get('query'), false, this.getSearchResultCount());
    }
  }
});