webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint -W020 */
	
	theApp = null;
	
	var $ = __webpack_require__(1);
	
	var Backbone = __webpack_require__(2);
	var Plumage = __webpack_require__(4);
	var KitchenSinkRouter = __webpack_require__(229);
	var KitchenSinkNavView = __webpack_require__(230);
	var KitchenSinkController = __webpack_require__(231);
	
	Backbone.$ = $;
	
	
	$(function() {
	  var navView = new KitchenSinkNavView();
	  theApp = new Plumage.App({
	    navView: navView
	  });
	
	  var controllers = {
	    'kitchenSinkController': new KitchenSinkController(theApp)
	  };
	
	  $('#nav').html(navView.render().el);
	
	  var isStatic = Boolean(window.isStatic);
	  var rootUrl = '/examples/kitchen_sink.html';
	
	  window.router = new KitchenSinkRouter({
	    app: theApp,
	    controllers: controllers,
	    defaultUrl: rootUrl,
	    rootUrl: rootUrl,
	    pushState: !Boolean(window.isStatic)
	  });
	  window.router.start();
	});


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */,
/* 176 */,
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */,
/* 186 */,
/* 187 */,
/* 188 */,
/* 189 */,
/* 190 */,
/* 191 */,
/* 192 */,
/* 193 */,
/* 194 */,
/* 195 */,
/* 196 */,
/* 197 */,
/* 198 */,
/* 199 */,
/* 200 */,
/* 201 */,
/* 202 */,
/* 203 */,
/* 204 */,
/* 205 */,
/* 206 */,
/* 207 */,
/* 208 */,
/* 209 */,
/* 210 */,
/* 211 */,
/* 212 */,
/* 213 */,
/* 214 */,
/* 215 */,
/* 216 */,
/* 217 */,
/* 218 */,
/* 219 */,
/* 220 */,
/* 221 */,
/* 222 */,
/* 223 */,
/* 224 */,
/* 225 */,
/* 226 */,
/* 227 */,
/* 228 */,
/* 229 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(3), __webpack_require__(2), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage) {
	  return Plumage.Router.extend({
	    controllerRoutes: [
	      ['', {controller: 'kitchenSinkController', method: 'home'}],
	      [':section', {controller: 'kitchenSinkController', method: 'showSection'}],
	      [':section/:example', {controller: 'kitchenSinkController', method: 'showSectionWithExample'}]
	    ]
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 230 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(4),
	  __webpack_require__(110)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, Backbone, Handlebars, Plumage) {
	
	  return Plumage.view.NavView.extend({
	
	    title: 'PlumageJS',
	    titleUrl: '/plumage.js',
	    subtitle: 'Kitchen Sink Example - note: slow load due to unconcatenated source',
	
	    userMenuItems: undefined,
	
	    showSearch: false,
	
	    navItems: [
	      {id: 'grid', label: 'Models', url: 'model', className: 'model-menu'},
	      {id: 'grid', label: 'Views', url: 'view', className: 'view-menu'},
	      {id: 'grid', label: 'Grids', url: 'grid', className: 'grid-menu'},
	      {id: 'form', label: 'Forms', url: 'form', className: 'form-menu'},
	    ],
	
	    onNavClick: function(e) {
	      var a = $(e.target), li = $(a.parent());
	      e.preventDefault();
	
	      window.router.navigate(a.attr('href'), {trigger:true});
	    },
	
	    onLinkClick: function(e) {
	      //do nothing to allow out link
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 231 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(232),
	  __webpack_require__(242),
	  __webpack_require__(315)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage, ExampleSectionView, ExampleSection, examples) {
	
	  return Plumage.controller.BaseController.extend({
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 232 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(4),
	  __webpack_require__(233),
	  __webpack_require__(239),
	  __webpack_require__(240)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Handlebars, Plumage, ExampleWithSourceView, template) {
	
	  return Plumage.view.ModelView.extend({
	    className: 'example-section-view',
	
	    template: template,
	
	    events: {
	      'scroll': 'onScroll'
	    },
	
	    subViews: [{
	      viewCls: Plumage.view.ListView,
	      name: 'navListView',
	      selector: '.example-list',
	      relationship: 'examples',
	      selectionAttr: 'example',
	      itemOptions: {template: '{{title}} <i class="icon-chevron-right"></i>'}
	    }, {
	      viewCls: Plumage.view.CollectionView,
	      name: 'examplesView',
	      selector: '.examples',
	      relationship: 'examples',
	      itemViewCls: ExampleWithSourceView
	    }],
	
	    initialize:function(options) {
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	
	      this.getSubView('examplesView').on('itemRender', this.onItemRender.bind(this));
	    },
	
	    /**
	     * overrides
	     */
	
	    onRender: function() {
	      Plumage.view.ModelView.prototype.onRender.apply(this, arguments);
	    },
	
	    setModel: function(rootModel) {
	      Plumage.view.ModelView.prototype.setModel.apply(this, arguments);
	      this.currentExample = this.model.get('example');
	      this.getSubView('navListView').setSelectionModel(this.model);
	      this.updateSelected();
	      this.$el.scrollTop(0);
	    },
	
	    update: function() {
	      // do nothing
	    },
	
	    /**
	     * Helpers
	     */
	
	    updateScroll: function() {
	      var exampleId = this.model.get('example');
	      if (exampleId) {
	        var itemView = this.getSubView('examplesView').getItemView(exampleId);
	        if (itemView) {
	          this.scrolling = true;
	          this.$el.scrollTo(itemView.el);
	          this.scrolling = false;
	        }
	      }
	    },
	
	    updateSelected: function() {
	      if (this.scrolling) {
	        return;
	      }
	      var scrollTop = this.$el.scrollTop(),
	        top = this.$el.offset().top,
	        height = this.$el.height(),
	        scrollHeight = this.$el[0].scrollHeight,
	        maxScroll = scrollHeight - height;
	
	      var examplesView = this.getSubView('examplesView');
	      for ( var i = 0; i < examplesView.itemViews.length; i++) {
	        var itemView = examplesView.itemViews[i];
	        if (itemView.$el.offset().top + itemView.$el.height() - top > height/2) {
	          this.currentExample = itemView.model.get('name');
	          this.model.set('example', this.currentExample);
	          itemView.model.updateUrl();
	          break;
	        }
	      }
	    },
	
	    /**
	     * Event Handlers
	     */
	
	    onScroll: function(event) {
	      this.updateSelected();
	    },
	
	    onModelChange: function(event) {
	      if (event.changed.example !== undefined) {
	        var exampleName = this.model.get('example');
	        if (this.currentExample !== exampleName) {
	          this.currentExample = exampleName;
	          this.updateScroll();
	        }
	      }
	    },
	
	    onItemRender: _.debounce(function() {
	      this.updateScroll();
	    }, 300)
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 233 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(4),
	  __webpack_require__(234),
	  __webpack_require__(235),
	  __webpack_require__(238)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Handlebars, Plumage, ExampleView, SourceView, template) {
	
	  return Plumage.view.ModelView.extend({
	    className: 'example-with-source',
	
	    template: template,
	
	    initialize: function() {
	      this.subViews = [
	        new Plumage.view.TabView({
	          selector: '.example-tabs',
	          className: 'tab-view tab-theme',
	          subViews: [
	            new ExampleView({tabId: 'page', tabLabel: 'Page'}),
	            new SourceView({tabId: 'source', tabLabel: 'Source', sourceType: 'js', suffix: 'js'}),
	            new SourceView({tabId: 'html', tabLabel: 'HTML', sourceType: 'html', suffix: 'html'})
	          ]
	        })
	      ];
	
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	    },
	
	    onRender: function() {
	      if (this.model) {
	        var name = this.model.get('name');
	        Plumage.view.ModelView.prototype.onRender.apply(this, arguments);
	      }
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 234 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(4)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Handlebars, Plumage) {
	
	  return Plumage.view.ModelView.extend({
	    className: 'example-view',
	
	    template: '<div class="the-example"></div>',
	
	    updateOnChange: false,
	
	    initialize: function() {
	      this.subViews = [];
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	    },
	
	    onModelLoad: function() {
	      var viewCls = this.model.getViewCls();
	      if (viewCls) {
	        this.subViews = _.without(this.subViews, this.example);
	        this.example = new viewCls({selector: '.the-example'});
	        this.subViews.push(this.example);
	        this.update();
	      }
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 235 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(236),
	  __webpack_require__(4),
	  __webpack_require__(237)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Handlebars, hljs, Plumage, template) {
	
	  return Plumage.view.ModelView.extend({
	    className: 'example-source',
	
	    template: template,
	
	    deferRender: true,
	
	    sourceType: 'js',
	
	    getTemplateData: function(){
	      var data = Plumage.view.ModelView.prototype.getTemplateData.apply(this, arguments);
	
	      if (this.sourceType === 'js') {
	        data.source = this.model.getJsSource();
	      } else {
	        data.source = this.model.getHtmlSource();
	      }
	
	      if (data.source) {
	        data.source = hljs.highlightAuto(data.source, ['javascript', 'html']).value;
	      }
	      data.title = this.getTitle();
	      return data;
	    },
	
	    getTitle: function() {
	      return this.model.get('name') + '.' + this.suffix;
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

	!function(e){true?e(exports):(window.hljs=e({}),"function"==typeof define&&define.amd&&define("hljs",[],function(){return window.hljs}))}(function(e){function t(e){return e.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function r(e){return e.nodeName.toLowerCase()}function n(e,t){var r=e&&e.exec(t);return r&&0==r.index}function a(e){return/no-?highlight|plain|text/.test(e)}function s(e){var t,r,n,s=e.className+" ";if(s+=e.parentNode?e.parentNode.className:"",r=/\blang(?:uage)?-([\w-]+)\b/.exec(s))return N(r[1])?r[1]:"no-highlight";for(s=s.split(/\s+/),t=0,n=s.length;n>t;t++)if(N(s[t])||a(s[t]))return s[t]}function i(e,t){var r,n={};for(r in e)n[r]=e[r];if(t)for(r in t)n[r]=t[r];return n}function c(e){var t=[];return function n(e,a){for(var s=e.firstChild;s;s=s.nextSibling)3==s.nodeType?a+=s.nodeValue.length:1==s.nodeType&&(t.push({event:"start",offset:a,node:s}),a=n(s,a),r(s).match(/br|hr|img|input/)||t.push({event:"stop",offset:a,node:s}));return a}(e,0),t}function o(e,n,a){function s(){return e.length&&n.length?e[0].offset!=n[0].offset?e[0].offset<n[0].offset?e:n:"start"==n[0].event?e:n:e.length?e:n}function i(e){function n(e){return" "+e.nodeName+'="'+t(e.value)+'"'}u+="<"+r(e)+Array.prototype.map.call(e.attributes,n).join("")+">"}function c(e){u+="</"+r(e)+">"}function o(e){("start"==e.event?i:c)(e.node)}for(var l=0,u="",d=[];e.length||n.length;){var b=s();if(u+=t(a.substr(l,b[0].offset-l)),l=b[0].offset,b==e){d.reverse().forEach(c);do o(b.splice(0,1)[0]),b=s();while(b==e&&b.length&&b[0].offset==l);d.reverse().forEach(i)}else"start"==b[0].event?d.push(b[0].node):d.pop(),o(b.splice(0,1)[0])}return u+t(a.substr(l))}function l(e){function t(e){return e&&e.source||e}function r(r,n){return new RegExp(t(r),"m"+(e.cI?"i":"")+(n?"g":""))}function n(a,s){if(!a.compiled){if(a.compiled=!0,a.k=a.k||a.bK,a.k){var c={},o=function(t,r){e.cI&&(r=r.toLowerCase()),r.split(" ").forEach(function(e){var r=e.split("|");c[r[0]]=[t,r[1]?Number(r[1]):1]})};"string"==typeof a.k?o("keyword",a.k):Object.keys(a.k).forEach(function(e){o(e,a.k[e])}),a.k=c}a.lR=r(a.l||/\b\w+\b/,!0),s&&(a.bK&&(a.b="\\b("+a.bK.split(" ").join("|")+")\\b"),a.b||(a.b=/\B|\b/),a.bR=r(a.b),a.e||a.eW||(a.e=/\B|\b/),a.e&&(a.eR=r(a.e)),a.tE=t(a.e)||"",a.eW&&s.tE&&(a.tE+=(a.e?"|":"")+s.tE)),a.i&&(a.iR=r(a.i)),void 0===a.r&&(a.r=1),a.c||(a.c=[]);var l=[];a.c.forEach(function(e){e.v?e.v.forEach(function(t){l.push(i(e,t))}):l.push("self"==e?a:e)}),a.c=l,a.c.forEach(function(e){n(e,a)}),a.starts&&n(a.starts,s);var u=a.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([a.tE,a.i]).map(t).filter(Boolean);a.t=u.length?r(u.join("|"),!0):{exec:function(){return null}}}}n(e)}function u(e,r,a,s){function i(e,t){for(var r=0;r<t.c.length;r++)if(n(t.c[r].bR,e))return t.c[r]}function c(e,t){if(n(e.eR,t)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?c(e.parent,t):void 0}function o(e,t){return!a&&n(t.iR,e)}function b(e,t){var r=v.cI?t[0].toLowerCase():t[0];return e.k.hasOwnProperty(r)&&e.k[r]}function p(e,t,r,n){var a=n?"":w.classPrefix,s='<span class="'+a,i=r?"":"</span>";return s+=e+'">',s+t+i}function f(){if(!x.k)return t(E);var e="",r=0;x.lR.lastIndex=0;for(var n=x.lR.exec(E);n;){e+=t(E.substr(r,n.index-r));var a=b(x,n);a?(B+=a[1],e+=p(a[0],t(n[0]))):e+=t(n[0]),r=x.lR.lastIndex,n=x.lR.exec(E)}return e+t(E.substr(r))}function g(){if(x.sL&&!y[x.sL])return t(E);var e=x.sL?u(x.sL,E,!0,C[x.sL]):d(E);return x.r>0&&(B+=e.r),"continuous"==x.subLanguageMode&&(C[x.sL]=e.top),p(e.language,e.value,!1,!0)}function m(){return void 0!==x.sL?g():f()}function h(e,r){var n=e.cN?p(e.cN,"",!0):"";e.rB?(M+=n,E=""):e.eB?(M+=t(r)+n,E=""):(M+=n,E=r),x=Object.create(e,{parent:{value:x}})}function _(e,r){if(E+=e,void 0===r)return M+=m(),0;var n=i(r,x);if(n)return M+=m(),h(n,r),n.rB?0:r.length;var a=c(x,r);if(a){var s=x;s.rE||s.eE||(E+=r),M+=m();do x.cN&&(M+="</span>"),B+=x.r,x=x.parent;while(x!=a.parent);return s.eE&&(M+=t(r)),E="",a.starts&&h(a.starts,""),s.rE?0:r.length}if(o(r,x))throw new Error('Illegal lexeme "'+r+'" for mode "'+(x.cN||"<unnamed>")+'"');return E+=r,r.length||1}var v=N(e);if(!v)throw new Error('Unknown language: "'+e+'"');l(v);var k,x=s||v,C={},M="";for(k=x;k!=v;k=k.parent)k.cN&&(M=p(k.cN,"",!0)+M);var E="",B=0;try{for(var L,$,A=0;;){if(x.t.lastIndex=A,L=x.t.exec(r),!L)break;$=_(r.substr(A,L.index-A),L[0]),A=L.index+$}for(_(r.substr(A)),k=x;k.parent;k=k.parent)k.cN&&(M+="</span>");return{r:B,value:M,language:e,top:x}}catch(R){if(-1!=R.message.indexOf("Illegal"))return{r:0,value:t(r)};throw R}}function d(e,r){r=r||w.languages||Object.keys(y);var n={r:0,value:t(e)},a=n;return r.forEach(function(t){if(N(t)){var r=u(t,e,!1);r.language=t,r.r>a.r&&(a=r),r.r>n.r&&(a=n,n=r)}}),a.language&&(n.second_best=a),n}function b(e){return w.tabReplace&&(e=e.replace(/^((<[^>]+>|\t)+)/gm,function(e,t){return t.replace(/\t/g,w.tabReplace)})),w.useBR&&(e=e.replace(/\n/g,"<br>")),e}function p(e,t,r){var n=t?k[t]:r,a=[e.trim()];return e.match(/\bhljs\b/)||a.push("hljs"),-1===e.indexOf(n)&&a.push(n),a.join(" ").trim()}function f(e){var t=s(e);if(!a(t)){var r;w.useBR?(r=document.createElementNS("http://www.w3.org/1999/xhtml","div"),r.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):r=e;var n=r.textContent,i=t?u(t,n,!0):d(n),l=c(r);if(l.length){var f=document.createElementNS("http://www.w3.org/1999/xhtml","div");f.innerHTML=i.value,i.value=o(l,c(f),n)}i.value=b(i.value),e.innerHTML=i.value,e.className=p(e.className,t,i.language),e.result={language:i.language,re:i.r},i.second_best&&(e.second_best={language:i.second_best.language,re:i.second_best.r})}}function g(e){w=i(w,e)}function m(){if(!m.called){m.called=!0;var e=document.querySelectorAll("pre code");Array.prototype.forEach.call(e,f)}}function h(){addEventListener("DOMContentLoaded",m,!1),addEventListener("load",m,!1)}function _(t,r){var n=y[t]=r(e);n.aliases&&n.aliases.forEach(function(e){k[e]=t})}function v(){return Object.keys(y)}function N(e){return y[e]||y[k[e]]}var w={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},y={},k={};return e.highlight=u,e.highlightAuto=d,e.fixMarkup=b,e.highlightBlock=f,e.configure=g,e.initHighlighting=m,e.initHighlightingOnLoad=h,e.registerLanguage=_,e.listLanguages=v,e.getLanguage=N,e.inherit=i,e.IR="[a-zA-Z]\\w*",e.UIR="[a-zA-Z_]\\w*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="\\b(0[xX][a-fA-F0-9]+|(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/},e.C=function(t,r,n){var a=e.inherit({cN:"comment",b:t,e:r,c:[]},n||{});return a.c.push(e.PWM),a.c.push({cN:"doctag",bK:"TODO FIXME NOTE BUG XXX",r:0}),a},e.CLCM=e.C("//","$"),e.CBCM=e.C("/\\*","\\*/"),e.HCM=e.C("#","$"),e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e.registerLanguage("apache",function(e){var t={cN:"number",b:"[\\$%]\\d+"};return{aliases:["apacheconf"],cI:!0,c:[e.HCM,{cN:"tag",b:"</?",e:">"},{cN:"keyword",b:/\w+/,r:0,k:{common:"order deny allow setenv rewriterule rewriteengine rewritecond documentroot sethandler errordocument loadmodule options header listen serverroot servername"},starts:{e:/$/,r:0,k:{literal:"on off all"},c:[{cN:"sqbracket",b:"\\s\\[",e:"\\]$"},{cN:"cbracket",b:"[\\$%]\\{",e:"\\}",c:["self",t]},t,e.QSM]}}],i:/\S/}}),e.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},r={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]},n={cN:"string",b:/'/,e:/'/};return{aliases:["sh","zsh"],l:/-?[a-z\.]+/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",operator:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"shebang",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,e.NM,r,n,t]}}),e.registerLanguage("coffeescript",function(e){var t={keyword:"in if for while finally new do return else break catch instanceof throw try this switch continue typeof delete debugger super then unless until loop of by when and or is isnt not",literal:"true false null undefined yes no on off",reserved:"case default function var void with const let enum export import native __hasProp __extends __slice __bind __indexOf",built_in:"npm require console print module global window document"},r="[A-Za-z$_][0-9A-Za-z$_]*",n={cN:"subst",b:/#\{/,e:/}/,k:t},a=[e.BNM,e.inherit(e.CNM,{starts:{e:"(\\s*/)?",r:0}}),{cN:"string",v:[{b:/'''/,e:/'''/,c:[e.BE]},{b:/'/,e:/'/,c:[e.BE]},{b:/"""/,e:/"""/,c:[e.BE,n]},{b:/"/,e:/"/,c:[e.BE,n]}]},{cN:"regexp",v:[{b:"///",e:"///",c:[n,e.HCM]},{b:"//[gim]*",r:0},{b:/\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/}]},{cN:"property",b:"@"+r},{b:"`",e:"`",eB:!0,eE:!0,sL:"javascript"}];n.c=a;var s=e.inherit(e.TM,{b:r}),i="(\\(.*\\))?\\s*\\B[-=]>",c={cN:"params",b:"\\([^\\(]",rB:!0,c:[{b:/\(/,e:/\)/,k:t,c:["self"].concat(a)}]};return{aliases:["coffee","cson","iced"],k:t,i:/\/\*/,c:a.concat([e.C("###","###"),e.HCM,{cN:"function",b:"^\\s*"+r+"\\s*=\\s*"+i,e:"[-=]>",rB:!0,c:[s,c]},{b:/[:\(,=]\s*/,r:0,c:[{cN:"function",b:i,e:"[-=]>",rB:!0,c:[c]}]},{cN:"class",bK:"class",e:"$",i:/[:="\[\]]/,c:[{bK:"extends",eW:!0,i:/[:="\[\]]/,c:[s]},s]},{cN:"attribute",b:r+":",e:":",rB:!0,rE:!0,r:0}])}}),e.registerLanguage("cpp",function(e){var t={cN:"keyword",b:"[a-z\\d_]*_t"},r={keyword:"false int float while private char catch export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace unsigned long volatile static protected bool template mutable if public friend do goto auto void enum else break extern using true class asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue inline delete alignof constexpr decltype noexcept nullptr static_assert thread_local restrict _Bool complex _Complex _Imaginary atomic_bool atomic_char atomic_schar atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong atomic_ullong",built_in:"std string cin cout cerr clog stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf"};return{aliases:["c","cc","h","c++","h++","hpp"],k:r,i:"</",c:[t,e.CLCM,e.CBCM,{cN:"string",v:[e.inherit(e.QSM,{b:'((u8?|U)|L)?"'}),{b:'(u8?|U)?R"',e:'"',c:[e.BE]},{b:"'\\\\?.",e:"'",i:"."}]},{cN:"number",b:"\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)"},e.CNM,{cN:"preprocessor",b:"#",e:"$",k:"if else elif endif define undef warning error line pragma",c:[{b:/\\\n/,r:0},{b:'include\\s*[<"]',e:'[>"]',k:"include",i:"\\n"},e.CLCM]},{b:"\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",e:">",k:r,c:["self",t]},{b:e.IR+"::",k:r},{bK:"new throw return else",r:0},{cN:"function",b:"("+e.IR+"\\s+)+"+e.IR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:r,c:[{b:e.IR+"\\s*\\(",rB:!0,c:[e.TM],r:0},{cN:"params",b:/\(/,e:/\)/,k:r,r:0,c:[e.CBCM]},e.CLCM,e.CBCM]}]}}),e.registerLanguage("cs",function(e){var t="abstract as base bool break byte case catch char checked const continue decimal dynamic default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long null when object operator out override params private protected public readonly ref sbyte sealed short sizeof stackalloc static string struct switch this true try typeof uint ulong unchecked unsafe ushort using virtual volatile void while async protected public private internal ascending descending from get group into join let orderby partial select set value var where yield",r=e.IR+"(<"+e.IR+">)?";return{aliases:["csharp"],k:t,i:/::/,c:[e.C("///","$",{rB:!0,c:[{cN:"xmlDocTag",v:[{b:"///",r:0},{b:"<!--|-->"},{b:"</?",e:">"}]}]}),e.CLCM,e.CBCM,{cN:"preprocessor",b:"#",e:"$",k:"if else elif endif define undef warning error line region endregion pragma checksum"},{cN:"string",b:'@"',e:'"',c:[{b:'""'}]},e.ASM,e.QSM,e.CNM,{bK:"class interface",e:/[{;=]/,i:/[^\s:]/,c:[e.TM,e.CLCM,e.CBCM]},{bK:"namespace",e:/[{;=]/,i:/[^\s:]/,c:[{cN:"title",b:"[a-zA-Z](\\.?\\w)*",r:0},e.CLCM,e.CBCM]},{bK:"new return throw await",r:0},{cN:"function",b:"("+r+"\\s+)+"+e.IR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:t,c:[{b:e.IR+"\\s*\\(",rB:!0,c:[e.TM],r:0},{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,k:t,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]}]}}),e.registerLanguage("css",function(e){var t="[a-zA-Z-][a-zA-Z0-9_-]*",r={cN:"function",b:t+"\\(",rB:!0,eE:!0,e:"\\("},n={cN:"rule",b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{cN:"value",eW:!0,eE:!0,c:[r,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]};return{cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,n,{cN:"id",b:/\#[A-Za-z0-9_-]+/},{cN:"class",b:/\.[A-Za-z0-9_-]+/},{cN:"attr_selector",b:/\[/,e:/\]/,i:"$"},{cN:"pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"']+/},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[r,e.ASM,e.QSM,e.CSSNM]}]},{cN:"tag",b:t,r:0},{cN:"rules",b:"{",e:"}",i:/\S/,c:[e.CBCM,n]}]}}),e.registerLanguage("diff",function(e){return{aliases:["patch"],c:[{cN:"chunk",r:10,v:[{b:/^@@ +\-\d+,\d+ +\+\d+,\d+ +@@$/},{b:/^\*\*\* +\d+,\d+ +\*\*\*\*$/},{b:/^\-\-\- +\d+,\d+ +\-\-\-\-$/}]},{cN:"header",v:[{b:/Index: /,e:/$/},{b:/=====/,e:/=====$/},{b:/^\-\-\-/,e:/$/},{b:/^\*{3} /,e:/$/},{b:/^\+\+\+/,e:/$/},{b:/\*{5}/,e:/\*{5}$/}]},{cN:"addition",b:"^\\+",e:"$"},{cN:"deletion",b:"^\\-",e:"$"},{cN:"change",b:"^\\!",e:"$"}]}}),e.registerLanguage("http",function(e){return{aliases:["https"],i:"\\S",c:[{cN:"status",b:"^HTTP/[0-9\\.]+",e:"$",c:[{cN:"number",b:"\\b\\d{3}\\b"}]},{cN:"request",b:"^[A-Z]+ (.*?) HTTP/[0-9\\.]+$",rB:!0,e:"$",c:[{cN:"string",b:" ",e:" ",eB:!0,eE:!0}]},{cN:"attribute",b:"^\\w",e:": ",eE:!0,i:"\\n|\\s|=",starts:{cN:"string",e:"$"}},{b:"\\n\\n",starts:{sL:"",eW:!0}}]}}),e.registerLanguage("ini",function(e){return{cI:!0,i:/\S/,c:[e.C(";","$"),{cN:"title",b:"^\\[",e:"\\]"},{cN:"setting",b:"^[a-z0-9\\[\\]_-]+[ \\t]*=[ \\t]*",e:"$",c:[{cN:"value",eW:!0,k:"on off true false yes no",c:[e.QSM,e.NM],r:0}]}]}}),e.registerLanguage("java",function(e){var t=e.UIR+"(<"+e.UIR+">)?",r="false synchronized int abstract float private char boolean static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private",n="\\b(0[bB]([01]+[01_]+[01]+|[01]+)|0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)|(([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?|\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))([eE][-+]?\\d+)?)[lLfF]?",a={cN:"number",b:n,r:0};return{aliases:["jsp"],k:r,i:/<\//,c:[e.C("/\\*\\*","\\*/",{r:0,c:[{cN:"doctag",b:"@[A-Za-z]+"}]}),e.CLCM,e.CBCM,e.ASM,e.QSM,{cN:"class",bK:"class interface",e:/[{;=]/,eE:!0,k:"class interface",i:/[:"\[\]]/,c:[{bK:"extends implements"},e.UTM]},{bK:"new throw return else",r:0},{cN:"function",b:"("+t+"\\s+)+"+e.UIR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:r,c:[{b:e.UIR+"\\s*\\(",rB:!0,r:0,c:[e.UTM]},{cN:"params",b:/\(/,e:/\)/,k:r,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]},a,{cN:"annotation",b:"@[A-Za-z]+"}]}}),e.registerLanguage("javascript",function(e){return{aliases:["js"],k:{keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},c:[{cN:"pi",r:10,b:/^\s*['"]use (strict|asm)['"]/},e.ASM,e.QSM,{cN:"string",b:"`",e:"`",c:[e.BE,{cN:"subst",b:"\\$\\{",e:"\\}"}]},e.CLCM,e.CBCM,{cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{b:/</,e:/>\s*[);\]]/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:[e.CLCM,e.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+e.IR,r:0},{bK:"import",e:"[;$]",k:"import from as",c:[e.ASM,e.QSM]},{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]}]}}),e.registerLanguage("json",function(e){var t={literal:"true false null"},r=[e.QSM,e.CNM],n={cN:"value",e:",",eW:!0,eE:!0,c:r,k:t},a={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:!0,eE:!0,c:[e.BE],i:"\\n",starts:n}],i:"\\S"},s={b:"\\[",e:"\\]",c:[e.inherit(n,{cN:null})],i:"\\S"};return r.splice(r.length,0,a,s),{c:r,k:t,i:"\\S"}}),e.registerLanguage("makefile",function(e){var t={cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]};return{aliases:["mk","mak"],c:[e.HCM,{b:/^\w+\s*\W*=/,rB:!0,r:0,starts:{cN:"constant",e:/\s*\W*=/,eE:!0,starts:{e:/$/,r:0,c:[t]}}},{cN:"title",b:/^[\w]+:\s*$/},{cN:"phony",b:/^\.PHONY:/,e:/$/,k:".PHONY",l:/[\.\w]+/},{b:/^\t+/,e:/$/,r:0,c:[e.QSM,t]}]}}),e.registerLanguage("xml",function(e){var t="[A-Za-z0-9\\._:-]+",r={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"},n={eW:!0,i:/</,r:0,c:[r,{cN:"attribute",b:t,r:0},{b:"=",r:0,c:[{cN:"value",c:[r],v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:!0,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},e.C("<!--","-->",{r:10}),{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[n],starts:{e:"</style>",rE:!0,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[n],starts:{e:"</script>",rE:!0,sL:""}},r,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:/[^ \/><\n\t]+/,r:0},n]}]}}),e.registerLanguage("markdown",function(e){return{aliases:["md","mkdown","mkd"],c:[{cN:"header",v:[{b:"^#{1,6}",e:"$"},{b:"^.+?\\n[=-]{2,}$"}]},{b:"<",e:">",sL:"xml",r:0},{cN:"bullet",b:"^([*+-]|(\\d+\\.))\\s+"},{cN:"strong",b:"[*_]{2}.+?[*_]{2}"},{cN:"emphasis",v:[{b:"\\*.+?\\*"},{b:"_.+?_",r:0}]},{cN:"blockquote",b:"^>\\s+",e:"$"},{cN:"code",v:[{b:"`.+?`"},{b:"^( {4}|	)",e:"$",r:0}]},{cN:"horizontal_rule",b:"^[-\\*]{3,}",e:"$"},{b:"\\[.+?\\][\\(\\[].*?[\\)\\]]",rB:!0,c:[{cN:"link_label",b:"\\[",e:"\\]",eB:!0,rE:!0,r:0},{cN:"link_url",b:"\\]\\(",e:"\\)",eB:!0,eE:!0},{cN:"link_reference",b:"\\]\\[",e:"\\]",eB:!0,eE:!0}],r:10},{b:"^\\[.+\\]:",rB:!0,c:[{cN:"link_reference",b:"\\[",e:"\\]:",eB:!0,eE:!0,starts:{cN:"link_url",e:"$"}}]}]}}),e.registerLanguage("nginx",function(e){var t={cN:"variable",v:[{b:/\$\d+/},{b:/\$\{/,e:/}/},{b:"[\\$\\@]"+e.UIR}]},r={eW:!0,l:"[a-z/_]+",k:{built_in:"on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll"},r:0,i:"=>",c:[e.HCM,{cN:"string",c:[e.BE,t],v:[{b:/"/,e:/"/},{b:/'/,e:/'/}]},{cN:"url",b:"([a-z]+):/",e:"\\s",eW:!0,eE:!0,c:[t]},{cN:"regexp",c:[e.BE,t],v:[{b:"\\s\\^",e:"\\s|{|;",rE:!0},{b:"~\\*?\\s+",e:"\\s|{|;",rE:!0},{b:"\\*(\\.[a-z\\-]+)+"},{b:"([a-z\\-]+\\.)+\\*"}]},{cN:"number",b:"\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"},{cN:"number",b:"\\b\\d+[kKmMgGdshdwy]*\\b",r:0},t]};return{aliases:["nginxconf"],c:[e.HCM,{b:e.UIR+"\\s",e:";|{",rB:!0,c:[{cN:"title",b:e.UIR,starts:r}],r:0}],i:"[^\\s\\}]"}}),e.registerLanguage("objectivec",function(e){var t={cN:"built_in",b:"(AV|CA|CF|CG|CI|MK|MP|NS|UI)\\w+"},r={keyword:"int float while char export sizeof typedef const struct for union unsigned long volatile static bool mutable if do return goto void enum else break extern asm case short default double register explicit signed typename this switch continue wchar_t inline readonly assign readwrite self @synchronized id typeof nonatomic super unichar IBOutlet IBAction strong weak copy in out inout bycopy byref oneway __strong __weak __block __autoreleasing @private @protected @public @try @property @end @throw @catch @finally @autoreleasepool @synthesize @dynamic @selector @optional @required",literal:"false true FALSE TRUE nil YES NO NULL",built_in:"BOOL dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once"},n=/[a-zA-Z@][a-zA-Z0-9_]*/,a="@interface @class @protocol @implementation";return{aliases:["mm","objc","obj-c"],k:r,l:n,i:"</",c:[t,e.CLCM,e.CBCM,e.CNM,e.QSM,{cN:"string",v:[{b:'@"',e:'"',i:"\\n",c:[e.BE]},{b:"'",e:"[^\\\\]'",i:"[^\\\\][^']"}]},{cN:"preprocessor",b:"#",e:"$",c:[{cN:"title",v:[{b:'"',e:'"'},{b:"<",e:">"}]}]},{cN:"class",b:"("+a.split(" ").join("|")+")\\b",e:"({|$)",eE:!0,k:a,l:n,c:[e.UTM]},{cN:"variable",b:"\\."+e.UIR,r:0}]}}),e.registerLanguage("perl",function(e){var t="getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when",r={cN:"subst",b:"[$@]\\{",e:"\\}",k:t},n={b:"->{",e:"}"},a={cN:"variable",v:[{b:/\$\d/},{b:/[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/},{b:/[\$%@][^\s\w{]/,r:0}]},s=e.C("^(__END__|__DATA__)","\\n$",{r:5}),i=[e.BE,r,a],c=[a,e.HCM,s,e.C("^\\=\\w","\\=cut",{eW:!0}),n,{cN:"string",c:i,v:[{b:"q[qwxr]?\\s*\\(",e:"\\)",r:5},{b:"q[qwxr]?\\s*\\[",e:"\\]",r:5},{b:"q[qwxr]?\\s*\\{",e:"\\}",r:5},{b:"q[qwxr]?\\s*\\|",e:"\\|",r:5},{b:"q[qwxr]?\\s*\\<",e:"\\>",r:5},{b:"qw\\s+q",e:"q",r:5},{b:"'",e:"'",c:[e.BE]},{b:'"',e:'"'},{b:"`",e:"`",c:[e.BE]},{b:"{\\w+}",c:[],r:0},{b:"-?\\w+\\s*\\=\\>",c:[],r:0}]},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{b:"(\\/\\/|"+e.RSR+"|\\b(split|return|print|reverse|grep)\\b)\\s*",k:"split return print reverse grep",r:0,c:[e.HCM,s,{cN:"regexp",b:"(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*",r:10},{cN:"regexp",b:"(m|qr)?/",e:"/[a-z]*",c:[e.BE],r:0}]},{cN:"sub",bK:"sub",e:"(\\s*\\(.*?\\))?[;{]",r:5},{cN:"operator",b:"-\\w\\b",r:0}];return r.c=c,n.c=c,{aliases:["pl"],k:t,c:c}}),e.registerLanguage("php",function(e){var t={cN:"variable",b:"\\$+[a-zA-Z_-Ã¿][a-zA-Z0-9_-Ã¿]*"},r={cN:"preprocessor",b:/<\?(php)?|\?>/},n={cN:"string",c:[e.BE,r],v:[{b:'b"',e:'"'},{b:"b'",e:"'"},e.inherit(e.ASM,{i:null}),e.inherit(e.QSM,{i:null})]},a={v:[e.BNM,e.CNM]};return{aliases:["php3","php4","php5","php6"],cI:!0,k:"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",c:[e.CLCM,e.HCM,e.C("/\\*","\\*/",{c:[{cN:"doctag",b:"@[A-Za-z]+"},r]}),e.C("__halt_compiler.+?;",!1,{eW:!0,k:"__halt_compiler",l:e.UIR}),{cN:"string",b:"<<<['\"]?\\w+['\"]?$",e:"^\\w+;",c:[e.BE]},r,t,{b:/(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/},{cN:"function",bK:"function",e:/[;{]/,eE:!0,i:"\\$|\\[|%",c:[e.UTM,{cN:"params",b:"\\(",e:"\\)",c:["self",t,e.CBCM,n,a]}]},{cN:"class",bK:"class interface",e:"{",eE:!0,i:/[:\(\$"]/,c:[{bK:"extends implements"},e.UTM]},{bK:"namespace",e:";",i:/[\.']/,c:[e.UTM]},{bK:"use",e:";",c:[e.UTM]},{b:"=>"},n,a]}}),e.registerLanguage("python",function(e){var t={cN:"prompt",b:/^(>>>|\.\.\.) /},r={cN:"string",c:[e.BE],v:[{b:/(u|b)?r?'''/,e:/'''/,c:[t],r:10},{b:/(u|b)?r?"""/,e:/"""/,c:[t],r:10},{b:/(u|r|ur)'/,e:/'/,r:10},{b:/(u|r|ur)"/,e:/"/,r:10},{b:/(b|br)'/,e:/'/},{b:/(b|br)"/,e:/"/},e.ASM,e.QSM]},n={cN:"number",r:0,v:[{b:e.BNR+"[lLjJ]?"},{b:"\\b(0o[0-7]+)[lLjJ]?"},{b:e.CNR+"[lLjJ]?"}]},a={cN:"params",b:/\(/,e:/\)/,c:["self",t,n,r]};return{aliases:["py","gyp"],k:{keyword:"and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda nonlocal|10 None True False",built_in:"Ellipsis NotImplemented"},i:/(<\/|->|\?)/,c:[t,n,r,e.HCM,{v:[{cN:"function",bK:"def",r:10},{cN:"class",bK:"class"}],e:/:/,i:/[${=;\n,]/,c:[e.UTM,a]},{cN:"decorator",b:/@/,e:/$/},{b:/\b(print|exec)\(/}]}}),e.registerLanguage("ruby",function(e){var t="[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?",r="and false then defined module in return redo if BEGIN retry end for true self when next until do begin unless END rescue nil else break undef not super class case require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor",n={cN:"doctag",b:"@[A-Za-z]+"},a={cN:"value",b:"#<",e:">"},s=[e.C("#","$",{c:[n]}),e.C("^\\=begin","^\\=end",{c:[n],r:10}),e.C("^__END__","\\n$")],i={cN:"subst",b:"#\\{",e:"}",k:r},c={cN:"string",c:[e.BE,i],v:[{b:/'/,e:/'/},{b:/"/,e:/"/},{b:/`/,e:/`/},{b:"%[qQwWx]?\\(",e:"\\)"},{b:"%[qQwWx]?\\[",e:"\\]"},{b:"%[qQwWx]?{",e:"}"},{b:"%[qQwWx]?<",e:">"},{b:"%[qQwWx]?/",e:"/"},{b:"%[qQwWx]?%",e:"%"},{b:"%[qQwWx]?-",e:"-"},{b:"%[qQwWx]?\\|",e:"\\|"},{b:/\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/}]},o={cN:"params",b:"\\(",e:"\\)",k:r},l=[c,a,{cN:"class",bK:"class module",e:"$|;",i:/=/,c:[e.inherit(e.TM,{b:"[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?"}),{cN:"inheritance",b:"<\\s*",c:[{cN:"parent",b:"("+e.IR+"::)?"+e.IR}]}].concat(s)},{cN:"function",bK:"def",e:" |$|;",r:0,c:[e.inherit(e.TM,{b:t}),o].concat(s)},{cN:"constant",b:"(::)?(\\b[A-Z]\\w*(::)?)+",r:0},{cN:"symbol",b:e.UIR+"(\\!|\\?)?:",r:0},{cN:"symbol",b:":",c:[c,{b:t}],r:0},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{cN:"variable",b:"(\\$\\W)|((\\$|\\@\\@?)(\\w+))"},{b:"("+e.RSR+")\\s*",c:[a,{cN:"regexp",c:[e.BE,i],i:/\n/,v:[{b:"/",e:"/[a-z]*"},{b:"%r{",e:"}[a-z]*"},{b:"%r\\(",e:"\\)[a-z]*"},{b:"%r!",e:"![a-z]*"},{b:"%r\\[",e:"\\][a-z]*"}]}].concat(s),r:0}].concat(s);i.c=l,o.c=l;var u="[>?]>",d="[\\w#]+\\(\\w+\\):\\d+:\\d+>",b="(\\w+-)?\\d+\\.\\d+\\.\\d(p\\d+)?[^>]+>",p=[{b:/^\s*=>/,cN:"status",starts:{e:"$",c:l}},{cN:"prompt",b:"^("+u+"|"+d+"|"+b+")",starts:{e:"$",c:l}}];return{aliases:["rb","gemspec","podspec","thor","irb"],k:r,c:s.concat(p).concat(l)}}),e.registerLanguage("sql",function(e){var t=e.C("--","$");return{cI:!0,i:/[<>]/,c:[{cN:"operator",bK:"begin end start commit rollback savepoint lock alter create drop rename call delete do handler insert load replace select truncate update set show pragma grant merge describe use explain help declare prepare execute deallocate savepoint release unlock purge reset change stop analyze cache flush optimize repair kill install uninstall checksum restore check backup revoke",e:/;/,eW:!0,k:{keyword:"abs absolute acos action add adddate addtime aes_decrypt aes_encrypt after aggregate all allocate alter analyze and any are as asc ascii asin assertion at atan atan2 atn2 authorization authors avg backup before begin benchmark between bin binlog bit_and bit_count bit_length bit_or bit_xor both by cache call cascade cascaded case cast catalog ceil ceiling chain change changed char_length character_length charindex charset check checksum checksum_agg choose close coalesce coercibility collate collation collationproperty column columns columns_updated commit compress concat concat_ws concurrent connect connection connection_id consistent constraint constraints continue contributors conv convert convert_tz corresponding cos cot count count_big crc32 create cross cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime data database databases datalength date_add date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts datetimeoffsetfromparts day dayname dayofmonth dayofweek dayofyear deallocate declare decode default deferrable deferred degrees delayed delete des_decrypt des_encrypt des_key_file desc describe descriptor diagnostics difference disconnect distinct distinctrow div do domain double drop dumpfile each else elt enclosed encode encrypt end end-exec engine engines eomonth errors escape escaped event eventdata events except exception exec execute exists exp explain export_set extended external extract fast fetch field fields find_in_set first first_value floor flush for force foreign format found found_rows from from_base64 from_days from_unixtime full function get get_format get_lock getdate getutcdate global go goto grant grants greatest group group_concat grouping grouping_id gtid_subset gtid_subtract handler having help hex high_priority hosts hour ident_current ident_incr ident_seed identified identity if ifnull ignore iif ilike immediate in index indicator inet6_aton inet6_ntoa inet_aton inet_ntoa infile initially inner innodb input insert install instr intersect into is is_free_lock is_ipv4 is_ipv4_compat is_ipv4_mapped is_not is_not_null is_used_lock isdate isnull isolation join key kill language last last_day last_insert_id last_value lcase lead leading least leaves left len lenght level like limit lines ln load load_file local localtime localtimestamp locate lock log log10 log2 logfile logs low_priority lower lpad ltrim make_set makedate maketime master master_pos_wait match matched max md5 medium merge microsecond mid min minute mod mode module month monthname mutex name_const names national natural nchar next no no_write_to_binlog not now nullif nvarchar oct octet_length of old_password on only open optimize option optionally or ord order outer outfile output pad parse partial partition password patindex percent_rank percentile_cont percentile_disc period_add period_diff pi plugin position pow power pragma precision prepare preserve primary prior privileges procedure procedure_analyze processlist profile profiles public publishingservername purge quarter query quick quote quotename radians rand read references regexp relative relaylog release release_lock rename repair repeat replace replicate reset restore restrict return returns reverse revoke right rlike rollback rollup round row row_count rows rpad rtrim savepoint schema scroll sec_to_time second section select serializable server session session_user set sha sha1 sha2 share show sign sin size slave sleep smalldatetimefromparts snapshot some soname soundex sounds_like space sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result sql_variant_property sqlstate sqrt square start starting status std stddev stddev_pop stddev_samp stdev stdevp stop str str_to_date straight_join strcmp string stuff subdate substr substring subtime subtring_index sum switchoffset sysdate sysdatetime sysdatetimeoffset system_user sysutcdatetime table tables tablespace tan temporary terminated tertiary_weights then time time_format time_to_sec timediff timefromparts timestamp timestampadd timestampdiff timezone_hour timezone_minute to to_base64 to_days to_seconds todatetimeoffset trailing transaction translation trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse ucase uncompress uncompressed_length unhex unicode uninstall union unique unix_timestamp unknown unlock update upgrade upped upper usage use user user_resources using utc_date utc_time utc_timestamp uuid uuid_short validate_password_strength value values var var_pop var_samp variables variance varp version view warnings week weekday weekofyear weight_string when whenever where with work write xml xor year yearweek zon",
	  literal:"true false null",built_in:"array bigint binary bit blob boolean char character date dec decimal float int integer interval number numeric real serial smallint varchar varying int8 serial8 text"},c:[{cN:"string",b:"'",e:"'",c:[e.BE,{b:"''"}]},{cN:"string",b:'"',e:'"',c:[e.BE,{b:'""'}]},{cN:"string",b:"`",e:"`",c:[e.BE]},e.CNM,e.CBCM,t]},e.CBCM,t]}}),e});

/***/ },
/* 237 */
/***/ function(module, exports) {

	module.exports = "{{#if title}}<h4>{{title}}</h4>{{/if}}\n<pre><code>{{{source}}}</code></pre>\n"

/***/ },
/* 238 */
/***/ function(module, exports) {

	module.exports = "<h2>{{title}}</h2>\n\n<div class=\"example-tabs\"></div>\n"

/***/ },
/* 239 */
/***/ function(module, exports) {

	module.exports = "<div class=\"container\">\n  <div class=\"row\">\n    <div class=\"span3\">\n\t\t\t<div class=\"example-list\"></div>\n    </div>\n    <div class=\"span9\">\n\t\t  <div class=\"examples\"></div>\n\t  </div>\n  </div>\n</div>"

/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Copyright (c) 2007-2014 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
	 * Licensed under MIT
	 * @author Ariel Flesler
	 * @version 1.4.14
	 */
	;(function(k){'use strict';!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_RESULT__ = function($){var j=$.scrollTo=function(a,b,c){return $(window).scrollTo(a,b,c)};j.defaults={axis:'xy',duration:0,limit:!0};j.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(f,g,h){if(typeof g=='object'){h=g;g=0}if(typeof h=='function')h={onAfter:h};if(f=='max')f=9e9;h=$.extend({},j.defaults,h);g=g||h.duration;h.queue=h.queue&&h.axis.length>1;if(h.queue)g/=2;h.offset=both(h.offset);h.over=both(h.over);return this._scrollable().each(function(){if(f==null)return;var d=this,$elem=$(d),targ=f,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=win?$(targ):$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}var e=$.isFunction(h.offset)&&h.offset(d,targ)||h.offset;$.each(h.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=j.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(h.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=e[pos]||0;if(h.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*h.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(h.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&h.queue){if(old!=attr[key])animate(h.onAfterFirst);delete attr[key]}});animate(h.onAfter);function animate(a){$elem.animate(attr,g,h.easing,a&&function(){a.call(this,targ,h)})}}).end()};j.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return $.isFunction(a)||$.isPlainObject(a)?a:{top:a,left:a}}return j}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))}(__webpack_require__(241)));

/***/ },
/* 241 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(243)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage, ExampleCollection) {
	
	  return Plumage.model.Model.extend({
	    idAttribute: 'name',
	
	    urlIdAttribute: 'name',
	    urlRoot: '/',
	
	
	    relationships: {
	      'examples': {
	        modelCls: ExampleCollection,
	        reverse: 'parent'
	      }
	    },
	
	    getCurrentExample: function () {
	      return this.getRelated('examples').getById(this.get('example'));
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 243 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(88),
	  __webpack_require__(116),
	  __webpack_require__(244)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(Plumage, Collection, Example) {
	
	  return Collection.extend({
	    model: Example,
	
	    url: function() {
	      return this.getRelated('parent').url();
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 244 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(3), __webpack_require__(2), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage) {
	
	  return Plumage.model.Model.extend({
	    idAttribute: 'name',
	
	    urlIdAttribute: 'name',
	
	    urlRoot: '/example',
	
	    viewAttrs: ['tab', 'dropdown'],
	
	    url: function() {
	      if (this.collection) {
	        return this.collection.url() + '/' + this.get('name');
	      }
	      return this.urlRoot + '/';
	    },
	
	    getViewCls: function() {
	      var name = this.get('name');
	      var section = this.collection.getRelated('parent').get('name');
	      return __webpack_require__(245)("./" + section + '/' + name);
	    },
	
	    getJsSource: function() {
	      var result = this.get('js');
	      if (!result) {
	        var name = this.get('name');
	        var section = this.collection.getRelated('parent').get('name');
	        result = __webpack_require__(291)("./" + section + '/' + name + '.js');
	        this.set('js', result);
	      }
	      return result;
	    },
	
	    getHtmlSource: function() {
	      var result = this.get('html');
	      if (!result) {
	        var name = this.get('name');
	        var section = this.collection.getRelated('parent').get('name');
	        result = __webpack_require__(314)("./" + section + '/templates/' + name + '.html');
	        this.set('html', result);
	      }
	      return result;
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 245 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./BaseExample": 246,
		"./BaseExample.js": 246,
		"./ExampleSectionView": 232,
		"./ExampleSectionView.js": 232,
		"./ExampleView": 234,
		"./ExampleView.js": 234,
		"./ExampleWithSourceView": 233,
		"./ExampleWithSourceView.js": 233,
		"./SourceView": 235,
		"./SourceView.js": 235,
		"./form/DateFields": 248,
		"./form/DateFields.js": 248,
		"./form/FieldsAndForms": 251,
		"./form/FieldsAndForms.js": 251,
		"./form/InPlaceFields": 256,
		"./form/InPlaceFields.js": 256,
		"./form/MultiSelectFields": 258,
		"./form/MultiSelectFields.js": 258,
		"./form/SelectFields": 263,
		"./form/SelectFields.js": 263,
		"./form/Validation": 265,
		"./form/Validation.js": 265,
		"./form/templates/DateFields.html": 250,
		"./form/templates/FieldsAndForms.html": 254,
		"./form/templates/InPlaceFields.html": 257,
		"./form/templates/MultiSelectFields.html": 262,
		"./form/templates/SelectFields.html": 264,
		"./form/templates/Validation.html": 267,
		"./grid/Filters": 268,
		"./grid/Filters.js": 268,
		"./grid/Grids": 270,
		"./grid/Grids.js": 270,
		"./grid/InfiniteScroll": 272,
		"./grid/InfiniteScroll.js": 272,
		"./grid/Paging": 274,
		"./grid/Paging.js": 274,
		"./grid/templates/Filters.html": 269,
		"./grid/templates/Grids.html": 271,
		"./grid/templates/InfiniteScroll.html": 273,
		"./grid/templates/Paging.html": 275,
		"./model/Collections": 276,
		"./model/Collections.js": 276,
		"./model/Models": 278,
		"./model/Models.js": 278,
		"./model/Relationships": 280,
		"./model/Relationships.js": 280,
		"./model/templates/Collections.html": 277,
		"./model/templates/Models.html": 279,
		"./model/templates/Relationships.html": 281,
		"./templates/ExampleSectionView.html": 239,
		"./templates/ExampleWithSourceView.html": 238,
		"./templates/SourceView.html": 237,
		"./view/CollectionViews": 282,
		"./view/CollectionViews.js": 282,
		"./view/ModelViews": 285,
		"./view/ModelViews.js": 285,
		"./view/ViewState": 287,
		"./view/ViewState.js": 287,
		"./view/Views": 289,
		"./view/Views.js": 289,
		"./view/templates/CollectionViews.html": 284,
		"./view/templates/ModelViews.html": 286,
		"./view/templates/ViewState.html": 288,
		"./view/templates/Views.html": 290
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 245;


/***/ },
/* 246 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*jshint -W061 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(4),
	  __webpack_require__(236),
	  __webpack_require__(247)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Handlebars, Plumage, hljs, Environment) {
	
	  return Plumage.view.ModelView.extend({
	    className: 'example-view',
	
	    template: '<div class="the-example"></div>',
	
	    events: {
	      'click .example-result a': 'onExampleResultClick'
	    },
	
	    updateOnChange: false,
	
	    initialize: function() {
	      this.testEnv = new Environment();
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	    },
	
	    onRender: function() {
	      Plumage.view.ModelView.prototype.onRender.apply(this, arguments);
	
	      this.testEnv.setup();
	      this.$('.example-code').each(function(i, el) {this.evaluateExampleCode(el);}.bind(this));
	      this.testEnv.teardown();
	    },
	
	    evaluateExampleCode: function(el) {
	      var code = $('code', el), result = '', f;
	      if (code) {
	        f = eval('(function (Plumage, log, testEnv) {' + code.text() + '})');
	        var exampleConsole = {log: function(text) {
	          result += text + '\n';
	        }};
	
	        this.testEnv.console = exampleConsole;
	        f(Plumage, exampleConsole.log, this.testEnv);
	      }
	      $(el).append($('<div class="example-result"><a>Result</a><pre><code>'+ result +'</code></pre></div>'));
	      hljs.highlightBlock(code[0], ['javascript']);
	    },
	
	    onExampleResultClick: function(event) {
	      var parent = $(event.target).parent('.example-result');
	      parent.toggleClass('expanded');
	
	      $('pre', parent).slideToggle({duration: 200});
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 247 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone) {
	
	  var Environment = function(){};
	
	  _.extend(Environment.prototype, {
	
	    console: undefined,
	
	    setup: function() {
	      var env = this;
	
	      /**
	       *
	       */
	      env.ajaxCount = 0;
	      env.ajaxResponse = {};
	      env.ajaxResponseStatus = 'success';
	      env.ajaxAsync = false;
	      env.sync = Backbone.sync;
	      env.ajax = Backbone.ajax;
	      env.countEvents = function(eventEmitter) {
	        var eventCount = {};
	        eventEmitter.on('all', function(e) {
	          eventCount[e] = eventCount[e] ? eventCount[e]+1 : 1;
	        });
	        return eventCount;
	      };
	
	      env.emulateHTTP = Backbone.emulateHTTP;
	      env.emulateJSON = Backbone.emulateJSON;
	
	      // Capture ajax settings for comparison.
	      Backbone.ajax = function(settings) {
	        var deferred = $.Deferred();
	        env.ajaxCount += 1;
	        env.ajaxSettings = settings;
	        if (env.console) {
	          env.console.log('Ajax ' + settings.type + ': ' + settings.url);
	        }
	        if (env.ajaxAsync) {
	
	          setTimeout(function(){
	            settings.success(env.ajaxResponse);
	            deferred.resolve(env.ajaxResponse, 'success', {});
	          });
	        } else {
	          if (env.ajaxResponseStatus === 'error') {
	            if (settings.error) {
	              settings.error(env.ajaxResponse);
	            }
	          } else {
	            if (settings.success) {
	              settings.success(env.ajaxResponse);
	            }
	          }
	          deferred.resolve(env.ajaxResponse, 'success', {});
	        }
	        return deferred;
	      };
	
	      // Capture the arguments to Backbone.sync for comparison.
	      Backbone.sync = function(method, model, options) {
	        env.syncArgs = {
	          method: method,
	          model: model,
	          options: options
	        };
	        return env.sync.apply(this, arguments);
	      };
	    },
	
	    teardown: function() {
	      this.syncArgs = null;
	      this.ajaxSettings = null;
	      Backbone.sync = this.sync;
	      Backbone.ajax = this.ajax;
	      Backbone.emulateHTTP = this.emulateHTTP;
	      Backbone.emulateJSON = this.emulateJSON;
	    }
	
	
	
	  });
	  return Environment;
	
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 248 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(6),
	  __webpack_require__(7),
	  __webpack_require__(4),
	  __webpack_require__(249),
	  __webpack_require__(250)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Handlebars, moment, Plumage, Vacation, template) {
	
	  return Plumage.view.ModelView.extend({
	
	    template: template,
	
	    modelCls: Vacation,
	
	    defaultSubViewOptions: {
	      updateModelOnChange: true
	    },
	
	    subViews: [
	      {
	        viewCls: Plumage.view.form.fields.DateField,
	        selector: '.date-field1',
	        label: 'From Date',
	        valueAttr: 'fromDate',
	        maxDateAttr: 'toDate'
	      },
	      {
	        viewCls: Plumage.view.form.fields.DateField,
	        selector: '.date-field2',
	        label: 'To Date',
	        valueAttr: 'toDate',
	        minDateAttr: 'fromDate'
	      },
	      {
	        viewCls: Plumage.view.form.fields.HourSelect,
	        selector: '.hour-field1',
	        label: 'From Hour',
	        valueAttr: 'fromDate'
	      },
	      {
	        viewCls: Plumage.view.form.fields.HourSelect,
	        selector: '.hour-field2',
	        valueAttr: 'fromDate',
	        replaceEl: true
	      },
	      {
	        viewCls: Plumage.view.form.fields.DateField,
	        selector: '.date-field3',
	        valueAttr: 'fromDate',
	        maxDateAttr: 'toDate',
	        keepTime: true,
	        replaceEl: true
	      },
	      {
	        viewCls: Plumage.view.form.fields.DateRangeField,
	        selector: '.date-range-field',
	        fromAttr: 'fromDate',
	        toAttr: 'toDate'
	      },
	      {
	        viewCls: Plumage.view.form.fields.DateRangeField,
	        selector: '.date-range-field-hour',
	        fromAttr: 'fromDate',
	        toAttr: 'toDate',
	        pickerOptions: {
	          showHourSelect: true
	        }
	      },
	      {
	        viewCls: Plumage.view.form.fields.DurationField,
	        selector: '.duration-field',
	        valueAttr: 'duration'
	      }
	    ],
	
	    initialize: function(options) {
	      Plumage.view.form.fields.Field.prototype.initialize.apply(this, arguments);
	
	      var model = new Vacation({fromDate: moment().subtract('day', 7).valueOf(), toDate: moment().valueOf(), duration: 3600000});
	      this.setModel(model);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 249 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(3), __webpack_require__(2), __webpack_require__(100)], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Model) {
	
	  return Model.extend({
	
	    modelName: 'Vacation',
	
	    urlRoot: '/vacations',
	
	    queryAttrs: ['name']
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 250 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>These fields let you pick date or a range of dates from a calendar.</p>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.DateField</h4>\n  <p>Field for selecting a single date</p>\n  <div class=\"date-field1\"></div>\n  <div class=\"date-field2\"></div>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.HourSelect</h4>\n  <p>There's also an hour field, which can be combined with DateField if desired. Make sure to set 'keepTime: true' on the DateField</p>\n  <div class=\"hour-field1\"></div>\n  <div class=\"control-group\">\n\t  <label class=\"control-label\" for=\"fromDate\">From Date</label>\n\t  <div class=\"controls\">\n\t    <span class=\"date-field3\"></span><span class=\"hour-field2\"></span>\n\t  </div>\n  </div>\n</div>\n\n\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.DateRangeField</h4>\n  <p>Field for selecting a range of dates</p>\n  <div class=\"date-range-field\"></div>\n\n  <p>You can also include hour selects in this field</p>\n  <div class=\"date-range-field-hour\"></div>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.DurationField</h4>\n  <p>Field for specifying a length of time</p>\n  <div class=\"duration-field\"></div>\n</div>"

/***/ },
/* 251 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(4),
	  __webpack_require__(252),
	  __webpack_require__(253),
	  __webpack_require__(254),
	  __webpack_require__(255)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Handlebars, Plumage, ExampleData, User, template, countries) {
	
	  var Form1 = Plumage.view.form.Form.extend();
	
	  var Results1 = Plumage.view.ModelView.extend();
	
	  return Plumage.view.ModelView.extend({
	
	    modelCls: User,
	
	    template: template,
	
	    fields: ['name', 'address1', 'address2', 'country'],
	
	    subViews: [
	      {
	        name: 'updateOnChange',
	        viewCls: Plumage.view.form.fields.Checkbox,
	        selector: '#update-on-change',
	        label: ' ',
	        checkboxLabel: 'Update Model on Change'
	      }, {
	        name: 'form1',
	        selector: '.form1',
	        viewCls: Plumage.view.form.Form,
	
	        className: 'form-horizontal',
	        template: '<div class="fields"></div><div class="address"></div><input type="submit" value="Submit"/>',
	        subViews: [
	          {viewCls: Plumage.view.form.fields.Checkbox, selector: '.fields', label: 'Billing?', valueAttr: 'billing'},
	          {viewCls: Plumage.view.form.fields.Field, selector: '.fields', label: 'Name', valueAttr: 'name'},
	          {
	            viewCls: Plumage.view.ModelView,
	            name: 'addressFields',
	            selector: '.address',
	            className: 'well',
	            subViews: [
	              {viewCls: Plumage.view.form.fields.Field, label: 'Address 1', valueAttr: 'address1'},
	              {viewCls: Plumage.view.form.fields.Field, label: 'City', valueAttr: 'city'},
	              {
	                name: 'countrySelect',
	                viewCls: Plumage.view.form.fields.Select,
	                label: 'Country',
	                valueAttr: 'country',
	                listValueAttr: 'name',
	                listLabelAttr: 'name'
	              }
	            ]
	          }
	        ],
	      }, {
	        viewCls: Plumage.view.ModelView,
	        selector: '.results1',
	        className: 'form-horizontal',
	        defaultSubViewCls: Plumage.view.DisplayField,
	
	        subViews: [
	          {label: 'Billing?', valueAttr: 'billing'},
	          {label: 'Name', valueAttr: 'name'},
	          {label: 'Address 1', valueAttr: 'address1'},
	          {label: 'City', valueAttr: 'city'},
	          {label: 'Country', valueAttr: 'country'}
	        ]
	      }
	    ],
	
	    initialize:function(options) {
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	
	      this.getSubView('updateOnChange').on('change', this.onUpdateOnChangeClick.bind(this));
	
	      var countryData = new Plumage.collection.DataCollection(countries);
	      this.getSubView('form1.addressFields.countrySelect').setListModel(countryData);
	
	      var model = new User();
	      model.onLoad();
	      this.setModel(model);
	    },
	
	    onUpdateOnChangeClick: function(checkbox) {
	      var value = Boolean(checkbox.getValue());
	      this.getSubView('form1').updateModelOnChange = value;
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 252 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	  return {
	    POST_DATA: {
	      href: '/posts/1',
	      id: 1,
	      body: 'my body'
	    },
	
	    POST_DATA_WITH_EMPTY_COMMENTS: {
	      href: '/posts/1',
	      id: 1,
	      body: 'my body',
	      comments: []
	    },
	
	    POSTS: [{
	      href: '/posts/1',
	      id: 1,
	      body: 'my body'
	    }, {
	      href: '/posts/2',
	      id: 2,
	      body: 'my body2'
	    }, {
	      href: '/posts/3',
	      id: 3,
	      body: 'my body3'
	    }],
	
	    POST_DATA_WITH_RELATED: {
	      href: '/posts/1',
	      id: 1,
	      body: 'my body',
	      author: {
	        href: '/users/7',
	        id: 7,
	        name: 'bob',
	        company: {
	          name: 'Twitter'
	        }
	      },
	      comments: [{
	        href: '/comments/1',
	        id: 5,
	        body: 'my comment',
	        user: {
	          href: '/users/1',
	          id: 1,
	          username: 'user1'
	        }
	      }, {
	        href: '/comments/6',
	        id: 6,
	        body: 'my comment2',
	        user: {
	          href: '/users/2',
	          id: 2,
	          username: 'user2'
	        }
	      }]
	    },
	
	    POST_DATA_WITH_RELATED_HREFS: {
	      href: '/posts/1',
	      id: 1,
	      body: 'my body',
	      author: {
	        href: '/users/7'
	      },
	      comments: {
	        href: '/comments'
	      }
	    },
	
	    POST_DATA_WITH_COMMENTS_WITH_ATTRIBTES: {
	      href: '/posts/1',
	      id: 1,
	      body: 'my body',
	      comments: {
	        href: '/comments',
	        models: [{
	          href: '/comments/5',
	          id: 5,
	          body: 'my comment',
	          user: {
	            href: '/users/1',
	            username: 'user1'
	          }
	        }, {
	          href: '/comments/6',
	          id: 6,
	          body: 'my comment2',
	          user: {
	            href: '/users/2',
	            username: 'user2'
	          }
	        }]
	      }
	    },
	
	    POSTS_WITH_COMMENTS: [{
	      href: '/posts/1',
	      id: 1,
	      body: 'my body',
	      comments: [{
	        href: '/comments/5',
	        id: 5,
	        body: 'my comment',
	        user: {
	          href: '/users/1',
	          username: 'user1'
	        }
	      }],
	    }, {
	      href: '/posts/2',
	      id: 2,
	      body: 'my body2',
	      comments: [{
	        href: '/comments/6',
	        id: 6,
	        body: 'my comment2',
	        user: {
	          href: '/users/2',
	          username: 'user2'
	        }
	      }]
	    }],
	
	    POST_WITH_VIEW_STATE: {
	      href: '/posts/1',
	      id: 1,
	      body: 'my body',
	      tab: 'detail'
	    },
	
	    CATEGORIES: [{
	      name: 'activities',
	      label: 'Activities'
	    }, {
	      name: 'life',
	      label: 'Life'
	    }, {
	      name: 'work',
	      label: 'Work'
	    }],
	
	    POST_WITH_CATEGORIES: {
	      href: '/posts/1',
	      id: 1,
	      body: 'my body',
	      categories: [{
	        name: 'activities',
	        label: 'Activities'
	      }, {
	        name: 'life',
	        label: 'Life'
	      }, {
	        name: 'work',
	        label: 'Work'
	      }]
	    },
	
	    USERS: [{
	      href: '/users/1',
	      name: 'user1'
	    }, {
	      href: '/users/2',
	      name: 'user2'
	    }, {
	      href: '/users/3',
	      name: 'user3'
	    }]
	  };
	
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 253 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(3), __webpack_require__(2), __webpack_require__(100), __webpack_require__(122)], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Model, Data) {
	
	  return Model.extend({
	    urlRoot: '/users',
	    relationships: {
	      company: {
	        modelCls: Data
	      }
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 254 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"intro\">\n  <p>A Field is a ModelView that updates an attribute of the bound model when updateModel is called</p>\n\n  <p>A Form is also a ModelView but uses an html form tag to catch submit and change events.</p>\n\n  <p>Here's a form with the basic html inputs</p>\n</div>\n\n<div class=\"example\">\n  <div class=\"row\">\n    <form class=\"span4\" style=\"margin-bottom: 0\">\n      <div id=\"update-on-change\"></div>\n    </form>\n  </div>\n  <div class=\"row form-example\">\n    <div class=\"span4\">\n      <form class=\"form-inline\">\n\n      </form>\n      <h5>Form</h5>\n      <div class=\"form1\"></div>\n    </div>\n    <div class=\"span4\">\n      <h5>Results</h5>\n      <div class=\"results1\"></div>\n    </div>\n  </div>\n</div>\n"

/***/ },
/* 255 */
/***/ function(module, exports) {

	module.exports = [
		{
			"name": "Afghanistan",
			"code": "AF"
		},
		{
			"name": "Åland Islands",
			"code": "AX"
		},
		{
			"name": "Albania",
			"code": "AL"
		},
		{
			"name": "Algeria",
			"code": "DZ"
		},
		{
			"name": "American Samoa",
			"code": "AS"
		},
		{
			"name": "AndorrA",
			"code": "AD"
		},
		{
			"name": "Angola",
			"code": "AO"
		},
		{
			"name": "Anguilla",
			"code": "AI"
		},
		{
			"name": "Antarctica",
			"code": "AQ"
		},
		{
			"name": "Antigua and Barbuda",
			"code": "AG"
		},
		{
			"name": "Argentina",
			"code": "AR"
		},
		{
			"name": "Armenia",
			"code": "AM"
		},
		{
			"name": "Aruba",
			"code": "AW"
		},
		{
			"name": "Australia",
			"code": "AU"
		},
		{
			"name": "Austria",
			"code": "AT"
		},
		{
			"name": "Azerbaijan",
			"code": "AZ"
		},
		{
			"name": "Bahamas",
			"code": "BS"
		},
		{
			"name": "Bahrain",
			"code": "BH"
		},
		{
			"name": "Bangladesh",
			"code": "BD"
		},
		{
			"name": "Barbados",
			"code": "BB"
		},
		{
			"name": "Belarus",
			"code": "BY"
		},
		{
			"name": "Belgium",
			"code": "BE"
		},
		{
			"name": "Belize",
			"code": "BZ"
		},
		{
			"name": "Benin",
			"code": "BJ"
		},
		{
			"name": "Bermuda",
			"code": "BM"
		},
		{
			"name": "Bhutan",
			"code": "BT"
		},
		{
			"name": "Bolivia",
			"code": "BO"
		},
		{
			"name": "Bosnia and Herzegovina",
			"code": "BA"
		},
		{
			"name": "Botswana",
			"code": "BW"
		},
		{
			"name": "Bouvet Island",
			"code": "BV"
		},
		{
			"name": "Brazil",
			"code": "BR"
		},
		{
			"name": "British Indian Ocean Territory",
			"code": "IO"
		},
		{
			"name": "Brunei Darussalam",
			"code": "BN"
		},
		{
			"name": "Bulgaria",
			"code": "BG"
		},
		{
			"name": "Burkina Faso",
			"code": "BF"
		},
		{
			"name": "Burundi",
			"code": "BI"
		},
		{
			"name": "Cambodia",
			"code": "KH"
		},
		{
			"name": "Cameroon",
			"code": "CM"
		},
		{
			"name": "Canada",
			"code": "CA"
		},
		{
			"name": "Cape Verde",
			"code": "CV"
		},
		{
			"name": "Cayman Islands",
			"code": "KY"
		},
		{
			"name": "Central African Republic",
			"code": "CF"
		},
		{
			"name": "Chad",
			"code": "TD"
		},
		{
			"name": "Chile",
			"code": "CL"
		},
		{
			"name": "China",
			"code": "CN"
		},
		{
			"name": "Christmas Island",
			"code": "CX"
		},
		{
			"name": "Cocos (Keeling) Islands",
			"code": "CC"
		},
		{
			"name": "Colombia",
			"code": "CO"
		},
		{
			"name": "Comoros",
			"code": "KM"
		},
		{
			"name": "Congo",
			"code": "CG"
		},
		{
			"name": "Congo, The Democratic Republic of the",
			"code": "CD"
		},
		{
			"name": "Cook Islands",
			"code": "CK"
		},
		{
			"name": "Costa Rica",
			"code": "CR"
		},
		{
			"name": "Cote D\"Ivoire",
			"code": "CI"
		},
		{
			"name": "Croatia",
			"code": "HR"
		},
		{
			"name": "Cuba",
			"code": "CU"
		},
		{
			"name": "Cyprus",
			"code": "CY"
		},
		{
			"name": "Czech Republic",
			"code": "CZ"
		},
		{
			"name": "Denmark",
			"code": "DK"
		},
		{
			"name": "Djibouti",
			"code": "DJ"
		},
		{
			"name": "Dominica",
			"code": "DM"
		},
		{
			"name": "Dominican Republic",
			"code": "DO"
		},
		{
			"name": "Ecuador",
			"code": "EC"
		},
		{
			"name": "Egypt",
			"code": "EG"
		},
		{
			"name": "El Salvador",
			"code": "SV"
		},
		{
			"name": "Equatorial Guinea",
			"code": "GQ"
		},
		{
			"name": "Eritrea",
			"code": "ER"
		},
		{
			"name": "Estonia",
			"code": "EE"
		},
		{
			"name": "Ethiopia",
			"code": "ET"
		},
		{
			"name": "Falkland Islands (Malvinas)",
			"code": "FK"
		},
		{
			"name": "Faroe Islands",
			"code": "FO"
		},
		{
			"name": "Fiji",
			"code": "FJ"
		},
		{
			"name": "Finland",
			"code": "FI"
		},
		{
			"name": "France",
			"code": "FR"
		},
		{
			"name": "French Guiana",
			"code": "GF"
		},
		{
			"name": "French Polynesia",
			"code": "PF"
		},
		{
			"name": "French Southern Territories",
			"code": "TF"
		},
		{
			"name": "Gabon",
			"code": "GA"
		},
		{
			"name": "Gambia",
			"code": "GM"
		},
		{
			"name": "Georgia",
			"code": "GE"
		},
		{
			"name": "Germany",
			"code": "DE"
		},
		{
			"name": "Ghana",
			"code": "GH"
		},
		{
			"name": "Gibraltar",
			"code": "GI"
		},
		{
			"name": "Greece",
			"code": "GR"
		},
		{
			"name": "Greenland",
			"code": "GL"
		},
		{
			"name": "Grenada",
			"code": "GD"
		},
		{
			"name": "Guadeloupe",
			"code": "GP"
		},
		{
			"name": "Guam",
			"code": "GU"
		},
		{
			"name": "Guatemala",
			"code": "GT"
		},
		{
			"name": "Guernsey",
			"code": "GG"
		},
		{
			"name": "Guinea",
			"code": "GN"
		},
		{
			"name": "Guinea-Bissau",
			"code": "GW"
		},
		{
			"name": "Guyana",
			"code": "GY"
		},
		{
			"name": "Haiti",
			"code": "HT"
		},
		{
			"name": "Heard Island and Mcdonald Islands",
			"code": "HM"
		},
		{
			"name": "Holy See (Vatican City State)",
			"code": "VA"
		},
		{
			"name": "Honduras",
			"code": "HN"
		},
		{
			"name": "Hong Kong",
			"code": "HK"
		},
		{
			"name": "Hungary",
			"code": "HU"
		},
		{
			"name": "Iceland",
			"code": "IS"
		},
		{
			"name": "India",
			"code": "IN"
		},
		{
			"name": "Indonesia",
			"code": "ID"
		},
		{
			"name": "Iran, Islamic Republic Of",
			"code": "IR"
		},
		{
			"name": "Iraq",
			"code": "IQ"
		},
		{
			"name": "Ireland",
			"code": "IE"
		},
		{
			"name": "Isle of Man",
			"code": "IM"
		},
		{
			"name": "Israel",
			"code": "IL"
		},
		{
			"name": "Italy",
			"code": "IT"
		},
		{
			"name": "Jamaica",
			"code": "JM"
		},
		{
			"name": "Japan",
			"code": "JP"
		},
		{
			"name": "Jersey",
			"code": "JE"
		},
		{
			"name": "Jordan",
			"code": "JO"
		},
		{
			"name": "Kazakhstan",
			"code": "KZ"
		},
		{
			"name": "Kenya",
			"code": "KE"
		},
		{
			"name": "Kiribati",
			"code": "KI"
		},
		{
			"name": "Korea, Democratic People\"S Republic of",
			"code": "KP"
		},
		{
			"name": "Korea, Republic of",
			"code": "KR"
		},
		{
			"name": "Kuwait",
			"code": "KW"
		},
		{
			"name": "Kyrgyzstan",
			"code": "KG"
		},
		{
			"name": "Lao People\"S Democratic Republic",
			"code": "LA"
		},
		{
			"name": "Latvia",
			"code": "LV"
		},
		{
			"name": "Lebanon",
			"code": "LB"
		},
		{
			"name": "Lesotho",
			"code": "LS"
		},
		{
			"name": "Liberia",
			"code": "LR"
		},
		{
			"name": "Libyan Arab Jamahiriya",
			"code": "LY"
		},
		{
			"name": "Liechtenstein",
			"code": "LI"
		},
		{
			"name": "Lithuania",
			"code": "LT"
		},
		{
			"name": "Luxembourg",
			"code": "LU"
		},
		{
			"name": "Macao",
			"code": "MO"
		},
		{
			"name": "Macedonia, The Former Yugoslav Republic of",
			"code": "MK"
		},
		{
			"name": "Madagascar",
			"code": "MG"
		},
		{
			"name": "Malawi",
			"code": "MW"
		},
		{
			"name": "Malaysia",
			"code": "MY"
		},
		{
			"name": "Maldives",
			"code": "MV"
		},
		{
			"name": "Mali",
			"code": "ML"
		},
		{
			"name": "Malta",
			"code": "MT"
		},
		{
			"name": "Marshall Islands",
			"code": "MH"
		},
		{
			"name": "Martinique",
			"code": "MQ"
		},
		{
			"name": "Mauritania",
			"code": "MR"
		},
		{
			"name": "Mauritius",
			"code": "MU"
		},
		{
			"name": "Mayotte",
			"code": "YT"
		},
		{
			"name": "Mexico",
			"code": "MX"
		},
		{
			"name": "Micronesia, Federated States of",
			"code": "FM"
		},
		{
			"name": "Moldova, Republic of",
			"code": "MD"
		},
		{
			"name": "Monaco",
			"code": "MC"
		},
		{
			"name": "Mongolia",
			"code": "MN"
		},
		{
			"name": "Montserrat",
			"code": "MS"
		},
		{
			"name": "Morocco",
			"code": "MA"
		},
		{
			"name": "Mozambique",
			"code": "MZ"
		},
		{
			"name": "Myanmar",
			"code": "MM"
		},
		{
			"name": "Namibia",
			"code": "NA"
		},
		{
			"name": "Nauru",
			"code": "NR"
		},
		{
			"name": "Nepal",
			"code": "NP"
		},
		{
			"name": "Netherlands",
			"code": "NL"
		},
		{
			"name": "Netherlands Antilles",
			"code": "AN"
		},
		{
			"name": "New Caledonia",
			"code": "NC"
		},
		{
			"name": "New Zealand",
			"code": "NZ"
		},
		{
			"name": "Nicaragua",
			"code": "NI"
		},
		{
			"name": "Niger",
			"code": "NE"
		},
		{
			"name": "Nigeria",
			"code": "NG"
		},
		{
			"name": "Niue",
			"code": "NU"
		},
		{
			"name": "Norfolk Island",
			"code": "NF"
		},
		{
			"name": "Northern Mariana Islands",
			"code": "MP"
		},
		{
			"name": "Norway",
			"code": "NO"
		},
		{
			"name": "Oman",
			"code": "OM"
		},
		{
			"name": "Pakistan",
			"code": "PK"
		},
		{
			"name": "Palau",
			"code": "PW"
		},
		{
			"name": "Palestinian Territory, Occupied",
			"code": "PS"
		},
		{
			"name": "Panama",
			"code": "PA"
		},
		{
			"name": "Papua New Guinea",
			"code": "PG"
		},
		{
			"name": "Paraguay",
			"code": "PY"
		},
		{
			"name": "Peru",
			"code": "PE"
		},
		{
			"name": "Philippines",
			"code": "PH"
		},
		{
			"name": "Pitcairn",
			"code": "PN"
		},
		{
			"name": "Poland",
			"code": "PL"
		},
		{
			"name": "Portugal",
			"code": "PT"
		},
		{
			"name": "Puerto Rico",
			"code": "PR"
		},
		{
			"name": "Qatar",
			"code": "QA"
		},
		{
			"name": "Reunion",
			"code": "RE"
		},
		{
			"name": "Romania",
			"code": "RO"
		},
		{
			"name": "Russian Federation",
			"code": "RU"
		},
		{
			"name": "RWANDA",
			"code": "RW"
		},
		{
			"name": "Saint Helena",
			"code": "SH"
		},
		{
			"name": "Saint Kitts and Nevis",
			"code": "KN"
		},
		{
			"name": "Saint Lucia",
			"code": "LC"
		},
		{
			"name": "Saint Pierre and Miquelon",
			"code": "PM"
		},
		{
			"name": "Saint Vincent and the Grenadines",
			"code": "VC"
		},
		{
			"name": "Samoa",
			"code": "WS"
		},
		{
			"name": "San Marino",
			"code": "SM"
		},
		{
			"name": "Sao Tome and Principe",
			"code": "ST"
		},
		{
			"name": "Saudi Arabia",
			"code": "SA"
		},
		{
			"name": "Senegal",
			"code": "SN"
		},
		{
			"name": "Serbia and Montenegro",
			"code": "CS"
		},
		{
			"name": "Seychelles",
			"code": "SC"
		},
		{
			"name": "Sierra Leone",
			"code": "SL"
		},
		{
			"name": "Singapore",
			"code": "SG"
		},
		{
			"name": "Slovakia",
			"code": "SK"
		},
		{
			"name": "Slovenia",
			"code": "SI"
		},
		{
			"name": "Solomon Islands",
			"code": "SB"
		},
		{
			"name": "Somalia",
			"code": "SO"
		},
		{
			"name": "South Africa",
			"code": "ZA"
		},
		{
			"name": "South Georgia and the South Sandwich Islands",
			"code": "GS"
		},
		{
			"name": "Spain",
			"code": "ES"
		},
		{
			"name": "Sri Lanka",
			"code": "LK"
		},
		{
			"name": "Sudan",
			"code": "SD"
		},
		{
			"name": "Suriname",
			"code": "SR"
		},
		{
			"name": "Svalbard and Jan Mayen",
			"code": "SJ"
		},
		{
			"name": "Swaziland",
			"code": "SZ"
		},
		{
			"name": "Sweden",
			"code": "SE"
		},
		{
			"name": "Switzerland",
			"code": "CH"
		},
		{
			"name": "Syrian Arab Republic",
			"code": "SY"
		},
		{
			"name": "Taiwan, Province of China",
			"code": "TW"
		},
		{
			"name": "Tajikistan",
			"code": "TJ"
		},
		{
			"name": "Tanzania, United Republic of",
			"code": "TZ"
		},
		{
			"name": "Thailand",
			"code": "TH"
		},
		{
			"name": "Timor-Leste",
			"code": "TL"
		},
		{
			"name": "Togo",
			"code": "TG"
		},
		{
			"name": "Tokelau",
			"code": "TK"
		},
		{
			"name": "Tonga",
			"code": "TO"
		},
		{
			"name": "Trinidad and Tobago",
			"code": "TT"
		},
		{
			"name": "Tunisia",
			"code": "TN"
		},
		{
			"name": "Turkey",
			"code": "TR"
		},
		{
			"name": "Turkmenistan",
			"code": "TM"
		},
		{
			"name": "Turks and Caicos Islands",
			"code": "TC"
		},
		{
			"name": "Tuvalu",
			"code": "TV"
		},
		{
			"name": "Uganda",
			"code": "UG"
		},
		{
			"name": "Ukraine",
			"code": "UA"
		},
		{
			"name": "United Arab Emirates",
			"code": "AE"
		},
		{
			"name": "United Kingdom",
			"code": "GB"
		},
		{
			"name": "United States",
			"code": "US"
		},
		{
			"name": "United States Minor Outlying Islands",
			"code": "UM"
		},
		{
			"name": "Uruguay",
			"code": "UY"
		},
		{
			"name": "Uzbekistan",
			"code": "UZ"
		},
		{
			"name": "Vanuatu",
			"code": "VU"
		},
		{
			"name": "Venezuela",
			"code": "VE"
		},
		{
			"name": "Viet Nam",
			"code": "VN"
		},
		{
			"name": "Virgin Islands, British",
			"code": "VG"
		},
		{
			"name": "Virgin Islands, U.S.",
			"code": "VI"
		},
		{
			"name": "Wallis and Futuna",
			"code": "WF"
		},
		{
			"name": "Western Sahara",
			"code": "EH"
		},
		{
			"name": "Yemen",
			"code": "YE"
		},
		{
			"name": "Zambia",
			"code": "ZM"
		},
		{
			"name": "Zimbabwe",
			"code": "ZW"
		}
	]

/***/ },
/* 256 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(4),
	  __webpack_require__(252),
	  __webpack_require__(253),
	  __webpack_require__(257),
	  __webpack_require__(255)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Handlebars, Plumage, ExampleData, User, template, countries) {
	
	  return Plumage.view.ModelView.extend({
	
	    modelCls: User,
	
	    template: template,
	
	    subViews: [{
	      selector: '.form1',
	      subViews: [{
	        viewCls: Plumage.view.form.fields.InPlaceTextField,
	        label: 'Name',
	        valueAttr: 'name',
	        updateModelOnChange: true
	      }, {
	        viewCls: Plumage.view.DisplayField,
	        label: 'City',
	        valueAttr: 'city'
	      }]
	    }, {
	      selector: '.results1',
	      subViews: [{
	        viewCls: Plumage.view.DisplayField,
	        label: 'Name',
	        valueAttr: 'name'
	      }, {
	        viewCls: Plumage.view.DisplayField,
	        label: 'City',
	        valueAttr: 'city'
	      }]
	    }],
	
	    initialize:function(options) {
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	
	      var model = new User({name: 'Bob Loblaw', city: 'Los Angeles'});
	      model.onLoad();
	      this.setModel(model);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 257 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"intro\">\n  <p>\n    You can optimize the edit process by making frequently edited fields editable in place.\n  </p>\n  <p>\n    This reduces the number of actions involved in common edit operations.\n  </p>\n</div>\n\n<div class=\"example\">\n  <div class=\"row form-example\">\n    <div class=\"span4\">\n      <h5>User</h5>\n      <div class=\"form1 form-horizontal\"></div>\n    </div>\n    <div class=\"span4\">\n      <h5>Results</h5>\n      <div class=\"results1 form-horizontal\"></div>\n    </div>\n  </div>\n</div>\n"

/***/ },
/* 258 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(4),
	  __webpack_require__(252),
	  __webpack_require__(259),
	  __webpack_require__(262)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Handlebars, Plumage, ExampleData, Post, template) {
	
	  return Plumage.view.ModelView.extend({
	
	    template: template,
	
	    modelCls: Post,
	
	    subViews: [{
	      selector: '.multiselect',
	      viewCls: Plumage.view.form.fields.MultiSelect
	    }, {
	      selector: '.dropdown-multiselect',
	      viewCls: Plumage.view.form.fields.DropdownMultiSelect
	    }, {
	      selector: '.dropdown-multiselect2',
	      viewCls: Plumage.view.form.fields.DropdownMultiSelect,
	      showSelectAll: true
	    }],
	
	    defaultSubViewOptions: {
	      updateModelOnChange: true,
	      valueAttr: 'category',
	      listValueAttr: 'name',
	      listLabelAttr: 'label',
	      listRelationship: 'categories',
	      noSelectionText: 'Select something'
	    },
	
	    initialize:function(options) {
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	      var model = new Post(ExampleData.POST_WITH_CATEGORIES);
	      this.setModel(model);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 259 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(3), __webpack_require__(2), __webpack_require__(100), __webpack_require__(124),
	        __webpack_require__(260), __webpack_require__(253)], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Model, DataCollection, CommentCollection, User) {
	
	  return Model.extend({
	
	    modelName: 'Post',
	
	    urlRoot: '/posts',
	
	    queryAttrs: ['body'],
	
	    relationships: {
	      'comments': {
	        modelCls: CommentCollection,
	        reverse: 'post'
	      },
	      'author': {
	        modelCls: User
	      },
	      'categories': {
	        modelCls: DataCollection
	      }
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 260 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(116),
	  __webpack_require__(261)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(Collection, Comment) {
	
	  return Collection.extend({
	    modelName: 'CommentCollection',
	    urlRoot: Comment.prototype.urlRoot,
	    model: Comment,
	
	    sortField: 'body',
	    sortDir: '-1',
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 261 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(3), __webpack_require__(2), __webpack_require__(100), __webpack_require__(119)], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Model, User) {
	
	  return Model.extend({
	
	    urlRoot: '/comments',
	
	    modelName: 'Comment',
	
	    relationships: {
	      'user': {
	        modelCls: User
	      }
	    },
	
	    validate: function(attrs, options) {
	      if (!attrs.body || attrs.body.length <= 3) {
	        return 'Comment is too short';
	      }
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 262 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>These fields let you pick a value from a list. Their common base class is Plumage.form.fields.Select</p>\n  <p>The set of options is taken from another model (the list model) that is also bound to the field.</p>\n  <p>\n    Bind the listModel with Select.setListModel(), or use the Select.listRelationship\n    option to have it automatically bind in the model tree.\n  </p>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.MultiSelect</h4>\n  <p>A basic html select with multiple=\"true\". Hold ctrl/command to select multiple.</p>\n  <div class=\"multiselect\"></div>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.DropdownMultiSelect</h4>\n  <p>A multi select using a bootstrap dropdown with checkboxes.</p>\n\n  <div class=\"dropdown-multiselect\"></div>\n</div>\n\n<div class=\"example\">\n  <p>It has an optional <strong>select all</strong> button</p>\n\n  <div class=\"dropdown-multiselect2\"></div>\n</div>\n"

/***/ },
/* 263 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(4),
	  __webpack_require__(252),
	  __webpack_require__(259),
	  __webpack_require__(264)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Handlebars, Plumage, ExampleData, Post, template) {
	
	  return Plumage.view.ModelView.extend({
	
	    template: template,
	
	    modelCls: Post,
	
	    fields: {
	      'select': {cls: Plumage.view.form.fields.Select, options: {}},
	      'dropdown-select': {cls: Plumage.view.form.fields.DropdownSelect, options: {}},
	      'type-ahead-select': {cls: Plumage.view.form.fields.TypeAhead, options: {noSelectionText: 'Type something', listRelationship: undefined}},
	      'category-select': {cls: Plumage.view.form.fields.CategorySelect, options: {}},
	      'button-group-select': {cls: Plumage.view.form.fields.ButtonGroupSelect, options: {}}
	    },
	
	    defaultFieldOptions: {
	      updateModelOnChange: true,
	      valueAttr: 'category',
	      listValueAttr: 'name',
	      listLabelAttr: 'label',
	      noSelectionText: 'Select something',
	      listRelationship: 'categories'
	    },
	
	    initialize:function(options) {
	      options = options || {};
	      this.subViews = [];
	
	      for (var key in this.fields) {
	        var field = this.fields[key];
	        this.subViews.push(
	          new field.cls(_.extend({}, this.defaultFieldOptions, field.options, {
	            selector: '.' + key
	          }))
	        );
	      }
	
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	
	      var model = new Post(ExampleData.POST_WITH_CATEGORIES);
	      this.setModel(model);
	
	      var typeAheadListModel = new Plumage.collection.DataCollection(
	        ExampleData.POST_WITH_CATEGORIES.categories,
	        {processInMemory: true, queryAttrs: ['label']}
	      );
	      typeAheadListModel.onLoad();
	
	      _.where(this.subViews, {selector: '.type-ahead-select'})[0].setListModel(typeAheadListModel);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 264 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>These fields let you pick a value from a list. Their common base class is Plumage.form.fields.Select</p>\n  <p>The set of options is taken from another model (the list model) that is also bound to the field.</p>\n  <p>\n    Bind the listModel with Select.setListModel(), or use the Select.listRelationship\n    option to have it automatically bind in the model tree.\n  </p>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.Select</h4>\n  <p>A basic html select</p>\n  <div class=\"select\"></div>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.DropdownSelect</h4>\n  <p>Bootstrap dropdown style</p>\n  <div class=\"dropdown-select\"></div>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.TypeAhead</h4>\n  <p>Type ahead select</p>\n  <div class=\"type-ahead-select\"></div>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.CategorySelect</h4>\n  <p>Bootstrap nav-pills style</p>\n  <div class=\"category-select\"></div>\n</div>\n\n<div class=\"example\">\n  <h4>Plumage.form.fields.ButtonGroupSelect</h4>\n  <p>Bootstrap btn-group style</p>\n  <div class=\"button-group-select\"></div>\n</div>\n"

/***/ },
/* 265 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(7),
	  __webpack_require__(4),
	  __webpack_require__(253),
	  __webpack_require__(266),
	  __webpack_require__(267),
	  __webpack_require__(255)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, moment, Plumage, User, AsyncModelMixin, template, countries) {
	
	  return Plumage.view.ModelView.extend({
	
	    modelCls: User,
	
	    template: template,
	
	    formInvalid: true,
	
	    subViews: [{
	      viewCls: Plumage.view.form.fields.DateField,
	      selector: '.past-date',
	      label: 'Date this week',
	      minDate: moment().startOf('week'),
	      maxDate: moment().startOf('week').add({day: 6})
	    }, {
	      viewCls: Plumage.view.form.fields.DurationField,
	      selector: '.duration-field',
	      label: 'Duration Field'
	    }, {
	      viewCls: Plumage.view.form.fields.Field,
	      selector: '.validated-field',
	      label: 'At least 2 characters',
	      validationRules: {
	        minLength: 2,
	        required: true
	      }
	    }, {
	      viewCls: Plumage.view.form.Form,
	      selector: '.server-form',
	      name: 'serverForm',
	      className: 'form-horizontal',
	      template: '<div class="fields"></div><div class="address"></div><input type="submit" value="Submit"/>',
	      subViews: [{
	        viewCls: Plumage.view.form.fields.Field,
	        selector: '.fields',
	        label: 'Invalid then Valid',
	        valueAttr: 'name'
	      }]
	    }],
	    initialize: function(options) {
	      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	
	      var form = this.getSubView('serverForm');
	
	      var model = new (Plumage.model.Model.extend(AsyncModelMixin))();
	      var i = 0;
	      model.ajaxResponse = function(){
	        return [{
	          meta: {success: false, validationError: {'name': 'invalid'}}
	        }, {
	          meta: {success: true}
	        }][i++ % 2];
	      };
	      form.setModel(model);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 266 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(3), __webpack_require__(2), __webpack_require__(100)], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Model) {
	
	  return {
	    urlRoot: '/',
	
	    sync: function(method, model, options) {
	      var result = this.ajaxResponse;
	      if ($.isArray(result)) {
	        if (result.length > 1) {
	          result = result.shift();
	        } else {
	          result = result[0];
	        }
	      } else if ($.isFunction(result)) {
	        result = result(method, model, options);
	      }
	      if ($.isPlainObject(result.meta)) {
	        options.success(result);
	      } else {
	        options.error(result);
	      }
	      return $.Deferred().resolve(this, result).promise();
	    }
	  };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 267 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>There's three places you can perform form validation:</p>\n  <ul>\n    <li>In the Plumage View</li>\n    <li>In the Plumage Model</li>\n    <li>On the server</li>\n  </ul>\n</div>\n<div>\n  <h4>In the Plumage View</h4>\n\n  <p>In some views you can limit the range of selectable values, eg DateField.</p>\n  <div class=\"past-date form-horizontal\"></div>\n\n  <p>DurationField validates for a number by default.</p>\n  <div class=\"duration-field form-horizontal\"></div>\n\n  <p>You can also specify validationRules and validationMessages.</p>\n  <div class=\"validated-field form-horizontal\"></div>\n\n  <h4>In the Plumage Model</h4>\n\n  <p>\n    It's possible to do this with Backbone's validation (Override <a href=\"http://backbonejs.org/#Model-validate\">validate</a> and call <a href=\"http://backbonejs.org/#Model-isValid\">isValid</a>).\n  </p>\n  <p>\n    But don't do this. It's too late to provide realtime feedback (like in field validation), and you'll\n    need to validate on the server anyway (protect against manually constructed POST etc.), so the only reason to do this\n    is if you're not saving to a server.\n  </p>\n\n  <h4>On the Server</h4>\n\n  <p>Whether or not you validate on the client, you still need to validate on the server.</p>\n  <p>On save, if the response contains validation errors, the model will trigger 'invalid' instead of 'error'.</p>\n  <code>{meta: {success: false, validationError: {field: 'message'}}}</code>\n\n  <p>eg</p>\n  <div class=\"server-form\"></div>\n</div>\n"

/***/ },
/* 268 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(217),
	  __webpack_require__(269),
	  __webpack_require__(228)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage, BaseExample, CountryCollection, template, countryData) {
	
	  return BaseExample.extend({
	
	    modelCls: CountryCollection,
	
	    template: template,
	
	    subViews: [{
	      viewCls: Plumage.view.grid.FilterView,
	      selector: '.filter-view',
	      filterConfigs: [{
	        placeholder: 'Name',
	        filterKey: 'name'
	      }, {
	        placeholder: 'Region',
	        filterKey: 'region'
	      }]
	    }, {
	      viewCls: Plumage.view.grid.GridView,
	      selector: '.grid-view',
	      infiniteScroll: false,
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
	
	      var model =  new CountryCollection(countryData, {processInMemory: true});
	      model.on('change', function() {
	        model.load();
	      });
	
	      this.setModel(model);
	      model.onLoad();
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 269 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>\n    You probably want to be able to filter your grid. To do this, add a FilterView adjacent to the grid,\n    and bound to the same collection. Specify which fields to filter with the filterConfigs param.\n  </p>\n  <p>\n    Don't forget to reload your Collection on change!\n  </p>\n</div>\n\n<div class=\"example\">\n  <h5>Grid with FilterView</h5>\n  <div class=\"filter-view\"></div>\n  <div class=\"grid-view\"></div>\n\n</div>\n\n\n\n"

/***/ },
/* 270 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(217),
	  __webpack_require__(246),
	  __webpack_require__(271),
	  __webpack_require__(228)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage, CountryCollection, BaseExample, template, countryData) {
	
	  return BaseExample.extend({
	
	    modelCls: CountryCollection,
	
	    template: template,
	
	    subViews: [{
	      viewCls: Plumage.view.grid.GridView,
	      selector: '.grid-view',
	      infiniteScroll: false,
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
	      var model =  new CountryCollection(countryData);
	      this.setModel(model);
	      model.onLoad();
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 271 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>\n    GridView is a wrapper around <a href=\"https://github.com/mleibman/SlickGrid\" target=\"_\">SlickGrid</a>,\n    a very awesome JS grid component.\n  </p>\n  <p>\n    A key factor in choosing SlickGrid is its support for infinite scroll. Plumage is for presenting your datasets,\n    whatever size they are, and let's be honest, nobody wants to press 'next page' anymore.\n  </p>\n</div>\n\n<div class=\"example\">\n  <h4>Basic Usage</h4>\n\n  <p>\n    Define <a href=\"https://github.com/mleibman/SlickGrid/wiki/Column-Options\" target=\"_\">columns</a> in the columns property,\n    and pass any other <a href=\"https://github.com/mleibman/SlickGrid/wiki/Grid-Options\" target=\"_\">SlickGrid options</a>\n    in with the gridOptions property.\n  </p>\n\n  <h5>Plumage.view.grid.GridView</h5>\n  <div class=\"grid-view\"></div>\n\n</div>\n\n\n\n"

/***/ },
/* 272 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(266),
	  __webpack_require__(217),
	  __webpack_require__(273),
	  __webpack_require__(228)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage, BaseExample, AsyncModelMixin, CountryCollection, template, countryData) {
	
	  return BaseExample.extend({
	
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 273 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>\n    In order to reduce response time when querying large data sets, you'll want to return only\n    a portion of all rows in a single query. Traditionally you'd do this with paging, but a more useable\n    solution is allocate space for all rows, but query them only as they become visible.\n  </p>\n  <p>\n    To do this in a GridView just set {infiniteScroll: true} (the default) and paging will be taken care\n    of for you when necessary.\n  </p>\n</div>\n\n<div class=\"example\">\n  <h5>Grid with Infinite Scroll (page size: 20)</h5>\n\n  <pre class=\"request-log\" style=\"height: 80px; overflow: auto;\"></pre>\n  <div class=\"grid-view\"></div>\n</div>\n\n\n\n"

/***/ },
/* 274 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(266),
	  __webpack_require__(217),
	  __webpack_require__(275),
	  __webpack_require__(228)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage, BaseExample, AsyncModelMixin, CountryCollection, template, countryData) {
	
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 275 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>\n    One requirement of using automatic paging is that you need the total number of rows so that enough\n    scroll space can be allocated.\n  </p>\n  <p>\n    If the total number of rows is unknown, we can fall back to traditional 'click next' paging.\n  </p>\n</div>\n\n<div class=\"example\">\n  <h5>Grid with Paging (page size: 20)</h5>\n\n  <pre class=\"request-log\" style=\"height: 80px; overflow: auto;\"></pre>\n  <div class=\"grid-view\"></div>\n  <div class=\"grid-pager\"></div>\n</div>\n\n\n\n"

/***/ },
/* 276 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(277)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Plumage, BaseExample, template) {
	
	  return BaseExample.extend({
	
	    template: template,
	
	    initialize:function(options) {
	      options = options || {};
	      BaseExample.prototype.initialize.apply(this, arguments);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 277 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>Collections are models that contain a list of other models.</p>\n</div>\n\n<div class=\"example\">\n  <h4>Remote Sorting, Filtering and Paging</h4>\n  <p>\n    Big Collections can be too to large to load efficiently in one request. Use paging to load only the models that\n    are currently being displaying. Also with big collections sorting and filtering helps users find what they're looking for.\n    Because you only have part of the data, these also have to be done server side.\n  </p>\n\n  <h5>Example</h5>\n  <div class=\"example-code\">\n  <pre><code>var MyCollection = Plumage.collection.Collection.extend({\n  model: Plumage.model.Model,\n  urlRoot: '/my_collection'\n});\nvar c = new MyCollection();\nc.set({sortDir: 1, sortField: 'name'});\nc.load();\nlog('request params: ' + JSON.stringify(testEnv.ajaxSettings.data));\n\nc.setFilter('name', 'foo');\nc.set('page', 1);\nc.load();\nlog('request params: ' + JSON.stringify(testEnv.ajaxSettings.data));\n</code></pre>\n  </div>\n  <p>It's up to the server to accept these params and return the correct results.</p>\n  <p>Only attributes listed in the collection's <code>viewState</code> option get included in the request params.</p>\n</div>\n\n<div class=\"example\">\n  <h4>Local Sorting and Filtering</h4>\n  <p>\n    If a collection is small, you can have it sort and filter client side by setting the <code>processInMemory</code> option.\n  </p>\n\n  <h5>Example</h5>\n  <div class=\"example-code\">\n  <pre><code>var MyCollection = Plumage.collection.Collection.extend({\n  model: Plumage.model.Model\n});\nvar c = new MyCollection([{id: 'id1'}, {id: 'id2'}, {id: 'id3'}], {processInMemory: true});\nc.onLoad(); // set loaded flag without a remote request. You can also call load() and get data from the server.\n\nlog('collection: ' + JSON.stringify(c.models));\n\nc.set({sortDir: -1, sortField: 'id'});\nc.load();\nlog('collection: ' + JSON.stringify(c.models));\nc.setFilter('id', 'id2');\nc.load();\nlog('collection: ' + JSON.stringify(c.models));</code></pre>\n  </div>\n\n  <p><strong>Note: Models in a collection must each have a unique id attribute.</strong></p>\n  <p>Set <code>idAttribute</code> on your Model class to define which attribute to use as the id.</strong></p>\n</div>\n\n<div class=\"example\">\n  <h4>Attributes</h4>\n  <p>\n    Because a Collection is also a Model, it has attributes, and these attributes are evented and can be bound to\n    fields etc just like a Model's. We've already seen some of these: sortField, sortDir, page and pageSize.\n  </p>\n  <p>\n    Collection attributes are useful for storing any information about the collection that's not part of its models.\n    If you want an attribute included in a Collection's query params, add it to the <code>viewState</code> option.\n  </p>\n\n  <h5>Example</h5>\n  <div class=\"example-code\">\n  <pre><code>var c = new Plumage.collection.Collection([], {meta: {'name': 'my_col'}});\nc.on('all', function(event) { log('event: ' + event); });\n\nlog('c.name: ' + c.get('name'));\nc.set('name', 'my_col2');\nlog('c.name: ' + c.get('name'));</code></pre>\n  </div>\n</div>\n\n\n"

/***/ },
/* 278 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(279)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Plumage, BaseExample, template) {
	
	  return BaseExample.extend({
	
	    template: template,
	
	    initialize:function(options) {
	      options = options || {};
	      BaseExample.prototype.initialize.apply(this, arguments);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 279 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>Models inherits from <a href=\"http://backbonejs.org/#Model\">Backbone.Model</a></p>\n  <p>\n    Backbone.Model gives us getters, setters, events and async loading. In addition to this, Plumage adds relationships,\n    some more events and unifies the interface for Models and Collections.\n  </p>\n</div>\n\n<div class=\"example\">\n  <h4>Getters and setters</h4>\n  <p>Model values are stored as unstructured JS objects. There's no need to specify field names or types ahead of time.</p>\n\n  <h5>Example</h5>\n  <div class=\"example-code\">\n    <pre><code>var model = new Plumage.model.Model({name: 'foo', value: 'bar'});\nlog('name: ' + model.get('name'));\nmodel.set('name', 'baz');\nlog('name: ' + model.get('name'));</code></pre>\n  </div>\n</div>\n\n<div class=\"example\">\n  <h4>Events</h4>\n  <p>Models fire events when attributes change, as well as before and after loading.</p>\n\n  <h5>Example</h5>\n  <div class=\"example-code\">\n  <pre><code>var model = new Plumage.model.Model();\nmodel.urlRoot = '/my_model';\nmodel.on('all', function(event) {\n  log('event: ' + event);\n});\nmodel.set({'name': 'foo'});\nlog('--');\nmodel.load();</code></pre>\n  </div>\n</div>\n\n"

/***/ },
/* 280 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(281)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Plumage, BaseExample, template) {
	
	  return BaseExample.extend({
	
	    template: template,
	
	    initialize: function(options) {
	      options = options || {};
	      BaseExample.prototype.initialize.apply(this, arguments);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 281 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>\n    Model relationships are defined in the model's class by setting the relationships attribute.\n  </p>\n  <p>\n    Load data into related models by nesting their data inside the root model's data.\n    It will be pulled out automatically and used to instantiate the related models.\n  </p>\n</div>\n\n<div class=\"example\">\n  <h5>Example</h5>\n  <div class=\"example-code\">\n  <pre><code>var MyModel = Plumage.model.Model.extend({\n  relationships: {\n    'related': {\n      modelCls: Plumage.model.Model\n    }\n  }\n});\nvar model = new MyModel({name: 'foo', related: {name: 'bar'}});\nlog('name: ' + model.get('name'));\nlog('related.name: ' + model.getRelated('related').get('name'));</code></pre>\n  </div>\n</div>\n\n<div class=\"example\">\n  <h4>Async Loading</h4>\n  <p>Related models can be loaded asynchronously by setting the remote option in their relationship definition.</p>\n  <p>The remote option can be one of 3 values, which determines when the relationship gets loaded</p>\n  <ul>\n    <li>'autoload' - Load as soon as the relation url is available.</li>\n    <li>'loadOnShow' - Load the first time a view bound to the current model is shown.</li>\n    <li>'manual' - No automatic loading. It's up to you to call load on the related model in your Controller.</li>\n  </ul>\n\n  <h5>Example</h5>\n  <div class=\"example-code\">\n  <pre><code>var RelatedModel = Plumage.model.Model.extend({urlRoot: '/related_model'});\nvar MyModel = Plumage.model.Model.extend({\n  urlRoot: '/base_model',\n  relationships: {\n    'related': {\n      modelCls: RelatedModel,\n      remote: 'autoload',\n      forceCreate: true // option (1) above\n    }\n  }\n});\nvar model = new MyModel({related: {}}); // option (2) above\nmodel.load();\n</code></pre>\n  </div>\n</div>\n\n<div class=\"example\">\n  <h4>loadOnShow</h4>\n  <p>If you're not going to use related data right away (eg if it's on a tab),\n  you can set the remote option to 'loadOnShow' and it will hold off until explicitly it's shown.</p>\n\n  <h5>Example</h5>\n  <div class=\"example-code\">\n  <pre><code>var RelatedModel = Plumage.model.Model.extend({urlRoot: '/related_model'});\nvar MyModel = Plumage.model.Model.extend({\n  urlRoot: '/base_model',\n  relationships: {\n    'related': {\n      modelCls: RelatedModel,\n      remote: 'loadOnShow'\n    }\n  }\n});\nvar model = new MyModel({related: {}});\nmodel.load();\nlog('--');\nlog('model marked to loadOnShow: ' + model.getRelated('related').loadOnShow);\nmodel.getRelated('related').load();\n</code></pre>\n  </div>\n"

/***/ },
/* 282 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(259),
	  __webpack_require__(283),
	  __webpack_require__(284)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage, BaseExample, Post, PostCollection, template) {
	
	  return BaseExample.extend({
	
	    modelCls: PostCollection,
	
	    template: template,
	
	    POSTS_DATA: [{
	      id: 1,
	      title: 'my post 1',
	      body: 'my body',
	      author: {name: 'Alice'},
	      comments: [{
	        id: 5,
	        body: 'my comment',
	        user: {
	          username: 'user1'
	        }
	      }],
	    }, {
	      id: 2,
	      title: 'my post 2',
	      body: 'my body2',
	      author: {name: 'Bob'},
	      comments: [{
	        id: 6,
	        body: 'my comment2',
	        user: {
	          username: 'user1'
	        }
	      }, {
	        id: 7,
	        body: 'another comment',
	        user: {
	          username: 'user3'
	        }
	      }]
	    }],
	
	    initialize:function(options) {
	      options = options || {};
	
	      this.events = _.extend({'click #add-post-btn': 'onAddPostClick'}, this.events);
	
	      var CommentView = Plumage.view.ModelView.extend({
	        template: 'Comment: {{body}} <div class="user" style="margin-left: 20px"></div',
	        initialize: function(options) {
	          this.subViews = [
	            new Plumage.view.ModelView({
	              relationship: 'user',
	              selector: '.user',
	              template: 'User: {{username}}'
	            })
	          ];
	          Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	        }
	      });
	
	      this.subViews = [
	        new Plumage.view.CollectionView({
	          selector: '.collection-view',
	          itemViewCls: Plumage.view.ModelView,
	          itemOptions: {
	            template: 'Post: {{title}}'
	          },
	          onModelAdd: function() {
	            Plumage.view.CollectionView.prototype.onModelAdd.apply(this, arguments);
	          }
	        }),
	        new Plumage.view.CollectionView({
	          selector: '.advanced-collection-view',
	          itemViewCls: Plumage.view.ModelView.extend({
	            template: 'Post: {{title}} <div class="comments" style="margin-left: 20px"></div>',
	            initialize: function(options) {
	              options = options || {};
	              this.subViews = [
	                new Plumage.view.CollectionView({
	                  selector: '.comments',
	                  relationship: 'comments',
	                  itemViewCls: CommentView
	                })
	              ];
	              Plumage.view.ModelView.prototype.initialize.apply(this, arguments);
	            }
	          }),
	        })
	      ];
	
	      BaseExample.prototype.initialize.apply(this, arguments);
	
	      this.setModel(new PostCollection(this.POSTS_DATA));
	    },
	
	    onAddPostClick: function() {
	      var index = this.model.size() + 1;
	      this.model.add(new Post({id: index, title: 'my post ' + index, body: 'my body ' + index}));
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 283 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(116),
	  __webpack_require__(259)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(Collection, Post) {
	
	  return Collection.extend({
	    modelName: 'PostCollection',
	
	    urlRoot: Post.prototype.urlRoot,
	    model: Post,
	
	    sortField: 'body',
	    sortDir: '-1',
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 284 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>\n    CollectionView renders a Model view for each model in a Collection.\n  </p>\n</div>\n\n<div class=\"example\">\n  <h4>Basic Usage</h4>\n\n  <h5>Plumage.view.CollectionView</h5>\n  <div class=\"collection-view well\"></div>\n  <a class=\"btn\" id=\"add-post-btn\">Add Post</a>\n</div>\n\n<div class=\"example\">\n  <h4>Advanced Usage</h4>\n\n  <p>ModelViews and CollectionViews can be combined to display complex model hierarchies</p>\n\n  <div class=\"advanced-collection-view well\"></div>\n\n  <p>\n    In this example a bunch of adhoc view classes are defined to create the view hierarchy. It's a bit messy, but\n    in a real project your views wouldn't be this simple (with more complex rendering, event handlers etc),\n    so you'd define each view class in its own file.\n  </p>\n\n  <p>\n    I intend for the definition of the view hierarchy to become more declarative at some point. Rather than creating subViews\n    in initialize, you'll pass some json to a builder to construct the hierarchy.\n  </p>\n</div>\n\n\n\n"

/***/ },
/* 285 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(259),
	  __webpack_require__(286)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Backbone, Plumage, BaseExample, Post, template) {
	
	  return BaseExample.extend({
	
	    modelCls: Post,
	
	    template: template,
	
	    initialize:function(options) {
	      options = options || {};
	
	      this.events = _.extend({'click #update-model-btn': 'onUpdateModelClick'}, this.events);
	
	      this.subViews = [
	        new Plumage.view.ModelView({
	          selector: '.model-view',
	          template: 'Post name: {{name}}</span>',
	          updateOnChange: true
	        }),
	        new Plumage.view.ModelView({
	          selector: '.sub-model-view',
	          template: 'Post name: {{name}}</span> <div class="body"></div>',
	          subViews: [
	            new Plumage.view.ModelView({
	              selector: '.body',
	              template: 'Body in subview: {{body}}'
	            })
	          ]
	        }),
	        new Plumage.view.ModelView({
	          selector: '.view-with-relationship',
	          template: 'Post name: {{name}}</span> <div class="author"></div>',
	          subViews: [
	            new Plumage.view.ModelView({
	              selector: '.author',
	              relationship: 'author',
	              template: 'Related Author in Subview: {{name}}'
	            })
	          ]
	        }),
	      ];
	      BaseExample.prototype.initialize.apply(this, arguments);
	
	      this.setModel(new Post({name: 'my post', body: 'post body', author: {name: 'Bob'}}));
	    },
	
	    onUpdateModelClick: function() {
	      var name = this.model.get('name');
	      this.model.set('name', 'no, '+name);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 286 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>\n    ModelViews inherits from ContainerView, so it too can have a tree of subviews.\n    Binding models throughout this tree manually would be tedious though, so by default, setModel and updateModel walk the view tree visiting applying themselves to each subview.\n  </p>\n\n  <p>Rather than Setting the relationship property on a ModelView allows you to specify which model in a tree of related models to use for rendering.</p>\n\n  <p>ModelView allows you bind a tree of related models to a tree of nested subviews in a declarative manner.</p>\n  <p>\n    Plumage adds integration with Handlebars templates, subviews, model binding, and some more hooks (eg onShow/noHide).\n  </p>\n</div>\n\n<div class=\"example\">\n  <h4>Model Binding</h4>\n  <p>ModelView.setModel binds a model to that view.\n  The view will then update when the model fires change and load events.</p>\n\n  <h5>Plumage.view.ModelView</h5>\n  <div class=\"model-view well\"></div>\n  <a class=\"btn\" id=\"update-model-btn\">Update Model</a>\n</div>\n\n<div class=\"example\">\n  <h4>Subviews Can Bind Too</h4>\n  <p>\n    setModel also passes the model to setModel on all subViews.\n    This makes it easy to, say, bind a model to all fields in a form. Views can also declare where in the model hierarchy\n    they want bind to by setting the 'relationship' property.\n  </p>\n\n  <p>If you look in the source of this example, you can see it's not setting the model on each example view. It's setting the\n  model on itself, which automatically propagates to all subviews.</p>\n\n  <h5>Subview binding</h5>\n  <div class=\"sub-model-view well\"></div>\n\n  <h5>relationship property</h5>\n  <div class=\"view-with-relationship well\"></div>\n\n  <p>You can also limit subview binding by setting the 'modelCls' property.\n  If you look at the source for this example, you can see it has modelCls: Post, which so that the Example model\n  representing this section doesn't also get set on the example views.\n  </p>\n\n  <p><strong>Note: Because each ModelView in the tree is independently listening to the bound model,\n    parent ModelViews should not render onModelChange.</strong></p>\n  <p>\n    If you did this, each subview would render during the parent view's onModelChange and then again during their own onModelChanges.\n    To prevent this from happening, ModelView by default does nothing in onModelChange. Set the 'updateOnChange' to true to turn on\n    rendering on change, or override onModelChange to update the DOM instead of performing a full render.\n  </p>\n\n</div>\n"

/***/ },
/* 287 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(252),
	  __webpack_require__(259),
	  __webpack_require__(288)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Plumage, BaseExample, ExampleData, Post, template) {
	
	  return BaseExample.extend({
	
	    template: template,
	
	    subViews: [{
	      viewCls: Plumage.view.form.fields.DropdownSelect,
	      selector: '.dropdown-select',
	      valueAttr: 'dropdown',
	      noSelectionText: 'Select something',
	      listValues: [
	        {label: 'Select foo!', value: 'foo'},
	        {label: 'No, select bar!', value: 'bar'}
	      ],
	      updateModelOnChange: true
	    }, {
	      viewCls: Plumage.view.ModelView,
	      selector: '.query-string',
	      template: '<label>Query String:</label><span>{{queryParams}}</span>',
	      getTemplateData: function() {
	        return {queryParams: $.param(this.model.getQueryParams())};
	      },
	      onModelChange: function(model) {
	        Plumage.view.ModelView.prototype.onModelChange.apply(this, arguments);
	        this.$('span').css({'background-color': '#ff3'});
	        this.$('span').animate({'background-color': '#fff'}, 600);
	      }
	    }],
	
	    onModelChange: function(model, options) {
	      if (model.changed.dropdown) {
	        model.updateUrl();
	      }
	      BaseExample.prototype.onModelChange.apply(this, arguments);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 288 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"intro\">\n  <p>Models can save and load state from the url's query params, which is useful for maintaining view state for when you\n    refresh the page, save a bookmark or share the link with others.\n  </p>\n\n  <p>\n    All the examples in the Kitchen Sink use view state. Click the \"Source\" tab directly above this paragraph,\n    then reload the page.\n  </p>\n\n  <p>\n    Get the picture? Add the fields you want saved to your model's viewAttrs option, which gets it\n    included in the query string returned by model.urlWithParams().\n  </p>\n\n  <p>\n    Then make sure your Controller is passing the query params (the last argument passed into the handler) into\n    createDetailModel or createIndexModel.\n  </p>\n  <p>eg.</p>\n\n  <pre><code>myDetailHandler: function(id, viewState) {\n  var model = createDetailModel(id, {}, viewState);\n  this.showDetailModel(model);\n}</code></pre>\n\n  <p>\n    View state can be used like any other model attribute. It can be get, set, and bound to fields. Changing it\n    fires change events like normal. When view state changes, however, model.updateUrl() must be called in order\n    to view state into the current url.\n  </p>\n  <p>\n    <div class=\"dropdown-select\"></div>\n  </p>\n  <p>\n    <div class=\"query-string\"></div>\n  </p>\n  <p>\n    Don't forget to set updateModelOnChange = true on the field if you want the model updated immediately.\n  </p>\n</div>\n"

/***/ },
/* 289 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(1),
	  __webpack_require__(3),
	  __webpack_require__(4),
	  __webpack_require__(246),
	  __webpack_require__(259),
	  __webpack_require__(290)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function($, _, Plumage, BaseExample, Post, template) {
	
	  return BaseExample.extend({
	
	    template: template,
	
	    subViews: [{
	      viewCls: Plumage.view.View,
	      selector: '.base-view',
	      template: 'Name: {{name}}',
	      getTemplateData: function() {return {name: 'foo'};}
	    }, {
	      viewCls: Plumage.view.ModelView,
	      selector: '.container-view',
	      template: 'SubView: <span class="subview"></span>',
	      subViews: [{
	        selector: '.subview',
	        template: 'I am a subview'
	      }]
	    }]
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 290 */
/***/ function(module, exports) {

	module.exports = "<div class=\"intro\">\n  <p>Views inherits from <a href=\"http://backbonejs.org/#View\">Backbone.View</a> from which we get event delegation and basic DOM rendering.</p>\n  <p>\n    Plumage adds integration with Handlebars templates, subviews, model binding, and some more hooks (eg onShow/noHide).\n  </p>\n</div>\n\n<div class=\"example\">\n  <h4>Templates</h4>\n  <p>The default rendering logic takes a View's template property and render's it into its DOM element.\n    The template data used in rendering is determined by the getTemplateData method.\n  </p>\n  <h5>Plumage.view.BaseView</h5>\n  <div class=\"base-view well\"></div>\n</div>\n\n<div class=\"example\">\n  <h4>Subviews</h4>\n  <p>You can nest views by adding them to a view's subViews property.</p>\n  <p>Specify the selector property to choose where in the parent view's element the subview will render</p>\n\n  <h5>Plumage.view.ContainerView</h5>\n  <div class=\"container-view well\"></div>\n</div>\n\n<div class=\"example\">\n  <h4>onShow/onHide</h4>\n  <p>onShow and onHide are hooks you can override to execute logic just before a view is shown, or after it's hidden. Just dont' forget to call the super</p>\n  <p>When using 3rd party views with Plumage, you may find they have issues like rendering problems, or events not triggering.\n  This is because Plumage moves views in and out of the DOM as they're shown and hidden. To fix this, you should override\n  onShow and onHide to add and remove event listeners respectively. If this still doesn't work, you may need to defer the\n  initial rendering of the 3rd party view until onShow is called the first time.\n  </p>\n</div>"

/***/ },
/* 291 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./BaseExample.js": 292,
		"./ExampleSectionView.js": 293,
		"./ExampleView.js": 294,
		"./ExampleWithSourceView.js": 295,
		"./SourceView.js": 296,
		"./form/DateFields.js": 297,
		"./form/FieldsAndForms.js": 298,
		"./form/InPlaceFields.js": 299,
		"./form/MultiSelectFields.js": 300,
		"./form/SelectFields.js": 301,
		"./form/Validation.js": 302,
		"./grid/Filters.js": 303,
		"./grid/Grids.js": 304,
		"./grid/InfiniteScroll.js": 305,
		"./grid/Paging.js": 306,
		"./model/Collections.js": 307,
		"./model/Models.js": 308,
		"./model/Relationships.js": 309,
		"./view/CollectionViews.js": 310,
		"./view/ModelViews.js": 311,
		"./view/ViewState.js": 312,
		"./view/Views.js": 313
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 291;


/***/ },
/* 292 */
/***/ function(module, exports) {

	module.exports = "/*jshint -W061 */\ndefine([\n  'jquery',\n  'underscore',\n  'backbone',\n  'handlebars',\n  'plumage',\n  'kitchen_sink/highlight',\n  'test/environment'\n], function($, _, Backbone, Handlebars, Plumage, hljs, Environment) {\n\n  return Plumage.view.ModelView.extend({\n    className: 'example-view',\n\n    template: '<div class=\"the-example\"></div>',\n\n    events: {\n      'click .example-result a': 'onExampleResultClick'\n    },\n\n    updateOnChange: false,\n\n    initialize: function() {\n      this.testEnv = new Environment();\n      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n    },\n\n    onRender: function() {\n      Plumage.view.ModelView.prototype.onRender.apply(this, arguments);\n\n      this.testEnv.setup();\n      this.$('.example-code').each(function(i, el) {this.evaluateExampleCode(el);}.bind(this));\n      this.testEnv.teardown();\n    },\n\n    evaluateExampleCode: function(el) {\n      var code = $('code', el), result = '', f;\n      if (code) {\n        f = eval('(function (Plumage, log, testEnv) {' + code.text() + '})');\n        var exampleConsole = {log: function(text) {\n          result += text + '\\n';\n        }};\n\n        this.testEnv.console = exampleConsole;\n        f(Plumage, exampleConsole.log, this.testEnv);\n      }\n      $(el).append($('<div class=\"example-result\"><a>Result</a><pre><code>'+ result +'</code></pre></div>'));\n      hljs.highlightBlock(code[0], ['javascript']);\n    },\n\n    onExampleResultClick: function(event) {\n      var parent = $(event.target).parent('.example-result');\n      parent.toggleClass('expanded');\n\n      $('pre', parent).slideToggle({duration: 200});\n    }\n  });\n});"

/***/ },
/* 293 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'handlebars',\n  'plumage',\n  'kitchen_sink/view/example/ExampleWithSourceView',\n  'kitchen_sink/view/example/templates/ExampleSectionView.html',\n  'jquery.scrollTo'\n], function($, _, Backbone, Handlebars, Plumage, ExampleWithSourceView, template) {\n\n  return Plumage.view.ModelView.extend({\n    className: 'example-section-view',\n\n    template: template,\n\n    events: {\n      'scroll': 'onScroll'\n    },\n\n    subViews: [{\n      viewCls: Plumage.view.ListView,\n      name: 'navListView',\n      selector: '.example-list',\n      relationship: 'examples',\n      selectionAttr: 'example',\n      itemOptions: {template: '{{title}} <i class=\"icon-chevron-right\"></i>'}\n    }, {\n      viewCls: Plumage.view.CollectionView,\n      name: 'examplesView',\n      selector: '.examples',\n      relationship: 'examples',\n      itemViewCls: ExampleWithSourceView\n    }],\n\n    initialize:function(options) {\n      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n\n      this.getSubView('examplesView').on('itemRender', this.onItemRender.bind(this));\n    },\n\n    /**\n     * overrides\n     */\n\n    onRender: function() {\n      Plumage.view.ModelView.prototype.onRender.apply(this, arguments);\n    },\n\n    setModel: function(rootModel) {\n      Plumage.view.ModelView.prototype.setModel.apply(this, arguments);\n      this.currentExample = this.model.get('example');\n      this.getSubView('navListView').setSelectionModel(this.model);\n      this.updateSelected();\n      this.$el.scrollTop(0);\n    },\n\n    update: function() {\n      // do nothing\n    },\n\n    /**\n     * Helpers\n     */\n\n    updateScroll: function() {\n      var exampleId = this.model.get('example');\n      if (exampleId) {\n        var itemView = this.getSubView('examplesView').getItemView(exampleId);\n        if (itemView) {\n          this.scrolling = true;\n          this.$el.scrollTo(itemView.el);\n          this.scrolling = false;\n        }\n      }\n    },\n\n    updateSelected: function() {\n      if (this.scrolling) {\n        return;\n      }\n      var scrollTop = this.$el.scrollTop(),\n        top = this.$el.offset().top,\n        height = this.$el.height(),\n        scrollHeight = this.$el[0].scrollHeight,\n        maxScroll = scrollHeight - height;\n\n      var examplesView = this.getSubView('examplesView');\n      for ( var i = 0; i < examplesView.itemViews.length; i++) {\n        var itemView = examplesView.itemViews[i];\n        if (itemView.$el.offset().top + itemView.$el.height() - top > height/2) {\n          this.currentExample = itemView.model.get('name');\n          this.model.set('example', this.currentExample);\n          itemView.model.updateUrl();\n          break;\n        }\n      }\n    },\n\n    /**\n     * Event Handlers\n     */\n\n    onScroll: function(event) {\n      this.updateSelected();\n    },\n\n    onModelChange: function(event) {\n      if (event.changed.example !== undefined) {\n        var exampleName = this.model.get('example');\n        if (this.currentExample !== exampleName) {\n          this.currentExample = exampleName;\n          this.updateScroll();\n        }\n      }\n    },\n\n    onItemRender: _.debounce(function() {\n      this.updateScroll();\n    }, 300)\n  });\n});"

/***/ },
/* 294 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'handlebars',\n  'plumage'\n], function($, _, Backbone, Handlebars, Plumage) {\n\n  return Plumage.view.ModelView.extend({\n    className: 'example-view',\n\n    template: '<div class=\"the-example\"></div>',\n\n    updateOnChange: false,\n\n    initialize: function() {\n      this.subViews = [];\n      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n    },\n\n    onModelLoad: function() {\n      var viewCls = this.model.getViewCls();\n      if (viewCls) {\n        this.subViews = _.without(this.subViews, this.example);\n        this.example = new viewCls({selector: '.the-example'});\n        this.subViews.push(this.example);\n        this.update();\n      }\n    }\n  });\n});"

/***/ },
/* 295 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'handlebars',\n  'plumage',\n  'kitchen_sink/view/example/ExampleView',\n  'kitchen_sink/view/example/SourceView',\n  'kitchen_sink/view/example/templates/ExampleWithSourceView.html'\n], function($, _, Backbone, Handlebars, Plumage, ExampleView, SourceView, template) {\n\n  return Plumage.view.ModelView.extend({\n    className: 'example-with-source',\n\n    template: template,\n\n    initialize: function() {\n      this.subViews = [\n        new Plumage.view.TabView({\n          selector: '.example-tabs',\n          className: 'tab-view tab-theme',\n          subViews: [\n            new ExampleView({tabId: 'page', tabLabel: 'Page'}),\n            new SourceView({tabId: 'source', tabLabel: 'Source', sourceType: 'js', suffix: 'js'}),\n            new SourceView({tabId: 'html', tabLabel: 'HTML', sourceType: 'html', suffix: 'html'})\n          ]\n        })\n      ];\n\n      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n    },\n\n    onRender: function() {\n      if (this.model) {\n        var name = this.model.get('name');\n        Plumage.view.ModelView.prototype.onRender.apply(this, arguments);\n      }\n    }\n  });\n});"

/***/ },
/* 296 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'handlebars',\n  'kitchen_sink/highlight',\n  'plumage',\n  'kitchen_sink/view/example/templates/SourceView.html'\n], function($, _, Backbone, Handlebars, hljs, Plumage, template) {\n\n  return Plumage.view.ModelView.extend({\n    className: 'example-source',\n\n    template: template,\n\n    deferRender: true,\n\n    sourceType: 'js',\n\n    getTemplateData: function(){\n      var data = Plumage.view.ModelView.prototype.getTemplateData.apply(this, arguments);\n\n      if (this.sourceType === 'js') {\n        data.source = this.model.getJsSource();\n      } else {\n        data.source = this.model.getHtmlSource();\n      }\n\n      if (data.source) {\n        data.source = hljs.highlightAuto(data.source, ['javascript', 'html']).value;\n      }\n      data.title = this.getTitle();\n      return data;\n    },\n\n    getTitle: function() {\n      return this.model.get('name') + '.' + this.suffix;\n    }\n  });\n});"

/***/ },
/* 297 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'handlebars',\n  'moment',\n  'plumage',\n  'example/model/Vacation',\n  'kitchen_sink/view/example/form/templates/DateFields.html'\n], function($, _, Handlebars, moment, Plumage, Vacation, template) {\n\n  return Plumage.view.ModelView.extend({\n\n    template: template,\n\n    modelCls: Vacation,\n\n    defaultSubViewOptions: {\n      updateModelOnChange: true\n    },\n\n    subViews: [\n      {\n        viewCls: Plumage.view.form.fields.DateField,\n        selector: '.date-field1',\n        label: 'From Date',\n        valueAttr: 'fromDate',\n        maxDateAttr: 'toDate'\n      },\n      {\n        viewCls: Plumage.view.form.fields.DateField,\n        selector: '.date-field2',\n        label: 'To Date',\n        valueAttr: 'toDate',\n        minDateAttr: 'fromDate'\n      },\n      {\n        viewCls: Plumage.view.form.fields.HourSelect,\n        selector: '.hour-field1',\n        label: 'From Hour',\n        valueAttr: 'fromDate'\n      },\n      {\n        viewCls: Plumage.view.form.fields.HourSelect,\n        selector: '.hour-field2',\n        valueAttr: 'fromDate',\n        replaceEl: true\n      },\n      {\n        viewCls: Plumage.view.form.fields.DateField,\n        selector: '.date-field3',\n        valueAttr: 'fromDate',\n        maxDateAttr: 'toDate',\n        keepTime: true,\n        replaceEl: true\n      },\n      {\n        viewCls: Plumage.view.form.fields.DateRangeField,\n        selector: '.date-range-field',\n        fromAttr: 'fromDate',\n        toAttr: 'toDate'\n      },\n      {\n        viewCls: Plumage.view.form.fields.DateRangeField,\n        selector: '.date-range-field-hour',\n        fromAttr: 'fromDate',\n        toAttr: 'toDate',\n        pickerOptions: {\n          showHourSelect: true\n        }\n      },\n      {\n        viewCls: Plumage.view.form.fields.DurationField,\n        selector: '.duration-field',\n        valueAttr: 'duration'\n      }\n    ],\n\n    initialize: function(options) {\n      Plumage.view.form.fields.Field.prototype.initialize.apply(this, arguments);\n\n      var model = new Vacation({fromDate: moment().subtract('day', 7).valueOf(), toDate: moment().valueOf(), duration: 3600000});\n      this.setModel(model);\n    }\n  });\n});"

/***/ },
/* 298 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'handlebars',\n  'plumage',\n  'example/ExampleData',\n  'example/model/User',\n  'kitchen_sink/view/example/form/templates/FieldsAndForms.html',\n  'data/countries.json'\n], function($, _, Backbone, Handlebars, Plumage, ExampleData, User, template, countries) {\n\n  var Form1 = Plumage.view.form.Form.extend();\n\n  var Results1 = Plumage.view.ModelView.extend();\n\n  return Plumage.view.ModelView.extend({\n\n    modelCls: User,\n\n    template: template,\n\n    fields: ['name', 'address1', 'address2', 'country'],\n\n    subViews: [\n      {\n        name: 'updateOnChange',\n        viewCls: Plumage.view.form.fields.Checkbox,\n        selector: '#update-on-change',\n        label: ' ',\n        checkboxLabel: 'Update Model on Change'\n      }, {\n        name: 'form1',\n        selector: '.form1',\n        viewCls: Plumage.view.form.Form,\n\n        className: 'form-horizontal',\n        template: '<div class=\"fields\"></div><div class=\"address\"></div><input type=\"submit\" value=\"Submit\"/>',\n        subViews: [\n          {viewCls: Plumage.view.form.fields.Checkbox, selector: '.fields', label: 'Billing?', valueAttr: 'billing'},\n          {viewCls: Plumage.view.form.fields.Field, selector: '.fields', label: 'Name', valueAttr: 'name'},\n          {\n            viewCls: Plumage.view.ModelView,\n            name: 'addressFields',\n            selector: '.address',\n            className: 'well',\n            subViews: [\n              {viewCls: Plumage.view.form.fields.Field, label: 'Address 1', valueAttr: 'address1'},\n              {viewCls: Plumage.view.form.fields.Field, label: 'City', valueAttr: 'city'},\n              {\n                name: 'countrySelect',\n                viewCls: Plumage.view.form.fields.Select,\n                label: 'Country',\n                valueAttr: 'country',\n                listValueAttr: 'name',\n                listLabelAttr: 'name'\n              }\n            ]\n          }\n        ],\n      }, {\n        viewCls: Plumage.view.ModelView,\n        selector: '.results1',\n        className: 'form-horizontal',\n        defaultSubViewCls: Plumage.view.DisplayField,\n\n        subViews: [\n          {label: 'Billing?', valueAttr: 'billing'},\n          {label: 'Name', valueAttr: 'name'},\n          {label: 'Address 1', valueAttr: 'address1'},\n          {label: 'City', valueAttr: 'city'},\n          {label: 'Country', valueAttr: 'country'}\n        ]\n      }\n    ],\n\n    initialize:function(options) {\n      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n\n      this.getSubView('updateOnChange').on('change', this.onUpdateOnChangeClick.bind(this));\n\n      var countryData = new Plumage.collection.DataCollection(countries);\n      this.getSubView('form1.addressFields.countrySelect').setListModel(countryData);\n\n      var model = new User();\n      model.onLoad();\n      this.setModel(model);\n    },\n\n    onUpdateOnChangeClick: function(checkbox) {\n      var value = Boolean(checkbox.getValue());\n      this.getSubView('form1').updateModelOnChange = value;\n    }\n  });\n});"

/***/ },
/* 299 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'handlebars',\n  'plumage',\n  'example/ExampleData',\n  'example/model/User',\n  'kitchen_sink/view/example/form/templates/InPlaceFields.html',\n  'data/countries.json'\n], function($, _, Backbone, Handlebars, Plumage, ExampleData, User, template, countries) {\n\n  return Plumage.view.ModelView.extend({\n\n    modelCls: User,\n\n    template: template,\n\n    subViews: [{\n      selector: '.form1',\n      subViews: [{\n        viewCls: Plumage.view.form.fields.InPlaceTextField,\n        label: 'Name',\n        valueAttr: 'name',\n        updateModelOnChange: true\n      }, {\n        viewCls: Plumage.view.DisplayField,\n        label: 'City',\n        valueAttr: 'city'\n      }]\n    }, {\n      selector: '.results1',\n      subViews: [{\n        viewCls: Plumage.view.DisplayField,\n        label: 'Name',\n        valueAttr: 'name'\n      }, {\n        viewCls: Plumage.view.DisplayField,\n        label: 'City',\n        valueAttr: 'city'\n      }]\n    }],\n\n    initialize:function(options) {\n      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n\n      var model = new User({name: 'Bob Loblaw', city: 'Los Angeles'});\n      model.onLoad();\n      this.setModel(model);\n    }\n  });\n});"

/***/ },
/* 300 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'handlebars',\n  'plumage',\n  'example/ExampleData',\n  'example/model/Post',\n  'kitchen_sink/view/example/form/templates/MultiSelectFields.html'\n], function($, _, Backbone, Handlebars, Plumage, ExampleData, Post, template) {\n\n  return Plumage.view.ModelView.extend({\n\n    template: template,\n\n    modelCls: Post,\n\n    subViews: [{\n      selector: '.multiselect',\n      viewCls: Plumage.view.form.fields.MultiSelect\n    }, {\n      selector: '.dropdown-multiselect',\n      viewCls: Plumage.view.form.fields.DropdownMultiSelect\n    }, {\n      selector: '.dropdown-multiselect2',\n      viewCls: Plumage.view.form.fields.DropdownMultiSelect,\n      showSelectAll: true\n    }],\n\n    defaultSubViewOptions: {\n      updateModelOnChange: true,\n      valueAttr: 'category',\n      listValueAttr: 'name',\n      listLabelAttr: 'label',\n      listRelationship: 'categories',\n      noSelectionText: 'Select something'\n    },\n\n    initialize:function(options) {\n      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n      var model = new Post(ExampleData.POST_WITH_CATEGORIES);\n      this.setModel(model);\n    }\n  });\n});"

/***/ },
/* 301 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'handlebars',\n  'plumage',\n  'example/ExampleData',\n  'example/model/Post',\n  'kitchen_sink/view/example/form/templates/SelectFields.html'\n], function($, _, Backbone, Handlebars, Plumage, ExampleData, Post, template) {\n\n  return Plumage.view.ModelView.extend({\n\n    template: template,\n\n    modelCls: Post,\n\n    fields: {\n      'select': {cls: Plumage.view.form.fields.Select, options: {}},\n      'dropdown-select': {cls: Plumage.view.form.fields.DropdownSelect, options: {}},\n      'type-ahead-select': {cls: Plumage.view.form.fields.TypeAhead, options: {noSelectionText: 'Type something', listRelationship: undefined}},\n      'category-select': {cls: Plumage.view.form.fields.CategorySelect, options: {}},\n      'button-group-select': {cls: Plumage.view.form.fields.ButtonGroupSelect, options: {}}\n    },\n\n    defaultFieldOptions: {\n      updateModelOnChange: true,\n      valueAttr: 'category',\n      listValueAttr: 'name',\n      listLabelAttr: 'label',\n      noSelectionText: 'Select something',\n      listRelationship: 'categories'\n    },\n\n    initialize:function(options) {\n      options = options || {};\n      this.subViews = [];\n\n      for (var key in this.fields) {\n        var field = this.fields[key];\n        this.subViews.push(\n          new field.cls(_.extend({}, this.defaultFieldOptions, field.options, {\n            selector: '.' + key\n          }))\n        );\n      }\n\n      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n\n      var model = new Post(ExampleData.POST_WITH_CATEGORIES);\n      this.setModel(model);\n\n      var typeAheadListModel = new Plumage.collection.DataCollection(\n        ExampleData.POST_WITH_CATEGORIES.categories,\n        {processInMemory: true, queryAttrs: ['label']}\n      );\n      typeAheadListModel.onLoad();\n\n      _.where(this.subViews, {selector: '.type-ahead-select'})[0].setListModel(typeAheadListModel);\n    }\n  });\n});"

/***/ },
/* 302 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'moment',\n  'plumage',\n  'example/model/User',\n  'example/model/AsyncModelMixin',\n  'kitchen_sink/view/example/form/templates/Validation.html',\n  'data/countries.json'\n], function($, _, Backbone, moment, Plumage, User, AsyncModelMixin, template, countries) {\n\n  return Plumage.view.ModelView.extend({\n\n    modelCls: User,\n\n    template: template,\n\n    formInvalid: true,\n\n    subViews: [{\n      viewCls: Plumage.view.form.fields.DateField,\n      selector: '.past-date',\n      label: 'Date this week',\n      minDate: moment().startOf('week'),\n      maxDate: moment().startOf('week').add({day: 6})\n    }, {\n      viewCls: Plumage.view.form.fields.DurationField,\n      selector: '.duration-field',\n      label: 'Duration Field'\n    }, {\n      viewCls: Plumage.view.form.fields.Field,\n      selector: '.validated-field',\n      label: 'At least 2 characters',\n      validationRules: {\n        minLength: 2,\n        required: true\n      }\n    }, {\n      viewCls: Plumage.view.form.Form,\n      selector: '.server-form',\n      name: 'serverForm',\n      className: 'form-horizontal',\n      template: '<div class=\"fields\"></div><div class=\"address\"></div><input type=\"submit\" value=\"Submit\"/>',\n      subViews: [{\n        viewCls: Plumage.view.form.fields.Field,\n        selector: '.fields',\n        label: 'Invalid then Valid',\n        valueAttr: 'name'\n      }]\n    }],\n    initialize: function(options) {\n      Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n\n      var form = this.getSubView('serverForm');\n\n      var model = new (Plumage.model.Model.extend(AsyncModelMixin))();\n      var i = 0;\n      model.ajaxResponse = function(){\n        return [{\n          meta: {success: false, validationError: {'name': 'invalid'}}\n        }, {\n          meta: {success: true}\n        }][i++ % 2];\n      };\n      form.setModel(model);\n    }\n  });\n});"

/***/ },
/* 303 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'example/collection/CountryCollection',\n  'kitchen_sink/view/example/grid/templates/Filters.html',\n  'data/country_data.json'\n], function($, _, Backbone, Plumage, BaseExample, CountryCollection, template, countryData) {\n\n  return BaseExample.extend({\n\n    modelCls: CountryCollection,\n\n    template: template,\n\n    subViews: [{\n      viewCls: Plumage.view.grid.FilterView,\n      selector: '.filter-view',\n      filterConfigs: [{\n        placeholder: 'Name',\n        filterKey: 'name'\n      }, {\n        placeholder: 'Region',\n        filterKey: 'region'\n      }]\n    }, {\n      viewCls: Plumage.view.grid.GridView,\n      selector: '.grid-view',\n      infiniteScroll: false,\n      columns: [\n        {id: 'name', name: 'Name', field: 'name', sortable: true},\n        {id: 'region', name: 'Region', field: 'region', sortable: true},\n        {id: 'population', name: 'Population', field: 'population', sortable: true, cssClass: 'number', defaultSortAsc: false}\n      ],\n      gridOptions: {\n        forceFitColumns: true\n      }\n    }],\n\n    initialize:function(options) {\n      BaseExample.prototype.initialize.apply(this, arguments);\n\n      var model =  new CountryCollection(countryData, {processInMemory: true});\n      model.on('change', function() {\n        model.load();\n      });\n\n      this.setModel(model);\n      model.onLoad();\n    }\n  });\n});"

/***/ },
/* 304 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'plumage',\n  'example/collection/CountryCollection',\n  'kitchen_sink/view/example/BaseExample',\n  'kitchen_sink/view/example/grid/templates/Grids.html',\n  'data/country_data.json'\n], function($, _, Backbone, Plumage, CountryCollection, BaseExample, template, countryData) {\n\n  return BaseExample.extend({\n\n    modelCls: CountryCollection,\n\n    template: template,\n\n    subViews: [{\n      viewCls: Plumage.view.grid.GridView,\n      selector: '.grid-view',\n      infiniteScroll: false,\n      columns: [\n        {id: 'name', name: 'Name', field: 'name', sortable: true},\n        {id: 'region', name: 'Region', field: 'region', sortable: true},\n        {id: 'population', name: 'Population', field: 'population', sortable: true, cssClass: 'number', defaultSortAsc: false}\n      ],\n      gridOptions: {\n        forceFitColumns: true\n      }\n    }],\n\n    initialize:function(options) {\n      BaseExample.prototype.initialize.apply(this, arguments);\n      var model =  new CountryCollection(countryData);\n      this.setModel(model);\n      model.onLoad();\n    }\n  });\n});"

/***/ },
/* 305 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'example/model/AsyncModelMixin',\n  'example/collection/CountryCollection',\n  'kitchen_sink/view/example/grid/templates/InfiniteScroll.html',\n  'data/country_data.json'\n], function($, _, Backbone, Plumage, BaseExample, AsyncModelMixin, CountryCollection, template, countryData) {\n\n  return BaseExample.extend({\n\n    modelCls: CountryCollection,\n\n    template: template,\n\n    subViews: [{\n      viewCls: Plumage.view.grid.GridView,\n      name: 'grid',\n      selector: '.grid-view',\n      columns: [\n        {id: 'name', name: 'Name', field: 'name', sortable: true},\n        {id: 'region', name: 'Region', field: 'region', sortable: true},\n        {id: 'population', name: 'Population', field: 'population', sortable: true, cssClass: 'number', defaultSortAsc: false}\n      ],\n      gridOptions: {\n        forceFitColumns: true\n      }\n    }],\n\n    initialize:function(options) {\n      BaseExample.prototype.initialize.apply(this, arguments);\n      var me = this;\n      me.log = '';\n\n      var model = new (CountryCollection.extend(AsyncModelMixin))();\n      model.set('pageSize', 20);\n\n      model.ajaxResponse = function(method, model, options){\n        var page = options.data.page,\n          pageSize = options.data.pageSize;\n        me.log += 'requested page ' + options.data.page + '\\n';\n        me.$('.request-log').html(me.log);\n        return {\n          meta: _.extend({}, options.data, {success: true, total: countryData.length}),\n          results: countryData.slice(page*pageSize, (page+1)*pageSize)\n        };\n      };\n      this.getSubView('grid').setModel(model);\n      model.load();\n    },\n\n    onRender: function() {\n      BaseExample.prototype.onRender.apply(this, arguments);\n      this.$('.request-log').html(this.log);\n    }\n  });\n});"

/***/ },
/* 306 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'example/model/AsyncModelMixin',\n  'example/collection/CountryCollection',\n  'kitchen_sink/view/example/grid/templates/Paging.html',\n  'data/country_data.json'\n], function($, _, Backbone, Plumage, BaseExample, AsyncModelMixin, CountryCollection, template, countryData) {\n\n  return BaseExample.extend({\n\n    modelCls: CountryCollection,\n\n    template: template,\n\n    subViews: [{\n      viewCls: Plumage.view.grid.GridView,\n      name: 'grid',\n      selector: '.grid-view',\n      infiniteScroll: false,\n      showPaging: true,\n      columns: [\n        {id: 'name', name: 'Name', field: 'name', sortable: true},\n        {id: 'region', name: 'Region', field: 'region', sortable: true},\n        {id: 'population', name: 'Population', field: 'population', sortable: true, cssClass: 'number', defaultSortAsc: false}\n      ],\n      gridOptions: {\n        forceFitColumns: true\n      }\n    }, {\n      viewCls: Plumage.view.grid.Pager,\n      selector: '.grid-pager'\n    }],\n\n    initialize:function(options) {\n      BaseExample.prototype.initialize.apply(this, arguments);\n      var me = this;\n      me.log = '';\n\n      var model = new (CountryCollection.extend(AsyncModelMixin))();\n      model.set('pageSize', 20);\n\n      model.ajaxResponse = function(method, model, options){\n        var page = options.data.page,\n          pageSize = options.data.pageSize;\n        me.log += 'requested page ' + options.data.page + '\\n';\n        me.$('.request-log').html(me.log);\n        return {\n          meta: _.extend({}, options.data, {success: true, total: countryData.length}),\n          results: countryData.slice(page*pageSize, (page+1)*pageSize)\n        };\n      };\n      this.setModel(model);\n      model.load();\n    },\n\n    onRender: function() {\n      BaseExample.prototype.onRender.apply(this, arguments);\n      this.$('.request-log').html(this.log);\n    }\n  });\n});"

/***/ },
/* 307 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'kitchen_sink/view/example/model/templates/Collections.html'\n], function($, _, Plumage, BaseExample, template) {\n\n  return BaseExample.extend({\n\n    template: template,\n\n    initialize:function(options) {\n      options = options || {};\n      BaseExample.prototype.initialize.apply(this, arguments);\n    }\n  });\n});"

/***/ },
/* 308 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'kitchen_sink/view/example/model/templates/Models.html'\n], function($, _, Plumage, BaseExample, template) {\n\n  return BaseExample.extend({\n\n    template: template,\n\n    initialize:function(options) {\n      options = options || {};\n      BaseExample.prototype.initialize.apply(this, arguments);\n    }\n  });\n});"

/***/ },
/* 309 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'kitchen_sink/view/example/model/templates/Relationships.html'\n], function($, _, Plumage, BaseExample, template) {\n\n  return BaseExample.extend({\n\n    template: template,\n\n    initialize: function(options) {\n      options = options || {};\n      BaseExample.prototype.initialize.apply(this, arguments);\n    }\n  });\n});"

/***/ },
/* 310 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'example/model/Post',\n  'example/collection/PostCollection',\n  'kitchen_sink/view/example/view/templates/CollectionViews.html'\n], function($, _, Backbone, Plumage, BaseExample, Post, PostCollection, template) {\n\n  return BaseExample.extend({\n\n    modelCls: PostCollection,\n\n    template: template,\n\n    POSTS_DATA: [{\n      id: 1,\n      title: 'my post 1',\n      body: 'my body',\n      author: {name: 'Alice'},\n      comments: [{\n        id: 5,\n        body: 'my comment',\n        user: {\n          username: 'user1'\n        }\n      }],\n    }, {\n      id: 2,\n      title: 'my post 2',\n      body: 'my body2',\n      author: {name: 'Bob'},\n      comments: [{\n        id: 6,\n        body: 'my comment2',\n        user: {\n          username: 'user1'\n        }\n      }, {\n        id: 7,\n        body: 'another comment',\n        user: {\n          username: 'user3'\n        }\n      }]\n    }],\n\n    initialize:function(options) {\n      options = options || {};\n\n      this.events = _.extend({'click #add-post-btn': 'onAddPostClick'}, this.events);\n\n      var CommentView = Plumage.view.ModelView.extend({\n        template: 'Comment: {{body}} <div class=\"user\" style=\"margin-left: 20px\"></div',\n        initialize: function(options) {\n          this.subViews = [\n            new Plumage.view.ModelView({\n              relationship: 'user',\n              selector: '.user',\n              template: 'User: {{username}}'\n            })\n          ];\n          Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n        }\n      });\n\n      this.subViews = [\n        new Plumage.view.CollectionView({\n          selector: '.collection-view',\n          itemViewCls: Plumage.view.ModelView,\n          itemOptions: {\n            template: 'Post: {{title}}'\n          },\n          onModelAdd: function() {\n            Plumage.view.CollectionView.prototype.onModelAdd.apply(this, arguments);\n          }\n        }),\n        new Plumage.view.CollectionView({\n          selector: '.advanced-collection-view',\n          itemViewCls: Plumage.view.ModelView.extend({\n            template: 'Post: {{title}} <div class=\"comments\" style=\"margin-left: 20px\"></div>',\n            initialize: function(options) {\n              options = options || {};\n              this.subViews = [\n                new Plumage.view.CollectionView({\n                  selector: '.comments',\n                  relationship: 'comments',\n                  itemViewCls: CommentView\n                })\n              ];\n              Plumage.view.ModelView.prototype.initialize.apply(this, arguments);\n            }\n          }),\n        })\n      ];\n\n      BaseExample.prototype.initialize.apply(this, arguments);\n\n      this.setModel(new PostCollection(this.POSTS_DATA));\n    },\n\n    onAddPostClick: function() {\n      var index = this.model.size() + 1;\n      this.model.add(new Post({id: index, title: 'my post ' + index, body: 'my body ' + index}));\n    }\n  });\n});"

/***/ },
/* 311 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'backbone',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'example/model/Post',\n  'kitchen_sink/view/example/view/templates/ModelViews.html'\n], function($, _, Backbone, Plumage, BaseExample, Post, template) {\n\n  return BaseExample.extend({\n\n    modelCls: Post,\n\n    template: template,\n\n    initialize:function(options) {\n      options = options || {};\n\n      this.events = _.extend({'click #update-model-btn': 'onUpdateModelClick'}, this.events);\n\n      this.subViews = [\n        new Plumage.view.ModelView({\n          selector: '.model-view',\n          template: 'Post name: {{name}}</span>',\n          updateOnChange: true\n        }),\n        new Plumage.view.ModelView({\n          selector: '.sub-model-view',\n          template: 'Post name: {{name}}</span> <div class=\"body\"></div>',\n          subViews: [\n            new Plumage.view.ModelView({\n              selector: '.body',\n              template: 'Body in subview: {{body}}'\n            })\n          ]\n        }),\n        new Plumage.view.ModelView({\n          selector: '.view-with-relationship',\n          template: 'Post name: {{name}}</span> <div class=\"author\"></div>',\n          subViews: [\n            new Plumage.view.ModelView({\n              selector: '.author',\n              relationship: 'author',\n              template: 'Related Author in Subview: {{name}}'\n            })\n          ]\n        }),\n      ];\n      BaseExample.prototype.initialize.apply(this, arguments);\n\n      this.setModel(new Post({name: 'my post', body: 'post body', author: {name: 'Bob'}}));\n    },\n\n    onUpdateModelClick: function() {\n      var name = this.model.get('name');\n      this.model.set('name', 'no, '+name);\n    }\n  });\n});"

/***/ },
/* 312 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'example/ExampleData',\n  'example/model/Post',\n  'kitchen_sink/view/example/view/templates/ViewState.html'\n], function($, _, Plumage, BaseExample, ExampleData, Post, template) {\n\n  return BaseExample.extend({\n\n    template: template,\n\n    subViews: [{\n      viewCls: Plumage.view.form.fields.DropdownSelect,\n      selector: '.dropdown-select',\n      valueAttr: 'dropdown',\n      noSelectionText: 'Select something',\n      listValues: [\n        {label: 'Select foo!', value: 'foo'},\n        {label: 'No, select bar!', value: 'bar'}\n      ],\n      updateModelOnChange: true\n    }, {\n      viewCls: Plumage.view.ModelView,\n      selector: '.query-string',\n      template: '<label>Query String:</label><span>{{queryParams}}</span>',\n      getTemplateData: function() {\n        return {queryParams: $.param(this.model.getQueryParams())};\n      },\n      onModelChange: function(model) {\n        Plumage.view.ModelView.prototype.onModelChange.apply(this, arguments);\n        this.$('span').css({'background-color': '#ff3'});\n        this.$('span').animate({'background-color': '#fff'}, 600);\n      }\n    }],\n\n    onModelChange: function(model, options) {\n      if (model.changed.dropdown) {\n        model.updateUrl();\n      }\n      BaseExample.prototype.onModelChange.apply(this, arguments);\n    }\n  });\n});\n"

/***/ },
/* 313 */
/***/ function(module, exports) {

	module.exports = "define([\n  'jquery',\n  'underscore',\n  'plumage',\n  'kitchen_sink/view/example/BaseExample',\n  'example/model/Post',\n  'kitchen_sink/view/example/view/templates/Views.html'\n], function($, _, Plumage, BaseExample, Post, template) {\n\n  return BaseExample.extend({\n\n    template: template,\n\n    subViews: [{\n      viewCls: Plumage.view.View,\n      selector: '.base-view',\n      template: 'Name: {{name}}',\n      getTemplateData: function() {return {name: 'foo'};}\n    }, {\n      viewCls: Plumage.view.ModelView,\n      selector: '.container-view',\n      template: 'SubView: <span class=\"subview\"></span>',\n      subViews: [{\n        selector: '.subview',\n        template: 'I am a subview'\n      }]\n    }]\n  });\n});"

/***/ },
/* 314 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./form/templates/DateFields.html": 250,
		"./form/templates/FieldsAndForms.html": 254,
		"./form/templates/InPlaceFields.html": 257,
		"./form/templates/MultiSelectFields.html": 262,
		"./form/templates/SelectFields.html": 264,
		"./form/templates/Validation.html": 267,
		"./grid/templates/Filters.html": 269,
		"./grid/templates/Grids.html": 271,
		"./grid/templates/InfiniteScroll.html": 273,
		"./grid/templates/Paging.html": 275,
		"./model/templates/Collections.html": 277,
		"./model/templates/Models.html": 279,
		"./model/templates/Relationships.html": 281,
		"./templates/ExampleSectionView.html": 239,
		"./templates/ExampleWithSourceView.html": 238,
		"./templates/SourceView.html": 237,
		"./view/templates/CollectionViews.html": 284,
		"./view/templates/ModelViews.html": 286,
		"./view/templates/ViewState.html": 288,
		"./view/templates/Views.html": 290
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 314;


/***/ },
/* 315 */
/***/ function(module, exports) {

	module.exports = {
		"model": {
			"name": "model",
			"examples": [
				{
					"name": "Models",
					"title": "Models"
				},
				{
					"name": "Collections",
					"title": "Collections"
				},
				{
					"name": "Relationships",
					"title": "Relationships"
				}
			]
		},
		"view": {
			"name": "view",
			"examples": [
				{
					"name": "Views",
					"title": "Views"
				},
				{
					"name": "ModelViews",
					"title": "Model Views"
				},
				{
					"name": "CollectionViews",
					"title": "Collection Views"
				},
				{
					"name": "ViewState",
					"title": "View State"
				}
			]
		},
		"grid": {
			"name": "grid",
			"examples": [
				{
					"name": "Grids",
					"title": "Grids"
				},
				{
					"name": "Filters",
					"title": "Column Filters"
				},
				{
					"name": "InfiniteScroll",
					"title": "Infinite Scroll"
				},
				{
					"name": "Paging",
					"title": "Paging"
				}
			]
		},
		"form": {
			"name": "form",
			"examples": [
				{
					"name": "FieldsAndForms",
					"title": "Fields and Forms"
				},
				{
					"name": "SelectFields",
					"title": "Select Fields"
				},
				{
					"name": "MultiSelectFields",
					"title": "MultiSelect Fields"
				},
				{
					"name": "DateFields",
					"title": "Date Fields"
				},
				{
					"name": "InPlaceFields",
					"title": "In Place Fields"
				},
				{
					"name": "Validation",
					"title": "Validation"
				}
			]
		}
	}

/***/ }
]);
//# sourceMappingURL=kitchen_sink.js.map