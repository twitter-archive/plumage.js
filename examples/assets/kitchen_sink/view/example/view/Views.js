/* global $, _ */
var Plumage = require('plumage');
var BaseExample = require('kitchen_sink/view/example/BaseExample');
var Post = require('example/model/Post');

var template = require('kitchen_sink/view/example/view/templates/Views.html');

module.exports = BaseExample.extend({

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