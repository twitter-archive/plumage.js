define([ 'jquery', 'underscore', 'backbone',
  'PlumageRoot', 'view/View'
], function($, _, Backbone, Plumage,
  View
) {

  var ViewBuilder = function() {
    this.initialize.apply(this, arguments);
  };

  _.extend(ViewBuilder.prototype,
  /** @lends Plumage.ViewBuilder.prototype */
  {
    defaultViewCls: undefined,
    defaultViewOptions: undefined,

    initialize: function(options) {
      options = options || {};
      _.extend(this, options);

      this.defaultViewCls = this.defaultViewCls || 'view/ModelView';
      if (typeof(this.defaultViewCls) === 'string') {
        this.defaultViewCls = require(this.defaultViewCls);
      }
    },

    buildView: function(config) {
      if (config instanceof View) {
        return config;
      }

      config = _.extend({}, this.defaultViewOptions, config);

      var viewCls = config.viewCls || this.defaultViewCls;
      delete config.viewCls;
      if(typeof(viewCls) === 'string') {
        viewCls = require(viewCls);
      }

      return new viewCls(config);
    }
  });


  return Plumage.ViewBuilder = ViewBuilder;
});

