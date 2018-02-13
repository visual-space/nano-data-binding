define(function (require, exports, module) {

    let debug = require('debug')('ArticleCmp')

    class ArticleCmp extends HTMLElement {

        constructor() {
            super()
            debug('Construct ArticleCmp')
        }

        connectedCallback() {
            debug('Connect ArticleCmp')
            this.render()
        }

        render() {
            debug('Render ArticleCmp')
            this.innerHTML = `
            Article component
        `
        }

    }

    window.customElements.define('article-cmp', ArticleCmp)

})