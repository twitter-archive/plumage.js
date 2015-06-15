// Karma configuration
// Generated on Fri Jun 12 2015 16:34:53 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['requirejs', 'qunit'],


    // list of files / patterns to load in the browser
    files: [
      'test/test-main.js',
      {pattern: 'assets/bower_components/*/*.js', included: false},
      {pattern: 'assets/bower_components/bootstrap/docs/assets/js/bootstrap.js', included: false},
      {pattern: 'assets/scripts/**/*.js', included: false},
      {pattern: 'assets/scripts/**/*.html', included: false},
      {pattern: 'examples/assets/**/*.js', included: false},
      {pattern: 'test/**/*.js', included: false},
      {pattern: 'test/**/*.html', included: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'assets/scripts/collection/**/*.js': ['coverage'],
      'assets/scripts/model/**/*.js': ['coverage'],
      'assets/scripts/util/**/*.js': ['coverage'],
      'assets/scripts/view/**/*.js': ['coverage'],
      'assets/scripts/*.js': ['coverage']
    },

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
      type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
      dir: 'coverage/'
    }
  });
};
