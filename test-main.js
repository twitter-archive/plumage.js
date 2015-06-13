var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(file);
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/assets/scripts',

  // dynamically load all test files
  deps: allTestFiles,

  paths: {
    'jquery.scrollTo': '../bower_components/jquery.scrollTo/jquery.scrollTo.min',
    linkify: '../bower_components/linkify/jquery.linkify',
    backbone: '../bower_components/backbone/backbone',
    d3: '../bower_components/d3/d3',
    handlebars: '../bower_components/handlebars/handlebars',
    jquery: '../bower_components/jquery/jquery',
    moment: '../bower_components/moment/moment',
    spinjs: '../bower_components/spinjs/spin',
    underscore: '../bower_components/underscore/underscore',
    text: '../bower_components/text/text',
    bootstrap: '../bower_components/bootstrap/docs/assets/js/bootstrap',
    'jquery.cookie': '../bower_components/jquery.cookie/jquery.cookie',
    'dropzone': '../bower_components/dropzone/dist/dropzone-amd-module',
    'sinon': '../bower_components/sinonjs/sinon',
    'example': '/base/examples/assets/example',
    'test': '/base/test'
  },
  shim: {
    'sinon': {
      exports: 'sinon'
    },
    'moment': {
      exports: 'moment'
    },
    'handlebars': {
      exports: 'Handlebars'
    },
  },

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
