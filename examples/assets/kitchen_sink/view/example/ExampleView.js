/* global $, _ */
var Plumage = require('plumage');

module.exports = Plumage.view.ModelView.extend({
  className: 'example-view',

  template: '<div class="the-example"></div>',

  updateOnChange: false,

  initialize: function() {
    this.subViews = [];
    Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
  },

  onModelLoad: function() {
    var viewCls = this.model.getViewCls();
    if (viewCls) {
      this.subViews = _.without(this.subViews, this.example);
      this.example = new viewCls({selector: '.the-example'});
      this.subViews.push(this.example);
      this.update();
    }
  }
});