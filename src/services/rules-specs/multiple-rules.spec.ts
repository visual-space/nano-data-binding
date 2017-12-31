import { setupTemplate} from '../../mocks/specs.utils'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

describe('Multiple rules', () => {
    
    beforeEach(done => { 
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="child" 
                    e-data="mockEvent, { mockValue: event.detail }"
                    e-if="mockEvent, event.detail"
                    e-for="mockEvent, event.detail"
                    e-class="mockEvent, { active: event.detail, enabled: event.detail }"
                    e-call="mockEvent, mockMethod(event.detail)">
                </div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())
    
    xit('Data bind attributes order does not matter', () => {})
    xit('Same event - e-if rule is executed first so that the other rules are not computed without reason', () => {})
    xit('Same event - e-call rule is executed last so that it can interact with the element after the data binds have changed', () => {})
    
})
