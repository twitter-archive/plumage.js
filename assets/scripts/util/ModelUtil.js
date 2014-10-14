define([
  'jquery', 'PlumageRoot'
], function($, Plumage) {
  return Plumage.util.ModelUtil = {
    loadClass: function(cls) {
      return typeof(cls) === 'string' ? require(cls) : cls;
    },

    /**
     * Merge options arguments with class values, including deeper prototypes if specified
     * @param {string} name Name of option to merge
     * @param {Model} model Model to set the option on
     * @param {object} options Options argument
     * @param {boolean} deep Merge deeper prototype values?
     */
    mergeOption: function(name, model, options, deep) {

      var args = [options[name] || {}];

      if (deep) {
        var proto = model;
        while (proto) {
          if (proto.hasOwnProperty(name)) {
            args.unshift(proto[name]);
          }
          proto = Object.getPrototypeOf(proto);
        }
      } else {
        args.unshift(model[name] || {});
      }
      var result = $.extend.apply(null, [true, {}].concat(args));
      delete options[name];
      model[name] = result;
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
  };
});