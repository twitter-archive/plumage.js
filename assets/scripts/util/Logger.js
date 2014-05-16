define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot'
],

function($, _, Backbone, Plumage) {

  /**
   * Logger that posts log calls to the server.
   *
   * Stores logs in local storage on POST so they can be retried if the request fails.
   *
   * @constructs Plumage.util.Logger
   */
  var Logger = function(options) {
    this.initialize.apply(this, arguments);
  };

  _.extend(Logger.prototype,
  /** @lends Plumage.util.Logger.prototype */
  {

    /** Server url to post to. */
    url: undefined,

    /** Local storage key to store unsent logs in. */
    localStorageKey: 'Plumage.util.Logger.failedLogs',

    /** initialization logic. */
    initialize: function(options) {
      _.extend(this, options);
      this.retryLogs();
    },

    /** Logs an error. Should add other log levels at some point. */
    error: function(type, message) {
      this.sendLog({level: 'error', type: type, message: message});
    },

    /** Send a log to the server. */
    sendLog: function(data) {
      if(data.time === undefined) { data.time = new Date().getTime(); }
      this.storeLog(data);

      Backbone.ajax({
        type: 'POST',
        url: this.url,
        data: data,
        success: this.getSuccessHandler(data).bind(this)
      });
    },

    /**
     * Gets logs from local storage.
     * @returns {Array} List of unsent log Objects
     */
    getStoredLogs: function() {
      var storedLogs = localStorage.getItem(this.localStorageKey);
      if (storedLogs) {
        try {
          return JSON.parse(storedLogs);
        } catch(e) {}
      }
      return [];
    },

    /** Try resending unsent logs. */
    retryLogs: function() {
      var storedLogs = this.getStoredLogs();
      for (var i = 0; i < storedLogs.length; i++) {
        this.sendLog(storedLogs[i]);
      }
    },

    /** Store a log in local storage. */
    storeLog: function(data) {
      var storedLogs = this.getStoredLogs();
      for ( var i = 0; i < storedLogs.length; i++) {
        if (storedLogs[i].time === data.time && storedLogs[i].type === data.type) {
          return;
        }
      }
      storedLogs.push(data);
      localStorage.setItem(this.localStorageKey, JSON.stringify(storedLogs));
    },

    /** Remove a log from local storage. */
    removeLog: function(data) {
      var logs = this.getStoredLogs();
      if (logs) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(_.filter(logs, function(log){
          return log.time !== data.time && log.type !== data.type;
        })));
      }
    },

    /** Delete all stored logs. */
    clearLogs: function() {
      localStorage.removeItem(this.localStorageKey);
    },

    //
    // Event Handlers
    //

    /**
     * Creates event handler that removes a stored log on success.
     * @param {Object} data The log being sent. Stored in closure.
     * @returns {function} The event handler
     * @private
     *
     */
    getSuccessHandler: function(data) {
      return function(response, status, xhr) {
        this.removeLog(data);
      };
    }
  });

  return Plumage.util.Logger = Logger;
});