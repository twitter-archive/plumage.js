/* global $, _ */
var Plumage = require('plumage');
var ExampleView = require('kitchen_sink/view/example/ExampleView');
var SourceView = require('kitchen_sink/view/example/SourceView');

var template = require('kitchen_sink/view/example/templates/ExampleWithSourceView.html');

module.exports = Plumage.view.ModelView.extend({
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