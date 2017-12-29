// Interfaces
import { DataBind, StringOrHTMLElement, Listener, Listeners, Subscriptions, Changes } from './interfaces/nano-data-binding'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:NanoDataBind') : () => {}
debug('Instantiate NanoDataBind')

/**
 * ====== Nano Data Bindings ======
 * <!> Nomenclature
 *     Origin - The source type of the value: context property, event or observable
 *     Source - The name of the property, event or observable
 *     Rule - Is the expected behavior that happens when a databind is created
 *     Code - In order to execute that behavior a certain code syntax is expected as input in the data bind
 */

/** Where is the source value caming from */
const ORIGIN = {
    Property: 'p-',
    Event: 'e-',
    Observable: 'o-'
}

/** Each rule triggers a specific behavior */
const RULE = {
    Data: 'data',
    If: 'if',
    For: 'for',
    Class: 'class',
    Call: 'call',
}

// Expose bind methods globally
// No need to import nanoBind in all the files
if ((window as any).nanoBind) console.warn('Some other lib is using the same globals as nano-data-bind')
if ((window as any).nanoBindAll) console.warn('Some other lib is using the same globals as nano-data-bind')
;(window as any).nanoBind = nanoBind
;(window as any).nanoBindAll = nanoBindAll

// Parse tempalte provided by n-for data bind
let parser = new DOMParser()

// <!> Automatically remove listeners
remListenersFromRemNodes()

// ====== BIND PARENT INSTANCE MEMBERS TO CHILD ======

/** 
 * Creates references in the child context to all the methods in the parent context, including the inherited ones from abstract classes 
 * Accepts both css selectors and DOM elements
 */
export function nanoBind(parent: HTMLElement, ...selectors: StringOrHTMLElement[]): HTMLElement[] {
    debug('Nano bind', { parent, selectors })
    let children: HTMLElement[],
        child: HTMLElement,
        selAreStrings: boolean,
        selAreElements: boolean

    // Validation
    selAreStrings = selectors.reduce((val, sel) => val && typeof sel === 'string', true)
    selAreElements = selectors.reduce((val, sel) => val && sel instanceof HTMLElement, true)
    debug('All selectors are strings', selAreStrings, 'All selectors are elements', selAreElements)
    
    if (arguments.length < 1)
        throw Error('nanoBind() failed. First param missing. Provide a HTMLElement.')

    if (parent instanceof HTMLElement === false)
        throw Error('nanoBind() failed. First parameter is not a HTMLElement.')
    
    if (selectors.length < 1)
        throw Error('nanoBind() failed. Second parameter missing. Provide a css selector string or a HTMLElement.')

    if (selectors[0] instanceof HTMLElement === false && typeof selectors[0] !== 'string')
        throw Error('nanoBind() failed. Second parameter is not a css selector string or a HTMLElement.')

    if (selAreStrings === false && selAreElements === false)
        throw Error('nanoBind() failed. Not all selectors have the same type.')

    if (selAreStrings) {

        // Get the dom elements
        children = selectors.map(selector => {
            child = parent.querySelector(selector as string)

            // Failsafe
            if (child === null) console.warn(`Selector "${selector}" is invalid. No child element matched in "<${parent.tagName.toLowerCase()}>"`)

            return child
        })

        // Filter out invalid selectors
        children = children.filter(child => child !== null)

    } else if (selAreElements) {
        // Just reuse the params under chilren name
        children = [...selectors as HTMLElement[]]
    }

    initDataBinds(parent, children)
    return children
}

/** 
 * Creates references in the child context to all the methods in the parent context, including the inherited ones from abstract classes 
 * Accepts onöy css selectors and calls `querySelectorAll()`
 * `nanoBindAll()` does not accept HTMLElement selectors. Use `nanoBind()` instead.
 */
export function nanoBindAll(parent: HTMLElement, ...selectors: string[]): HTMLElement[] {
    debug('Nano bind', { parent, selectors })
    let children: HTMLElement[] = [],
        childrenCache: HTMLElement[],
        selAreStrings: boolean
        
    // Validation
    selAreStrings = selectors.reduce((val, sel) => val && typeof sel === 'string', true)
    debug('All selectors are strings', selAreStrings)
    
    if (arguments.length < 1)
        throw Error('nanoBind() failed. First param missing. Provide a HTMLElement.')

    if (parent instanceof HTMLElement === false)
        throw Error('nanoBind() failed. First parameter is not a HTMLElement.')
    
    if (selectors.length < 1)
        throw Error('nanoBind() failed. Second parameter missing. Provide a css selector string or a HTMLElement.')

    if (typeof selectors[0] !== 'string')
        throw Error('nanoBind() failed. Second parameter is not a css selector string.')

    if (selAreStrings === false)
        throw Error('nanoBind() failed. Not all selectors have the same type.')

    // Get the dom elements
    selectors.forEach(selector => {
        childrenCache = Array.from(parent.querySelectorAll(selector))
        childrenCache.forEach(child => children.push(child))

        // Failsafe
        if (childrenCache.length === 0) console.warn(`Selector "${selector}" is invalid. No element matched in "<${parent.tagName.toLowerCase()}>"`)
    })

    // Filter out invalid selectors
    children = children.filter(child => child !== null)

    initDataBinds(parent, children)
    return children
}

