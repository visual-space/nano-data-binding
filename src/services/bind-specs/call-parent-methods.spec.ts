import { nanoBind } from '../selectors'
import { setupTemplate, dispatchEvent, id } from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

// Read properties & invoke methods from parent context while binding the child context
describe('Call parent methods', () => {
    beforeEach(() => setupTemplate(`
        <mock-web-cmp class="parent" no-auto-bind>
            <div class="data-bind child" e-call="mockEvent, this.increment(event.detail)"></div>
        </mock-web-cmp>
    `))
    afterEach(() => document.querySelector('.container').remove())

    it('No method should be copied in the child', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')

        expect(parent.aaa_Parent_Instance_Public_Medhod).toBeDefined() // Instance
        expect(parent.aaa_Child_Instance_Public_Medhod).toBeDefined()
        expect(parent.aaa_Parent_Proto_Public_Medhod).toBeDefined() // Prototype
        expect(parent.aaa_Child_Proto_Public_Medhod).toBeDefined()
        nanoBind(parent, '.child')
        dispatchEvent('mockEvent'+id(), 1)
        expect(child.aaa_Parent_Instance_Public_Medhod).toBeUndefined() // Instance
        expect(child.aaa_Child_Instance_Public_Medhod).toBeUndefined()
        expect(child.aaa_Parent_Proto_Public_Medhod).toBeUndefined() // Prototype
        expect(child.aaa_Child_Proto_Public_Medhod).toBeUndefined()
    })

    it('Execute methods from the parent in the context of the child', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')

        expect(child.count).toBeUndefined()        
        nanoBind(parent, '.child')
        dispatchEvent('mockEvent'+id(), 1)
        expect(child.count).toEqual(1)
    })

    it('Reads setters and getters', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')
        
        parent.aaa_SetGet = 2
        expect(parent.aaa_SetGet).toEqual(2) 
        nanoBind(parent, '.child')
        dispatchEvent('mockEvent'+id(), 1)
        expect(child.aaa_SetGet).toBeUndefined() // Defined properties can be enumerable and also have setters getters

    })

    it('Reads object properties defined with set and get', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')
        
        parent.aaa_SetGet_DefinedProperty = 2
        expect(parent.aaa_SetGet_DefinedProperty).toEqual(2) 
        nanoBind(parent, '.child')
        dispatchEvent('mockEvent'+id(), 1)
        expect(child.aaa_SetGet_DefinedProperty).toEqual(2) // Defined properties can be enumerable and also have setters getters
    })

    // <!> ES6 classes don't have private modifier. There is no public private distinction.
    //     Typescript just emulates this statically.
    it('Reads to nonenumerable members', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')
        
        expect((parent as any).aaa_NonEnumerable_Property).toBeDefined()
        nanoBind(parent, '.child')
        dispatchEvent('mockEvent'+id(), 1)
        expect((child as any).aaa_NonEnumerable_Property).toBeUndefined() 
    })

    xit('Value change on parent are available imediatly on the child', () => {})

})