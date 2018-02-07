// Interfaces
import { Listeners } from '../interfaces/nano-data-binding'

// Services
import { initElDataBinds } from './init-data-binds'
import { isAttrDataBind, getParentWebCmpContext } from './utils'

// Constants
import { DEBUG } from '../constants/nano-data-binding.const'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:AutoBindUnbind') : () => { }
debug('Instantiate AutoBindUnbind')

/**
 * Data binds are initialised automatically just by typing them in templates.
 * <!> A mutation observer continously scans all new dom elements for data binds and triggers theyr initialisation.
 *     The parent context (source values) is detected by searching for the first web component in the ancestors hierarchy.
 *     Synchronous code will not see the data bind executed imeditatly due to the 'end-of-microtask' timing model
 *     `_nano_no-auto-init` flag can be used to disable the autobind behavior for automatic testing purposes.
 * <!> Event listeners and subscriprions are automatically discarded when the dom element is destroyed.
 * REVIEW Is there any better approach than using the mutation observer?
 *     We do not want to inherit from a base class that can intercept all templates and track data binds in a separate data structure
 *     We want to create web components and magically have them achieve this behavior. 
 *     Maybe wrapping the wenb componets declare method can do the trick.
 *     Performance benchmarking must be done before swithing methods of initialisation.
 */
export function initAutoBindUnbind(): void {
    debug('Init auto bind unbind')

    var mutObs = new MutationObserver(mutations => {
        DEBUG.verbose && debug('Document body mutated', mutations)

        mutations.forEach(mutation => {

            // Detect new nodes with data bind attributes
            if (mutation.addedNodes) {
                let nodes = Array.from(mutation.addedNodes)
                nodes.forEach((node: any) => { // <!> any used intentionaly
                    // debug('Added node', node.tagName, node.classList) // Ultra verbose
                    if (node.tagName) {
                        let allNodes = [],
                            collection = node.getElementsByTagName("*")

                        // Check all nodes
                        allNodes.push(node)
                        for (let n of collection) allNodes.push(n)
                        DEBUG.verbose && debug('All nodes', allNodes)

                        allNodes.forEach((n: any) => initOnlyDataBinds(n))
                    }
                })
            }

            // Detect removed nodes with custom event listeners
            if (mutation.removedNodes) {
                let nodes = Array.from(mutation.removedNodes)
                nodes.forEach((node: any) => { // <!> any by intent
                    // debug('Added node', node.tagName, node.classList) // Ultra verbose
                    if (node.tagName) {
                        let allNodes = [],
                            collection = node.getElementsByTagName("*")

                        // Check all nodes
                        allNodes.push(node)
                        for (let n of collection) allNodes.push(n)
                        // debug('All nodes', allNodes) // Ultra verbose

                        allNodes.forEach((n: any) => {
                            removeEventListeners(n)
                            removeSubscriptions(n)
                        })
                    }
                })
            }
        })
    })

    mutObs.observe(document.body, {
        childList: true,
        subtree: true
    })
}

/** 
 * Scans for nano data bind syntax and initilises it 
 * The first node that is a web component in the hieratchy chain is used as the parent context
 */
function initOnlyDataBinds(child: HTMLElement): void {

    let attributes: Attr[] = Array.from(child.attributes)
    attributes.forEach(attr => {
        if (isAttrDataBind(attr)) {
            let parent = getParentWebCmpContext(child)
            // debug('Parent web component', {parent, child}) // Ultra verbose
            if (parent) {

                // Block autobind via attribute (for testing purposes)
                if (parent.hasAttribute('no-auto-bind')) return

                debug('Init data binds', { parent, child })
                initElDataBinds(parent, [child])
            }
            else console.warn('Cannot find parent for data bind', child)
        }
    })
}

/** Removes listeners that were setup by the data binds */
function removeEventListeners(node: HTMLElement): void {
    let listeners: Listeners = (<any>node)._nano_listeners

    // Ignore non data bind elements
    if (!listeners) return
    let tagName: string = node.tagName.toLowerCase()
    debug(`Remove event listeners from "<${tagName}>"`, listeners)

    // Remove all listeners
    for (let eventName in listeners) {
        let eventHandler = listeners[eventName]
        document.removeEventListener(eventName, eventHandler)
        DEBUG.verbose && debug(`Removed custom event listener "${eventName}" from "<${tagName}>"`)
    }
}

/** Removes observables that were setup by the data binds */
function removeSubscriptions(node: HTMLElement): void {
    let subscriptions: any = (<any>node)._nano_subscriptions

    // Ignore non data bind elements
    if (!subscriptions) return
    let tagName: string = node.tagName.toLowerCase()
    debug(`Remove subscriptions from "<${tagName}>"`, subscriptions)

    // Remove all listeners
    for (let id in subscriptions) {
        let subscription = subscriptions[id]
        subscription.unsubscribe()
        DEBUG.verbose && debug(`Removed subscription "${id}" from "<${tagName}>"`)
    }
}