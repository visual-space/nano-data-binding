import { DataBind, Listener, Listeners, Subscriptions } from '../interfaces/nano-data-binding'
import { ORIGIN, RULE } from '../constants/nano-data-binding.const'
import * as utils from './utils'
import * as parser from './rule-parser'

// Services
import { templates } from './template-cache'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:Bind') : () => {}
debug('Instantiate Bind')

/**
 * <!> Data binding requires several steps: 
 *     Building the `dataBind` descriptor object that is used to transfer information between the various stages of the process.
 *     Caching dynamyc templates- `If` and `For` rules reuse the cached templates.
 *     Setting up change detection for the source values (parent context properties, events, observables).
 *     Triggering the data bind behavior when the source value changes.
 *     All data bound methods are evaluated in the context of the child element.
 *     If a method is not defined in the child context than it is looked-up in the parent context and if found the reference is copied.
 *     All event listeners and subscriptions are returned for automatical clean-up when the component is destroyed.
 * <!> The parent elemenet contains the data sources, the child declares the data binds.
 * REFACTOR: Current design has a big flaw. Multiple data binds cannot be stored for the same element. If, For and Data cannot work together.
 */
export function initDataBinds(parent: HTMLElement, children: HTMLElement[]): void {

    children.forEach(child => {
        let attributes: Attr[] = Array.from(child.attributes),
            dataBind: DataBind = <DataBind>{ parent, child },
            cacheHostEl: Node,
            listeners: Listeners = {},
            subscriptions: Subscriptions = {}

        attributes.forEach(attr => {

            // Ignore other attributes
            if (!utils.isAttrDataBind(attr)) {return}
            
            // Parse and cache
            Object.assign(dataBind, getDataBindDescriptor(attr))
            debug('Data bind', {dataBind})

            // Cache attribute for easy delete after init
            dataBind.attribute = attr

            // Setup placeholder comment for "if" rule
            if (dataBind.rule === RULE.If) parser.setupIfDataBindPlaceholder(dataBind)

            // Cache "for" rule template for reuse when the list is updated.
            // The dynamic template was initialy intercepted in preprocessing and assigned as an id in the tpl attribute.
            if (dataBind.rule === RULE.For) {
                let tplId = +Array.from(child.attributes).find( attr => attr.nodeName === `tpl` ).nodeValue
                dataBind.template = templates[tplId]
                child.removeAttribute(`tpl`) // Clean-up data bind tags
            }
            
            cacheHostEl = dataBind.rule === RULE.If ? dataBind.placeholder : dataBind.child

            // Cache data bind for easy inspections
            ;(cacheHostEl as any)._nano_dataBind = dataBind

            // Watch source values
            let refs = watchForValueChanges(dataBind)

            // Store listeners and subscriptions until the host element is destroyed.
            if (dataBind.origin === ORIGIN.Event) Object.assign(listeners, refs)
            if (dataBind.origin === ORIGIN.Observable) Object.assign(subscriptions, refs)

        })

        // <!> Provide an easy method for removing all custom listeners when the child element is destroyed
        // "If" and "for" rules avoid trigering unwanted unsubscribe actions by caching the listeners and subs in the placeholder comment.
        ;(cacheHostEl as any)._nano_listeners = listeners
        ;(cacheHostEl as any)._nano_subscriptions = subscriptions

    })

}

/** Complete description of the data bind */
function getDataBindDescriptor (attribute: Attr): DataBind {
    let dataBind: DataBind = <DataBind>{
        origin: utils.getDataBindOrigin(attribute),
        rule: utils.getDataBindRule(attribute),
        source: utils.getDataBindSource(attribute),
        code: utils.getDataBindCode(attribute)
    }
    // debug('Get data bind descriptor', {dataBind}) // Verbose
    return dataBind
}

/**
 * Creates getter setters for parent context properties
 * Any exsiting getter setters are wrapped
 * Events are listende and observables are subscribed
 */
function watchForValueChanges (dataBind: DataBind): Listeners | Subscriptions {
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
function evaluateDataBind(dataBind: DataBind): void {
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

        case RULE.Call:
            parser.callChildContextMethod(dataBind)
            break

        default:
            console.warn(`Data bind rule "${rule}" is invalid. Accepted rules are: n-data, n-if, n-for, n-class, n-call`)
    }
}