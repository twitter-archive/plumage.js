define(['jquery', 'underscore', 'backbone', 'PlumageRoot', 'History'],
function($, _, Backbone, Plumage, History) {
  return Plumage.Router = Backbone.Router.extend(
  /** @lends Plumage.Router.prototype */
  {
    /** Routes config. Map from route pattern to a route options object. Options must include controller and method */
    controllerRoutes: undefined,

    /** reference to the controllerManager for access to Controller instances*/
    controllerManager: undefined,

    /** Root url of the application. Passed on to History */
    rootUrl: '/',

    /** If a route is not recognized, redirect to defaultUrl */
    defaultUrl: '/',

    /** use html5 push state? If false, falls back to using # for deep urls. */
    pushState: true,

    /**
     * Routes requests to Controller handler methods.
     *
     * @extends external:Backbone.Router
     * @constructs
     */
    initialize: function(options) {
      options = options || {};
      if (options.app !== undefined) {
        this.app = options.app;
      }
      if (options.defaultUrl !== undefined) {
        this.defaultUrl = options.defaultUrl;
      }
      if (options.rootUrl !== undefined) {
        this.rootUrl = options.rootUrl;
      }
      if (options.pushState !== undefined) {
        this.pushState = options.pushState;
      }
      if (options.history !== undefined) {
        this.history = options.history;
      } else {
        this.history = new Plumage.History();
      }


      this.route('*path', 'defaultRoute', function(path){
        if (window.location.pathname !== this.defaultUrl) {
          window.location.pathname = this.defaultUrl;
        }
      });

      for (var route in this.controllerRoutes) {
        if (!this.controllerRoutes.hasOwnProperty(route)) {
          continue;
        }
        var routeOptions = this.controllerRoutes[route],
          name = routeOptions.controller + '.' + routeOptions.method,
          handler = _.bind(this.routeToController, this, routeOptions);
        this.route(route, name, handler);
      }
    },

    start: function() {
      this.history.start({pushState: this.pushState, root: this.rootUrl});
    },

    /** Route handler that forwards to method 'options.method'
     * in Controller 'options.controller'
     */
    routeToController: function(options, queryParams){
      if (this.app.navView) {
        this.app.navView.select(options.nav);
      }
      var ctrl = this.app.controllerManager.getController(options.controller);
      ctrl[options.method].apply(ctrl, Array.prototype.slice.call(arguments, 1));
    },

    /**
     * Override to switch to this.history
     */
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) {
        route = this._routeToRegExp(route);
      }
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) {
        callback = this[name];
      }
      var router = this;
      this.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        router.history.trigger('route', router, name, args);
      });
      return this;
    },

    navigate: function(url, options) {
      //remove host and protocol if it's local
      if (url.indexOf(window.location.origin) === 0) {
        url = url.slice(window.location.origin.length);
      }

      //remove url prefix
      if (url.indexOf(this.rootUrl) === 0) {
        url = url.slice(this.rootUrl.length);
      }
      this.history.navigate(url, options);
    },

    /** Special navigate method for working around Backbone's ignoring of query params. */
    navigateWithQueryParams: function(url, options) {
      if (url === window.location.pathname + window.location.search) {
        //already there
        return;
      }

      this.navigate(url, options);
    },

    /**
     * Override to parse query string
     */
    execute: function(callback, args) {
      var queryParams = this.parseQueryString(args.pop());
      if (queryParams) {
        args.push(queryParams);
      }
      if (callback) {
        callback.apply(this, args);
      }
    },

    parseQueryString: function(queryString) {
      if (!queryString) {
        return undefined;
      }
      var result = {};
      queryString = decodeURIComponent(queryString.replace(/\+/g, '%20'));
      if(queryString) {
        $.each(queryString.split('&'), function(index, value) {
          if(value) {
            var param = value.split('=');
            result[param[0]] = param[1];
          }
        });
      }
      return result;
    }
  });
});