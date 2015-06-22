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
    path: __dirname + "/dist",
    filename: "[name].js"
  },

  devtool: 'source-map',

  module: { loaders: [
    { test: /\.html$/, loader: "raw-loader" },
    { test: /\.json$/, loader: "json-loader" }
  ]},

  plugins: [
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
      slickgrid: '../assets/scripts/vendor/slickgrid',

      //plumage: __dirname + '/../assets/scripts/plumage',
      jquery: __dirname + '/../assets/bower_components/jquery/dist/jquery',
      underscore: __dirname + '/../assets/bower_components/underscore/underscore',
      backbone: __dirname + '/../assets/bower_components/backbone/backbone',
      bootstrap: __dirname + '/../assets/bower_components/bootstrap/docs/assets/js/bootstrap',
      handlebars: __dirname + '/../assets/bower_components/handlebars/handlebars',
      spinjs: __dirname + '/../assets/bower_components/spinjs/spin',
      'jquery.cookie': __dirname + '/../assets/bower_components/jquery.cookie/jquery.cookie',
      linkify: __dirname + '/../assets/bower_components/linkify/jquery.linkify',
      'jquery.scrollTo': __dirname + '/../assets/bower_components/jquery.scrollTo/jquery.scrollTo.min',

      test: __dirname + '/../test'
    }
  }
};
