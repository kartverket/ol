const path = require('path');
module.exports = {
  entry: './build/index.js',
  devtool: 'source-map',
  mode: 'production',
  output: {
    path: path.resolve('./dist'),
    filename: 'ol.js',
    library: 'ol',
    libraryTarget: 'umd',
    libraryExport: 'default'
  }
};
