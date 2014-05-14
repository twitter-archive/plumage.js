define([
  'jquery',
  'underscore',
  'plumage',
  'kitchen_sink/view/example/BaseExample',
  'text!kitchen_sink/view/example/model/templates/Collections.html'
], function($, _, Plumage, BaseExample, template) {

  return BaseExample.extend({

    template: template,

    initialize:function(options) {
      options = options || {};
      this.subViews = [];
      BaseExample.prototype.initialize.apply(this, arguments);
    }
  });
});