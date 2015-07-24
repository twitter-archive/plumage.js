var Plumage = require('plumage');
var CountryFields = require('countries/view/country/CountryFields');
var CityDetail = require('countries/view/country/CityDetail');
var LanguagesView = require('countries/view/country/LanguagesView');

var template = require('countries/view/country/templates/CountryDetail.html');

module.exports = Plumage.view.ModelView.extend({

  className: 'city-detail',

  template: template,
  titleTemplate: '<h2>{{name}}</h2>',
  subtitleTemplate: '{{region}}',

  events: {
    'click a': 'onLinkClick'
  },

  initialize:function(options) {
    options = options || {};
    this.subViews = [
      new Plumage.view.ModelView({selector: '.title', template: this.titleTemplate, replaceEl: true}),
      new Plumage.view.ModelView({selector: '.subtitle', events: {'click a': 'onLinkClick'}, template: this.subtitleTemplate, replaceEl: true}),
      new CountryFields({selector: '.fields'}),
      new CityDetail({selector: '.capital', relationship: 'capital'}),
      new LanguagesView({selector: '.languages', relationship: 'language'})
    ].concat(options.subViews || []);
    Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
  },

  setModel: function(rootModel) {
    Plumage.view.ModelView.prototype.setModel.apply(this, arguments);
  }
});