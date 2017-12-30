import { setupTemplate } from '../../mocks/specs.utils'

describe('Common specs for all data binds', () => {

    beforeEach(() => setupTemplate(`
        <mock-web-cmp class="parent">
            <div class="data-bind child data" e-data="mockEvent, {customInput: event.detail}"></div>
            <div class="data-bind child if" e-if="mockEvent, event.detail"></div>
            <div class="data-bind child for" e-for="mockEvent, event.detail"></div>
            <div class="data-bind child class" e-class="mockEvent, {active: event.detail, enabled: event.detail}"></div>
            <div class="data-bind child call" e-call="mockEvent, mockMehtod(event.detail)"></div>
        </mock-web-cmp>
    `))
    afterEach(() => document.querySelector('.container').remove())

    it('Automatically adds data binds when element is added in the DOM', () => {
        expect(1).toBe(2)
    })
    it('nano-no-auto-init attribute prevents automatic initilisation of data binds (Used for testing)', () => {
        expect(1).toBe(2)
    })
    xit('Matches with or without whitespace', () => { })
    xit('Matches multiline html', () => { })

})
