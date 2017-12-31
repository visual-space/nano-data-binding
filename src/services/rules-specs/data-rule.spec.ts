import { setupTemplate, dispatchEvent, id} from '../../mocks/specs.utils'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

describe('Data rule', () => {

    beforeEach(done => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="child" e-data="mockEvent, { 
                    mockValue: event.detail, 
                    secondMockValue: event.detail 
                }">
                <!--<div class="short" e-data="mockValue, { mockValue }">-->
                </div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())
    
    it('Binds data to the child element target property', () => {
        let child: HTMLElement = document.querySelector('.child')
        dispatchEvent('mockEvent'+id(), 1)
        expect((child as any).mockValue).toEqual(1)
    })

    it('Binds to multiple target properties on the child element (one update, multiple inputs)', () => {
        let child: HTMLElement = document.querySelector('.child')
        dispatchEvent('mockEvent'+id(), 1)
        expect((child as any).mockValue).toEqual(1)
        expect((child as any).secondMockValue).toEqual(1)
    })

    // TODO Implement functionality
    xit('Parses short notation for object assignment: {mockValue}', () => {})

})
