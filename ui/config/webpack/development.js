

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const baseConfig = require('./base.js');

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  watch: true,
  entry: [
    '@babel/polyfill',
    './src/index.jsx',
  ],
  output: {
    path: path.resolve(__dirname, '../../dist/'),
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.SERVER_URL': JSON.stringify(process.env.SERVER_URL),
    }),
    new BrowserSyncPlugin(
      // BrowserSync options
      {
        // browse to http://localhost:3000/ during development
        host: 'localhost',
        port: 3100,
        // proxy the Webpack Dev Server endpoint
        // (which should be serving on http://localhost:3100/)
        // through BrowserSync
        proxy: 'http://localhost:3000/',
      },
    ),
  ],
  optimization: {
    noEmitOnErrors: true,
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          configFile: '.eslintrc',
          failOnWarning: false,
          failOnError: false,
        },
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader?modules&localIdentName=[name]---[local]---[hash:base64:5]!sass-loader',
      },
    ],
  },
});
