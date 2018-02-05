import { DataBind, Changes } from '../interfaces/nano-data-binding'
import * as utils from './utils'

// Services
import { templates } from './template-cache'

/**
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

 // Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:Parser') : () => {}
debug('Instantiate Parser')

/**
 * Binds the values defined in the descriptor object to the child element
 * These values can be mathced to getter setter properties and this is how the data is progragated trough all nesting levels
 * <!> Ideally the hierarchy of the components would be shallow and wide instead of tall and narrow.
 *     Nonetheless this data binding will work as many levels are needed
 */
export function bindDataToElem(dataBind: DataBind): void {
    let { parent, child, source, code } = dataBind

    // DEPRECATED Previous attempt, will be removed eventually
    // Capture returned value from executed code
    // dataBind.modifier = 'this._evalOutput = '
    
    // let inputs: { [key: string]: any } = utils.evalInContext.call(child, dataBind)

    // let inputId: string
    // for (inputId in inputs) {
    //     ;(child as any)[inputId] = (<any>parent)[inputId]
    // }

    code = code.trim()
    
    ;(child as any)[code] = (<any>parent)[source]

    debug('Write data bind values to element', { dataBind }) // inputs
}

/** 
 * Adds a comment placehodler for the if rule.
 * Initialised only once. The rest of the updates are controlled by the comment placeholder.
 * Instead of creating the event listener in the child element the if rule maintains it in the placeholder ocmmnet.
 * This simplifies a lot of the work needed to show/hide the element. However it breaks the pattern of the other rules.
 */
export function setupIfDataBindPlaceholder(dataBind: DataBind): void {
    let { child, attribute } = dataBind,
        placeholder: Comment

        // Setup placeholder comment 
        placeholder = document.createComment('')
        dataBind.placeholder = placeholder
        debug('Setup IF rule placeholder', { dataBind })

        // Remove data binds
        // Rendering the if data bind won`t trigger new data bind initialisations
        child.removeAttribute(attribute.nodeName)
    
        // Hidden element clone
        ;(placeholder as any)._nano_originalElement = child.cloneNode()
        ;(placeholder as any)._nano_originalElement.innerHTML = child.innerHTML
    
        // Insert placeholder
        child.parentNode.insertBefore(placeholder, child)

        // TODO this will be done in pre processing
        // Remove the orginal element that hosted the n-if data bind attribute
        // <!> In case you need to show the element before the first event is dispatched
        //     dispatch the same custom event with with the detail value set on true
        child.remove()

        // Release the original element from memory
        delete dataBind.child
}

/** Retrieve and cache "for" rule template from the preprocessing step. */
export function getForDataBindTemplate(dataBind: DataBind): void {
    debug('Get "for" rule template', { dataBind })
    let { child } = dataBind
    let tplId = +Array.from(child.attributes).find( attr => attr.nodeName === `tpl` ).nodeValue
    dataBind.template = templates[tplId]
    child.removeAttribute(`tpl`) // Clean-up data bind tags
}

/** Toggle the  an element using a comment node as a placeholder */
export function toggleIfDataBindElement(dataBind: DataBind): void {
    let { child, placeholder } = dataBind, // , parent
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

        // Bind again, other data binds might need to execute again
        // nanoBind(parent, ifElement) // DEPRECATED - it is already happening from the global mutation observable

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
 * TODO Upgrade to allow multiple tags rendered by the same loop. In this case we need to scan for data binds and attach the data there.
 */
export function updateItemsInForList (dataBind: DataBind) {
    let { child } = dataBind,
        changes: Changes = { added: [], removed: [] }
    
    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '

    let newItems: any[] = utils.evalInContext.call(child, dataBind),
        elems: HTMLElement[] = Array.from(child.children),
        oldItems: any[] = elems.map((el: any) => el._nano_forItemData)
    if (newItems.constructor !== Array) {
        console.warn(`Cannot render list. Only arrays are accepted. ${utils.printDataBindInfo(dataBind)}`)
        return
    }

    changes.added = newItems.filter(itm => !oldItems.includes(itm))
    changes.removed = oldItems.filter(itm => !newItems.includes(itm))

    debug('Update items in for list', { newItems, oldItems, changes, dataBind })

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
    // <!> TODO Can be optimised to add all modifications at once using one parse
    changes.added.forEach( add => {
        let i: number = newItems.indexOf(add)

        // Parked until replaced with something better
        // elem = parser.parseFromString(dataBind.template, "text/html").children[0] // DEPRECATED, does not fulfill the expected role of generating dom elements

        // <!> Currently this code assumes onla one element at a time is introduced
        // REVIEW Is this a memory leak?
        let tmpEl = document.createElement(`div`)
        tmpEl.innerHTML = dataBind.template
        
        let elem = tmpEl.children[0]

        // Cache data, Insert, Bind
        ;(elem as any)._nano_forItemData = add
        ;(elem as any).forItemData = add // TODO Add custom inputs

        child.insertBefore(elem, child.children[i])

        // Fals when there are no chidlren
        // When inserting HTML into a page by using insertAdjacentHTML be careful not to use user input that hasn't been escaped.
        // <!> Currently this code assumes onla one element at a time is introduced
        // child.children[i].insertAdjacentHTML('beforebegin', dataBind.template)

        // let elem = child.children[i]

        // ;(elem as any)._nano_forItemData = add
        // ;(elem as any).forItemData = add // TODO Add custom inputs

        // debug('Added new element', {elem, add})
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