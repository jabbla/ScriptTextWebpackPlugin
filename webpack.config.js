var HelloPlugin = require('./index.js');
var path = require('path');

module.exports = {
    entry: {
        test: './test/src/test/index.js',
        test1: './test/src/test1/index.js'
    },
    output: {
        filename: '[name]/[name].[chunkhash].js',
        path: path.resolve(__dirname, './test/dist')
    },
    plugins: [
        new HelloPlugin({
            default: {
                source:{
                    filename: '[pageName].html',
                    path: path.resolve(__dirname, './test/src/[pageName]')
                },
                output: {
                    filename: '[pageName].html',
                    path: path.resolve(__dirname, './test/dist/[pageName]')
                }
            },
            config: [
                {
                    pageName: 'test',
                    chunks: [{
                        name: 'test',
                        path: './'
                    }, {
                        name: 'test1',
                        path: '../test1'
                    }]
                },
                {
                    pageName: 'test1',
                    chunks: [{
                        name: 'test1',
                        path: './'
                    }]
                }
            ]
        })
    ]
};