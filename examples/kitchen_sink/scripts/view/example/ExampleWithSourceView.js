define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'plumage',
  'kitchen_sink/view/example/ExampleView',
  'kitchen_sink/view/example/SourceView',
  'text!kitchen_sink/view/example/templates/ExampleWithSourceView.html'
], function($, _, Backbone, Handlebars, Plumage, ExampleView, SourceView, template) {

  return Plumage.view.ModelView.extend({
    className: 'example-with-source',

    template: template,

    initialize: function() {
      this.subViews = [
        new Plumage.view.TabView({
          selector: '.example-tabs',
          className: 'tab-view tab-theme',
          subViews: [
            new ExampleView({tabId: 'page', tabLabel: 'Page'}),
            new SourceView({tabId: 'source', tabLabel: 'Source', sourceType: 'js', suffix: 'js'}),
            new SourceView({tabId: 'html', tabLabel: 'HTML', sourceType: 'html', suffix: 'html'})
          ]
        })
      ];

      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
    },

    onRender: function() {
      if (this.model) {
        var name = this.model.get('name');
        Plumage.view.ModelView.prototype.onRender.apply(this, arguments);
      }
    }
  });
});