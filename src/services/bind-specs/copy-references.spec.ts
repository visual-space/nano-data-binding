import { nanoBind } from '../selectors'
import { setupTemplate } from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

describe('Copy references of properties & methods from parent context to child context', () => {
    beforeEach(() => setupTemplate(`
        <mock-web-cmp class="parent">
            <div class="data-bind child child-1"></div>
            <div class="data-bind child child-2"></div>
        </mock-web-cmp>
    `))
    afterEach(() => document.querySelector('.container').remove())

    it('Binds only methods from the instance, not from the prototype (including inherited methods)', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')

        // Instance
        expect(parent.aaa_Parent_Instance_Public_Medhod).toBeDefined()
        expect(parent.aaa_Child_Instance_Public_Medhod).toBeDefined()
        expect(parent.aaa_Parent_Instance_Public_Medhod(1)).toEqual(2)
        expect(parent.aaa_Child_Instance_Public_Medhod(1)).toEqual(2)

        // Prototype
        expect(parent.aaa_Parent_Proto_Public_Medhod).toBeDefined()
        expect(parent.aaa_Child_Proto_Public_Medhod).toBeDefined()
        expect(parent.aaa_Parent_Proto_Public_Medhod(1)).toEqual(2)
        expect(parent.aaa_Child_Proto_Public_Medhod(1)).toEqual(2)

        nanoBind(parent, '.child')

        // Instance
        expect(child.aaa_Parent_Instance_Public_Medhod).toBeDefined()
        expect(child.aaa_Child_Instance_Public_Medhod).toBeDefined()
        expect(child.aaa_Parent_Instance_Public_Medhod(1)).toEqual(2)
        expect(child.aaa_Child_Instance_Public_Medhod(1)).toEqual(2)

        // Prototype
        expect(child.aaa_Parent_Proto_Public_Medhod).toBeUndefined()
        expect(child.aaa_Child_Proto_Public_Medhod).toBeUndefined()
    })

    it('It does not bind setters and getters', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')
        
        parent.aaa_SetGet = 2
        expect(parent.aaa_SetGet).toEqual(2) 
        nanoBind(parent, '.child')
        expect(child.aaa_SetGet).toBeUndefined() // Defined properties can be enumerable and also have setters getters

    })

    it('It binds object properties defined with set and get', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')
        
        parent.aaa_SetGet_DefinedProperty = 2
        expect(parent.aaa_SetGet_DefinedProperty).toEqual(2) 
        nanoBind(parent, '.child')
        expect(child.aaa_SetGet_DefinedProperty).toEqual(2) // Defined properties can be enumerable and also have setters getters
    })

    // <!> ES6 classes don't have private modifier. There is no public private distinction.
    //     Typescript just emulates this statically.
    it('Nonenumerable properties are not passed from parent to child (js does not have private modifier)', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')
        
        expect((parent as any).aaa_NonEnumerable_Property).toBeDefined()
        nanoBind(parent, '.child')
        expect((child as any).aaa_NonEnumerable_Property).toBeUndefined() 
    })

    xit('Ignores evaluatedstring', () => {})
    xit('Changing the value on parent does not change the value on child (pass by value)', () => {})
    xit('Changing a property of an object hosted in parent element also changes the object received by the children element (pass by reference, no cloning)', () => {})

    it('Binds DOM element', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')

        nanoBind(parent, '.child')

        expect(child.increment).toBeDefined()
        expect(child.increment(1)).toEqual(2)
    })

    it('Binds multiple css selector strings', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child1: MockWebCmp = document.querySelector('.child-1'),
            child2: MockWebCmp = document.querySelector('.child-2')

        nanoBind(parent, '.child-1', '.child-2')

        expect(child1.increment).toBeDefined()
        expect(child2.increment).toBeDefined()
        expect(child1.increment(1)).toEqual(2)
        expect(child2.increment(1)).toEqual(2)
    })

    it('Binds multiple HTMLElements', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child1: MockWebCmp = document.querySelector('.child-1'),
            child2: MockWebCmp = document.querySelector('.child-2')

        nanoBind(parent, child1, child2)

        expect(child1.increment).toBeDefined()
        expect(child2.increment).toBeDefined()
        expect(child1.increment(1)).toEqual(2)
        expect(child2.increment(1)).toEqual(2)
    })
    
    it('Return element with active data bindings', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child'),
            returnedEL: HTMLElement = nanoBind(parent, '.child')[0]
        
        expect(child).toEqual(returnedEL as any)
    })

    xit('Binds to a custom crafted contexts (decorated methods, bind(this), an entire service)', () => {})

})