
// Interfaces
import { DataBind, StringOrHTMLElement, Listener, Listeners, Changes } from './interfaces/nano.data.bind'

// Debug
let debug = require('debug')('ndb:NanoDataBind')
debug('Instantiate NanoDataBind')

/**
 * ====== Nano Data Bindings ======
 * <!> This is not a framework! These are some simple global utils that add basic data binding to web components.
 *     The objective of this entire script is to keep the codebase as close to vanila JS as possible while avoiding some boilerplate. 
 * <!> Interpolation in multiline string templates is static, no actual data binds are created.
 *     In order to update a static template a lot of boilerplate code is needed.
 *     Using a few basic data binding tags can shrink a significant amount of code.
 * <!> These data binds could be done automatically for every component, however this is not really needed, and it could be harmful.
 * <!> All these utils will be used in all files, having them as globals spares a lot of imports.
 *     Each of these methods has a global typescript definition matched.
 * <!> Please be a good citisen and don't start dumping everything in the global context.
 * <!> Before extending this file with any functionality please reconsider if it is really needed.
 *     The main goal of this file is to be easy to read and understand in 30 minutes for most developers, all in under 600 lines of code.
 *     Anything more will result in a new framework that is as complex and mysterious as previous frameworks.
 *     Any change that those not conform to these constraints will be rejected.
 * 
 * <!> WARNING 
 *     Caching references of n-if elements will prevent them from being released and destroyed.
 *     The script does not intend to provide additional API that can safely get references without interfering with n-if. 
 *     The developers need to be aware of this limitation in order to keep this script lightweight.
 *     Querying at runtime for the required n-if element is enough to prevent this obstruction of the element removal.
 * 
 * <!> WARNING 
 *     Functions are part of the `__proto__` lookup object.
 *     They will be ignored by Object.assign in `nanoBind()` and in `nanoBindAll()`.
 *     Object.assign only copies an object instance's own properties.
 *     Altough it might seem this is a bug for the moment we use it as a feature in order to copy only the desired methods from a class.
 *     However these methods are part of the instance, that means they take extra space in memory.
 *     Further testing is necessary to understand what is the otpimal solution in this case.
 *     Considering that these data bindings should be used only in web components, the memory use is not that great.
 *     This solution is not truly private but what we need is to prevnet property collision on data binding so non-enumerable is enough.
 *     Less thechnical knowledge is needed to understand this solution than wekmaps os symbols. It also expresses more clarity of intent.
 *     When assigning from a node to another no other methods and properties are assigned besides the instance onse. 
 *     All details about the node are preserved.
 *     console.log(Object.assign({}, parent)).
 *     One extra way to control this behavior is to copy a method from the prototype and in the instance.
 *     Pushing methods from the prototzpe can be done also by explcitly adding them to the `parent` context param.
 * 
 * <!> WARNING
 *     The data binding behavior depends on getters and setters in oreder to react to value changes.
 *     Copying setters and getters via Object.assign is not possible.
 *     Instead we need to defined a porperty with getters and setters in the constructor.
 *     `Object.defineProperty(this, "aaa_mockObjectProperty", { get() { ... }, set(v) { ... } })`.
 *     Then, a data bind value can be passed down bellow trough all the levels of nesting.
 *     In case you want to prevent a property to bind to the children you can use `enumerable: false` in the property definition.
 *     Beware when using a `get, set` pair together with a private property to cache the value. 
 *     ES6 classes don't have private, public modifiers so everything is copied. That means, a private property leaks in the children.
 * 
 * <!> WARNING
 *     Not having true privates in javascript ES6 classes is a terrible drawback
 *     It is not possible trough some simple notatioan to gain truly private variables and methods
 *     Either we declare them in constructor which has a performance penality of not using inheritance (each intsance gets a copy)
 *     Either we use scoped WeakMaps. This solution works to achieve true private while keeping performance intact.
 *     However the syntax is a bit elaborated, which definitely does not satisfy a lot of people (beginners in particular, very easy to forget about these details).
 *     Using defineProperty with `enumerable: false` flag will prevent it from being copied. But again, it will be part of the instance.
 *     Considering that only properties (not methods) will need this treatment the memory consumtion is minimal and unavvoidable after all. 
 *     Unique instances of vars for each class instance are required by default. Otherwise we ould have a singleton.
 *     There is another way of doing a bit of "magic" and ignoring all properties that use underscore notation.
 *     This of course is not free of problems. Mainly the problem of breaking the language rules for some custom solution.
 *     Declaring variables outside of the class is going to leak in global ocntext in normal js or it is going to be stuck to the singletone
 *     of the imported file. Neither is good.
 * 
 * <!> WARNING 
 *     Not everytime you might want to bind to the `this` context a of the parent. A smaller selection of methods and values can be created.
 *     However, this in itself can become a source of confusion if other context are used isntead of the parent.
 *     THis is a powerful technique but can backfire hard if not used with discipline and awareness.
 *     Unless you don't fully understand what are you doing just bind to the `this` content of the parent.
 * 
 * <!> WARNING
 *     All data binds are unidirectional
 *     This script is build around the idea of a state store, thus we want to have no back and forth comunication between components
 *     For this reason no data bind for listening to events was provided
 *  
 * <!> WARNING
 *     Chaining properties in multiple levels from the same web component is possible
 *     However this practice is strongly discouraged.
 *     Developers already have a strong expectation taht a component will receive inputs just from the parent
 *     Receiving inputs (data binds) from other levels than the parent can be hard to read, confusing, and hard to maintan.
 * 
 * REFACTOR Instead of creating 10K event listeners use one event listener that is executing all the registered operations.
 *     Maybe a default property for events would be useful. For complex pages rendering twice is not a good idea.
 *     Apparently, in the debug log in the tests it looks like some event listeners are not cleaned. Must review carefully.
 *     The oreder of events seems strange.
 *     Connet co observables and auto unsubscribe
 *
 * REFACOTR Hunt for memory leaks, Most likely there are a lot of them right now
 * 
 * TODO nanoBindAll(parent, children)
 *
 */

