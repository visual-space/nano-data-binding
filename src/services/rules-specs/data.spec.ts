// import { nanoBind } from '../selectors'
import { setupTemplate, dispatchEvent, id} from '../../mocks/specs.utils'
// import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

describe('Data bind e-data=""', () => {

    beforeEach(done => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" e-data="mockEvent, { 
                    mockValue: event.detail, 
                    secondMockValue: event.detail 
                }">
                <!--<div class="data-bind short" e-data="mockValue, { mockValue }">-->
                </div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())
    
    it('Binds data to the child element target property', () => {
        let //parent: MockWebCmp = document.querySelector('.parent'),
            child: HTMLElement = document.querySelector('.child')

        // nanoBind(parent, child)
        dispatchEvent('mockEvent'+id(), 1)
        expect((child as any).mockValue).toEqual(1)
    })

    it('Binds to multiple target properties on the child element (one update, multiple inputs)', () => {
        let //parent: MockWebCmp = document.querySelector('.parent'),
            child: HTMLElement = document.querySelector('.child')

        // nanoBind(parent, child)
        dispatchEvent('mockEvent'+id(), 1)
        expect((child as any).mockValue).toEqual(1)
        expect((child as any).secondMockValue).toEqual(1)
    })

    // TODO Implement functionality
    xit('Parses short notation for object assignment: {mockValue}', () => {})

})
