define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot'
],

function($, _, Backbone, Plumage) {


  var instance;
  /**
   * Singleton object. Call loadModel to load a Model, and have RequestManager keep a reference to the request so it
   * can be cancelled if necessary.
   *
   * Request manager also triggers 'message' on the Plumage.App for flash messages if the response contains a message.
   *
   * @constructs Plumage.RequestManager
   */
  var RequestManager = function() {
    this.requests = [];
    this.initialize.apply(this, arguments);
  };

  _.extend(RequestManager.prototype,
  /** @lends Plumage.RequestManager.prototype */
  {
    /** Does nothing. Override to provide initialization logic. */
    initialize: function() {
    },

    /** Load the given model, keeping a reference to the request. */
    loadModel: function(model, options) {
      options = options || {};
      var success = options.success;
      options.success = function(model, resp, options) {
        this.onSuccess(model, resp, options);
        if (success) {success(model, resp, options);}
      }.bind(this);

      var xhr = model.load(options);
      if (xhr) {
        this.requests.push({xhr: xhr, url: model.url()});
      }
    },

    /** cancel all uncompleted requests. */
    abortOutstandingRequests: function() {
      for(var i=0;i<this.requests.length;i++) {
        var xhr = this.requests[i].xhr;
        var url = this.requests[i].url;

        xhr.abort();
      }
      this.requests = [];
    },

    /**
     * Event handler. Trigger's message on the App if response contains a message.
     * @param resp {Object} XHR response
     * @private
     */
    onSuccess: function(model, resp, options) {
      if (resp.meta && resp.meta.message_body) {
        theApp.dispatch.trigger('message', resp.meta.message_body, resp.meta.message_class);
      }
    }
  });

  if (instance === undefined) {
    instance = new RequestManager();
  }

  return Plumage.requestManager = instance;
});