import { nanoBind } from '../selectors'
import { setupTemplate } from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

// First test is initilising 
MockWebCmp // <!> Trigger registration of component (first spec to be read) 

describe('Manually initialise data binds (edge cases, bypass first web component parent rule )', () => {
    beforeEach(() => setupTemplate(`
        <mock-web-cmp class="parent" nano-no-auto-init>
            <div class="data-bind child child-1"></div>
            <div class="data-bind child child-2"></div>
        </mock-web-cmp>
    `))
    afterEach(() => document.querySelector('.container').remove())

    it('Binds DOM element', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')

        nanoBind(parent, '.child')

        expect(child.increment).toBeDefined()
        expect(child.increment(1)).toEqual(2)
    })

    it('Binds multiple css selector strings', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child1: MockWebCmp = document.querySelector('.child-1'),
            child2: MockWebCmp = document.querySelector('.child-2')

        nanoBind(parent, '.child-1', '.child-2')

        expect(child1.increment).toBeDefined()
        expect(child2.increment).toBeDefined()
        expect(child1.increment(1)).toEqual(2)
        expect(child2.increment(1)).toEqual(2)
    })

    it('Binds multiple HTMLElements', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child1: MockWebCmp = document.querySelector('.child-1'),
            child2: MockWebCmp = document.querySelector('.child-2')

        nanoBind(parent, child1, child2)

        expect(child1.increment).toBeDefined()
        expect(child2.increment).toBeDefined()
        expect(child1.increment(1)).toEqual(2)
        expect(child2.increment(1)).toEqual(2)
    })
    
    it('Return element with active data bindings', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child'),
            returnedEL: HTMLElement = nanoBind(parent, '.child')[0]
        
        expect(child).toEqual(returnedEL as any)
    })
    
    xit('nano-no-auto-init attribute prevents automatic initilisation of data binds (Used for testing)', () => {})

    xit('Binds to a custom crafted contexts (decorated methods, bind(this), an entire service)', () => {})

})