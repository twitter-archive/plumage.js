define([
  'jquery', 'underscore', 'backbone', 'plumage',
  'example/model/Country',
  'example/collection/CountryCollection',
  'countries/view/country/CountryIndex',
  'countries/view/country/CountryDetail',
  'text!data/country_data.json'
],

function($, _, Backbone, Plumage,
    Country, CountryCollection, CountryIndex, CountryDetail, countryData) {


  var data = JSON.parse(countryData);

  return Plumage.controller.ModelController.extend({

    modelCls: Country,
    indexModelCls: CountryCollection,

    indexViewCls: CountryIndex,
    detailViewCls: CountryDetail,

    showDetail: function(name, params){

      var attributes = _.find(data, function(country) {
        return country.name === name;
      });

      var model = this.createDetailModel(name, attributes, params);
      model.onLoad();

      this.showDetailModel(model);
    },

    createIndexModel: function(options, params) {
      var collection =  new CountryCollection(data, {meta: params, processInMemory: true});
      collection.onLoad();
      collection.on('change', this.onIndexChange.bind(this));
      return collection;
    },

    // No server so don't actually load anything.
    loadModel: function(model) {
      model.onLoad();
    }
  });
});