// Data binding attributes names
const RULE = {
    Data: 'n-data',
    If: 'n-if',
    For: 'n-for',
    Class: 'n-class',
    Call: 'n-call',
}

// Data bind origins (method of reading the soruce value)
const CONTEXT_PROP = 'ContextProperty'
const CUSTOM_EVENT = 'CustomEvent'

// Dot notation - Binds to context property. Matches only first occurence
const ContextProperty = /(^[^.]*\.)/gm
const PropEvalString = /(\.[\s\S]*)/gm

// Colon notation - Binds to custom event. Matches only first occurence
const CustomEvent = /(^[^:]*\:)/gm
const EventEvalString = /(\:[\s\S]*)/gm

// Expose bind methods globally
// No need to import nanoBind in all the files
;(window as any).nanoBind = nanoBind
;(window as any).nanoBindAll = nanoBindAll

// Parse tempalte provided by n-for data bind
let parser = new DOMParser()

// <!> Automatically remove listeners
remListenersFromRemNodes()

// ====== BIND ======

/** 
 * Creates references in the child context to all the methods in the parent context, including the inherited ones from abstract classes 
 * Only `bind()` accepts also DOM ellements
 */
export function nanoBind(parent: HTMLElement, ...selectors: StringOrHTMLElement[]): HTMLElement[] {
    debug('Nano bind', { parent, selectors })
    let children: HTMLElement[],
        child: HTMLElement,
        selAreStrings: boolean,
        selAreElements: boolean

    // Validation
    selAreStrings = selectors.reduce((val, sel) => val && typeof sel === `string`, true)
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

    // <!> Carefully read the doc comments for this methods
    bindContextToChildren(parent, children)
    parseDataBindAttributes(parent, children)

    return children

}

/** 
 * Same as `bind()` but using `querySelectorAll()`.
 * `bindAll()` does not accept HTMLElement selectors. Use `bind()` instead.
 */
