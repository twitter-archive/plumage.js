var Plumage = require('plumage');
var template = require('countries/view/country/templates/CityDetail.html');

module.exports = Plumage.view.ModelView.extend({

  className: 'city-detail',

  template: template,

  renderOnChange: true,

  renderOnLoad: true,

  initialize: function() {
    Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
    this.subViews = [
      new Plumage.view.DisplayField({label: 'Population', valueAttr: 'population', selector: '.fields', relationship: this.relationship}),
      new Plumage.view.DisplayField({label: 'Latitude', valueAttr: 'latitude', selector: '.fields', relationship: this.relationship}),
      new Plumage.view.DisplayField({label: 'Longitude', valueAttr: 'longitude', selector: '.fields', relationship: this.relationship})
    ];
  }
});