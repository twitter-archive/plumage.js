define([
  'jquery',
  'moment',
  'PlumageRoot'
], function($, moment, Plumage) {
  return Plumage.util.D3Util = {
    /**
     * Similar to _.sortedIndex, but doesn't apply iterator to target value
     */
    applyConfig: function(d3El, config, context) {
      for (var key in config) {
        if (!config.hasOwnProperty(key)) { return; }
        d3El.attr(key, Plumage.util.D3Util.getAccessor(config[key], context));
      }
    },

    /**
     * Wrap accessor to add context as 3rd param.
     * @param attr existing accessor function or value
     * @returns wrapped accessor
     */
    getAccessor: function(attr, context) {
      if (typeof(attr) === 'function') {
        return function (d, i) {
          return attr(d, i, context);
        };
      }
      return attr;
    }
  };
});