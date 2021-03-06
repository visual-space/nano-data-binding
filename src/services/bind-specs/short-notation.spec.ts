import { setupTemplate } from '../../mocks/specs.utils'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

describe('Short notation', () => {

    afterEach(() => document.querySelector('.container').remove())

    xit('Defaults to source property name if no target property is specified', () => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="child data" p-data="mockProperty"></div>
                <div class="child data" p-data="mockProperty, {customInput}"></div>
                <div class="child if" p-if="mockProperty"></div>
                <div class="child for" p-for="mockProperty"></div>
                <div class="child class" p-class="mockProperty, {active, enabled}"></div>
                <div class="child call" p-call="mockMehtod(mockProperty)"></div>
            </mock-web-cmp>
        `)
    }) 

    xit('Defaults to source event name if no target property is specified', () => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="child data" e-data="mockEvent"></div>
                <div class="child data" e-data="mockEvent, {customInput}"></div>
                <div class="child if" e-if="mockEvent"></div>
                <div class="child for" e-for="mockEvent"></div>
                <div class="child class" e-class="mockEvent, {active, enabled}"></div>
                <div class="child call" e-call="mockEvent, mockMehtod(event.detail)"></div>
            </mock-web-cmp>
        `)
    })

    xit('Defaults to source observable name if no target property is specified', () => { 
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="child data" o-data="mockObservable"></div>
                <div class="child data" o-data="mockObservable, {customInput}"></div>
                <div class="child if" o-if="mockObservable"></div>
                <div class="child for" o-for="mockObservable"></div>
                <div class="child class" o-class="mockObservable, {active, enabled}"></div>
                <div class="child call" o-call="mockObservable, mockMehtod(payload)"></div>
            </mock-web-cmp>
        `)
    })

})
