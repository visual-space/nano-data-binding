const webpack = require('webpack'),
    path = require('path'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

// Constants
const BUILD_DIR = path.join(__dirname, '../../build'),
    ENGINE_DIR = path.join(__dirname, '../../engine'),
    PUBLIC_DIR = path.join(__dirname, '../../public'),
    PLUGINS_DIR = path.join(__dirname, '../../plugins'),
    THEMES_DIR = path.join(__dirname, '../../themes'),
    MEDIA_DIR = path.join(__dirname, '../../media'),
    NODE_MODULES_DIR = path.join(__dirname, '../../node_modules')

// Shared between prod and dev
module.exports = {

    entry: './public/main.ts',

    output: {
        // Since webpack-dev-middleware handles the files in memory, path property is used only in production.
        path: BUILD_DIR,
        publicPath: '/',
        filename: 'visual-space.js'
    },

    resolve: {
        extensions: ['*', '.ts', '.js', `.scss`]
    },

    module: {

        rules: [
            {
                test: /\.ts?$/,
                use: 'awesome-typescript-loader',
                include: [ENGINE_DIR, PUBLIC_DIR, PLUGINS_DIR, THEMES_DIR],
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "sass-loader",
                    options: { // ???
                        includePaths: ["absolute/path/a", "absolute/path/b"]
                    }
                }]
            },
            {
                test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
                use: {
                    loader: 'file-loader',
                    query: {
                        name: 'media/[name].[ext]'
                    }
                },
                include: [ENGINE_DIR, PUBLIC_DIR, PLUGINS_DIR, THEMES_DIR, MEDIA_DIR]
            }
        ]

    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {},

    // Base plugins
    plugins: [

        new CopyWebpackPlugin([
            {
                from: `media`,
                to: 'media'
            },
            {
                from: `themes/default/shared/images`, // AUTOMATIC PLUGINS THEMES
                to: 'images/visual-space'
            },
            {
                from: `plugins/visual-school/theme/shared/images`, // AUTOMATIC PLUGINS THEMES
                to: 'images/visual-school'
            }
        ]),

        new HtmlWebpackPlugin({
            template: 'public/index.html',
            inject: false // Prevent bundle being loaded twice, once in index.html and once here
        }),

        // Load visual'space.js after libs are loaded
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer'
        })
    ],

    stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
    }
}