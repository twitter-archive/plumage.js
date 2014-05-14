define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'plumage',
], function($, _, Backbone, Handlebars, Plumage) {

  return Plumage.view.ModelView.extend({
    className: 'example-view',

    template: '<div class="the-example"></div>',

    updateOnChange: false,

    onModelLoad: function() {
      var viewCls = this.model.get('viewCls');
      if (viewCls) {
        this.subViews = _.without(this.subViews, this.example);
        this.example = new viewCls({selector: '.the-example'});
        this.subViews.push(this.example);
        this.update();
      }
    }
  });
});