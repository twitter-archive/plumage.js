require.config({
  shim: {
    'handlebars': {
      exports: 'Handlebars'
    },

    'slickgrid/lib/jquery-ui': {
      deps: [
        'jquery'
      ]
    },
    'slickgrid/lib/jquery.event.drag': {
      deps: [
        'jquery'
      ]
    },
    'slickgrid/lib/jquery.event.drop': {
      deps: [
        'jquery'
      ]
    },
    'slickgrid/slick.core': {
      deps: [
        'slickgrid/lib/jquery-ui',
        'slickgrid/lib/jquery.event.drag',
        'slickgrid/lib/jquery.event.drop'
      ]
    },
    'slickgrid/slick.grid': {
      deps: [
        'slickgrid/slick.core'
      ]
    }
  },
  paths: {
    slickgrid: 'vendor/slickgrid',
    'slickgrid/lib/jquery-ui': 'vendor/slickgrid/lib/jquery-ui-1.10.4.custom.min',
    'slickgrid/lib/jquery.event.drag': 'vendor/slickgrid/lib/jquery.event.drag-2.2',
    'slickgrid/lib/jquery.event.drop': 'vendor/slickgrid/lib/jquery.event.drop-2.2',

    //bower
    'jquery.scrollTo': '../bower_components/jquery.scrollTo/jquery.scrollTo.min',
    linkify: '../bower_components/linkify/jquery.linkify',
    backbone: '../bower_components/backbone/backbone',
    blanket: '../bower_components/blanket/dist/qunit/blanket',
    d3: '../bower_components/d3/d3',
    handlebars: '../bower_components/handlebars/handlebars',
    jquery: '../bower_components/jquery/jquery',
    moment: '../bower_components/moment/moment',
    spinjs: '../bower_components/spinjs/spin',
    underscore: '../bower_components/underscore/underscore',
    text: '../bower_components/text/text',
    bootstrap: '../bower_components/bootstrap/docs/assets/js/bootstrap'
  }
});
