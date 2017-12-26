var webpack = require("webpack"),
    common = require("./webpack-common")

// Production
module.exports = Object.assign(common, {
    devtool: "cheap-module-source-map",

    // Development plugins
    plugins: [
        ...common.plugins,

        // Transfers the node js env vars to the scripts
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production', // Use 'development' unless process.env.NODE_ENV is defined
            DEBUG: false
        }),
    ]

})  