// ====== EVALUATE NANO BIND ATTIRBUTES / RULES. SELECT BEHAVIOR ======

/**
 * <!> The event handler will be evaluated in the context of the child element
 * <!> All event listeners are automatically cleaned up when the component is destroyed
 */
function initDataBinds(parent: HTMLElement, children: HTMLElement[]): void { 
    
    // Bind
    bindContextToChildren(parent, children)

    children.forEach(child => {
        let attributes: Attr[] = Array.from(child.attributes),
            dataBind: DataBind = <DataBind>{ parent, child },
            listeners: Listeners = {},
            subscriptions: Subscriptions = {}

        attributes.forEach(attr => {

            // Ignore other attributes
            if (!isAttrDataBind(attr)) {return}
            
            // Parse
            Object.assign(dataBind, getDataBindFromAttribute(attr))

            // Cache
            cacheValuesInDom(dataBind)

            // Watch
            let refs = watchForValueChanges(dataBind)
            if (dataBind.origin === ORIGIN.Event) Object.assign(listeners, refs)
            if (dataBind.origin === ORIGIN.Observable) Object.assign(subscriptions, refs)

        })

        // <!> Provide an easy method for removing all custom listeners when the child element is destroyed
        ;(child as any)._nano_listeners = listeners
        ;(child as any)._nano_subscriptions = subscriptions

    })

}

/** 
 * Adds the methods from on context to another context using object assign 
 * TODO Copy only instance methods instaed of everything.
 */
function bindContextToChildren(parent: HTMLElement, children: HTMLElement[]) {
    debug('Bind context to children', [parent, children])

    children.forEach(child => {

        // Bind parent context 
        // <!> Only methods defined on the instance, nothing is copied from __proto__
        Object.assign(child, parent)
        
        // Cache the parent/ancestor context
        ;(child as any).ancestor = parent

    })
}

function getDataBindFromAttribute (attribute: Attr): DataBind {
    let dataBind: DataBind = <DataBind>{
        origin: getDataBindOrigin(attribute),
        rule: getDataBindRule(attribute),
        source: getDataBindSource(attribute),
        code: getDataBindCode(attribute)
    }
    debug('Get data bind from attribute', {dataBind})
    return dataBind
}

function cacheValuesInDom (dataBind: DataBind) {
    debug('Cache values in DOM', dataBind)
    let { child } = dataBind,
        placeholderIndex: number, // Used to identify the position of the targeted IF element and then find the placeholder comment
        placeholder: Node, // A placeholder comment will be present if the data bind was already initialised
        isComment: boolean // Double check that the placeholder is the right node
    
    if (dataBind.rule === RULE.If) {

        // n-if uses a placehodler comment that will control the visibility of the target/child element
        placeholderIndex = Array.prototype.indexOf.call(child.parentElement.childNodes, child) - 1
        placeholder = child.parentElement.childNodes[placeholderIndex]
        isComment = placeholder.nodeType === 8
        debug('Recovered IF data bind placeholder', { isComment, placeholderIndex, placeholder, dataBind })
            
        // Create placeholder only once
        if (isComment !== true) setupIfDataBindPlaceholder(dataBind)

    } else if (dataBind.rule === RULE.For) {
        
        // Cache original html for reuse when the list is updated
        dataBind.template = child.innerHTML
        child.innerHTML = ''

    }
}

function watchForValueChanges (dataBind: DataBind): Listeners | Subscriptions {
    debug('Watch for value changes', dataBind)
    let listeners: Listeners = {},
        subscriptions: Subscriptions = {}

    if (dataBind.origin === ORIGIN.Property) {

        // To implement

    } else if (dataBind.origin === ORIGIN.Event) {

        // Prepare the event handlers
        let eventHandler: Listener = () => evaluateDataBind(dataBind)

        // Cache the handlers so they ca be removed later
        listeners[dataBind.source] = eventHandler

        // Add the custom event listener
        document.addEventListener(dataBind.source, eventHandler)
        debug('Added custom event listener', dataBind.source)
        return listeners

    } else if (dataBind.origin === ORIGIN.Observable) {

        // To implement
        return subscriptions

    }
}

