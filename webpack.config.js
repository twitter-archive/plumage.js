var webpack = require("webpack");

module.exports = {
  context: __dirname + "/assets/scripts",
  entry: {
    plumage: "./plumage.js",
    vendor: ['jquery', 'underscore', 'backbone', 'handlebars', 'bootstrap', 'd3']
  },

  output: {
    path: __dirname + "/dist",
    filename: "plumage.js",
    library: "plumage",
    libraryTarget: 'umd',
  },

  module: {
    loaders: [
      { test: /\.html$/, loader: "raw-loader" }
    ],
    noParse: [
      /sinon/
    ]
  },

  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      "_": "underscore"
    }),
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js")
  ],


  resolve: {
    root: [
      __dirname + '/assets/scripts'
    ],
    extensions: ['', '.js', '.jsx'],
    alias: {
      slickgrid: 'vendor/slickgrid',

      'jquery.scrollTo': __dirname + '/assets/bower_components/jquery.scrollTo/jquery.scrollTo.min',
      linkify: __dirname + '/assets/bower_components/linkify/jquery.linkify',
      backbone: __dirname + '/assets/bower_components/backbone/backbone',
      blanket: __dirname + '/assets/bower_components/blanket/dist/qunit/blanket',
      d3: __dirname + '/assets/bower_components/d3/d3',
      handlebars: __dirname + '/assets/bower_components/handlebars/handlebars',
      jquery: __dirname + '/assets/bower_components/jquery/dist/jquery',
      moment: __dirname + '/assets/bower_components/moment/moment',
      spinjs: __dirname + '/assets/bower_components/spinjs/spin',
      underscore: __dirname + '/assets/bower_components/underscore/underscore',
      bootstrap: __dirname + '/assets/bower_components/bootstrap/docs/assets/js/bootstrap',
      'jquery.cookie': __dirname + '/assets/bower_components/jquery.cookie/jquery.cookie',
      'sinon':  __dirname + '/assets/bower_components/sinonjs/sinon',
      'example': __dirname + '/examples/assets/example',
      'test': __dirname + '/test',

      //'dropzone': __dirname + '/assets/bower_components/dropzone/dist/dropzone-amd-module'
    }
  }
};
