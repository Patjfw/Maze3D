module.exports = {
  entry: ["babel-polyfill", "./src/maze3d.js"],
  output: {
    path: __dirname + "/dist",
    filename: "maze3d.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      }
    ]
  },
  devServer: {
    contentBase: __dirname + '/src',
    watchContentBase: true,
    compress: true,
    port: 9000
  }
}
