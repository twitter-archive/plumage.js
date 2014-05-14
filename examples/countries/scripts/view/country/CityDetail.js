define([
  'jquery',
  'backbone',
  'plumage',
  'text!countries/view/country/templates/CityDetail.html'
], function($, Backbone, Plumage, template) {

  return Plumage.view.ModelView.extend({

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
});