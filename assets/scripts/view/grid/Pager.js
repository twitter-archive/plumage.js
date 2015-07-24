/* globals $, _ */

var Plumage = require('PlumageRoot');
var ModelView = require('view/ModelView');

var template = require('view/grid/templates/Pager.html');

module.exports = Plumage.view.grid.Pager = ModelView.extend({

  className: 'pager',

  template: template,

  events: {
    'click .pager .previous a': 'onPreviousClick',
    'click .pager .next a': 'onNextClick',
  },

  getTemplateData: function() {
    return {
      atFirstPage: this.atFirstPage(),
      atLastPage: this.atLastPage()
    };
  },

  atFirstPage: function() {
    if (this.model) {
      return this.model.get('page') === 0;
    }
    return false;
  },

  atLastPage: function() {
    if (this.model && this.model.size) {
      return this.model.size() < this.model.get('pageSize');
    }
    return false;
  },

  onPreviousClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.atFirstPage()) {
      var page = this.model.get('page');
      this.model.set('page', Math.max(page-1, 0));
      this.model.load();
    }
  },

  onNextClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var page = this.model.get('page'),
      pageSize = this.model.get('pageSize'),
      atLastPage = this.model.size() < pageSize;

    if (!this.atLastPage()) {
      this.model.set('page', page+1);
      this.model.load();
    }
  }
});
