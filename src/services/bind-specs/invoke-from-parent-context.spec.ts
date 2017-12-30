import { nanoBind } from '../selectors'
import { setupTemplate } from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

describe('Read properties & invoke methods from parent context while binding the child context', () => {
    beforeEach(() => setupTemplate(`
        <mock-web-cmp class="parent" nano-no-auto-init>
            <div class="data-bind child child-1"></div>
            <div class="data-bind child child-2"></div>
        </mock-web-cmp>
    `))
    afterEach(() => document.querySelector('.container').remove())

    it('Binds methods from the instance, prototype methods and inherited methods', () => {
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
        expect(child.aaa_Parent_Proto_Public_Medhod).toBeDefined()
        expect(child.aaa_Child_Proto_Public_Medhod).toBeDefined()
        expect(child.aaa_Parent_Proto_Public_Medhod(1)).toEqual(2)
        expect(child.aaa_Child_Proto_Public_Medhod(1)).toEqual(2)
    })

    it('Binds/reads setters and getters', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')
        
        parent.aaa_SetGet = 2
        expect(parent.aaa_SetGet).toEqual(2) 
        nanoBind(parent, '.child')
        expect(child.aaa_SetGet).toBeUndefined() // Defined properties can be enumerable and also have setters getters

    })

    it('Binds object properties defined with set and get', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')
        
        parent.aaa_SetGet_DefinedProperty = 2
        expect(parent.aaa_SetGet_DefinedProperty).toEqual(2) 
        nanoBind(parent, '.child')
        expect(child.aaa_SetGet_DefinedProperty).toEqual(2) // Defined properties can be enumerable and also have setters getters
    })

    // <!> ES6 classes don't have private modifier. There is no public private distinction.
    //     Typescript just emulates this statically.
    it('Binds to nonenumerable members', () => {
        let parent: MockWebCmp = document.querySelector('.parent'),
            child: MockWebCmp = document.querySelector('.child')
        
        expect((parent as any).aaa_NonEnumerable_Property).toBeDefined()
        nanoBind(parent, '.child')
        expect((child as any).aaa_NonEnumerable_Property).toBeUndefined() 
    })

    xit('Value change on parent are available imediatly on the child', () => {})

})