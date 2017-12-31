import { setupTemplate, dispatchEvent, id} from '../../mocks/specs.utils'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

describe('Class rule', () => {
    
    beforeEach(done => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="mock-class child" e-class="mockEvent, {active: event.detail, enabled: event.detail}"></div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())
    
    it('Does nothing after init (events default to false)', () => {
        let child: HTMLElement = document.querySelector('.child')
        expect(child.classList.contains('mock-class')).toBeTruthy()
        expect(child.classList.contains('child')).toBeTruthy()
        expect(child.classList.contains('active')).toBeFalsy()
    })

    it('Adds a class to the element', () => {
        let child: HTMLElement = document.querySelector('.child')
        expect(child.classList.contains('active')).toBeFalsy()
        dispatchEvent('mockEvent'+id(), true)
        expect(child.classList.contains('active')).toBeTruthy()
    })
    
    it('Adds multiple classes to the element', () => {
        let child: HTMLElement = document.querySelector('.child')
        dispatchEvent('mockEvent'+id(), true)
        expect(child.classList.contains('active')).toBeTruthy()
        expect(child.classList.contains('enabled')).toBeTruthy()
    })
    
    it('Removes a class from the element', () => {
        let child: HTMLElement = document.querySelector('.child')
        expect(child.classList.contains('active')).toBeFalsy()
        dispatchEvent('mockEvent'+id(), true)
        expect(child.classList.contains('active')).toBeTruthy()
        dispatchEvent('mockEvent'+id(), false)
        expect(child.classList.contains('active')).toBeFalsy()
    })
    
    // REVIEW Not sure about this one
    xit('Ignores existing classes', () => {})
    
})
