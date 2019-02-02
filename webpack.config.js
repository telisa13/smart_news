const webpack = require('webpack');
const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

const outputPath = path.resolve(__dirname, './public/scripts');

module.exports = {
  entry: {
    SwitchTheme:[
      path.resolve(__dirname, './react/SwitchTheme.js')
    ]
  },
  output:{
    path: outputPath,
    filename: '[name].js'
  },
  resolve:{
    extensions: [".js", ".jsx"] // расширения для загрузки модулей
  },
  module:{
    rules:[
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        // exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      // {
      //   test: /\.(gif|png|jpg|jpeg|svg)$/,
      //   exclude: /node_modules/,
      //   include: path.resolve(__dirname, './src/assets/'),
      //   use: 'url-loader?limit=10000&name=assets/[name].[ext]'
      // }
    ]
  },
  // plugins:[
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, './app/getPage.html'),
    //   filename: 'getPage.html',
    //   path: outputPath
    // }),
    // new webpack.NamedModulesPlugin(),
    // new webpack.HotModuleReplacementPlugin()
  // ],
  devServer:{
    contentBase: path.resolve(__dirname, './public'),
    port: 9876,
    historyApiFallback: true,
    inline: true,
    hot: true,
    host: 'localhost'
  }
  /*,
   plugins: [
   new webpack.optimize.UglifyJsPlugin({
   compress: { warnings: false },
   include: /\.min\.js$/,
   minimize: true
   })
   ]*/
};