export function nanoBindAll(parent: HTMLElement, ...selectors: string[]): HTMLElement[] {
    debug('Nano bind', { parent, selectors })
    let children: HTMLElement[] = [],
        childrenCache: HTMLElement[],
        selAreStrings: boolean
        
    // Validation
    selAreStrings = selectors.reduce((val, sel) => val && typeof sel === `string`, true)
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

    // <!> Carefully read the doc comments for this methods
    bindContextToChildren(parent, children)
    parseDataBindAttributes(parent, children)

    return children
}

/** 
 * Adds the methods from on context to another context using object assign 
 * TODO Copy only instance methods instaed of everything.
 */
function bindContextToChildren(parent: HTMLElement, children: HTMLElement[]) {
    debug('Bind context to children', [parent, children])

    children.forEach(child => {

        // Bind parent context 
        // Instance properties only, nothing from __proto__
        Object.assign(child, parent)
        
        // Cache the parent/ancestor context
        ;(child as any).ancestor = parent

    })
}

// ====== DATA BINDING ======

/**
 * <!> The event handler will be evaluated in the context of the child element
 * <!> All event listeners are automatically cleaned up when the component is destroyed
 */
function parseDataBindAttributes(parent: HTMLElement, children: HTMLElement[]): void {
    debug('Parse data bind attributes', [parent, children])

    children.forEach(child => {
        let dataBind: DataBind = <DataBind>{ parent, child },
            attributes: Attr[] = Array.from(child.attributes),
            customListeners: Listeners = {},
            isDataBind: boolean,
            propertyNameMatch: RegExpMatchArray,
            eventNameMatch: RegExpMatchArray,
            propertyName: string,
            eventName: string,
            dotIndex: number,
            colonIndex: number,
            dotIsFirst: boolean = true,
            colonIsFirst: boolean = true,
            placeholderIndex: number, // Used to identify the position of the targeted IF element and then find the placeholder comment
            placeholder: Node, // A placeholder comment will be present if the data bind was already initialised
            isComment: boolean // Double check that the placeholder is the right node

        attributes.forEach(attr => {
            isDataBind = isAttrDataBind(attr)

            // Get the type and value
            if (isDataBind) {
                propertyNameMatch = attr.nodeValue.match(ContextProperty)
                eventNameMatch = attr.nodeValue.match(CustomEvent)
                debug('Dot Regex', propertyNameMatch, 'Colon regex', eventNameMatch)

                // Some scenarios can match both regex expressions (ex: n-class)
                // We need to make sure we pick the first match
                if (propertyNameMatch && eventNameMatch) {
                    dotIndex = attr.nodeValue.indexOf('.')
                    colonIndex = attr.nodeValue.indexOf(':')
                    if (dotIndex > colonIndex) dotIsFirst = false
                    else if (colonIndex > dotIndex) colonIsFirst = false
                    debug('Dot and Colon race condition fix', {dotIndex, colonIndex, dotIsFirst, colonIsFirst})
                }

                // Source - Context property
                if (propertyNameMatch && dotIsFirst) {
                    propertyName = propertyNameMatch[0].replace('.', '').trim()
                    dataBind.code = attr.nodeValue.match(PropEvalString)[0].replace('.', '')
                    dataBind.origin = CONTEXT_PROP

                // Source - Custom event
                } else if (eventNameMatch && colonIsFirst) {
                    eventName = eventNameMatch[0].replace(':', '').trim()
                    dataBind.code = attr.nodeValue.match(EventEvalString)[0].replace(':', '')
                    dataBind.origin = CUSTOM_EVENT
                }

                // Source, Rule
                dataBind.source = dotIsFirst ? propertyName : eventName
                dataBind.rule = attr.nodeName

                debug(`Parsed data bind`, { dataBind })
            }
            
            // n-if uses a placehodler comment that will control the visibility of the target/child element
            if (dataBind.rule === RULE.If) {
                placeholderIndex = Array.prototype.indexOf.call(child.parentElement.childNodes, child) - 1
                placeholder = child.parentElement.childNodes[placeholderIndex]
                isComment = placeholder.nodeType === 8
                debug(`Recovered IF data bind placeholder`, { isComment, placeholderIndex, placeholder, dataBind })
                    
                // Create placeholder only once
                if (isComment !== true) setupIfDataBindPlaceholder(dataBind)
            } else if (dataBind.rule === RULE.For) {
                
                // Cache original html for reuse when the list is updated
                dataBind.template = child.innerHTML
                child.innerHTML = ''
            }

            if (isDataBind && dataBind.origin === CONTEXT_PROP) {

                // prefix: any = 

                // // Prepare the event handlers
                // let property: string = type.split(BIND.ContextProperty)[1],
                //     value: any = (context as any)[property]
                // // var handler = {
                // //     get: function(target, name) {
                // //         return name in target ?
                // //             target[name] :
                // //             37;
                // //     }
                // // };

                // // var p = new Proxy({}, handler);

                // console.log('TEST context property data bind', property, value)

            } else if (isDataBind && dataBind.origin === CUSTOM_EVENT) {

                // Prepare the event handlers
                let eventHandler: Listener = () => evaluateDataBind(dataBind)

                // Cache the handlers so they ca be removed later
                customListeners[dataBind.source] = eventHandler

                // Add the custom event listener
                document.addEventListener(dataBind.source, eventHandler)
                debug('Added custom event listener', dataBind.source)
            }
        })

        // <!> Provide an easy method for removing all custom listeners when the child element is destroyed
        ;(child as any)._customListeners = customListeners

    })

}

