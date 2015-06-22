define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
  'kitchen_sink/view/example/BaseExample',
  'example/model/Post',
  'kitchen_sink/view/example/view/templates/ModelViews.html'
], function($, _, Backbone, Plumage, BaseExample, Post, template) {

  return BaseExample.extend({

    modelCls: Post,

    template: template,

    initialize:function(options) {
      options = options || {};

      this.events = _.extend({'click #update-model-btn': 'onUpdateModelClick'}, this.events);

      this.subViews = [
        new Plumage.view.ModelView({
          selector: '.model-view',
          template: 'Post name: {{name}}</span>',
          updateOnChange: true
        }),
        new Plumage.view.ModelView({
          selector: '.sub-model-view',
          template: 'Post name: {{name}}</span> <div class="body"></div>',
          subViews: [
            new Plumage.view.ModelView({
              selector: '.body',
              template: 'Body in subview: {{body}}'
            })
          ]
        }),
        new Plumage.view.ModelView({
          selector: '.view-with-relationship',
          template: 'Post name: {{name}}</span> <div class="author"></div>',
          subViews: [
            new Plumage.view.ModelView({
              selector: '.author',
              relationship: 'author',
              template: 'Related Author in Subview: {{name}}'
            })
          ]
        }),
      ];
      BaseExample.prototype.initialize.apply(this, arguments);

      this.setModel(new Post({name: 'my post', body: 'post body', author: {name: 'Bob'}}));
    },

    onUpdateModelClick: function() {
      var name = this.model.get('name');
      this.model.set('name', 'no, '+name);
    }
  });
});