var path = require('path');

module.exports = {
    entry: './js/index.js',
    output: {
        filename: 'app.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                presets: ['env'],
            }
        }]
    }
};