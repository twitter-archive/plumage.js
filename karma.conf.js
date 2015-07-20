//turn on to disable coverage for easier debugging
var debugging = true;

var oneFile = 'test/RouterTest.js';

var webpackConfig = require("./webpack.config.js");
webpackConfig.plugins.pop(); //remove CommonChunksPlugin for testing

if (debugging) {
  webpackConfig.devtool = 'inline-source-map';
} else {
  webpackConfig.module.postLoaders = [ { // << instrumenting for coverage
    test: /\.js$/,
    exclude: /(test|node_modules|bower_components|vendor)\//,
    loader: 'istanbul-instrumenter'
  }];
}



if (debugging) {
  var preprocessors = {
    'test/**/*Test.js': ['webpack','sourcemap']
  };
} else {
  preprocessors = {
    'test/**/*Test.js': ['webpack','sourcemap'],
    'assets/scripts/collection/**/*.js': ['coverage'],
    'assets/scripts/controller/**/*.js': ['coverage'],
    'assets/scripts/model/**/*.js': ['coverage'],
    'assets/scripts/util/**/*.js': ['coverage'],
    'assets/scripts/view/**/*.js': ['coverage'],
    'assets/scripts/*.js': ['coverage']
  }
}

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    frameworks: ['qunit'],

    files: [
      'test/**/*Test.js'
      //oneFile
    ],

    exclude: [
    ],

    preprocessors: preprocessors,

    reporters: [
      'progress',
      //'coverage'
    ],

    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },

    plugins: [
      require('karma-webpack'),
      require('karma-qunit'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-sourcemap-loader'),
      require('karma-coverage')
    ],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    coverageReporter: {
      type: 'html', // lcov or lcovonly are required for generating lcov.info files
      dir: 'coverage/'
    }
  });
};
