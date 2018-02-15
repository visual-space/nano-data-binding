// Quickly start a minimal app structure without any compilation step.
require.config({
    paths: {
        'debug': 'vendors/debug',
        'browser': 'vendors/browser',
        'ms': 'vendors/ms',
        'blog': 'components/blog.app',
        'article': 'components/article.cmp',
        'nano-data-binding': 'lib/nano-data-binding',
    },
});

// <!> Order matters, browser before debug
require(['ms', 'browser', 'debug','nano-data-binding', 'blog', 'article'], function () {
    
    // Expose debug in console
    debug = arguments[2]

});