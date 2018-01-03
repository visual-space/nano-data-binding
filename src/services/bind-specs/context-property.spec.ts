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
                <div class="child if" p-i-f="mockIfProp, mockIfProp"></div>
                <div class="child for" p-f-or="mockForProp, mockForProp"></div>
                <div class="child class" p-c-lass="mockClassProp, {active: mockClassProp, enabled: mockClassProp}"></div>
                <div class="child call" p-c-all="mockCallProp, mockMehtod(mockCallProp)"></div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())

    it('Instantiates with the initial value', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            dataEl: HTMLElement = document.querySelector('.child.data')//,
            // ifEl: HTMLElement = document.querySelector('.child.if'),
            // forEl: HTMLElement = document.querySelector('.child.for'),
            // classEl: HTMLElement = document.querySelector('.child.class'),
            // callEl: HTMLElement = document.querySelector('.child.call'),
            // getIfEl = () => document.querySelector('.child.if')

        ;(<any>parent).mockDataProp = 123

        // <!> Adding the sources after init makes the test even harder to pass
        // ;(parent as any).mockDataProp = 123
        // ;(parent as any).mockIfProp = false
        // ;(parent as any).mockForProp = [1,2,3]
        // ;(parent as any).mockClassProp = true
        // ;(parent as any).mockCallProp = 'abc'
        expect((dataEl as any ).customInput).toEqual(123)
        // expect(getIfEl()).toBeDefined()
    })
    xit('When the source value is updated the value of another local value can be used to update the target', () => { }) // REVIEW, can be confusing

})
