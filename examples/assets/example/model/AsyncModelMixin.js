define(['jquery', 'underscore', 'backbone', 'model/Model'],
function($, _, Backbone, Model) {

  return {
    urlRoot: '/',

    sync: function(method, model, options) {
      var response = this.ajaxResponse;
      if ($.isArray(response)) {
        if (response.length > 1) {
          response = response.shift();
        } else {
          response = response[0];
        }
      } else if ($.isFunction(response)) {
        response = response(method, model, options);
      }
      if ($.isPlainObject(response.meta)) {
        options.success(response);
      } else {
        options.error(response);
      }
    }
  };
});