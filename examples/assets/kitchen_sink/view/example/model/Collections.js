define([
  'jquery',
  'underscore',
  'plumage',
  'kitchen_sink/view/example/BaseExample',
  'kitchen_sink/view/example/model/templates/Collections.html'
], function($, _, Plumage, BaseExample, template) {

  return BaseExample.extend({

    template: template,

    initialize:function(options) {
      options = options || {};
      BaseExample.prototype.initialize.apply(this, arguments);
    }
  });
});