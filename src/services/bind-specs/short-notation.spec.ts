import { setupTemplate } from '../../mocks/specs.utils'

describe('Short notation for all origin - rule combos', () => {

    afterEach(() => document.querySelector('.container').remove())

    xit('Defaults to source property name if no target property is specified', () => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child data" p-data="mockProperty"></div>
                <div class="data-bind child data" p-data="mockProperty, {customInput}"></div>
                <div class="data-bind child if" p-if="mockProperty"></div>
                <div class="data-bind child for" p-for="mockProperty"></div>
                <div class="data-bind child class" p-class="mockProperty, {active, enabled}"></div>
                <div class="data-bind child call" p-call="mockMehtod(mockProperty)"></div>
            </mock-web-cmp>
        `)

    }) 

    xit('Defaults to source event name if no target property is specified', () => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child data" e-data="mockEvent"></div>
                <div class="data-bind child data" e-data="mockEvent, {customInput}"></div>
                <div class="data-bind child if" e-if="mockEvent"></div>
                <div class="data-bind child for" e-for="mockEvent"></div>
                <div class="data-bind child class" e-class="mockEvent, {active, enabled}"></div>
                <div class="data-bind child call" e-call="mockEvent, mockMehtod(event.detail)"></div>
            </mock-web-cmp>
        `)

    })

    xit('Defaults to source observable name if no target property is specified', () => { 
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child data" o-data="mockObservable"></div>
                <div class="data-bind child data" o-data="mockObservable, {customInput}"></div>
                <div class="data-bind child if" o-if="mockObservable"></div>
                <div class="data-bind child for" o-for="mockObservable"></div>
                <div class="data-bind child class" o-class="mockObservable, {active, enabled}"></div>
                <div class="data-bind child call" o-call="mockObservable, mockMehtod(payload)"></div>
            </mock-web-cmp>
        `)
    })

})