/** 
 * Evaluate the method provided in the attribute 
 * <!> Establishing in which context the evaluated method is executed is very easy, just switch between normal functions and lamba functions
 *     In time if VScode gets better language support for template strings, even auto complete should work.
 */
function evaluateDataBind(dataBind: DataBind): void {
    dataBind.event = event as CustomEvent
    debug('Evaluate data bind', { dataBind })
    let { rule } = dataBind

    // Evaluate the attribute value depending on the rule (attribute name)
    switch (dataBind.rule) {

        case RULE.Data:
            bindDataToElem(dataBind)
            break

        // <!> RULE.If rule is not executed from the child element
        //     It is executed from the placeholder (the comment node)
        //     In this way we don't have to worry about all the edge cases that happen when the child is added or removed
        //     The placeholder is alwasy there and it doesn't need any special treatment
        case RULE.If:
            break

        case RULE.For:
            updateItemsInForList(dataBind)
            break

        case RULE.Class:
            addCssClassesToElem(dataBind)
            break

        case RULE.Class:
            addCssClassesToElem(dataBind)
            break

        case RULE.Call:
            callChildContextMethod(dataBind)
            break

        default:
            console.warn(`Data bind rule "${rule}" is invalid. Accepted rules are: n-data, n-if, n-for, n-class, n-call`)
    }
}

// ====== RULES / BEHAVIORS ======

/**
 * Binds the values defined in the descriptor object to the child element
 * These values can be mathced to getter setter properties and this is how the data is progragated trough all nesting levels
 * <!> Ideally the hierarchy of the components would be shallow and wide instead of tall and narrow.
 *     Nonetheless this data binding will work as many levels are needed
 */
function bindDataToElem(dataBind: DataBind): void {
    let { child } = dataBind

    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '
    
    let inputs: { [key: string]: any } = evalInContext.call(child, dataBind)

    let inputId: string
    for (inputId in inputs) {
        (child as any)[inputId] = inputs[inputId]
    }
    debug('Write data bind values to element', { inputs, dataBind })
}

/** 
 * Adds a comment placehodler for the if rule.
 * Initialised only once. The rest of the updates are controlled by the comment placeholder.
 * Instead of creating the event lsitener in the child element the if rule maintains it in the placeholder ocmmnet.
 * This simplifies a lot of the work needed to show/hide the element. However it breaks the pattern of the other rules.
 */
