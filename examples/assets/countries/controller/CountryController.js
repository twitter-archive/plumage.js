/* globals $, _ */
var Plumage = require('plumage');

var Country = require('example/model/Country');
var CountryCollection = require('example/collection/CountryCollection');
var CountryIndex = require('countries/view/country/CountryIndex');
var CountryDetail = require('countries/view/country/CountryDetail');
var countryData = require('data/country_data.json');

module.exports = Plumage.controller.ModelController.extend({

  name: 'CountryController',

  modelCls: Country,
  indexModelCls: CountryCollection,

  indexViewCls: CountryIndex,
  detailViewCls: CountryDetail,

  showDetail: function(name, params){

    var attributes = _.find(countryData, function(country) {
      return country.name === name;
    });

    var model = this.createDetailModel(name, attributes, params);
    model.onLoad();

    this.showDetailModel(model);
  },

  createIndexModel: function(options, params) {
    var collection =  new CountryCollection(countryData, {meta: params, processInMemory: true});
    collection.onLoad();
    collection.on('change', this.onIndexChange.bind(this));
    return collection;
  },

  // No server so don't actually load anything.
  loadModel: function(model) {
    model.onLoad();
    return $.Deferred().resolve(model).promise();
  }
});