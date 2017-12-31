import { nanoBind } from '../selectors'
import { setupTemplate } from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

// Manually initialise data binds (edge cases, bypass first web component parent rule )
describe('Manual data binds', () => {
    beforeEach(() => setupTemplate(`
        <mock-web-cmp class="parent" no-auto-bind>
            <div class="data-bind child-1" e-call="mockEvent, this.increment(event.detail)"></div>
            <div class="data-bind child-2" e-call="mockEvent, this.increment(event.detail)"></div>
        </mock-web-cmp>
    `))
    afterEach(() => document.querySelector('.container').remove())

    it('Binds DOM element', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child-1')

        nanoBind(parent, '.child-1')

        expect(child.increment).toBeUndefined()
        expect(child.count).toEqual(2)
    })

    it('Binds multiple css selector strings', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child1: MockWebCmp = document.querySelector('.child-1'),
            child2: MockWebCmp = document.querySelector('.child-2')

        nanoBind(parent, '.child-1', '.child-2')

        expect(child1.increment).toBeUndefined()
        expect(child2.increment).toBeUndefined()
        expect(child1.count).toEqual(2)
        expect(child2.count).toEqual(2)
    })

    it('Binds multiple HTMLElements', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child1: MockWebCmp = document.querySelector('.child-1'),
            child2: MockWebCmp = document.querySelector('.child-2')

        nanoBind(parent, child1, child2)

        expect(child1.increment).toBeUndefined()
        expect(child2.increment).toBeUndefined()
        expect(child1.count).toEqual(2)
        expect(child2.count).toEqual(2)
    })
    
    it('Return element with active data bindings', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child-1'),
            returnedEL: HTMLElement = nanoBind(parent, '.child-1')[0]
        
        expect(child).toEqual(returnedEL as any)
    })
    
    xit('no-auto-bind attribute prevents automatic initilisation of data binds (Used for testing)', () => {})

    xit('Binds to a custom crafted contexts (decorated methods, bind(this), an entire service)', () => {})

})