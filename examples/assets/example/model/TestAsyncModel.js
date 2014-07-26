define(['jquery', 'underscore', 'backbone', 'model/Model'],
function($, _, Backbone, Model) {

  return Model.extend({

    modelName: 'TestAsyncModel',

    urlRoot: '/',

    ajaxResponse: undefined,

    initialize: function(attributes, options) {
      options = options || {};
      if (options.ajaxResponse) {
        this.ajaxResponse = options.ajaxResponse;
      }
      Model.prototype.initialize.apply(this, arguments);
    },

    sync: function(method, model, options) {
      var response = this.ajaxResponse;
      if ($.isArray(response)) {
        if (response.length > 1) {
          response = response.shift();
        } else {
          response = response[0];
        }
      } else if ($.isFunction(response)) {
        response = response();
      }
      if ($.isPlainObject(response.meta)) {
        options.success(response);
      } else {
        options.error(response);
      }
    }
  });
});