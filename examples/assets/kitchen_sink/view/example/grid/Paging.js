define([
  'jquery',
  'underscore',
  'backbone',
  'plumage',
  'kitchen_sink/view/example/BaseExample',
  'example/model/AsyncModelMixin',
  'example/collection/CountryCollection',
  'text!kitchen_sink/view/example/grid/templates/Paging.html',
  'text!data/country_data.json'
], function($, _, Backbone, Plumage, BaseExample, AsyncModelMixin, CountryCollection, template, countryData) {

  countryData = JSON.parse(countryData);

  return BaseExample.extend({

    modelCls: CountryCollection,

    template: template,

    subViews: [{
      viewCls: Plumage.view.grid.GridView,
      name: 'grid',
      selector: '.grid-view',
      infiniteScroll: false,
      showPaging: true,
      columns: [
        {id: 'name', name: 'Name', field: 'name', sortable: true},
        {id: 'region', name: 'Region', field: 'region', sortable: true},
        {id: 'population', name: 'Population', field: 'population', sortable: true, cssClass: 'number', defaultSortAsc: false}
      ],
      gridOptions: {
        forceFitColumns: true
      }
    }, {
      viewCls: Plumage.view.grid.Pager,
      selector: '.grid-pager'
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
      this.setModel(model);
      model.load();
    },

    onRender: function() {
      BaseExample.prototype.onRender.apply(this, arguments);
      this.$('.request-log').html(this.log);
    }
  });
});