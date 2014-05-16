define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone) {

  /**
   * Tracks events to make sure they happened and in the right order
   */
  var EventLog = function(emitters) {
    if (!$.isArray(emitters)) {
      emitters = [emitters];
    }
    this.emitters = emitters;
    this.log = [];
    this.counts = {};

    for ( var i = 0; i < emitters.length; i++) {
      var emitter = emitters[i];
      emitter.on('all', this.createEventHandler(emitter));
    }
  };

  _.extend(EventLog.prototype, Backbone.Events, {

    createEventHandler: function(emitter) {
      return function(e) {
        this.log.push({
          modelName: emitter.modelName,
          id: emitter.id,
          emitter: emitter,
          event: e
        });
        this.counts[e] = this.counts[e] ? this.counts[e] + 1 : 1;
      }.bind(this);
    }
  });

  return EventLog;
});


