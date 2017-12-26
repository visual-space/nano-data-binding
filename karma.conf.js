let webpackConfig = require('./webpack/webpack-config'),
    path = require('path')

// Karma configuration
// Generated on Sat Dec 16 2017 20:48:19 GMT+0100 (W. Europe Standard Time)
module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', 'karma-typescript'],
        webpack: webpackConfig,
        client:{
          clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        files: [
            'src/**/*.ts',
        ],
        preprocessors: {
            'src/**/*.ts': ['karma-typescript'],
        },
        karmaTypescriptConfig: {
            compilerOptions: {
                module: 'commonjs',
                preserveConstEnums: true,
                removeComments: true,
                noImplicitAny: true,    
                sourceMap: true,
                target: 'ES6',
                lib: [ "dom", "es2017" ],
            },
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/
            },
            include: [
                'src/**/*.ts',
            ],
            exclude: [
                'node_modules',
                'lib'
            ],
        },
        reporters: ['progress', 'kjhtml', 'karma-typescript'], // , 'html'
        htmlReporter: {
            outputDir: 'reports/karma-html',
            templatePath: null,
            focusOnFailures: false,
            namedFiles: false,
            pageTitle: null,
            urlFriendlyName: false,
            reportName: 'report-summary-filename',
            preserveDescribeNesting: false,
            foldAll: false,
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
        concurrency: Infinity,
        webpackMiddleware: {
            noInfo: true,
            stats: 'errors-only'
        }
    })
}