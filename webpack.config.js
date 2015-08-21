var webpack = require("webpack");

module.exports = {
  context: __dirname + "/assets/scripts",
  entry: {
    plumage: "./plumage.js",
    vendor: ['jquery', 'underscore', 'backbone', 'handlebars', 'bootstrap']
  },

  output: {
    path: __dirname + "/dist",
    filename: "plumage.js",
    library: "plumage",
    libraryTarget: 'umd'
  },

  module: {
    loaders: [
      { test: /\.html$/, loader: "raw-loader" },
      { test: /\.jsx$/, loader: 'babel-loader' }
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
    new webpack.NormalModuleReplacementPlugin(/^sinon$/, __dirname + '/test/vendor/sinon-1.15.4.js'),
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js")
  ],


  resolve: {
    root: [
      __dirname + '/assets/scripts'
    ],
    extensions: ['', '.js', '.jsx'],
    alias: {
      bootstrap: 'bootstrap-sass',
      slickgrid: 'vendor/slickgrid',
      linkify: 'vendor/jquery.linkify',
      example: __dirname + '/examples/assets/example',
      test: __dirname + '/test'
    }
  },
  node: {
    fs: 'empty' // for handlebars
  }
};
