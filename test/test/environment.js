define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone) {

  var Environment = function(){};

  _.extend(Environment.prototype, {

    console: undefined,

    setup: function() {
      var env = this;

      /**
       *
       */
      env.ajaxCount = 0;
      env.ajaxResponse = {};
      env.ajaxResponseStatus = 'success';
      env.ajaxAsync = false;
      env.sync = Backbone.sync;
      env.ajax = Backbone.ajax;
      env.countEvents = function(eventEmitter) {
        var eventCount = {};
        eventEmitter.on('all', function(e) {
          eventCount[e] = eventCount[e] ? eventCount[e]+1 : 1;
        });
        return eventCount;
      };

      env.emulateHTTP = Backbone.emulateHTTP;
      env.emulateJSON = Backbone.emulateJSON;

      // Capture ajax settings for comparison.
      Backbone.ajax = function(settings) {
        var deferred = $.Deferred();
        env.ajaxCount += 1;
        env.ajaxSettings = settings;
        if (env.console) {
          env.console.log('Ajax ' + settings.type + ': ' + settings.url);
        }
        if (env.ajaxAsync) {

          setTimeout(function(){
            settings.success(env.ajaxResponse);
            deferred.resolve();
          });
        } else {
          if (env.ajaxResponseStatus === 'error') {
            if (settings.error) {
              settings.error(env.ajaxResponse);
            }
          } else {
            if (settings.success) {
              settings.success(env.ajaxResponse);
            }
          }
          deferred.resolve();
        }
        return deferred;
      };

      // Capture the arguments to Backbone.sync for comparison.
      Backbone.sync = function(method, model, options) {
        env.syncArgs = {
          method: method,
          model: model,
          options: options
        };
        return env.sync.apply(this, arguments);
      };
    },

    teardown: function() {
      this.syncArgs = null;
      this.ajaxSettings = null;
      Backbone.sync = this.sync;
      Backbone.ajax = this.ajax;
      Backbone.emulateHTTP = this.emulateHTTP;
      Backbone.emulateJSON = this.emulateJSON;
    }



  });
  return Environment;

});
