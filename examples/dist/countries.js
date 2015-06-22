webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/*jshint -W020 */
	
	theApp = null;
	
	var $ = __webpack_require__(1);
	
	var Backbone = __webpack_require__(2);
	var Plumage = __webpack_require__(4);
	var CountriesRouter = __webpack_require__(213);
	var CountryController = __webpack_require__(214);
	
	Backbone.$ = $;
	
	
	$(function() {
	  theApp = new Plumage.App();
	
	
	  var isStatic = Boolean(window.isStatic);
	  var rootUrl = '/examples/countries.html';
	  var controllers = {
	    'countryController': new CountryController(theApp)
	  };
	
	
	  window.router = new CountriesRouter({
	    app: theApp,
	    controllers: controllers,
	    rootUrl: rootUrl,
	    defaultUrl: rootUrl,
	    pushState: !Boolean(window.isStatic)
	  });
	  window.router.start();
	});


/***/ },

/***/ 213:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(3), __webpack_require__(2), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage) {
	
	  return Plumage.Router.extend({
	
	    controllerRoutes: [
	      ['', {controller: 'countryController', method: 'showIndex'}],
	      [':id', {controller: 'countryController', method: 'showDetail'}]
	    ]
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },

/***/ 214:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1), __webpack_require__(3), __webpack_require__(2), __webpack_require__(4),
	  __webpack_require__(215),
	  __webpack_require__(217),
	  __webpack_require__(218),
	  __webpack_require__(222),
	  __webpack_require__(228)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage,
	    Country, CountryCollection, CountryIndex, CountryDetail, countryData) {
	
	  return Plumage.controller.ModelController.extend({
	
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },

/***/ 218:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(219),
	  __webpack_require__(220),
	  __webpack_require__(221)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, Backbone, Plumage, CountryGrid, CountryFilterView, template) {
	
	  return Plumage.view.controller.IndexView.extend({
	
	    template: template,
	
	    gridViewCls: CountryGrid,
	    filterViewCls: CountryFilterView
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },

/***/ 219:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(217)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, Backbone, Plumage, CountryCollection) {
	
	  function capitalFormatter(row, cell, value, columnDef, dataContext) {
	    var capital = dataContext.getRelated('capital');
	    if (capital) {
	      return capital.get('accentcity');
	    }
	  }
	
	  return Plumage.view.grid.GridView.extend({
	
	    modelCls: CountryCollection,
	
	    infiniteScroll: false,
	
	    columns: [
	      {id: 'name', name: 'Name', field: 'name', sortable: true},
	      {id: 'region', name: 'Region', field: 'region', sortable: true},
	      {id: 'capital', name: 'Capital', field: 'capital', sortable: true, formatter: capitalFormatter},
	      {id: 'population', name: 'Population', field: 'population', sortable: true, cssClass: 'number', defaultSortAsc: false}
	    ],
	
	    gridOptions: {
	      enableColumnReorder: false,
	      forceFitColumns: true
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },

/***/ 220:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(2),
	  __webpack_require__(4),
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, Backbone, Plumage) {
	
	
	  return Plumage.view.grid.FilterView.extend({
	
	    tagName: 'form',
	
	    className: 'form-inline',
	
	    filterConfigs: [
	      {
	        placeholder: 'Name',
	        filterKey: 'name'
	      },
	      {
	        placeholder: 'Region',
	        filterKey: 'region'
	      }
	    ],
	
	    showSearch: true,
	
	    searchEmptyText: 'Search'
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },

/***/ 221:
/***/ function(module, exports) {

	module.exports = "<div class=\"container\">\n<div class=\"filter-view\"></div>\n<div class=\"grid-view\"></div>\n\n</div>"

/***/ },

/***/ 222:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(223),
	  __webpack_require__(224),
	  __webpack_require__(226),
	  __webpack_require__(227)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, Backbone, Plumage, CountryFields, CityDetail, LanguagesView, template) {
	
	  return Plumage.view.ModelView.extend({
	
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },

/***/ 223:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(2),
	  __webpack_require__(4)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, Backbone, Plumage) {
	
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },

/***/ 224:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(225)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, Backbone, Plumage, template) {
	
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },

/***/ 225:
/***/ function(module, exports) {

	module.exports = "\n<h4> Capital City - {{accentcity}}</h4>\n\n<div class=\"fields form-horizontal country-section\"></div>\n\n"

/***/ },

/***/ 226:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(2),
	  __webpack_require__(4)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, Backbone, Plumage) {
	
	  return Plumage.view.CollectionView.extend({
	
	    template: '<h4>Languages</h4><ul class="items"></ul>',
	
	    itemViewCls: Plumage.view.ModelView,
	    itemOptions: {
	      template: 'Name: {{name}}'
	    },
	
	    initialize: function() {
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },

/***/ 227:
/***/ function(module, exports) {

	module.exports = "<div class=\"container\">\n\n  <div class=\"row\">\n    <header class=\"span12\">\n      <div class=\"title-wrap\">\n        <div class=\"title-left\">\n          <div class=\"title\"></div>\n          <div class=\"subtitle\"></div>\n          <div class=\"clear\"></div>\n        </div>\n      </div>\n    </header>\n  </div>\n  <div class=\"row\">\n    <div class=\"fields country-section span4\"></div>\n    <div class=\"span4\">\n      <div class=\"capital\"></div>\n      <div class=\"languages\"></div>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"span12\">\n      <a href=\"/\">&larr; Back to Countries</a>\n    </div>\n  </div>\n</div>\n"

/***/ }

});
//# sourceMappingURL=countries.js.map