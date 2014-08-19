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
          middleware: function (connect) {
            return [
              mountFolder(connect, 'build'),
              mountFolder(connect, 'test'),
              mountFolder(connect, 'examples/assets'),
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
              connect().use('/test', connect.static(path.resolve('test'))),
              mountApp(connect, '/examples/countries.html', 'examples/countries.html'),
              mountApp(connect, '/examples/kitchen_sink.html', 'examples/kitchen_sink.html'),
              connect().use('/examples', connect.static(path.resolve('examples')))
            ];
          }
        }
      },
      'gh-pages': {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'gh-pages')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      },
      examples: {
        path: 'http://localhost:<%= connect.options.port %>/plumage.js/examples/kitchen_sink.html'
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

    qunit: {
      all: {
        options: {
          urls: ['http://localhost:9000/']
        }
      }
    },

    /**
     * Building
     **/

    clean: {
      server: 'build'
    },

    sass: {
      options: {
        loadPath: [
          'assets/styles',
          'assets/bower_components',
          'assets/bower_components/twitter-bootstrap-sass/vendor/assets/stylesheets'
        ],
      },
      plumage: {
        lineNumbers: true,
        files: {
          'build/styles/plumage.css': 'assets/styles/plumage.scss'
        }
      },
      dist: {
        options: {
          lineNumbers: false,
        },
        files: {
          'build/styles/plumage.css': 'assets/styles/plumage.scss'
        }
      },

      docs: {
        options: {
          loadPath: [
            'build/docs/styles',
            'assets/bower_components',
            'assets/bower_components/twitter-bootstrap-sass/vendor/assets/stylesheets'
          ],
        },
        files: {
          'build/docs/styles/docs.css': 'docs/styles/docs.scss'
        }
      },

      examples: {
        options: {
        },
        files: {
          'examples/assets/styles/kitchensink.css': 'examples/assets/styles/kitchensink.scss',
          'examples/assets/styles/countries.css': 'examples/assets/styles/countries.scss'
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
        ]
      },
      'gh-pages': {
        files: [
          {expand: true, cwd: '.', src: ['examples/**', 'assets/**', 'test/test/environment.js'], dest: 'gh-pages/plumage.js'},
          {expand: true, cwd: 'build/docs', src: ['**'], dest: 'gh-pages/plumage.js'},
          {expand: true, cwd: 'build/scripts/', src: ['plumage.js', 'plumage.min.js'], dest: 'gh-pages/plumage.js'},
          {expand: true, cwd: 'build/styles/', src: ['plumage.css'], dest: 'gh-pages/plumage.js'},
          {expand: true, cwd: 'assets/scripts/vendor/slickgrid/images', src: ['sort-*', 'header-*'], dest: 'gh-pages/plumage.js'},

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
          'assets/scripts/collection/BufferedCollection.js',
          'assets/scripts/collection/Selection.js',

          'assets/scripts/view/View.js',
          'assets/scripts/view/ContainerView.js',
          'assets/scripts/view/ModelView.js',
          'assets/scripts/view/CollectionView.js',
          'assets/scripts/view/calendar/Calendar.js',
          'assets/scripts/view/form/fields/Field.js',
          'assets/scripts/view/form/fields/DateField.js',
          'assets/scripts/view/form/fields/DateRangeField.js',
          'assets/scripts/view/grid/GridData.js',
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
      sass: {
        files: ['assets/styles/**/*.{scss,sass}', 'examples/styles/**/*.{scss,sass}'],
        tasks: ['sass', 'copy']
      },
      requirejs: {
        files: ['assets/scripts/**/*.{js,html}'],
        tasks: ['requirejs']
      },
      docs: {
        files: ['docs/**/*.{html,scss}'],
        tasks: ['docs']
      },
      copy: {
        files: ['assets/scripts/**/*.{js,html}', 'examples/assets/**/*.{js,html}'],
        tasks: ['copy']
      }
    },
    'gh-pages': {
      options: {
        base: 'gh-pages/plumage.js'
      },
      src: ['**']
    }
  });

  grunt.registerTask('examples', [
    'sass',
    'requirejs',
    'copy:gh-pages',
    'connect:gh-pages',
    'open:examples',
    'watch'
  ]);

  grunt.registerTask('test-browser', [
    'jshint',
    'connect:test',
    'open:server',
    'watch'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'connect:test',
    'qunit'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'sass:dist',
    'requirejs',
    'uglify',
    'copy:dist'
  ]);

  grunt.registerTask('docs', [
    'jekyll:build',
    'sass:docs',
    'jsdoc:build',
  ]);

  grunt.registerTask('gh-pages-deploy', [
    'build',
    'docs',
    'copy:gh-pages',
    'gh-pages'
  ]);

};
