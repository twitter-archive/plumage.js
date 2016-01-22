var $ = require('jquery');
var _ = require('underscore');
var Cookies = require('cookies-js');

var Plumage = require('PlumageRoot');
var View = require('view/View');
var ModelView = require('view/ModelView');

module.exports = Plumage.view.TabView = ModelView.extend(
/** @lends Plumage.view.TabView.prototype */
  {
    className: 'tab-view tab-theme',

    template: require('view/templates/TabView.html'),

    viewStateAttr: 'tab',

    cookieName: undefined,

    events: {
      'click .tabs a': 'onTabClick'
    },

    triggerOnTabChange: false,

    /**
     * If set, call [router.logNavigationAction]{@link Plumage.Router#logNavigationAction}nAction on tab change.
     */
    logTabNavigation: false,

    /**
     * Tabbed view with subviews as tab panes.
     *
     * Tabs are generated from subViews with the tabId and tabLabel attributes.
     *
     * @constructs
     * @extends Plumage.view.ModelView
     */
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
      var tab = this.model.get(this.viewStateAttr);
      if (!tab) {
        tab = this.getTabCookie();
        if (tab === undefined) {
          tab = _.find(this.subViews, function(subView){ return subView.tabId !== undefined;}).tabId;
        }
        this.model.set(this.viewStateAttr, tab);
      }
    },

    getActiveTab: function() {
      if (this.model) {
        return this.model.get(this.viewStateAttr);
      }
    },

    setActiveTab: function(tabId) {
      if (this.model && tabId !== this.getActiveTab()) {
        if (this.triggerOnTabChange) {
          var extras = {};
          extras[this.viewStateAttr] = tabId;
          if (window.router) {
            window.router.navigateWithQueryParams(this.model.viewUrlWithParams(extras), {trigger: true});
          }
        } else {
          this.model.set(this.viewStateAttr, tabId);
          this.model.updateUrl();
        }
        this.updateTabCookie();
        if (this.logTabNavigation) {
          if (window.router) {
            window.router.logNavigationAction(window.location.href, window.location.pathname);
          }
        }
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
      var tab = this.$('a[data-tab="#'+ cssId + '"]');

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

    getTabCookie: function() {
      if (this.cookieName) {
        return Cookies.get('tabview.' + this.cookieName);
      }
    },

    updateTabCookie: function() {
      if (this.cookieName) {
        Cookies.set('tabview.' + this.cookieName, this.getActiveTab(), { expires: 7*3600*24 });
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
      var tab = this.model.get(this.viewStateAttr);
      if (tab) {
        this.updateActiveTab();
      } else {
        tab = this.getTabCookie();
        if (tab === undefined) {
          tab = _.find(this.subViews, function(subView){ return subView.tabId !== undefined;}).tabId;
        }
        this.setActiveTab(tab);
      }
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

  }
);