var Plumage = require('plumage');
var ExampleSection = require('kitchen_sink/model/ExampleSection');
var ExampleSectionView = require('kitchen_sink/view/example/ExampleSectionView');
var examples = require('data/examples.json');

module.exports = Plumage.controller.BaseController.extend({
  contentSelector: '#page',

  exampleSections: {},

  currentSection: undefined,

  initialize : function(app, options) {
    Plumage.controller.BaseController.prototype.initialize.apply(this, arguments);
    this.exampleSectionView = new ExampleSectionView();
  },

  home: function(section, options) {
    window.router.navigate('model/Models', {trigger: true, replace: true});
  },

  showSection: function(section, options) {
    this.showSectionWithExample(section, undefined, options);
  },

  showSectionWithExample: function(section, example, options) {
    var model = this.exampleSections[section];
    if (!model) {
      var exampleSectionData = examples[section];
      if (exampleSectionData) {
        model = new ExampleSection(exampleSectionData);
        this.doShowSection(model, example, options);
        model.onLoad();
      }
      this.exampleSections[section] = model;
    }
    else {
      this.doShowSection(model, example, options);
    }
  },

  doShowSection: function(model, example, options) {
    if (model.get('name') !== this.currentSection) {
      this.currentSection = model.get('name');
      if (example) {
        model.set('example', example);
        var currentExample = model.getCurrentExample();
        currentExample.set(options);
      }

      this.exampleSectionView.setModel(model);
    }
    this.showView(this.exampleSectionView);
    this.app.navView.select(model.get('name') + '-menu');
  }
});