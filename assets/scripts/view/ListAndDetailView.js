define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/ModelView',
  'view/ListView'
], function($, _, Backbone, Handlebars, Plumage, ModelView, ListView) {

  /**
   * A selectable list and corresponding detail view.
   */
  return Plumage.view.ListAndDetailView = ModelView.extend({

    className: 'list-and-detail-view',

    template: '<div class="list"></div><div class="detail"></div>',

    listOptions: {},

    detailViewCls: undefined,

    events: {
      'click .select': 'onSelect'
    },

    initialize:function(options) {
      options = options || {};
      this.subViews = [
        this.listView = new ListView(_.extend({
          selector: '.list',
          className: 'list-view'
        }, this.listOptions)),
        this.detailView = this.createDetailView()
      ].concat(options.subViews || []);
      ModelView.prototype.initialize.apply(this, arguments);

      this.listView.on('selectionChange', this.onSelect.bind(this));
    },

    createDetailView: function() {
      return new this.detailViewCls({selector: '.detail', replaceEl: true});
    },

    onRender: function(){
      $(this.el).html(this.template());
    },

    onSelect: function(selectedId) {
      var selectedModel = this.listView.model.getById(selectedId);
      this.detailView.setModel(selectedModel);
    },

    update: function() {
      //do nothing
    }
  });
});