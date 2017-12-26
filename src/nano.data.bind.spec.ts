// import { nanoBind, nanoBindAll } from './nano.data.bind'
import { nanoBind, nanoBindAll } from './nano.data.bind'

// Mocks
import { MockWebCmp, MockArr } from './mocks/nano-data-bind.mock'
MockWebCmp

/**
 * ====== NANO DATA BIND SPEC ======
 * Extensive testing was done for the data bondoings to make sure they work as expected no matter what other modificaitons are made
 * The data bindings will be used globally and they need to be tested thoroughly
 * TODO Curretn tests setup leaks events between tests. Using unique event names would need 
 */

// Give acccess to debug in testing environment^s console
// Sometimes tests can be fixed by studying the debug statements
;(window as any).debug = require('debug')
declare var debug: any

const MOCK_EVENT = 'MOCK_EVENT'

describe('NanoDataBind', () => {

    // ====== PARAMS VALIDATION ======

    describe('Params validation', () => {

        beforeEach(() => setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child"></div>
            </mock-web-cmp>
        `))
        afterEach(() => document.querySelector('.container').remove())
        
        it('Error - nanoBind() failed. First param missing. Provide a HTMLElement.', () => {
            expect( () => (nanoBind as any)() ).toThrow(new Error('nanoBind() failed. First param missing. Provide a HTMLElement.'))
        })
        
        it('Error - nanoBind() failed. First parameter is not a HTMLElement.', () => {
            let err = 'nanoBind() failed. First parameter is not a HTMLElement.'

            expect( () => nanoBind(1 as any) ).toThrow(new Error(err))
            expect( () => nanoBind('abc' as any) ).toThrow(new Error(err))
            expect( () => nanoBind(true as any) ).toThrow(new Error(err))
            expect( () => nanoBind([] as any) ).toThrow(new Error(err))
            expect( () => nanoBind({} as any) ).toThrow(new Error(err))
        })
        
        it('Error - nanoBind() failed. Second parameter missing. Provide a css selector string or a HTMLElement.', () => {
            let parent: MockWebCmp = document.querySelector('.parent')
            expect( () => nanoBind(parent as any) ).toThrow(new Error('nanoBind() failed. Second parameter missing. Provide a css selector string or a HTMLElement.'))
        })
        
        it('Error - nanoBind() failed. Second parameter is not a css selector string or a HTMLElement.', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                err = 'nanoBind() failed. Second parameter is not a css selector string or a HTMLElement.'

            expect( () => nanoBind(parent, 1 as any) ).toThrow(new Error(err))
            expect( () => nanoBind(parent, true as any) ).toThrow(new Error(err))
            expect( () => nanoBind(parent, [] as any) ).toThrow(new Error(err))
            expect( () => nanoBind(parent, {} as any) ).toThrow(new Error(err))
        })
        
        it('Error - nanoBind() failed. Not all selectors have the same type.', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child'),
                err = 'nanoBind() failed. Not all selectors have the same type.'

            expect( () => nanoBind(parent, 'sel', 1 as any) ).toThrow(new Error(err))
            expect( () => nanoBind(parent, child, 1 as any) ).toThrow(new Error(err))
        })
    })
    
    // ====== BINDS PROPERTIES & METHODS FROM PARENT CONTEXT ======
    // TODO Check also for props not only mehtods

    describe('Binds properties from parent context', () => {
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

    // ====== ALL DATA BINDS ======

    describe('Common specs for all data binds', () => {

        beforeEach(() => setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child data" n-data="${MOCK_EVENT} : {customInput: event.detail}"></div>
                <div class="data-bind child if" n-if="${MOCK_EVENT} : event.detail"></div>
                <div class="data-bind child for" n-for="${MOCK_EVENT} : event.detail"></div>
                <div class="data-bind child class" n-class="${MOCK_EVENT} : {active: event.detail, enabled: event.detail}"></div>
                <div class="data-bind child call" n-call="${MOCK_EVENT} : event.detail"></div>
            </mock-web-cmp>
        `))
        afterEach(() => document.querySelector('.container').remove())

        xit('Removes event listeners when element is destroyed', () => {
            let parent: MockWebCmp = document.querySelector('.parent')//,
                // children = document.querySelectorAll('.child')

            // nanoBindAll(parent, children) // RESTORE when nanoBindAll() is implemented
            nanoBindAll(parent, '.data', '.if', '.for', '.class', '.call' )
            dispatchEvent(MOCK_EVENT+id, true)

            expect(1).toBeDefined(1)
        })

        xit('Matches with or without whitespace', () => { })
        xit('Matches the first colon or first dot', () => { })
        xit('Matches multiline html', () => { })
        xit('Matches only first occurence dot', () => { })
        xit('Matches only first occurence colon', () => { })
        // REVIEW
        // This behavior could be actually dangerous. 
        // Complex code that goes against the separation of data computation from the rendering of components can be written.
        // This behavior can be potatentially useful in limited set of situations that usually can be handled in better ways.
        xit('When the source value is updated the value of another local value can be used to update the target', () => { })
        // TODO Implement
        xit('value defaults to event.detail if no property is provided', () => { })
        // TODO Implement
        xit('Defaults to property bind if no operation token was provided ".", ":". "$"', () => { })
        xit('Property - Instantiates with the initial value', () => { })

    })

    // ====== DATA ======

    describe('Data bind n-data=""', () => {

        beforeEach(() => setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" n-data="${MOCK_EVENT} : { 
                    mockValue: event.detail, 
                    secondMockValue: event.detail 
                }">
                <!--<div class="data-bind short" n-data="mockValue . { mockValue }">-->
                </div>
            </mock-web-cmp>
        `))
        afterEach(() => document.querySelector('.container').remove())
        
        it('Binds data to the child element target property', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child')

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, 1)
            expect((child as any).mockValue).toEqual(1)
        })

        it('Binds to multiple target properties on the child element (one update, multiple inputs)', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child')

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, 1)
            expect((child as any).mockValue).toEqual(1)
            expect((child as any).secondMockValue).toEqual(1)
        })

        // TODO Implement functionality
        xit('Parses short notation for object assignment: {mockValue}', () => {})

    })

    // ====== IF ======
    
    describe('Data bind n-if=""', () => {
        
        beforeEach(() => setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" n-if="${MOCK_EVENT} : event.detail"></div>
            </mock-web-cmp>
        `))
        afterEach(() => document.querySelector('.container').remove())
        
        it('Hides the element on initialisation (default is "false" for events)', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child'),
                getChild = () => document.querySelector('.child')

            nanoBind(parent, child)

            expect(getChild()).toEqual(null)
        })
        
        it('Element remains hidden after the second "false" event', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child'),
                getChild = () => document.querySelector('.child')

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, false)

            expect(getChild()).toEqual(null)
        })
        
        it('Element becomes visible after the first "true" event', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child'),
                getChild = () => document.querySelector('.child')

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, true)

            expect(getChild().tagName).toEqual('DIV')
        })
        
        it('Element remains visible after the second "true" event', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child'),
                getChild = () => document.querySelector('.child')

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, true)
            expect(getChild().tagName).toEqual('DIV')
            dispatchEvent(MOCK_EVENT+id, true)
            expect(getChild().tagName).toEqual('DIV')
        })
        
        it('Element is hidden when transitioning from "true" to "false" event', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child'),
                getChild = () => document.querySelector('.child')

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, true)
            expect(getChild().tagName).toEqual('DIV')
            dispatchEvent(MOCK_EVENT+id, false)
            expect(getChild()).toEqual(null)
        })

        // <!> Normally tests should not cover the inner workings of private code.
        //     However this code leaves a visible trail in the DOM node and the code itseld is quite sensitive.
        //     Also we do not expect to change the implementation of this behavior because there are no other viable alternatives.

        xit('Adds a placholder commnent', () => {})
        xit('Reuses the previous placeholder', () => {})
        xit('Binding twice will reuse the preexisting cached template (in case of developer mistake)', () => {})
        xit('Placeholder is created once per data bind initialisation', () => {})
        xit('Placeholder stores a clone of the target element', () => {})
        xit('Placeholder connects to the same custom, event as the target element', () => {})
        xit('Placeholder connects to the same context property as the target element', () => {})
        xit('Placeholder listeners are removed automatically', () => {})
        xit('Placeholder keeps a clone of the removed element (attributes and innerHtml)', () => {})
        xit('Prevents any cross communication between instances of the target element (clone the placeholder cloned element)', () => {})

    })

    // ====== FOR ======
    // <!> TODO After implementing rack by also update the tests
    
    describe('Data bind n-for=""', () => {

        /** Small util used to retrieve data associated with the list elements */
        function getListDataFromEls(children: HTMLCollection) {
            return Array.from(children).map( ch => (ch as any)._nForDataBInd )
        }

        beforeEach(() => setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" n-for="${MOCK_EVENT} : event.detail">
                    <div class="item"></div>
                </div>
            </mock-web-cmp>
        `))
        afterEach(() => document.querySelector('.container').remove())
        
        // +d1
        // +d2
        // +d3
        it('Init - Add all elements', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)

            expect(child.children.length).toEqual(3)
            expect(storedArr).toEqual(mockArr)
            expect(storedArr[0]).toBe(mockArr[0])
            expect(storedArr[1]).toBe(mockArr[1])
            expect(storedArr[2]).toBe(mockArr[2])
        })

        // d1 - e1
        // d2 - e2
        // d3 - e3
        it('No change - Nothing happens if the same list is provided again', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)
            dispatchEvent(MOCK_EVENT+id, mockArr) // Should fail.

            expect(child.children.length).toEqual(3)
            expect(storedArr).toEqual(mockArr)
            expect(storedArr[0]).toBe(mockArr[0])
            expect(storedArr[1]).toBe(mockArr[1])
            expect(storedArr[2]).toBe(mockArr[2])
        })

        // *d1 - e1
        // d2 - e2
        // d3 - e3
        // TODO Make sure to keep this behavior when implementing trackBy tests
        it('Update first item - No DOM changes, only setter getters react to item data updated', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)

            expect(child.children.length).toEqual(3)
            expect(storedArr).toEqual(mockArr)
            expect(storedArr[0]).toBe(mockArr[0])
            expect(storedArr[1]).toBe(mockArr[1])
            expect(storedArr[2]).toBe(mockArr[2])

            // Test pass by reference (update)
            mockArr[0].a = 0
            expect(storedArr[0].a).toEqual(0)
            expect(storedArr[0].a).toEqual(mockArr[0].a)
        })

        // -d1 - e1 
        // d2 - e2
        // d3 - e3
        it('Remove first - Other DOM nodes won\'t update', () => {
            
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            expect(child.children.length).toEqual(3)

            mockArr.shift()
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)

            expect(child.children.length).toEqual(2)
            expect(storedArr).toEqual(mockArr)
            expect(storedArr[1]).toBe(mockArr[1])
            expect(storedArr[2]).toBe(mockArr[2])
        })

        // -d1 - e1
        // -d2 - e2
        // -d3 - e3
        // +d
        // +d
        // +d
        it('Remove and Add all - New array, total update', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            expect(child.children.length).toEqual(3)

            mockArr.length = 0
            dispatchEvent(MOCK_EVENT+id, mockArr)
            expect(child.children.length).toEqual(0)

            // Keep old arr reference intact
            mockArr.push({ a: 4 })
            mockArr.push({ b: 5 })
            mockArr.push({ c: 6 }) 
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)

            expect(child.children.length).toEqual(3)
            expect(storedArr).toEqual(mockArr)
            expect(storedArr[0].a).toEqual(4)
            expect(storedArr[1].b).toEqual(5)
            expect(storedArr[2].c).toEqual(6)
        })

        // -d1 - e1
        // +d
        // d2 - e2
        // d3 - e3
        it(`Remove and add first - Creates new element, it does not recylce the old element. 
            As long refs/ids of the deleted element are different.`, () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            expect(child.children.length).toEqual(3)

            mockArr.shift()
            dispatchEvent(MOCK_EVENT+id, mockArr)
            expect(child.children.length).toEqual(2)

            mockArr.unshift({ a: 4 })
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)

            expect(child.children.length).toEqual(3)
            expect(storedArr).toEqual(mockArr)
            expect(storedArr[0].a).toEqual(4)
            expect(storedArr[1]).toBe(mockArr[1])
            expect(storedArr[2]).toBe(mockArr[2])
        })

        // +d 
        // d1 - e1
        // d3 - e2
        // d4 - e3
        it('Add first - Other DOM nodes won\'t update', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            expect(child.children.length).toEqual(3)

            mockArr.unshift({ z: 4 })
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)

            expect(child.children.length).toEqual(4)
            expect(storedArr).toEqual(mockArr)
            expect(storedArr[0].z).toEqual(4)
            expect(storedArr[1]).toBe(mockArr[1])
            expect(storedArr[2]).toBe(mockArr[2])
            expect(storedArr[3]).toBe(mockArr[3])
        })

        // +d 
        // d1 - e1
        // +d
        // +d
        // d3 - e2
        // d4 - e3
        it('Add multiple intermixed - Other DOM nodes won\'t update', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            expect(child.children.length).toEqual(3)

            mockArr.unshift({ x: 4 })
            mockArr.splice(2, 0, { y: 5 })
            mockArr.splice(3, 0, { z: 6 })
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)

            expect(child.children.length).toEqual(6)
            expect(storedArr).toEqual(mockArr)
            expect(storedArr[0].x).toEqual(4)
            expect(storedArr[1]).toBe(mockArr[1])
            expect(storedArr[2].y).toEqual(5)
            expect(storedArr[3].z).toEqual(6)
            expect(storedArr[4]).toBe(mockArr[4])
            expect(storedArr[5]).toBe(mockArr[5])
        })

        // -d1 - e1
        // *d2 - e2
        // d3 - e3
        // +d
        it('All operations mixed together', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            expect(child.children.length).toEqual(3)

            mockArr.shift()
            mockArr[0].b = 5
            mockArr.push({ d: 4 })
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)

            expect(child.children.length).toEqual(3)
            expect(storedArr).toEqual(mockArr)
            expect(storedArr[0]).toBe(mockArr[0])
            expect(storedArr[0].b).toEqual(5)
            expect(storedArr[1]).toBe(mockArr[1])
            expect(storedArr[2].d).toEqual(4)
        })

        // -d1 - e1
        // +d2
        // -d3 - e2
        // +d1
        // d4 - e3
        it('Shuffling (changing order)', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: HTMLHtmlElement = document.querySelector('.child'),
                mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
                storedArr: MockArr

            nanoBind(parent, child)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            expect(child.children.length).toEqual(3)

            let el0 = mockArr[0]
            mockArr.shift()
            mockArr.splice(1,0,el0)
            dispatchEvent(MOCK_EVENT+id, mockArr)
            storedArr = getListDataFromEls(child.children)

            expect(child.children.length).toEqual(3)
            expect(storedArr[0]).toBe(mockArr[1])
            expect(storedArr[1]).toBe(mockArr[0])
            expect(storedArr[2]).toBe(mockArr[2])
        })

        xit('Renders text', () => {})
        xit('Renders html', () => {})
        xit('Renders web components and binds data from the array to them', () => {})
        xit('Binds data to the iterated children components / html elements', () => {})
        xit('Binding twice will reuse the preexisting cached template (in case of developer mistake)', () => {})
        xit('Short notation', () => {})

    })
    
    // ====== CLASS ======

    describe('Data bind n-class=""', () => {
        
        beforeEach(() => setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" n-class="${MOCK_EVENT} : {active: event.detail, enabled: event.detail}"></div>
            </mock-web-cmp>
        `))
        afterEach(() => document.querySelector('.container').remove())
        
        it('Does nothing after init (events default to false)', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child')

            nanoBind(parent, child)

            expect(child.classList.contains('data-bind')).toBeTruthy()
            expect(child.classList.contains('child')).toBeTruthy()
            expect(child.classList.contains('active')).toBeFalsy()
        })

        it('Adds a class to the element', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child')

            nanoBind(parent, child)

            expect(child.classList.contains('active')).toBeFalsy()
            dispatchEvent(MOCK_EVENT+id, true)
            expect(child.classList.contains('active')).toBeTruthy()
        })
        
        it('Adds multiple classes to the element', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child')

            nanoBind(parent, child)

            dispatchEvent(MOCK_EVENT+id, true)
            expect(child.classList.contains('active')).toBeTruthy()
            expect(child.classList.contains('enabled')).toBeTruthy()
        })
        
        it('Removes a class from the element', () => {
            let parent: MockWebCmp = document.querySelector('.parent'),
                child: MockWebCmp = document.querySelector('.child')

            nanoBind(parent, child)

            expect(child.classList.contains('active')).toBeFalsy()
            dispatchEvent(MOCK_EVENT+id, true)
            expect(child.classList.contains('active')).toBeTruthy()
            dispatchEvent(MOCK_EVENT+id, false)
            expect(child.classList.contains('active')).toBeFalsy()
        })
        
        // REVIEW Not sure about this one
        xit('Ignores existing classes', () => {})
    })
    
    // ====== CALL ======

    describe('Data bind n-call=""', () => {
      
        beforeEach(() => setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" n-call="${MOCK_EVENT} : event.detail"></div>
            </mock-web-cmp>
        `))
        afterEach(() => document.querySelector('.container').remove())
        
        it('Executes a method from the context of the parent', () => {
            let parent: any = document.querySelector('.parent'),
                child: any = document.querySelector('.child')

            parent.mockMethod = function () {
                this.MockProperty = 5
            }

            nanoBind(parent, child)

            expect(child.mockMethod).toBeDefined()
            expect(child.MockProperty).toBeUndefined()
            child.mockMethod()
            expect(child.MockProperty).toEqual(5)
            
        })
    })
    
    // ====== DEEP NESTING DATA BIND ======

    describe('Deep nesting of n-data="" data binds', () => {

        // <!> Chaining properties in multiple levels from the same web component is possible
        //     However this practice is strongly discouraged.
        //     Developers already have a strong expectation taht a component will receive inputs just from the parent
        //     Receiving inputs (data binds) from other levels than the parent can be hard to read, confusing, and hard to maintan.
        beforeEach(() => setupTemplate(`
            <mock-web-cmp class="level-1" n-data="${MOCK_EVENT} : { mockValueL1: event.detail }">
                <mock-web-cmp class="level-2" n-data="mockValueL1 . { mockValueL2 }">
                    <mock-web-cmp class="level-3" n-data="mockValueL2 . { mockValueL3 }">
                    </mock-web-cmp>
                </mock-web-cmp>
            </mock-web-cmp>
        `))
        afterEach(() => document.querySelector('.container').remove())

        xit('Data binds to sett getter defined properties chain together over multiple nesting layers', () => {
            let lvl1: MockWebCmp = document.querySelector('.level-1'),
                lvl2: MockWebCmp = document.querySelector('.level-2'),
                lvl3: MockWebCmp = document.querySelector('.level-3')
    
            expect((lvl1 as any).mockValue).toBeUndefined()
            expect((lvl2 as any).mockValue).toBeUndefined()
            expect((lvl3 as any).mockValue).toBeUndefined()

            nanoBind(lvl1, lvl2, lvl3)
            dispatchEvent(MOCK_EVENT+id, 1)

            expect((lvl1 as any).mockValue).toEqual(1)
            expect((lvl2 as any).mockValue).toEqual(1)
            expect((lvl3 as any).mockValue).toEqual(1)
        })

    })
    
    // ====== MULTIPLE BINDS ======

    describe('Multiple data binds on the same element', () => {
      
        beforeEach(() => setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" 
                    n-data="${MOCK_EVENT} : { mockValue: event.detail }"
                    n-if="${MOCK_EVENT} : event.detail"
                    n-for="${MOCK_EVENT} : event.detail"
                    n-class="${MOCK_EVENT} : { active: event.detail, enabled: event.detail }"
                    n-call="${MOCK_EVENT} : event.detail">
                </div>
            </mock-web-cmp>
        `))
        afterEach(() => document.querySelector('.container').remove())
        
        xit('Data bind attributes order does not matter', () => {})
        xit('Same event - n-if rule is executed first so that the other rules are not computed without reason', () => {})
        xit('Same event - n-call rule is executed last so that it can interact with the element after the data binds have changed', () => {})
    })

})

/** 
 * Each tests needs an unique event name, otherwise the tests will have interferance from one to the other 
 * Events fire in previouse tests, show up as events in the later tests
 */
let id: number = 0

/** 
 * Each test needs to start with a fresh template
 * <!> Unique ids are automatically added to events 
 */
function setupTemplate(template: string) {

    // Container
    var container = document.createElement('div') 
    container.classList.add('container')
    
    // <!> Suffix all event names with a unique id
    // The counter increments once per test, exactly what we need
    template = template.replace(/(MOCK_EVENT)/g, `MOCK_EVENT${++id}`)
    
    // Simple nested web component with basic content
    container.innerHTML = template
        
    // Connect
    document.body.appendChild(container)
    debug.enabled === true && console.log('======Template ready======')
}

function dispatchEvent(eventName: string, val: any) {
    debug.enabled === true && console.log('======Dispatch event======', eventName, val)
    let customEvent = new CustomEvent(eventName, { detail: val })
    document.dispatchEvent(customEvent)
}
