/* global $, _ */
var Plumage = require('plumage');
var BaseExample = require('kitchen_sink/view/example/BaseExample');
var AsyncModelMixin = require('example/model/AsyncModelMixin');

var CountryCollection = require('example/collection/CountryCollection');

var template = require('kitchen_sink/view/example/grid/templates/InfiniteScroll.html');
var countryData = require('data/country_data.json');

module.exports = BaseExample.extend({

  modelCls: CountryCollection,

  template: template,

  subViews: [{
    viewCls: Plumage.view.grid.GridView,
    name: 'grid',
    selector: '.grid-view',
    columns: [
      {id: 'name', name: 'Name', field: 'name', sortable: true},
      {id: 'region', name: 'Region', field: 'region', sortable: true},
      {id: 'population', name: 'Population', field: 'population', sortable: true, cssClass: 'number', defaultSortAsc: false}
    ],
    gridOptions: {
      forceFitColumns: true
    }
  }],

  initialize:function(options) {
    BaseExample.prototype.initialize.apply(this, arguments);
    var me = this;
    me.log = '';

    var model = new (CountryCollection.extend(AsyncModelMixin))();
    model.set('pageSize', 20);

    model.ajaxResponse = function(method, model, options){
      var page = options.data.page,
        pageSize = options.data.pageSize;
      me.log += 'requested page ' + options.data.page + '\n';
      me.$('.request-log').html(me.log);
      return {
        meta: _.extend({}, options.data, {success: true, total: countryData.length}),
        results: countryData.slice(page*pageSize, (page+1)*pageSize)
      };
    };
    this.getSubView('grid').setModel(model);
    model.load();
  },

  onRender: function() {
    BaseExample.prototype.onRender.apply(this, arguments);
    this.$('.request-log').html(this.log);
  }
});