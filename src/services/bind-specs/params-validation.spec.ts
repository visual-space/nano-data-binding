import { nanoBind } from '../selectors'
import { setupTemplate } from '../../mocks/specs.utils'
import { MockWebCmp } from '../../mocks/nano-data-bind.mock'

describe('Params validation', () => {

    beforeEach(() => setupTemplate(`
        <mock-web-cmp class="parent" no-auto-bind>
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