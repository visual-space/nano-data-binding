const webpack = require('webpack'),
    path = require('path')

// Constants
const LIB_DIR = path.join(__dirname, '../lib'),
    SRC_DIR = path.join(__dirname, '../src'),
    NODE_MODULES_DIR = path.join(__dirname, '../node_modules')

// Shared between prod and dev
module.exports = {

    entry: './src/nano.data.bind.ts',

    output: {
        path: LIB_DIR,
        publicPath: '/',
        filename: 'nano.data.bind.js'
    },

    resolve: {
        extensions: ['*', '.ts', '.js']
    },

    module: {

        rules: [
            {
                test: /\.ts?$/,
                use: 'awesome-typescript-loader',
                include: SRC_DIR,
                exclude: /node_modules/
            }
        ]

    },

    stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
    }
}