// import { nanoBind } from '../selectors'
import { setupTemplate, dispatchEvent, id} from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

describe('Data bind e-call=""', () => {
    
    beforeEach(done => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" e-call="mockEvent, this.mockMethod(event.detail)"></div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())
    
    it('Executes a method from the context of the parent', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: HTMLElement = document.querySelector('.child')

        // setTimeout(() => done(), 10)
        ;(parent as any).mockMethod = function (val: boolean) {
            this.MockProperty = val
        }

        // nanoBind(parent, child)
        dispatchEvent('mockEvent'+id(), 5)

        expect((child as any).mockMethod).toBeDefined()
        expect((child as any).MockProperty).toEqual(5)
        
    })
    
})