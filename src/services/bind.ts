import { DataBind, Listener, Listeners, Subscriptions } from '../interfaces/nano-data-binding'
import { ORIGIN, RULE } from '../constants/nano-data-binding.const'
import * as utils from './utils'
import * as rules from './rules'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:Bind') : () => {}
debug('Instantiate Bind')

/** 
 * ====== BIND ======
 * After selecting the target elements we need to bind the parent and the children contexts.
 * This is the core of the entire system
 * 
 * <!> Several operations are performed: 
 *     // Copying references to methods so that they can be invoked by inline event handlers such ast `onclick`.  // DEPRECATED
 *     Building the `dataBind` descriptor object that is used to transfer information between the various stages of the process.
 *     Setting up DOM caches for the rules that require them (IF and FOR).
 *     Whatching for changes in the source values (context properties, events, observables).
 *     Reacting to any changed values by executing a certain behavior for each rule.
 * 
 * <!> The original approach was to copy references from parent context to the child context.
 *     This approach had a long list a drawbacks.
 *     - Possiblity of collisions between members of parent and child contexts.
 *     - Members added to the parent context at runtime are ignored.
 *     - References to primitives form the parent context were copied and then remaind stale`.
 *     - Setters and getters could not by copied, it was necessary to use `Object.defineProperty()`.
 */

/**
 * <!> The event handler will be evaluated in the context of the child element
 * <!> All event listeners are automatically cleaned up when the component is destroyed
 */
export function initDataBinds(parent: HTMLElement, children: HTMLElement[]): void { 
    
    // Bind
    // bindContextToChildren(parent, children) // DEPRECATED

    children.forEach(child => {
        let attributes: Attr[] = Array.from(child.attributes),
            dataBind: DataBind = <DataBind>{ parent, child },
            listeners: Listeners = {},
            subscriptions: Subscriptions = {}

        attributes.forEach(attr => {

            // Ignore other attributes
            if (!utils.isAttrDataBind(attr)) {return}
            
            // Parse
            Object.assign(dataBind, getDataBindFromAttribute(attr))
            debug('Data bind', {dataBind})

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

// DEPRECATED
// /** 
//  * Adds the methods from on context to another context using object assign 
//  * TODO Copy only instance methods instead of everything.
//  */
// export function bindContextToChildren(parent: HTMLElement, children: HTMLElement[]) {
//     debug('Bind context to children', [parent, children])

//     children.forEach(child => {

//         // Bind parent context 
//         // <!> Only methods defined on the instance, nothing is copied from __proto__
//         Object.assign(child, parent)
        
//         // Cache the parent/ancestor context
//         ;(child as any).ancestor = parent

//     })
// }

export function getDataBindFromAttribute (attribute: Attr): DataBind {
    let dataBind: DataBind = <DataBind>{
        origin: utils.getDataBindOrigin(attribute),
        rule: utils.getDataBindRule(attribute),
        source: utils.getDataBindSource(attribute),
        code: utils.getDataBindCode(attribute)
    }
    // debug('Get data bind from attribute', {dataBind}) // Verbose
    return dataBind
}

export function cacheValuesInDom (dataBind: DataBind) {
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
        if (isComment !== true) rules.setupIfDataBindPlaceholder(dataBind)

    } else if (dataBind.rule === RULE.For) {
        
        // Cache original html for reuse when the list is updated
        dataBind.template = child.innerHTML
        child.innerHTML = ''

    }
}

export function watchForValueChanges (dataBind: DataBind): Listeners | Subscriptions {
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
export function evaluateDataBind(dataBind: DataBind): void {
    dataBind.event = event as CustomEvent
    debug('Evaluate data bind', { dataBind })
    let { rule } = dataBind

    // Evaluate the attribute value depending on the rule (attribute name)
    switch (dataBind.rule) {

        case RULE.Data:
            rules.bindDataToElem(dataBind)
            break

        // <!> RULE.If rule is not executed from the child element
        //     It is executed from the placeholder (the comment node)
        //     In this way we don't have to worry about all the edge cases that happen when the child is added or removed
        //     The placeholder is alwasy there and it doesn't need any special treatment
        case RULE.If:
            break

        case RULE.For:
            rules.updateItemsInForList(dataBind)
            break

        case RULE.Class:
            rules.addCssClassesToElem(dataBind)
            break

        case RULE.Class:
            rules.addCssClassesToElem(dataBind)
            break

        case RULE.Call:
            rules.callChildContextMethod(dataBind)
            break

        default:
            console.warn(`Data bind rule "${rule}" is invalid. Accepted rules are: n-data, n-if, n-for, n-class, n-call`)
    }
}