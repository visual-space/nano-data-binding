class ArticleCmp extends HTMLElement {

    constructor () {
        super()
        console.log('Constrcut ArticleCmp')
    }

    connectedCallback() {
        console.log('Connect ArticleCmp')
        this.render()
    }

    render() {
        console.log('Render ArticleCmp')
        this.innerHTML = `
            Article component
        `
    }

}

window.customElements.define('article-cmp', ArticleCmp)