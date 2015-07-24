/* global $, _ */
var Plumage = require('plumage');
var ExampleWithSourceView = require('kitchen_sink/view/example/ExampleWithSourceView');

var template = require('kitchen_sink/view/example/templates/ExampleSectionView.html');
require('jquery.scrollTo');

module.exports = Plumage.view.ModelView.extend({
  className: 'example-section-view',

  template: template,

  events: {
    'scroll': 'onScroll'
  },

  subViews: [{
    viewCls: Plumage.view.ListView,
    name: 'navListView',
    selector: '.example-list',
    relationship: 'examples',
    selectionAttr: 'example',
    itemOptions: {template: '{{title}} <span class="glyphicon glyphicon-chevron-right"></span>'}
  }, {
    viewCls: Plumage.view.CollectionView,
    name: 'examplesView',
    selector: '.examples',
    relationship: 'examples',
    itemViewCls: ExampleWithSourceView
  }],

  initialize:function(options) {
    Plumage.view.ModelView.prototype.initialize.apply(this, arguments);

    this.getSubView('examplesView').on('itemRender', this.onItemRender.bind(this));
  },

  /**
   * overrides
   */

  onRender: function() {
    Plumage.view.ModelView.prototype.onRender.apply(this, arguments);
  },

  setModel: function(rootModel) {
    Plumage.view.ModelView.prototype.setModel.apply(this, arguments);
    this.currentExample = this.model.get('example');
    this.getSubView('navListView').setSelectionModel(this.model);
    this.updateSelected();
    this.$el.scrollTop(0);
  },

  update: function() {
    // do nothing
  },

  /**
   * Helpers
   */

  updateScroll: function() {
    var exampleId = this.model.get('example');
    if (exampleId) {
      var itemView = this.getSubView('examplesView').getItemView(exampleId);
      if (itemView) {
        this.scrolling = true;
        this.$el.scrollTo(itemView.el);
        this.scrolling = false;
      }
    }
  },

  updateSelected: function() {
    if (this.scrolling) {
      return;
    }
    var scrollTop = this.$el.scrollTop(),
      top = this.$el.offset().top,
      height = this.$el.height(),
      scrollHeight = this.$el[0].scrollHeight,
      maxScroll = scrollHeight - height;

    var examplesView = this.getSubView('examplesView');
    for ( var i = 0; i < examplesView.itemViews.length; i++) {
      var itemView = examplesView.itemViews[i];
      if (itemView.$el.offset().top + itemView.$el.height() - top > height/2) {
        this.currentExample = itemView.model.get('name');
        this.model.set('example', this.currentExample);
        itemView.model.updateUrl();
        break;
      }
    }
  },

  /**
   * Event Handlers
   */

  onScroll: function(event) {
    this.updateSelected();
  },

  onModelChange: function(event) {
    if (event.changed.example !== undefined) {
      var exampleName = this.model.get('example');
      if (this.currentExample !== exampleName) {
        this.currentExample = exampleName;
        this.updateScroll();
      }
    }
  },

  onItemRender: _.debounce(function() {
    this.updateScroll();
  }, 300)
});