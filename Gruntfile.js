'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});

var send = require('send');
var path = require('path');
var url = require('url');
var grunt = require('grunt');

var mountFolder = function (connect, dir) {
  return connect.static(path.resolve(dir));
};

// For single page web apps:
//  - always serve appPath/index.html for any path in appPath.
var mountApp = function (connect, appPath, indexFile) {
  return function(req, res, next) {
    var pathName = url.parse(req.url).pathname;
    if (0 === pathName.toLowerCase().indexOf(appPath.toLowerCase())) {
      send(req, indexFile)
      .pipe(res);
    } else {
      next();
    }
  };
};

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    /**
     * Web servers
     */
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'build'),
              mountFolder(connect, 'assets')
            ];
          }
        }
      },
      test: {
        options: {
          keepalive: true,
          middleware: function (connect) {
            return [
              mountFolder(connect, 'build'),
              mountFolder(connect, 'test'),
              mountFolder(connect, 'examples/example_models'),
              mountFolder(connect, 'assets')
            ];
          }
        }
      },
      docs: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'dist/docs'),
              connect().use('/dist', connect.static(path.resolve('dist'))),
              connect().use('/assets', connect.static(path.resolve('assets'))),
              connect().use('/assets/examples', connect.static(path.resolve('examples'))),
              connect().use('/test', connect.static(path.resolve('test'))),
              mountApp(connect, '/examples/countries', 'examples/countries/index.html'),
              mountApp(connect, '/examples/kitchen_sink', 'examples/kitchen_sink/index.html')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },

    /**
     * Validate JS
     **/

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'assets/scripts/**/*.js',
        'test/example/**/*.js',
        'test/test/**/*.js',
        'examples/**/*.js',
      ]
    },

    /**
     * Building
     **/

    clean: {
      server: 'build'
    },

    /** Compile scss to css */
    compass: {

      options: {
        cssDir: 'build/styles',
        imagesDir: 'assets/images',
        javascriptsDir: 'assets/scripts',
        relativeAssets: true,
        importPath: [
          'assets/styles',
          'assets/bower_components',
          'assets/bower_components/twitter-bootstrap-sass/vendor/assets/stylesheets'
        ]
      },

      plumage: {
        options: {
          sassDir: 'assets/styles',
          specify: 'assets/styles/plumage.scss',
        }
      },

      dist: {
        options: {
          sassDir: 'assets/styles',
          specify: 'assets/styles/plumage.scss',
          noLineComments: true
        }
      },

      docs: {
        options: {
          cssDir: 'build/docs/styles',
          sassDir: 'docs/styles',
          specify: 'docs/styles/docs.scss'
        }
      },

      examples: {
        options: {
          cssDir: 'examples/styles',
          sassDir: 'examples/styles',
          importPath: [
            'assets/bower_components',
            'assets/bower_components/twitter-bootstrap-sass/vendor/assets/stylesheets'
          ],
          specify: ['examples/styles/kitchensink.scss', 'examples/styles/countries.scss']
        }
      },

      bootstrap: {
        options: {
          sassDir: 'assets/bower_components/twitter-bootstrap-sass/vendor/assets/stylesheets',
          cssDir: 'build/styles'
        }
      }

    },

    /** Concatenate js with require.js */
    requirejs: {
      build: {
        // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          mainConfigFile: 'assets/scripts/config.js',
          baseUrl: 'assets/scripts',
          out: 'build/scripts/plumage.js',
          name: 'plumage',
          exclude: ['jquery', 'underscore','backbone','handlebars', 'text', 'bootstrap', 'd3', 'moment', 'spinjs'],
          optimize: 'none',
          preserveLicenseComments: false
        }
      }
    },

    /** optimize js */
    uglify: {
      dist: {
        files: {
          'build/scripts/plumage.min.js': ['build/scripts/plumage.js']
        }
      }
    },

    copy: {
      dist: {
        files: [
          {expand: true, cwd: 'build/scripts/', src: ['plumage.js', 'plumage.min.js'], dest: 'dist/'},
          {expand: true, cwd: 'build/styles/', src: ['plumage.css'], dest: 'dist/'},
          {expand: true, cwd: 'build', src: ['docs/**'], dest: 'dist/'}
        ]
      }
    },

    /** Build docs with Jekyll */
    jekyll: {
      build: {
        options: {
          src: './docs',
          dest: './build/docs'
        }
      }
    },

    jsdoc: {
      build: {
        src: [
          'README.md',
          'assets/scripts/*.js',
          'assets/scripts/controller/*.js',
          'assets/scripts/model/Model.js',
          'assets/scripts/model/Filter.js',
          'assets/scripts/collection/Collection.js',
          'assets/scripts/collection/GridData.js',
          'assets/scripts/collection/BufferedGridData.js',

          'assets/scripts/view/View.js',
          'assets/scripts/view/ContainerView.js',
          'assets/scripts/view/ModelView.js',
          'assets/scripts/view/CollectionView.js',
          'assets/scripts/view/calendar/Calendar.js',
          'assets/scripts/view/form/fields/Field.js',
          'assets/scripts/view/form/fields/DatePicker.js',
          'assets/scripts/view/form/fields/DateRangePicker.js',
          'assets/scripts/util/Logger.js',
        ],
        options: {
          destination: './build/docs/api',
          configure: './jsdoc/jsdoc_conf.json'
        }
      }
    },

    /** update requirejs config with bower components */
    bower: {
      target: {
        rjsConfig: 'assets/scripts/config.js'
      }
    },

    watch: {
      options: {
        nospawn: true
      },
      compass: {
        files: ['assets/styles/**/*.{scss,sass}', 'examples/styles/**/*.{scss,sass}'],
        tasks: ['compass', 'copy']
      },
      requirejs: {
        files: ['assets/scripts/**/*.{js,html}'],
        tasks: ['requirejs']
      },
      docs: {
        files: ['docs/**/*.{html,scss}'],
        tasks: ['docs']
      }
    }
  });

  grunt.registerTask('examples', [
    'compass',
    'copy',
    'requirejs',
    'connect:docs',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'connect:test',
    'open:server'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'compass:dist',
    'requirejs',
    'uglify',
    'copy'
  ]);

  grunt.registerTask('docs', [
    'jekyll:build',
    'compass:docs',
    'watch'
  ]);
};
