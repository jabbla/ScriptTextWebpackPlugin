var HelloPlugin = require('./index.js');
var path = require('path');

module.exports = {
    entry: {
        test: './test/src/test/index.js',
        test1: './test/src/test1/index.js'
    },
    output: {
        filename: '[name]/[name].[chunkhash].js',
        path: './test/dist'
    },
    plugins: [
        new HelloPlugin({
            default: {
                source:{
                    filename: '[textName].html',
                    path: path.resolve(__dirname, './test/src/[textName]')
                },
                output: {
                    filename: '[textName].html',
                    path: path.resolve(__dirname, './test/dist/[textName]')
                }
            },
            config: [
                {
                    textName: 'test',
                    chunks: [{
                        name: 'test',
                        path: './'
                    }, {
                        name: 'test1',
                        path: '../test1'
                    }]
                },
                {
                    textName: 'test1',
                    chunks: [{
                        name: 'test1',
                        path: './'
                    }]
                }
            ]
        })
    ]
};