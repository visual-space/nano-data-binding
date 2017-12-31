import { setupTemplate } from '../../mocks/specs.utils'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

// Common specs for all data binds
describe('Common specs', () => {

    beforeEach(done => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child data" e-data="mockEvent, {customInput: event.detail}"></div>
                <div class="data-bind child if" e-if="mockEvent, event.detail"></div>
                <div class="data-bind child for" e-for="mockEvent, event.detail"></div>
                <div class="data-bind child class" e-class="mockEvent, {active: event.detail, enabled: event.detail}"></div>
                <div class="data-bind child call" e-call="mockEvent, mockMehtod(event.detail)"></div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())

    xit('Automatically adds data binds when element is added in the DOM', () => {})
    xit('Matches with or without whitespace', () => { })
    xit('Matches multiline html', () => { })

})
