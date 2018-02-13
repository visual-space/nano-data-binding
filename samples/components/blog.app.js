define(function (require, exports, module) {

    let debug = require('debug')('BlogApp')

    class BlogApp extends HTMLElement {

        constructor() {
            super()
            debug('Construct blog app')

            this.articles = ['Article 1', 'Article 2', 'Article 3']
        }

        connectedCallback() {
            debug('Connect BlogApp')
            this.render()
        }

        render() {
            debug('Render BlogApp')

            this.innerHTML = `
            Blog app
        ` + this.innerHTML
        }

    }

    window.customElements.define('blog-app', BlogApp)

})