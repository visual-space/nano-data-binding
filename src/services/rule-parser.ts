import { DataBind, Changes } from '../interfaces/nano-data-binding'
import * as utils from './utils'

/**
 * Each data bind rule has an expected behavior. 
 * Most of these behaviors are inspired by the Angualr framework.
 * These data binds have been tailored for taking advantage of the web components API.
 * 
 * <!> Behaviors
 *     `call`  - Pass data to the target component
 *     `if`    - Hide the target component
 *     `for`   - Render all elements from an array using the same template
 *     `class` - Conditionally add CSS classes to target element
 *                ALl the previous rules could be implemented using this one.     
 */

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:RuleParser') : () => {}
debug('Instantiate RuleParser')

/**
 * Binds the values defined in the descriptor object to the child element
 * These values can be mathced to getter setter properties and this is how the data is progragated trough all nesting levels
 * <!> Ideally the hierarchy of the components would be shallow and wide instead of tall and narrow.
 *     Nonetheless this data binding will work as many levels are needed
 */
export function bindDataToElem(dataBind: DataBind): void {
    let { parent, child, source, code } = dataBind

    code = code.trim()
    
    ;(child as any)[code] = (<any>parent)[source]

    debug('Write data bind values to element', { dataBind }) // inputs
}

/** Toggle the element using a comment node as a placeholder */
export function toggleConditionalElem(dataBind: DataBind): void {
    debug('Toggle IF data bind element', { dataBind })
    let { child } = dataBind,
        isVisible: boolean,
        conditionalEl: HTMLElement

    // Element visibility
    dataBind.modifier = 'this._evalOutput = ' // Capture value
    isVisible = utils.evalInContext.call(child, dataBind)

    // Toggle element
    if (isVisible === true) {
        conditionalEl = utils.getElementFromCachedTemplate(dataBind)
        debug('Insert child', {conditionalEl})
        child.parentNode.insertBefore(conditionalEl, child.nextSibling)
    } else if (isVisible === false) {
        debug('Remove child')
        dataBind.child.remove()
    }
}

/**
 * Iterates all elements of an array.
 * Update, Add, Remove operations are optimised to target only the changed elements.
 * Renders text, html and web components.
 * Binds data from the array to the web components.
 * <!> The for loop is by design unabled to bind data to templates.
 *     In order to encourage a simpler cleaner architecture, items are expected to be defined as webcomponents.
 *     The performance cost is minimal to non-existent, and having two web components defined in the same file is permited.
 * <!> Compares the old list with the new list, extracts the changes and then it syncs the dom with the new list.
 * <!> Repeats only one element and it`s contents.
 * TODO Upgrade to allow multiple tags rendered by the same loop. In this case we need to scan for data binds and attach the data there.
 * REFACTOR The old list can be cached somewhere instead of being retrieved from the DOM elements.
 */
export function updateForList (dataBind: DataBind) {
    let { child } = dataBind,
        changes: Changes = { added: [], removed: [] }
    
    // Get the source array
    // REFACTOR After simplifying the syntax, this step wont be needed anymore.
    dataBind.modifier = 'this._evalOutput = ' // Capture value
    let newItems: any[] = utils.evalInContext.call(child, dataBind),
        elems: HTMLElement[] = <HTMLElement[]>Array.from(child.children),
        oldItems: any[] = elems.map((el: any) => el._nano_forItemData)
    if (newItems.constructor !== Array) {
        console.warn(`Cannot render "for" list. Only arrays are accepted. ${utils.printDataBindInfo(dataBind)}`)
        return
    }

    // Label additions and deletions
    changes.added = newItems.filter(itm => !oldItems.includes(itm))
    changes.removed = oldItems.filter(itm => !newItems.includes(itm))

    debug('Update "for" list', { newItems, oldItems, changes, dataBind })

    // Validation
    elems.forEach(el => {
        if (!(el as any)._nano_forItemData) {
            console.warn('Metadata is missing. Ensure that no other library manipulates the items generated via n-for data bind.')
        }
    })
    
    // Remove elements
    // <!> Removing before adding, clears up the children HTMLCollection of unwanted positions
    //     Now all additions can be done with one single index rule
    let removedElems: Element[] = []

    changes.removed.forEach( rem => {
        let i: number = oldItems.indexOf(rem)

        // Cache proper index and then remove
        removedElems.push(child.children[i])
    })

    debug('Removed old element', {removedElems})
    removedElems.forEach( remEl => remEl.remove() )

    // Add new elements
    // <!> OPTIMISE Add all new items in one step (benchmark the difference)
    changes.added.forEach( add => {
        let listItemEl: HTMLElement,
            i: number

        // Create, Cache, Insert
        listItemEl = utils.getElementFromCachedTemplate(dataBind)
        ;(listItemEl as any)._nano_forItemData = add
        ;(listItemEl as any).forItemData = add // TODO Add custom inputs
        i = newItems.indexOf(add)
        child.insertBefore(listItemEl, child.children[i])

    })
}

export function addCssClassesToElem(dataBind: DataBind): void {
    let { child } = dataBind
    
    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '
    
    let classesObj: { [key: string]: boolean } = utils.evalInContext.call(child, dataBind)
    debug('Add css classes to element', { classesObj, dataBind })

    let classes: string[] = Object.keys(classesObj)
    classes.forEach(cssClass => {
        if (typeof classesObj[cssClass] !== 'boolean') 
            console.warn(`Cannot match class, value is not boolean. ${utils.printDataBindInfo(dataBind)}`)
        classesObj[cssClass] === true ? child.classList.add(cssClass) : child.classList.remove(cssClass)
    })
}

/** Execute a method bound to the data source */
export function callChildContextMethod(dataBind: DataBind): void {
    let { child } = dataBind

    // Only execute code
    // dataBind.modifier = 'this.' // DEPRECATED - User should have control over the context used to invoke the bound method
    dataBind.modifier = ''

    utils.evalInContext.call( child, dataBind )
    debug('Call child context method', { dataBind })
}