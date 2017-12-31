import { setupTemplate, dispatchEvent, id} from '../../mocks/specs.utils'

describe('Data bind e-call=""', () => {
    
    beforeEach(done => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" e-call="mockEvent, this.increment(event.detail)"></div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())
    
    it('Executes a method from the context of the parent', () => {
        let child: HTMLElement = document.querySelector('.child')
        dispatchEvent('mockEvent'+id(), 5)
        expect((child as any).increment).toBeUndefined()
        expect((child as any).count).toEqual(6)
    })
    
})