const path = require('path')
module.exports = {
  entry: './src/vue.js',
  output: {
    path: path.resolve('./dist'),
    filename: 'vue.js'
  }
}