import { DataBind, Listener, Changes } from '../interfaces/nano-data-binding'
import * as utils from './utils'
import { ORIGIN } from '../constants/nano-data-binding.const'
import { nanoBind } from './selectors'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:Rules') : () => {}
debug('Instantiate NanoDataBind')

/**
 * ====== RULES / BEHAVIORS ======
 * Each data bind rule has an expected behavior. 
 * Most of these behaviors are inspired by the Angualr framework.
 * These data binds have been tailored for taking advantage of the web components API.
 * 
 * <!> Behaviors
 *     `n-call` - Pass data to the target component
 *     `n-if` - Hide the target component
 *     `n-for` - Render all elements from an array using the same template
 *     `n-class` - Conditionally add CSS classes to target element
 *     `n-call` - Execute a method in the context of the target element. 
 *                ALl the previous rules could be implemented using this one.     
 */

// Parse tempalte provided by n-for data bind
let parser = new DOMParser()

/**
 * Binds the values defined in the descriptor object to the child element
 * These values can be mathced to getter setter properties and this is how the data is progragated trough all nesting levels
 * <!> Ideally the hierarchy of the components would be shallow and wide instead of tall and narrow.
 *     Nonetheless this data binding will work as many levels are needed
 */
export function bindDataToElem(dataBind: DataBind): void {
    let { child } = dataBind

    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '
    
    let inputs: { [key: string]: any } = utils.evalInContext.call(child, dataBind)

    let inputId: string
    for (inputId in inputs) {
        (child as any)[inputId] = inputs[inputId]
    }
    debug('Write data bind values to element', { inputs, dataBind })
}

/** 
 * Adds a comment placehodler for the if rule.
 * Initialised only once. The rest of the updates are controlled by the comment placeholder.
 * Instead of creating the event listener in the child element the if rule maintains it in the placeholder ocmmnet.
 * This simplifies a lot of the work needed to show/hide the element. However it breaks the pattern of the other rules.
 */
export function setupIfDataBindPlaceholder(dataBind: DataBind): void {
    let { child, origin, source } = dataBind,
        placeholder: Comment

        // Setup placeholder comment 
        placeholder = document.createComment('')
        dataBind.placeholder = placeholder
        debug('Setup if data bind placeholder', { dataBind })
    
        // Hidden element clone
        ;(placeholder as any)._nano_originalElement = child.cloneNode()
        ;(placeholder as any)._nano_originalElement.innerHTML = child.innerHTML
    
        // Insert placeholder
        child.parentNode.insertBefore(placeholder, child)

        // Remove the orginal element that hosted the n-if data bind attribute
        // <!> In case you need to show the element before the first event is dispatched
        //     dispatch the same custom event with with the detail value set on true
        child.remove()

        // Release the original element from memory
        delete dataBind.child

        // Data bind the placeholder
        if (origin === ORIGIN.Event) {

            // Add event
            let handler: Listener = () => toggleIfDataBindElement(dataBind)
            document.addEventListener(source, handler)
            ;(placeholder as any)._nano_listeners = { source: handler }

        } else if (origin === ORIGIN.Property) {

            // Not implemented

        } else if (origin === ORIGIN.Observable) {

            // Not implemented

        }

}

/** Toggle the  an element using a comment node as a placeholder */
export function toggleIfDataBindElement(dataBind: DataBind): void {
    let { child, placeholder, parent } = dataBind,
        isVisible: boolean,
        ifElement: HTMLElement

    debug('Toggle IF data bind element', { dataBind })

    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '

    // Retrieve visibility value from evaluated code
    isVisible = utils.evalInContext.call(placeholder, dataBind)
    debug('IF element is visible', isVisible)

    // Fail safe for repeated values (same value multiple times in a row)
    if (isVisible === false && child === undefined) return
    if (isVisible === true && child !== undefined) return

    // Clone the placeholder clone. Prevents any cross communication between instances
    ifElement = (placeholder as any)._nano_originalElement.cloneNode()
    ifElement.innerHTML = (placeholder as any)._nano_originalElement.innerHTML

    if (isVisible === true) {
        debug('Insert child', {ifElement})

        // Inset the hidden element in document
        placeholder.parentNode.insertBefore(ifElement, placeholder.nextSibling)

        // Reuse data bind object (It is kept alive by the placeholder comment)
        dataBind.child = ifElement

        // Bind again, other data binds might actuall need to run again
        nanoBind(parent, ifElement)

    } else if (isVisible === false) {
        debug('Remove child')

        // Remove the IF element
        dataBind.child.remove()
        
        // Release the old one from memory
        delete dataBind.child
    }
}

/**
 * Iterates all elements of an array
 * Update, Add, Remove operations are optimised to target only the changed elements
 * Renders text, html and web components
 * Binds data from the array to the web components
 * <!> The for loop is by design unabled to bind data to templates
 *     In order to encourage a simpler cleaner architecture, items are expected to be defined as webcomponents
 *     The performance cost is minimal to non-existent, and having two web components defined in the same file is permited
 * <!> Compares the old list with the new list, extracts the changes and then it syncs the dom with the new list
 */
export function updateItemsInForList (dataBind: DataBind) {
    let { child } = dataBind,
        changes: Changes = { added: [], removed: [] }
    
    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '

    let newItems: any[] = utils.evalInContext.call(child, dataBind),
        elems: HTMLElement[] = Array.from(child.children),
        oldItems: any[] = elems.map((el: any) => el._nForDataBInd)
    if (newItems.constructor !== Array) {
        console.warn(`Cannot render list. Only arrays are accepted. ${utils.mapLogDataBindInfo(dataBind)}`)
        return
    }

    changes.added = newItems.filter(itm => !oldItems.includes(itm))
    changes.removed = oldItems.filter(itm => !newItems.includes(itm))

    debug('Update items in for list', { newItems, oldItems, changes, dataBind })

    // Validation
    elems.forEach(el => {
        if (!(el as any)._nForDataBInd) {
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
    // <!> TODO Can be optimised to add all modifications at once using one parse
    changes.added.forEach( add => {
        let i: number = newItems.indexOf(add),
            elem = parser.parseFromString(dataBind.template, "text/xml").children[0]

        // Cache data, Insert, Bind
        ;(elem as any)._nForDataBInd = add
        ;(elem as any).forItemData = add // TODO Add custom inputs
        child.insertBefore(elem, child.children[i])

        debug('Added new element', {elem, add})
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
            console.warn(`Cannot match class, value is not boolean. ${utils.mapLogDataBindInfo(dataBind)}`)
        classesObj[cssClass] === true ? child.classList.add(cssClass) : child.classList.remove(cssClass)
    })
}

/** Execute a method bound to the data source */
export function callChildContextMethod(dataBind: DataBind): void {
    let { child } = dataBind

    // Only execute code
    // dataBind.modifier = 'this.' // DEPRECATED - User should have control over the context used to invoke the bound method
    dataBind.modifier = ''

    utils.evalInContext.call(child, dataBind)
    debug('Call child context method', { dataBind })
}