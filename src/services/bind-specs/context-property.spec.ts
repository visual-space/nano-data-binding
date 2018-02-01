import { setupTemplate } from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

// If there is no prop defined it does nothing
// When the poperty receives a value it reacts to change
// Caches the value of an existing prop and evaluates data bind
// Wraps existing setter, getters in intact (get, set, both)
// Wraps existing setter getter props intact (get, set, both)
// <!> Multiple p-data rules (so far the only option is array notation, but it is a terrible option)
describe('Context property', () => {

    beforeEach(done => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="child data" p-data="mockDataProp, customInput"></div>
                <div class="child if" p-if="mockIfProp, parent.mockIfProp"></div>
                <div class="child for" p-for="mockForProp, parent.mockForProp"><div>Test</div></div>
                <div class="child class" p-class="mockClassProp, {active: parent.mockClassProp}"></div>
                <div class="child call" p-call="mockCallProp, this.increment(parent.mockCallProp)"></div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())

    // Because all the rules have been tested already for events we merge all of them in one test for context properties
    it('Instantiates with the initial value', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            dataEl: HTMLElement = document.querySelector('.child.data'),
            getIfEl = () => document.querySelector('.child.if'),
            forEl: HTMLElement = document.querySelector('.child.for'),
            classEl: HTMLElement = document.querySelector('.child.class'),
            callEl: HTMLElement = document.querySelector('.child.call')

        // <!> Defining the source values after init makes the test even harder to pass
        ;(<any>parent).mockDataProp = 123
        ;(<any>parent).mockIfProp = true
        ;(parent as any).mockForProp = [1,2,3]
        ;(parent as any).mockClassProp = true
        ;(parent as any).mockCallProp = 1

        expect((dataEl as any ).customInput).toEqual(123)
        expect(getIfEl().tagName).toBeDefined()
        expect(forEl.children.length).toEqual(3)
        expect(classEl.classList.contains('active')).toBeTruthy()
        expect((callEl as any).increment).toBeDefined()
        expect((callEl as any).count).toEqual(1)
    })
    xit('When the source value is updated the value of another local value can be used to update the target', () => { }) // REVIEW, can be confusing

})