// ====== EVENT LISTENERS ======

/** Detect an attribute that triggers an event listener (colon notation) */
function isAttrDataBind(attribute: Attr): boolean {
    let attributeNames: string[] = [RULE.Call, RULE.Class, RULE.Data, RULE.For, RULE.If],
        isListener: boolean

    // Detect data bind syntax
    isListener = attributeNames.indexOf(attribute.nodeName) !== -1

    debug('Is attribute event listener', attribute.nodeName, isListener)
    return isListener
}

/** 
 * Evaluate the method provided in the attribute 
 * <!> Establishing in which context the evaluated method is executed is very easy, just switch between normal functions and lamba functions
 *     In time if VScode gets better language support for template strings, even auto complete should work.
 */
function evaluateDataBind(dataBind: DataBind): void {
    dataBind.event = event as CustomEvent
    debug(`Evaluate data bind`, { dataBind })
    let { rule } = dataBind

    // Evaluate the string (attribute value) depending on the rule (attribute name)
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

// ====== DATA BINDING BEHAVIORS ======

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
    debug(`Write data bind values to element`, { inputs, dataBind })
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
        debug(`Setup if data bind placeholder`, { dataBind })
    
        // Hidden element clone
        ;(placeholder as any)._hiddenElement = child.cloneNode()
        ;(placeholder as any)._hiddenElement.innerHTML = child.innerHTML
    
        // Insert placeholder
        child.parentNode.insertBefore(placeholder, child)

        // Remove the orginal element that hosted the n-if data bind attribute
        // <!> In case you need to show the element before the first event is dispatched
        //     dispatch the same custom event with with the detail value set on true
        child.remove()

        // Release the old one from memory
        delete dataBind.child

        // Data bind the placeholder TODO Reuse the bind logic
        if (origin === CUSTOM_EVENT) {

            // Add event
            let handler: Listener = () => toggleIfDataBindElement(dataBind)
            document.addEventListener(source, handler)
            ;(placeholder as any)._customListeners = { source: handler }

        } else if (origin === CONTEXT_PROP) {
            console.warn('If data bind not implemented for context properties')
        }

}

