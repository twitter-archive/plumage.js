define(['jquery', 'underscore', 'backbone', 'model/Model'],
function($, _, Backbone, Model) {

  return {
    urlRoot: '/',

    sync: function(method, model, options) {
      var result = this.ajaxResponse;
      if ($.isArray(result)) {
        if (result.length > 1) {
          result = result.shift();
        } else {
          result = result[0];
        }
      } else if ($.isFunction(result)) {
        result = result(method, model, options);
      }
      if ($.isPlainObject(result.meta)) {
        options.success(result);
      } else {
        options.error(result);
      }
      return $.Deferred().resolve(this, result).promise();
    }
  };
});