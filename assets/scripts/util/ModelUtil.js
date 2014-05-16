define([
  'jquery', 'PlumageRoot'
], function($, Plumage) {
  return Plumage.util.ModelUtil = {
    loadClass: function(cls) {
      return typeof(cls) === 'string' ? require(cls) : cls;
    },

    mergeOption: function(name, model, options) {
      var result = $.extend(true, {}, model[name] || {}, options[name] || {});
      delete options[name];
      model[name] = result;
    }
  };
});