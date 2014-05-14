define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/View',
  'view/ModelView',
  'text!view/templates/TabView.html'
], function($, _, Backbone, Handlebars, Plumage, View, ModelView, template) {

  return Plumage.view.TabView = ModelView.extend({

    className: 'tab-view tab-theme',

    template: Handlebars.compile(template),

    viewStateAttr: 'tab',

    events: {
      'click .tabs a': 'onTabClick'
    },

    initialize: function() {
      ModelView.prototype.initialize.apply(this, arguments);
      this.eachTabSubView(function(subView) {
        subView.selector = '#' + subView.tabId + '-tab';
      }, this);
    },

    onRender: function() {
      var data = this.getTemplateData();
      $(this.el).html(this.template(data));
      this.updateActiveTab();
    },

    setModel: function() {
      ModelView.prototype.setModel.apply(this, arguments);
      if (this.model.get(this.viewStateAttr) === undefined) {
        var firstTabView = _.find(this.subViews, function(subView){ return subView.tabId !== undefined;});
        this.model.set(this.viewStateAttr, firstTabView.tabId);
      }
    },

    getActiveTab: function() {
      if (this.model) {
        return this.model.get(this.viewStateAttr);
      }
    },

    setActiveTab: function(tabId) {
      if (this.model) {
        this.model.set(this.viewStateAttr, tabId);
        this.model.updateUrl();
      }
    },

    getTemplateData: function() {
      var tabs = [];
      this.eachTabSubView(function(subView) {
        var tab = {
          id: subView.tabId,
          active: subView.tabId === this.getActiveTab(),
          label: subView.tabLabel
        };
        tabs.push(tab);
      }, this);
      return {tabs: tabs};
    },

    updateActiveTab: function() {
      var activeTab = this.getActiveTab();
      if (activeTab === undefined) {
        activeTab = this.subViews[0].tabId;
      }
      var cssId = activeTab +'-tab';
      var tab = this.$('a[data-tab=#'+ cssId + ']');

      this.$('.tabs li').removeClass('active');
      tab.parent('li').addClass('active');

      if (tab) {
        this.eachTabSubView(function(subView) {
          if (subView.tabId === this.getActiveTab()) {
            this.$el.addClass(subView.tabId + '-tab-selected');
            this.$('#'+subView.tabId+'-tab').addClass('active');
            if (this.shown) {
              subView.onShow();
            }
          } else {
            this.$el.removeClass(subView.tabId + '-tab-selected');
            this.$('#'+subView.tabId+'-tab').removeClass('active');
            if (this.shown) {
              subView.onHide();
            }
          }
        }, this);
      }
    },

    onTabClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var tab = $(e.target);
      var tabId = this.cleanTabId(tab.data('tab'));
      e.preventDefault();
      this.setActiveTab(tabId);
    },

    eachTabSubView: function(callback, scope) {
      _.each(this.subViews, function(subView) {
        if (subView.tabId) {
          if (scope) {
            return callback.call(this, subView);
          } else {
            callback(subView);
          }
        }
      }, this);
    },

    /**
     * Override subview behavior. Don't call ModelView's versions
     */
    onModelLoad: function() {
      this.updateActiveTab();
    },

    onModelChange: function() {
      this.updateActiveTab();
    },

    onShow: function() {
      View.prototype.onShow.apply(this, arguments);
      this.updateActiveTab();

      this.eachSubView(function(subView) {
        if (subView.tabId === this.getActiveTab() || subView.tabId === undefined) {
          subView.onShow();
        }
      }, this);
    },

    onHide: function() {
      View.prototype.onHide.apply(this, arguments);
      this.eachSubView(function(subView) {
        if (subView.tabId === this.getActiveTab() || subView.tabId === undefined) {
          subView.onHide();
        }
      }, this);
    },

    /**
     * Helpers
     */

    cleanTabId: function(tabId) {
      return tabId.replace(/^#/, '').replace(/-tab$/, '');
    }

  });
});