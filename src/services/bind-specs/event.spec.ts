import { setupTemplate } from '../../mocks/specs.utils'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

describe('Custom event', () => {

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

    xit('When the source value is updated the value of another local value can be used to update the target', () => { }) // REVIEW, can be confusing
    xit('Removes event listeners when element is destroyed', () => {})

})