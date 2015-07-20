'use strict';

// Include Gulp and other build automation tools and utilities
// See: https://github.com/gulpjs/gulp/blob/master/docs/API.md
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var path = require('path');
var runSequence = require('run-sequence');
var webpack = require('webpack');
var karma = require('karma');
var argv = require('minimist')(process.argv.slice(2));

// Settings
var RELEASE = !!argv.release;                 // Minimize and optimize during a build?

var src = {};
var watch = false;
var browserSync;

function createBundler(configFile) {
  return function(cb) {
    var started = false;
    var config = require(configFile);
    var bundler = webpack(config);

    function bundle(err, stats) {
      if (err) {
        throw new $.util.PluginError('webpack', err);
      }

      if (argv.verbose) {
        $.util.log('[webpack]', stats.toString({colors: true}));
      }

      if (!started) {
        started = true;
        return cb();
      }
    }

    if (watch) {
      bundler.watch(200, bundle);
    } else {
      bundler.run(bundle);
    }
  };
}

gulp.task('default', ['sync']);

// Clean output directory
gulp.task('clean', del.bind(
  null, ['dist/*'], {dot: true}
));

gulp.task('lint', function() {
  return gulp.src(['Gulpfile.js',
    'assets/scripts/**/*.js',
    'test/example/**/*.js',
    'test/test/**/*.js',
    'examples/assets/**/*.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'))
    .pipe($.jshint.reporter('fail'));
});

// 3rd party libraries
gulp.task('vendor', function() {
  return gulp.src('node_modules/bootstrap/dist/fonts/**')
      .pipe(gulp.dest('dist/fonts'));
});

gulp.task('styles', function() {
  src.styles = 'assets/styles/**/*.{css,scss}';
  return gulp.src('assets/styles/plumage.scss')
    .pipe($.plumber())
    .pipe($.sass()) //sourcemap?
    .on('error', console.error.bind(console))
    //.pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe($.csscomb())
    .pipe($.if(RELEASE, $.minifyCss()))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'styles'}));
});

gulp.task('bundle', createBundler('./webpack.config.js'));

gulp.task('bundle-examples', createBundler('./examples/webpack.config.js'));

// Build the app from source code
gulp.task('build', ['clean'], function(cb) {
  runSequence(['styles', 'bundle'], cb);
});

// Build and start watching for modifications
gulp.task('build:watch', function(cb) {
  watch = true;
  runSequence('build', function() {
    //gulp.watch(src.assets, ['assets']);
    gulp.watch(src.styles, ['styles']);
    cb();
  });
});

gulp.task('test', ['lint'], function (done) {
  var server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    browsers: [
      'Firefox'
    ]
  }, done);
  server.start();
});

gulp.task('jekyll', $.shell.task([
  'jekyll build --source ./docs --destination ./build/docs'
], {
  errorMessge: 'Error running Jekyll'
}));

gulp.task('styles-docs', function() {
  src.styles = 'docs/styles/*.{css,scss}';
  return gulp.src('docs/styles/docs.scss')
        .pipe($.sass()) //sourcemap?
    .on('error', console.error.bind(console))
    //.pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe($.csscomb())
    .pipe($.minifyCss())
    .pipe(gulp.dest('build/docs/styles'));
});

gulp.task('jsdoc', $.shell.task([
  './node_modules/jsdoc/jsdoc.js -c ./jsdoc/jsdoc_conf.json -d ./build/docs/api assets/scripts/**/*.js'
]));

gulp.task('docs', ['jekyll', 'styles-docs']);

gulp.task('copy:gh-pages', ['jekyll', 'styles-docs', 'jsdoc', 'build-examples'], function(done) {
  runSequence(['jekyll'], ['styles-docs', 'jsdoc', 'build-examples'], function() {
    gulp.src('build/docs/**/*.*').pipe(gulp.dest('gh-pages/plumage.js'));
    done();
  });
});

//
// Examples
//

// 3rd party libraries
gulp.task('vendor-examples', function() {
  return gulp.src('node_modules/bootstrap-sass/assets/fonts/**')
      .pipe(gulp.dest('build/docs/fonts'));
});

gulp.task('assets-examples', function() {
  return gulp.src(['examples/*.html', 'assets/scripts/vendor/slickgrid/images/*.*'])
      .pipe(gulp.dest('build/docs/examples'));
});

gulp.task('styles-examples', function() {
  src.styles = ['assets/styles/**/*.scss', 'examples/assets/styles/**/*.scss'];

  return gulp.src('examples/assets/styles/kitchensink.scss')
      .pipe($.plumber())
      .pipe($.sass()) //sourcemap?
      .on('error', console.error.bind(console))
    //.pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
      .pipe($.csscomb())
      .pipe($.if(RELEASE, $.minifyCss()))
      .pipe(gulp.dest('build/docs/examples'))
      .pipe($.size({title: 'styles'}));
});

// Build the app from source code
gulp.task('build-examples', function(cb) {
  runSequence(['vendor-examples', 'assets-examples', 'styles-examples'], ['bundle-examples'], cb);
});

// Build and start watching for modifications
gulp.task('build-examples:watch', function(cb) {
  watch = true;
  runSequence('build-examples', function() {
    //gulp.watch(src.assets, ['assets']);
    gulp.watch(src.styles, ['styles-examples']);
    cb();
  });
});

// Launch BrowserSync development server
gulp.task('sync-examples', ['build-examples:watch'], function(cb) {
  browserSync = require('browser-sync');

  browserSync({
    browser: 'google chrome',
    server: {
      baseDir: './build/docs/examples/'
    }
  }, cb);

  gulp.watch('build/docs/examples/**/*.*', function(file) {
    browserSync.reload(path.relative('examples', file.path));
  });
});


