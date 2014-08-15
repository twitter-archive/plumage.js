define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ModelView',
  'text!view/grid/templates/Pager.html'
], function($, _, Backbone, Plumage, ModelView, template) {

  return Plumage.view.grid.Pager = ModelView.extend({

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
      if (this.model) {
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
});
