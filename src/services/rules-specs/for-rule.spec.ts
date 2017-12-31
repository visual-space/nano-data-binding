import { setupTemplate, dispatchEvent, id} from '../../mocks/specs.utils'
import { MockArr } from '../../interfaces/nano-data-binding'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

describe('For rule', () => {

    /** Small util used to retrieve data associated with the list elements */
    function getListDataFromEls(children: HTMLCollection) {
        return Array.from(children).map( ch => (ch as any)._nForDataBInd )
    }

    beforeEach((done) => {
        setupTemplate(`
            <mock-web-cmp class="parent">
                <div class="data-bind child" e-for="mockEvent, event.detail">
                    <div class="item"></div>
                </div>
            </mock-web-cmp>
        `)
        setTimeout(() => done(), 0) // Wait for dom mutation
    })
    afterEach(() => document.querySelector('.container').remove())
    
    // +d1
    // +d2
    // +d3
    it('Add all elements at init', () => {
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
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
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
        storedArr = getListDataFromEls(child.children)
        dispatchEvent('mockEvent'+id(), mockArr) // Should fail.

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
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
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
        
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
        expect(child.children.length).toEqual(3)

        mockArr.shift()
        dispatchEvent('mockEvent'+id(), mockArr)
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
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
        expect(child.children.length).toEqual(3)

        mockArr.length = 0
        dispatchEvent('mockEvent'+id(), mockArr)
        expect(child.children.length).toEqual(0)

        // Keep old arr reference intact
        mockArr.push({ a: 4 })
        mockArr.push({ b: 5 })
        mockArr.push({ c: 6 }) 
        dispatchEvent('mockEvent'+id(), mockArr)
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
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
        expect(child.children.length).toEqual(3)

        mockArr.shift()
        dispatchEvent('mockEvent'+id(), mockArr)
        expect(child.children.length).toEqual(2)

        mockArr.unshift({ a: 4 })
        dispatchEvent('mockEvent'+id(), mockArr)
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
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
        expect(child.children.length).toEqual(3)

        mockArr.unshift({ z: 4 })
        dispatchEvent('mockEvent'+id(), mockArr)
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
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
        expect(child.children.length).toEqual(3)

        mockArr.unshift({ x: 4 })
        mockArr.splice(2, 0, { y: 5 })
        mockArr.splice(3, 0, { z: 6 })
        dispatchEvent('mockEvent'+id(), mockArr)
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
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
        expect(child.children.length).toEqual(3)

        mockArr.shift()
        mockArr[0].b = 5
        mockArr.push({ d: 4 })
        dispatchEvent('mockEvent'+id(), mockArr)
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
        let child: HTMLElement = document.querySelector('.child'),
            mockArr: MockArr = [{ a: 1 }, { b: 2 }, { c: 3 }],
            storedArr: MockArr

        dispatchEvent('mockEvent'+id(), mockArr)
        expect(child.children.length).toEqual(3)

        let el0 = mockArr[0]
        mockArr.shift()
        mockArr.splice(1,0,el0)
        dispatchEvent('mockEvent'+id(), mockArr)
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