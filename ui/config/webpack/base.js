

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, '../..'),
  resolve: {
    alias: {
      assets: path.resolve(__dirname, '../../src/assets'),
      components: path.resolve(__dirname, '../../src/components'),
      config: path.resolve(__dirname, '../../src/config'),
      styles: path.resolve(__dirname, '../../src/styles'),
    },
    extensions: ['*', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
      },
      {
        test: /\.(eot|otf|svg|ttf|woff|woff2)$/,
        loader: 'file-loader',
        include: /src[\\/]assets[\\/]fonts/,
      },
      {
        test: /\.(gif|jpeg|jpg|png|svg)$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    // handles creating an index.html file and injecting assets. necessary because assets
    // change name because the hash part changes. We want hash name changes to bust cache
    // on client browsers.
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: 'body',
      filename: 'index.html',
    }),

    new CopyWebpackPlugin([
      {
        from: 'src/assets/favicon.ico',
      },
    ]),
  ],
};
