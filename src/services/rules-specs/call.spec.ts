import { nanoBind } from '../selectors'
import { setupTemplate, dispatchEvent, id} from '../../mocks/specs.utils'

describe('Data bind e-call=""', () => {
    
    beforeEach(() => setupTemplate(`
        <mock-web-cmp class="parent">
            <div class="data-bind child" e-call="mockEvent, this.mockMethod(event.detail)"></div>
        </mock-web-cmp>
    `))
    afterEach(() => document.querySelector('.container').remove())
    
    it('Executes a method from the context of the parent', () => {
        let parent: any = document.querySelector('.parent'),
            child: any = document.querySelector('.child')

        parent.mockMethod = function (val: boolean) {
            this.MockProperty = val
        }

        nanoBind(parent, child)
        dispatchEvent('mockEvent'+id(), 5)

        expect(child.mockMethod).toBeDefined()
        expect(child.MockProperty).toEqual(5)
        
    })
    
})