import { nanoBind } from '../selectors'
import { setupTemplate } from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

describe('Origin - Context property', () => {

    beforeEach(() => setupTemplate(`
        <mock-web-cmp class="parent">
            <div class="data-bind child data" p-data="mockDataProp, {customInput: mockProperty}"></div>
            <div class="data-bind child if" p-if="mockIfProp, mockProperty"></div>
            <div class="data-bind child for" p-for="mockForProp, mockProperty"></div>
            <div class="data-bind child class" p-class="mockClassProp, {active: mockProperty, enabled: mockProperty}"></div>
            <div class="data-bind child call" p-call="mockCallProp, mockMehtod(mockProperty)"></div>
        </mock-web-cmp>
    `))
    afterEach(() => document.querySelector('.container').remove())

    it('Property - Instantiates with the initial value', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            dataEl: HTMLElement = document.querySelector('.child.data'),
            ifEl: HTMLElement = document.querySelector('.child.if'),
            forEl: HTMLElement = document.querySelector('.child.for'),
            classEl: HTMLElement = document.querySelector('.child.class'),
            callEl: HTMLElement = document.querySelector('.child.call'),
            getIfEl = () => document.querySelector('.child.if')

        nanoBind(parent, dataEl, ifEl, forEl, classEl, callEl)
        ;(parent as any).mockDataProp = 123
        ;(parent as any).mockIfProp = false
        ;(parent as any).mockForProp = [1,2,3]
        ;(parent as any).mockClassProp = true
        ;(parent as any).mockCallProp = 'abc'
        // expect((dataEl as any ).customInput).toEqual(123)
        expect(getIfEl()).toBeDefined()
    })
    xit('When the source value is updated the value of another local value can be used to update the target', () => { }) // REVIEW, can be confusing

})
