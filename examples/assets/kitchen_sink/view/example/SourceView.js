/* global $, _ */
var Plumage = require('plumage');
var hljs = require('kitchen_sink/highlight');
var template = require('kitchen_sink/view/example/templates/SourceView.html');

module.exports = Plumage.view.ModelView.extend({
  className: 'example-source',

  template: template,

  deferRender: true,

  sourceType: 'js',

  getTemplateData: function(){
    var data = Plumage.view.ModelView.prototype.getTemplateData.apply(this, arguments);

    if (this.sourceType === 'js') {
      data.source = this.model.getJsSource();
    } else {
      data.source = this.model.getHtmlSource();
    }

    if (data.source) {
      data.source = hljs.highlightAuto(data.source, ['javascript', 'html']).value;
    }
    data.title = this.getTitle();
    return data;
  },

  getTitle: function() {
    return this.model.get('name') + '.' + this.suffix;
  }
});