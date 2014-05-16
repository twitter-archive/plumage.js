define([
  'jquery',
  'backbone',
  'plumage'
], function($, Backbone, Plumage) {

  return Plumage.view.ModelView.extend({
    className: 'form-horizontal',

    initialize: function() {
      this.subViews = [
        new Plumage.view.DisplayField({label: 'Native Name', valueAttr: 'nativeName'}),
        new Plumage.view.DisplayField({label: 'Region', valueAttr: 'region'}),
        new Plumage.view.DisplayField({label: 'Subregion', valueAttr: 'subregion'}),
        new Plumage.view.DisplayField({label: 'Population', valueAttr: 'population'}),
        new Plumage.view.DisplayField({label: 'Currency', valueAttr: 'currency'}),
        new Plumage.view.DisplayField({label: 'TLD', valueAttr: 'tld'}),
        new Plumage.view.DisplayField({label: 'Calling Code', valueAttr: 'callingCode'}),
      ];
      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
    }
  });
});