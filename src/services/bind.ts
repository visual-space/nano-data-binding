import { DataBind, Listener, Listeners, Subscriptions } from '../interfaces/nano-data-binding'
import { ORIGIN, RULE } from '../constants/nano-data-binding.const'
import * as utils from './utils'
import * as parser from './parser'

// Services
import { templates } from './cache'

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
 *     If a method is not defined in the child context than it is looked-up in the parent context and if found the reference is copied.
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

    children.forEach(child => {

        // Prevent double init of the same element
        if ((<any>child)._nano_dataBind) {
            if (parent.hasAttribute('no-auto-bind')) {
                debug('Data bind already initialised', {dataBind: this._nano_dataBind})
            } else {
                // console.warn('Data bind already initialised', {dataBind: this._nano_dataBind}) // REVIEW, seems to fire more than needed
            }
            return
        }

        let attributes: Attr[] = Array.from(child.attributes),
            dataBind: DataBind = <DataBind>{ parent, child },
            listeners: Listeners = {},
            subscriptions: Subscriptions = {},
            hostEl: Node, // child or in the case of the IF rule the placehodler comment
            // TODO, find a better way, this approach is not simple and easy. The other rules may execute first.
            hasPlaceholder: boolean // If placehodler is already defined, than skip the data bind process

        attributes.forEach(attr => {

            // Ignore other attributes
            if (!utils.isAttrDataBind(attr)) {return}
            
            // Parse
            Object.assign(dataBind, getDataBindFromAttribute(attr))
            debug('Data bind', {dataBind})

            // Cache
            hasPlaceholder = cacheInitialState(dataBind)
            if (hasPlaceholder === true) return // Prevent double init of IF rule
            hostEl = dataBind.rule === RULE.If ? dataBind.placeholder : dataBind.child
            // debug('Host element', {hostEl}) // Verbose
            ;(hostEl as any)._nano_dataBind = dataBind

            // Watch
            let refs = watchForValueChanges(dataBind)
            if (dataBind.origin === ORIGIN.Event) Object.assign(listeners, refs)
            if (dataBind.origin === ORIGIN.Observable) Object.assign(subscriptions, refs)

        })

        if (hasPlaceholder === true) return // Prevent double init of IF rule
        // <!> Provide an easy method for removing all custom listeners when the child element is destroyed
        ;(hostEl as any)._nano_listeners = listeners
        ;(hostEl as any)._nano_subscriptions = subscriptions

    })

}

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

/**
 * IF rule sets up a placeholder comment
 * FOR rule cached the initial template
 */
export function cacheInitialState (dataBind: DataBind): boolean {
    debug('Cache initial state', { dataBind })
    let { child } = dataBind,
        placeholderIndex: number, // Used to identify the position of the targeted IF element and then find the placeholder comment
        placeholder: Node, // A placeholder comment will be present if the data bind was already initialised
        isComment: boolean // Double check that the placeholder is the right node
    
    if (dataBind.rule === RULE.If) {

        // n-if uses a placehodler comment that will control the visibility of the target/child element
        placeholderIndex = Array.prototype.indexOf.call(child.parentElement.childNodes, child) - 1
        placeholder = child.parentElement.childNodes[placeholderIndex]
        isComment = placeholder.nodeType === 8
        debug('Recover IF data bind placeholder', { isComment, placeholderIndex, placeholder })
            
        // Create placeholder only once
        if (isComment !== true) parser.setupIfDataBindPlaceholder(dataBind)

    } else if (dataBind.rule === RULE.For) {
        
        // Cache original html for reuse when the list is updated
        let tplId = +Array.from(child.attributes).find( attr => attr.nodeName === `tpl` ).nodeValue
        // debug(`Cached template (retrieved after preprocessing)`, tplId, templates[tplId]) // Verbose
        dataBind.template = templates[tplId]
        // dataBind.template = child.innerHTML // DEPRECATE Retrieved from the cached templates (after preprocessing)
        // child.innerHTML = '' // DEPRECATE Already done in preprocessing

    }

    return isComment
}

// TODO Break in smaller parts
export function watchForValueChanges (dataBind: DataBind): Listeners | Subscriptions {
    debug('Watch for value changes', {dataBind})
    let { origin, parent, source } = dataBind,
        listeners: Listeners = {},
        subscriptions: Subscriptions = {}

    if (origin === ORIGIN.Property) {

        let value: any,
            proto: any,
            _desc: PropertyDescriptor,
            desc: PropertyDescriptor,
            _set: any, // Originals
            set: any, // Wrappers
            _get: any,
            get: any

        proto = Object.getPrototypeOf(parent)
        _desc = Object.getOwnPropertyDescriptor(parent, source)

        // Original or new set
        _set = proto.__lookupSetter__(source)
        if (!_set) {
            if (_desc) _set = _desc.set
            else _set = function (val: any) { value = val }
        }
        
        // Original or new get
        _get = proto.__lookupGetter__(source)
        if (!_get) {
            if (_desc) _get = _desc.get
            else _get = function () { return value }
        }

        // Cache original property value
        if ((<any>parent)[source] !== undefined) {
            value = (<any>parent)[source]
            
            // <!> Evaluate data bind with first value
            evaluateDataBind(dataBind)
        }

        // Wrappers
        set = (val: any) => {
            _set.call(parent, val)
            evaluateDataBind(dataBind)
        }
        get = () => { return _get.call(parent) }

        // Bind
        desc = { set , get }
        Object.defineProperty(parent, source, desc)

    } else if (origin === ORIGIN.Event) {

        // Prepare the event handlers
        let eventHandler: Listener = () => evaluateDataBind(dataBind)

        // Cache the handlers so they ca be removed later
        listeners[source] = eventHandler

        // Add the custom event listener
        document.addEventListener(source, eventHandler)
        debug('Added custom event listener', source)
        return listeners

    } else if (origin === ORIGIN.Observable) {

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
            parser.bindDataToElem(dataBind)
            break

        case RULE.If:
            parser.toggleIfDataBindElement(dataBind)
            break

        case RULE.For:
            parser.updateItemsInForList(dataBind)
            break

        case RULE.Class:
            parser.addCssClassesToElem(dataBind)
            break

        // case RULE.Class:
        //     parser.addCssClassesToElem(dataBind)
        //     break

        case RULE.Call:
            parser.callChildContextMethod(dataBind)
            break

        default:
            console.warn(`Data bind rule "${rule}" is invalid. Accepted rules are: n-data, n-if, n-for, n-class, n-call`)
    }
}