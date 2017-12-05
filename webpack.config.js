const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlFile = path.resolve(__dirname, 'test', 'index.html');
const htmlName = htmlFile.split('/').slice(-1)[0];

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'test', 'index.js')
  },
  devtool: "#inline-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new HtmlWebpackPlugin({
      template: htmlFile,
      filename: htmlName,
      inject: true
    })
  ]
};