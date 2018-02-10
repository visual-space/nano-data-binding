// import { nanoBind } from '../manual-selectors'
// import { setupTemplate, dispatchEvent, id } from '../../mocks/specs.utils'
// import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

// /** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */

// // Deep nesting of e-data="" data binds
// describe('Deep nesting', () => {

//     // <!> Chaining properties in multiple levels from the same web component is possible
//     //     However this practice is strongly discouraged.
//     //     Developers already have a strong expectation taht a component will receive inputs just from the parent
//     //     Receiving inputs (data binds) from other levels than the parent can be hard to read, confusing, and hard to maintan.
//     beforeEach(() => setupTemplate(`
//         <mock-web-cmp class="level-1" e-data="mockEvent, { mockValueL1: event.detail }" no-auto-bind>
//             <mock-web-cmp class="level-2" e-data="mockValueL1, { mockValueL2 }">
//                 <mock-web-cmp class="level-3" e-data="mockValueL2, { mockValueL3 }">
//                 </mock-web-cmp>
//             </mock-web-cmp>
//         </mock-web-cmp>
//     `))
//     afterEach(() => document.querySelector('.container').remove())

//     xit('Data binds to sett getter defined properties chain together over multiple nesting layers', () => {
//         let lvl1: MockWebCmp = document.querySelector('.level-1'),
//             lvl2: MockWebCmp = document.querySelector('.level-2'),
//             lvl3: MockWebCmp = document.querySelector('.level-3')

//         expect((lvl1 as any).mockValue).toBeUndefined()
//         expect((lvl2 as any).mockValue).toBeUndefined()
//         expect((lvl3 as any).mockValue).toBeUndefined()

//         nanoBind(lvl1, lvl2, lvl3)
//         dispatchEvent('mockEvent'+id(), 1)

//         expect((lvl1 as any).mockValue).toEqual(1)
//         expect((lvl2 as any).mockValue).toEqual(1)
//         expect((lvl3 as any).mockValue).toEqual(1)
//     })

// })