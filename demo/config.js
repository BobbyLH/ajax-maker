const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DashboardPlugin = require('webpack-dashboard/plugin')

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  path: path.resolve(__dirname),
  template: path.join(__dirname, 'index.html'),
  filename: 'index.html'
})

module.exports = {
  entry: path.join(__dirname, 'index.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, '..', 'src'),
        use: [
          {loader: 'ts-loader'}
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {loader: 'babel-loader'}
        ]
      }
    ]
  },
  plugins: [
    htmlWebpackPlugin,
    new webpack.ProgressPlugin(function handler (percentage, msg) {
      console.log((percentage.toFixed(2) * 100) + '%', msg)
    }),
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin({ port: 3302 })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  mode: 'development'
}
