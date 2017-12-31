import { setupTemplate } from '../../mocks/specs.utils'

// Implement
// Also implment shortnotaion tests after implmenting observables
describe('Observable', () => {

    beforeEach(done => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="child data" o-data="mockObservable, {customInput: payload}"></div>
                <div class="child if" o-if="mockObservable, payload"></div>
                <div class="child for" o-for="mockObservable, payload"></div>
                <div class="child class" o-class="mockObservable, {active: payload, enabled: payload}"></div>
                <div class="child call" o-call="mockObservable, payload"></div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())

    xit('When the source value is updated the value of another local value can be used to update the target', () => { }) // REVIEW, can be confusing
    xit('Removes subscriptions when element is destroyed', () => {})

})