function setupIfDataBindPlaceholder(dataBind: DataBind): void {
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
function toggleIfDataBindElement(dataBind: DataBind): void {
    let { child, placeholder, parent } = dataBind,
        isVisible: boolean,
        ifElement: HTMLElement

    debug('Toggle IF data bind element', { dataBind })

    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '

    // Retrieve visibility value from evaluated code
    isVisible = evalInContext.call(placeholder, dataBind)
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
function updateItemsInForList (dataBind: DataBind) {
    let { child } = dataBind,
        changes: Changes = { added: [], removed: [] }
    
    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '

    let newItems: any[] = evalInContext.call(child, dataBind),
        elems: HTMLElement[] = Array.from(child.children),
        oldItems: any[] = elems.map((el: any) => el._nForDataBInd)
    if (newItems.constructor !== Array) {
        console.warn(`Cannot render list. Only arrays are accepted. ${mapLogDataBindInfo(dataBind)}`)
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

function addCssClassesToElem(dataBind: DataBind): void {
    let { child } = dataBind
    
    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '
    
    let classesObj: { [key: string]: boolean } = evalInContext.call(child, dataBind)
    debug('Add css classes to element', { classesObj, dataBind })

    let classes: string[] = Object.keys(classesObj)
    classes.forEach(cssClass => {
        if (typeof classesObj[cssClass] !== 'boolean') 
            console.warn(`Cannot match class, value is not boolean. ${mapLogDataBindInfo(dataBind)}`)
        classesObj[cssClass] === true ? child.classList.add(cssClass) : child.classList.remove(cssClass)
    })
}

/** Execute a method bound to the data source */
function callChildContextMethod(dataBind: DataBind): void {
    let { child } = dataBind

    // Only execute code
    // dataBind.modifier = 'this.' // DEPRECATED - User should have control over the context used to invoke the bound method
    dataBind.modifier = ''

    evalInContext.call(child, dataBind)
    debug('Call child context method', { dataBind })
}

// ====== AUTO REMOVE EVENT LISTENERS, SUBSCRIPTIONS ======

/**
 * Observe when child nodes are removed
 * <!> child.disconectedCallback is not available so we need to use mutation observer
 * <!> Also mixin classes don't have access to super.disconnectedCallback(). 
 *     This approach also solves their problem
 */
function remListenersFromRemNodes(): void {
    debug('Remove listeners from removed nodes')

    var mutObs = new MutationObserver(e => {
        debug('Document body mutated', e)

        // Detect removed nodes with custom event listeners
        if (e[0].removedNodes) {
            [...(e[0] as any).removedNodes].forEach(node => {
                (node as any).tagName && removeEventListeners.call(node)
                (node as any).tagName && removeSubscriptions.call(node)
            })
        }
    })

    mutObs.observe(document.body, {
        childList: true,
        subtree: true
    })
}

/** Removes listeners that were setup by the data binds */
function removeEventListeners(): void {
    let listeners: Listeners = this._nano_listeners,
        tagName: string = this.tagName.toLowerCase()
    debug(`Remove event listeners from "<${tagName}>"`, listeners)

    // Remove all listeners
    for (let eventName in listeners) {
        let eventHandler = listeners[eventName]
        document.removeEventListener(eventName, eventHandler)
        // debug(`Removed custom event listener "${eventName}" from "<${tagName}>"`) // Verbose
    }
}

/** Removes observables that were setup by the data binds */
function removeSubscriptions(): void {
    let subscriptions: any = this._nano_subscriptions,
        tagName: string = this.tagName.toLowerCase()
    debug(`Remove subscriptions from "<${tagName}>"`, subscriptions)

    // Remove all listeners
    for (let id in subscriptions) {
        let subscription = subscriptions[id]
        subscription.unsubscribe()
        // debug(`Removed subscription "${id}" from "<${tagName}>"`) // Verbose
    }
}

// ====== UTILS ======

/** Detect attributes with nano data bind syntax */
function isAttrDataBind(attribute: Attr): boolean {
    const MATCH_DATA_BIND = /(^[peo]-(data|if|for|class|call)$)/g
    let isListener: boolean = attribute.nodeName.search(MATCH_DATA_BIND) === 0
    // debug('Is attribute data bind', attribute.nodeName, isListener) // Verbose
    return isListener
}

function getDataBindOrigin(attribute: Attr): string {
    let origin: string = attribute.nodeName.substring(0,2)
    // debug('Get data bind rule', attribute.nodeName, origin) // Verbose
    return origin   
}

function getDataBindRule(attribute: Attr): string {
    let rule: string = attribute.nodeName.substring(2,7)
    // debug('Get data bind rule', attribute.nodeName, rule) // Verbose
    return rule   
}

function getDataBindSource(attribute: Attr): string {
    const MATCH_SOURCE = /(^[^.]*,)/gm
    let source: string = attribute.nodeValue.match(MATCH_SOURCE)[0].replace(',','')
    // debug('Get data bind source', attribute.nodeName, source) // Verbose
    return source
}

function getDataBindCode(attribute: Attr): string {
    const MATCH_CODE = /(,[\s\S]*)/gm
    let rule: string = attribute.nodeValue.match(MATCH_CODE)[0].replace(',','')
    // debug('Get data bind code', attribute.nodeName, rule) // Verbose
    return rule
}

/** 
 * Evaluates a string in a given context. 
 * Useful to trigger behaviors associated with data bind rules.
 */
function evalInContext(dataBind: DataBind): any {
    let { modifier, code } = dataBind
    debug('Evaluate in context', { dataBind })

    eval(modifier + code)

    // Some expression might assign a value to `this._evalOutput`
    // These prefixes are added in `evaluateAttrString` depending on the data bind type
    debug('Eval output', this._evalOutput)

    // Returns undefined when the children context is not available (code is evaluated in global context)
    // This is a silent fail because it is a common one that it is actually expected.
    // The n-if rule if triggered again with a false value will not be able to evalute 
    // the code in a child context because it does not have a child, only the placeholder.
    return this._evalOutput
}

/** Render extra details about the data bind in debug log messages */
function mapLogDataBindInfo(dataBind: DataBind): string {
    let { parent, child, origin, source, rule, code } = dataBind,
        parentTagName = `<${parent.tagName.toLowerCase()}>`,
        childTagName = `<${child.tagName.toLowerCase()}>`

    return `Parent "${parentTagName}", Child "${childTagName}", Origin "${origin}", Source "${source}, Rule "${rule}, Code "${code}"`
}