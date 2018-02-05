import { nanoBind, nanoBindAll } from '../manual-selectors'
import { setupTemplate, dispatchEvent, id } from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

// Read properties & invoke methods from parent context while binding the child context.
// Only methods are copied from the parent. Parent proerties are ignored.
describe('Call parent methods', () => {
    afterEach(() => document.querySelector('.container').remove())

    it('Copies from the parent context the invoked methods that are not already in the child context', () => {
        setupTemplate(`
            <mock-web-cmp class="parent" no-auto-bind>
                <div class="child-1" e-call="mockEvent, this.Parent_Instance_increment(event.detail)"></div>
                <div class="child-2" e-call="mockEvent, this.Child_Instance_increment(event.detail)"></div>
                <div class="child-3" e-call="mockEvent, this.Parent_Proto_increment(event.detail)"></div>
                <div class="child-4" e-call="mockEvent, this.Child_Proto_increment(event.detail)"></div>
            </mock-web-cmp>
        `)

        let parent: MockWebCmp = document.querySelector('.parent'),
            child1: HTMLElement = document.querySelector('.child-1'),
            child2: HTMLElement = document.querySelector('.child-2'),
            child3: HTMLElement = document.querySelector('.child-3'),
            child4: HTMLElement = document.querySelector('.child-4')

        // Typescirpt private methods and properties are accessible in javascript
        expect(parent.Public_Property).toBeDefined() // Instance
        expect((<any>parent).Private_Property).toBeDefined() // Instance

        expect(parent.Parent_Instance_increment).toBeDefined() // Instance
        expect(parent.Child_Instance_increment).toBeDefined()
        expect(parent.Parent_Proto_increment).toBeDefined() // Prototype
        expect(parent.Child_Proto_increment).toBeDefined()
        expect((<any>child1).Parent_Instance_increment).toBeUndefined() // Instance
        expect((<any>child2).Child_Instance_increment).toBeUndefined()
        expect((<any>child3).Parent_Proto_increment).toBeUndefined() // Prototype
        expect((<any>child4).Child_Proto_increment).toBeUndefined()
        nanoBindAll(parent, 'mock-web-cmp > div')
        dispatchEvent('mockEvent'+id(), 1)
        expect((<any>child1).Parent_Instance_increment).toBeDefined() // Instance
        expect((<any>child2).Child_Instance_increment).toBeDefined()
        expect((<any>child3).Parent_Proto_increment).toBeDefined() // Prototype
        expect((<any>child4).Child_Proto_increment).toBeDefined()
    })

    it('Execute methods from the parent in the context of the child', () => {
        setupTemplate(`
            <mock-web-cmp class="parent" no-auto-bind>
                <div class="child" e-call="mockEvent, this.increment(event.detail)"></div>
            </mock-web-cmp>
        `)

        let parent: MockWebCmp = document.querySelector('.parent'),
            child: HTMLElement = document.querySelector('.child')

        expect((<any>child).count).toBeUndefined()        
        nanoBind(parent, '.child')
        expect((<any>child).count).toBeUndefined() // This proves that properties are not copied no matter what      
        dispatchEvent('mockEvent'+id(), 1)
        expect((<any>child).count).toEqual(1)
    })

    xit('Value change on parent are available imediatly on the child', () => {})

})