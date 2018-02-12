class BlogApp extends HTMLElement {

    constructor () {
        super()
        console.log('Constrcut blog app')

        this.articles = [ 'Article 1', 'Article 2', 'Article 3' ]
    }

    connectedCallback() {
        console.log('Connect BlogApp')
        this.render()
    }

    render() {
        console.log('Render BlogApp', this.innerHTML, this)
        let orig = this.innerHTML

        console.log(orig + `
        Blog app
    `)
        this.innerHTML = orig + `
            Blog app
        `
    }

}

window.customElements.define('blog-app', BlogApp)