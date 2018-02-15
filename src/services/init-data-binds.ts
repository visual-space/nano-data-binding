// Interfaces
import { DataBindElement, ElementData, DataBind, Listener, Listeners, Subscriptions } from '../interfaces/nano-data-binding'

// Constants
import { DEBUG, ORIGIN, RULE } from '../constants/nano-data-binding.const'

// Services
import * as utils from './utils'
import * as parser from './rule-parser'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:InitDataBinds') : () => { }
debug('Instantiate InitDataBinds')

/**
 * <!> Terminology
 *     Origin - The source type of the value: context property, event or observable.
 *     Source - The name of the source property/event/observable.
 *     Rule - Runtime behavior executed when a databind is created/updated.
 *     Code - Parameters for the data bind behavior are defubed using custom syntax. 
 * 
 * <!> Data binding requires several steps: 
 *     Building the `dataBind` descriptor object that is used to transfer information between the various stages of the process.
 *     Caching dynamyc templates- `If` and `For` rules reuse the cached templates.
 *     Setting up change detection for the source values (parent context properties, events, observables).
 *     Triggering the data bind behavior when the source value changes.
 *     All data bound methods are evaluated in the context of the child element.
 *     If a method is not defined in the child context than it is looked-up in the parent context and if found the reference is copied.
 *     All event listeners and subscriptions are returned for automatical clean-up when the component is destroyed.
 * 
 * "If" and "for" rules terminate listeners and subscritons when the placeholder commnet is removed
 * "Data", "claa", "call" rules terminate listeners and subscritons when the host element is removed
 * 
 * <!> The parent elemenet contains the data sources, the child declares the data binds.
 */
export function initElDataBinds(parent: HTMLElement, child: HTMLElement | Comment): void {
    debug('Init element data binds', { parent, child })
    let dataBinds: DataBind[] = [],
        listeners: Listeners = {},
        subscriptions: Subscriptions = {},
        elData: ElementData,
        refs

    dataBinds = getDataBinds(child)

    dataBinds.forEach(dataBind => {

        // Eval data bind when source value changes
        refs = detectSourceValueChanges(evaluateDataBind, dataBind)

        // Evaluate first time (init)
        evaluateDataBind(dataBind)

        // <!> Both events and observables can potenatially be used on the same element
        if (dataBind.origin === ORIGIN.Event) Object.assign(listeners, refs)
        if (dataBind.origin === ORIGIN.Observable) Object.assign(subscriptions, refs)

    })

    elData = { dataBinds, listeners, subscriptions }
    cacheDataOnEl(elData, child as DataBindElement)

}

export function getDataBinds(child: HTMLElement | Comment): DataBind[] {
    let dataBinds: DataBind[] = [],
        attributes: Attr[],
        dataBind: DataBind,
        template: string

    // Rules with condtional templates ("for", "if") are replaced with a placehoder commnet in preprocessing.
    // This comment is then used as the host of the data binds in order to secure total absence of the element when requested.
    if (child.nodeType === 8) {
            
        // Placeholder Comments - "For", "if"
        template = utils.getTemplateFromPlaceholder(child as Comment)
        attributes = utils.getDataBindAttributes(template)
        
        // Remove data binds
        // Rendering the if data bind won`t trigger new data bind initialisations
        // child.removeAttribute(attribute.nodeName) // RESTORE

    } else {
        
        // Host Elements - "data", "class", "call"
        attributes = Array.from(child.attributes)

    }

    // Parse only data bind attributes
    attributes = attributes.filter(attribute => utils.isAttrDataBind(attribute))

    attributes.forEach(attribute => {

        // Data bind descriptor object
        dataBind = getDataBindDescriptorByAttr(attribute)
        Object.assign(dataBind, { parent, child, attribute, template })
        debug('Data bind', { dataBind })
        dataBinds.push(dataBind)

    })

    return dataBinds
}

/** Complete description of the data bind */
export function getDataBindDescriptorByAttr(attribute: Attr): DataBind {
    let dataBind: DataBind = <DataBind>{
        origin: utils.getDataBindOrigin(attribute),
        rule: utils.getDataBindRule(attribute),
        source: utils.getDataBindSource(attribute),
        code: utils.getDataBindCode(attribute)
    }
    DEBUG.verbose && debug('Get data bind descriptor', { dataBind })
    return dataBind
}

/**
 * Creates getter setters for parent context properties
 * Any exsiting getter setters are wrapped
 * Events are listende and observables are subscribed
 * <!> When any of these values changes the callback is executed
 */
function detectSourceValueChanges(callback: (dataBind: DataBind) => void, dataBind: DataBind): Listeners | Subscriptions {
    debug('Detect source value changes', { dataBind })
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
            callback(dataBind)
        }

        // Wrappers
        set = (val: any) => {
            _set.call(parent, val)
            callback(dataBind)
        }
        get = () => { return _get.call(parent) }

        // Bind
        desc = { set, get }
        Object.defineProperty(parent, source, desc)

    } else if (origin === ORIGIN.Event) {

        // Prepare the event handlers
        let eventHandler: Listener = () => callback(dataBind)

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
 * Cache data bind for easy inspection 
 * <!> Listeners and observables will be terminated when the child element is removed from DOM.
 */
function cacheDataOnEl(data: ElementData, child: DataBindElement) {
    let { dataBinds, listeners, subscriptions } = data

    child._nano_dataBinds = dataBinds
    child._nano_listeners = listeners
    child._nano_subscriptions = subscriptions
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
            parser.toggleConditionalElem(dataBind)
            break

        case RULE.For:
            parser.updateForList(dataBind)
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