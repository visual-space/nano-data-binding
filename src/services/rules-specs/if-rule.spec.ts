import { setupTemplate, dispatchEvent, id} from '../../mocks/specs.utils'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

let getChild = () => document.querySelector('.child')

describe('If Rule', () => {
    
    beforeEach(done => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="child" e-if="mockEvent, event.detail"></div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())
    
    it('Hides the element on initialisation (default is "false" for events)', () => {
        expect(getChild()).toEqual(null)
    })
    
    it('Element remains hidden after the second "false" event', () => {
        expect(getChild()).toEqual(null)
        dispatchEvent('mockEvent'+id(), false)
        expect(getChild()).toEqual(null)
    })
    
    it('Element becomes visible after the first "true" event', () => {
        expect(getChild()).toEqual(null)
        dispatchEvent('mockEvent'+id(), true)
        expect(getChild().tagName).toEqual('DIV')
    })
    
    it('Element remains visible after the second "true" event', () => {
        expect(getChild()).toEqual(null)
        dispatchEvent('mockEvent'+id(), true)
        expect(getChild().tagName).toEqual('DIV')
        dispatchEvent('mockEvent'+id(), true)
        expect(getChild().tagName).toEqual('DIV')
    })
    
    it('Element is hidden when transitioning from "true" to "false" event', () => {
        expect(getChild()).toEqual(null)
        dispatchEvent('mockEvent'+id(), true)
        expect(getChild().tagName).toEqual('DIV')
        dispatchEvent('mockEvent'+id(), false)
        expect(getChild()).toEqual(null)
    })

    // <!> Normally tests should not cover the inner workings of private code.
    //     However this code leaves a visible trail in the DOM node and the code itseld is quite sensitive.
    //     Also we do not expect to change the implementation of this behavior because there are no other viable alternatives.

    xit('Adds a placholder commnent', () => {})
    xit('Reuses the previous placeholder', () => {})
    xit('Binding twice will reuse the preexisting cached template (in case of developer mistake)', () => {})
    xit('Placeholder is created once per data bind initialisation', () => {})
    xit('Placeholder stores a clone of the target element', () => {})
    xit('Placeholder connects to the same custom, event as the target element', () => {})
    xit('Placeholder connects to the same context property as the target element', () => {})
    xit('Placeholder listeners are removed automatically (all of them)', () => {})
    xit('Placeholder keeps a clone of the removed element (attributes and innerHtml)', () => {})
    xit('Prevents any cross communication between instances of the target element (clone the placeholder cloned element)', () => {})

})