/** Toggle the  an element using a commnet node as a placeholder */
function toggleIfDataBindElement(dataBind: DataBind): void {
    let { child, placeholder, parent } = dataBind,
        isVisible: boolean,
        ifElement: HTMLElement

    debug(`Toggle IF data bind element`, { dataBind })

    // Capture returned value from executed code
    dataBind.modifier = 'this._evalOutput = '

    // Retrieve visibility value from evaluated code
    isVisible = evalInContext.call(placeholder, dataBind)
    debug(`IF element is visible`, isVisible)

    // Fail safe for repeated values (same value multiple times in a row)
    if (isVisible === false && child === undefined) return
    if (isVisible === true && child !== undefined) return

    // Clone the placeholder clone. Prevents any cross communication between instances
    ifElement = (placeholder as any)._hiddenElement.cloneNode()
    ifElement.innerHTML = (placeholder as any)._hiddenElement.innerHTML

    if (isVisible === true) {
        debug(`Insert child`, {ifElement})

        // Inset the hidden element in document
        placeholder.parentNode.insertBefore(ifElement, placeholder.nextSibling)

        // Reuse data bind object (It is kept alive by the placeholder comment)
        dataBind.child = ifElement

        // Bind again, other data binds might actuall need to run again
        nanoBind(parent, ifElement)

    } else if (isVisible === false) {
        debug(`Remove child`)

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
 * TODO A `trackBy()` method that takes care of the performance in case the references are lost
 * TODO What if data has duplicate identifiers?
 * TODO What if arrays have gaps? (This is allowed in js)
 * TODO For the moment a standard socket property is used. But in order to make this work with 
 *      any components we need a way to specify what info goes to what inputs 
 *      while also specifying which part of the event is the soruce
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
        console.warn(`Cannot render list. Only arrays are accepted. ${logDataBindDetails(dataBind)}`)
        return
    }

    changes.added = newItems.filter(itm => !oldItems.includes(itm))
    changes.removed = oldItems.filter(itm => !newItems.includes(itm))

    debug(`Update items in for list`, { newItems, oldItems, changes, dataBind })

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
    debug(`Add css classes to element`, { classesObj, dataBind })

    let classes: string[] = Object.keys(classesObj)
    classes.forEach(cssClass => {
        if (typeof classesObj[cssClass] !== 'boolean') 
            console.warn(`Cannot match class, value is not boolean. ${logDataBindDetails(dataBind)}`)
        classesObj[cssClass] === true ? child.classList.add(cssClass) : child.classList.remove(cssClass)
    })
}

/** Execute a method bound to the data source */
function callChildContextMethod(dataBind: DataBind): void {
    let { child } = dataBind

    // Only execute code
    dataBind.modifier = 'this.'

    evalInContext.call(child, dataBind)
    debug(`Call child context method`, { dataBind })
}

/** Evaluates a string in a given context */
function evalInContext(dataBind: DataBind): any {
    let { modifier, code } = dataBind
    debug(`Evaluate in context`, { dataBind })

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

// ====== REMOVE EVENT LISTNERS ======

/**
 * Observe when child nodes are removed
 * <!> child.disconectedCallback is not available so we need to use mutation observer
 * <!> Also mixin classes don't have access to super.disconnectedCallback(). 
 *     This approach also solves their problem
 */
function remListenersFromRemNodes(): void {
    debug(`Remove listeners from removed nodes`)

    var mutObs = new MutationObserver(e => {
        debug(`Document body mutated`, e)

        // Detect removed nodes with custom event listeners
        if (e[0].removedNodes) {
            [...(e[0] as any).removedNodes].forEach(node => {
                (node as any).tagName && removeCustomListeners.call(node)
            })
        }
    })

    mutObs.observe(document.body, {
        childList: true,
        subtree: true
    })
}

/** Removes listeners that were setup by the bind() method */
function removeCustomListeners(): void {
    let listeners: Listeners = this._customListeners,
        tagName: string = this.tagName.toLowerCase()
    debug(`Remove all custom event listeners from "<${tagName}>"`, listeners)

    // Remove all listeners
    for (let eventName in listeners) {
        let eventHandler = listeners[eventName]
        document.removeEventListener(eventName, eventHandler)
        debug(`Removed custom event listener "${eventName}" from "<${tagName}>"`)
    }
}

// ====== UTILS ======

/** Small helper method used to render extra details about the data bind in error messages */
function logDataBindDetails(dataBind: DataBind): string {
    let { parent, child, origin, source, rule, code } = dataBind,
        parentTagName = `<${parent.tagName.toLowerCase()}>`,
        childTagName = `<${child.tagName.toLowerCase()}>`

    return `Parent "${parentTagName}", Child "${childTagName}", Origin "${origin}", Source "${source}, Rule "${rule}, Code "${code}"`
}