define([
  'jquery',
  'backbone',
  'plumage'
], function($, Backbone, Plumage) {

  return Plumage.view.CollectionView.extend({

    template: '<h4>Languages</h4><ul class="items"></ul>',

    itemViewCls: Plumage.view.ModelView,
    itemOptions: {
      template: 'Name: {{name}}'
    },

    initialize: function() {
      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
    }
  });
});