define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'kitchen_sink/highlight',
  'plumage',
  'text!kitchen_sink/view/example/templates/SourceView.html'
], function($, _, Backbone, Handlebars, hljs, Plumage, template) {

  return Plumage.view.ModelView.extend({
    className: 'example-source',

    template: template,

    deferRender: true,

    sourceType: 'js',

    getTemplateData: function(){
      var data = Plumage.view.ModelView.prototype.getTemplateData.apply(this, arguments);

      data.source = this.model.getSource(this.sourceType, this.onSourceLoad.bind(this));
      if (data.source) {
        data.source = hljs.highlightAuto(data.source).value;
      }
      data.title = this.getTitle();
      return data;
    },

    getTitle: function() {
      return this.model.get('name') + '.' + this.suffix;
    },

    onSourceLoad: function() {
      this.render();
    }
  });
});