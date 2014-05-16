define([
  'jquery',
  'underscore',
  'plumage',
  'kitchen_sink/view/example/BaseExample',
  'example/model/Post',
  'text!kitchen_sink/view/example/view/templates/Views.html'
], function($, _, Plumage, BaseExample, Post, template) {

  return BaseExample.extend({

    template: template,

    subViews: [{
      viewCls: Plumage.view.View,
      selector: '.base-view',
      template: 'Name: {{name}}',
      getTemplateData: function() {return {name: 'foo'};}
    }, {
      viewCls: Plumage.view.ModelView,
      selector: '.container-view',
      template: 'SubView: <span class="subview"></span>',
      subViews: [{
        selector: '.subview',
        template: 'I am a subview'
      }]
    }]
  });
});