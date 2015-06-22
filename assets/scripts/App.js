define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'util/Logger'
],

function($, _, Backbone, Handlebars, Plumage, Logger) {

  /**
   * Global object responsible for initializing your App as well as the Controllers and Nav etc.
   *
   * After creating it, pass your app to your Router.
   *
   * @constructs Plumage.App
   */
  var App = function(options) {
    this.initialize.apply(this, arguments);
  };

  _.extend(App.prototype, Backbone.Events,
  /** @lends Plumage.App.prototype */
  {
    /** Keeps track of the current top level view */
    views: {current: null},

    /** Should init cross-site request forgery token in $.ajax. See jQuery docs */
    initCSRFToken: false,

    /** Initialization logic. Feel free to extend */
    initialize: function(options) {
      _.extend(this, options);

      this.registerHandlebarsHelpers();

      if (this.initCSRFToken) {
        $.ajaxSetup({
          headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
          }
        });
      }
      this.dispatch = _.extend({}, Backbone.Events);
    },

    registerHandlebarsHelpers: function() {
      Handlebars.registerHelper('setIndex', function(value){
        this.index = Number(value + 1); //I needed human readable index, not zero based
      });
    },

    getViewState: function() {
      var view = this.views.current;

      if (view && view.model) {
        return view.model.getQueryParams();
      }
      return {};
    }
  });

  App.extend = Backbone.Model.extend;

  return Plumage.App = App;
});