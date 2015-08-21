var webpack = require("webpack");
var ProvidePlugin = require("webpack/lib/ProvidePlugin");

module.exports = {
  context: __dirname + "/assets",
  entry: {
    countries: 'countries/application',
    kitchen_sink: 'kitchen_sink/application',
    vendor: ['jquery', 'underscore', 'backbone', 'handlebars', 'bootstrap']
  },

  output: {
    path: __dirname + "/../build/docs/examples",
    filename: "[name].js"
  },

  devtool: 'source-map',

  module: { loaders: [
    { test: /\.html$/, loader: "raw-loader" },
    { test: /\.json$/, loader: "json-loader" },
    { test: /\.jsx$/, loader: 'babel-loader' }
  ]},

 // plugins: [
    new ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      "_": "underscore"
    }),
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js")
  ],

  resolve: {
    root: [
      __dirname + '/assets', __dirname + '/dist', __dirname + '/../assets/scripts'
    ],
    extensions: ['', '.js', '.jsx'],
    alias: {
      bootstrap: 'bootstrap-sass',
      slickgrid: '../assets/scripts/vendor/slickgrid',
      linkify: __dirname + '/../assets/scripts/vendor/jquery.linkify',
      test: __dirname + '/../test'
    }
  },
  node: {
    fs: 'empty' // for handlebars
  }
};
