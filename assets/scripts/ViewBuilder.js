var _ = require('underscore');
var Backbone = require('backbone');
var Plumage = require('PlumageRoot');
var View = require('view/View');

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
    },

    buildView: function(config, defaultViewCls, defaultViewOptions) {
      if (config instanceof View) {
        return config;
      }

      defaultViewCls = defaultViewCls || View;
      defaultViewOptions = defaultViewOptions || {};

      config = _.extend({}, defaultViewOptions, config);

      var viewCls = config.viewCls || defaultViewCls;
      if (viewCls === undefined) {
        throw 'No view class';
      }
      delete config.viewCls;

      var view = new viewCls(config);

      return view;
    }
  }
);


module.exports = Plumage.ViewBuilder = ViewBuilder;

