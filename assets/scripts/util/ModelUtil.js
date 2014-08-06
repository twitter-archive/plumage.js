define([
  'jquery', 'PlumageRoot'
], function($, Plumage) {
  return Plumage.util.ModelUtil = {
    loadClass: function(cls) {
      return typeof(cls) === 'string' ? require(cls) : cls;
    },

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
    }
  };
});