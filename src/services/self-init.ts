import { Listeners } from '../interfaces/nano-data-binding'
import { nanoBind } from './selectors';
import { isAttrDataBind, getParentWebCmpContext } from '../services/utils'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:AutoInit') : () => {}
debug('Instantiate AutoInit')

/**
 * ====== SELF INIT ======
 * Automatically init nano data bind syntax.
 * By default, the first web component encountered in the ancestors hierarchy is selected as the parent context.
 * `_nano_no-auto-init` flag can be used to disable the autobind behavior for automatic testing purposes.
 * <!> Data binds are initialised by a mutation observer.
 *     As a side effect this means that synchronous code will not see the change made in template imediatly due to the 'end-of-microtask' timing model
 *     IN case you really need to start a data bind imediatly then initialise it manually using `nanoBind()`
 */

/**
 * Automatically bind elements with nano data binds.
 * <!> Automatically remove event listeners and cancel subscriprions-
 *     child.disconectedCallback is not available so we need to use mutation observer
 *     Also mixin classes don't have access to super.disconnectedCallback().
 * <!> TODO This part of the scirpt could be probably improved a lot performance-wise
 */
export function setupAutoBindUndind(): void {
    debug('Setup auto bind, unbind')

    var mutObs = new MutationObserver(mutations => {
        // debug('Document body mutated', mutations) // Verbose

        mutations.forEach(mutation => {

            // Detect new nodes with data bind attributes
            if (mutation.addedNodes) {
                let nodes = Array.from(mutation.addedNodes)
                nodes.forEach((node: any) => { // <!> any by intent
                    // debug('Added node', node.tagName, node.classList) // Ultra verbose
                    if (node.tagName) {
                        let allNodes = [], collection = node.getElementsByTagName("*")
                        allNodes.push(node) // Just in case
                        for (let n of collection) allNodes.push(n)
                        
                        // debug('All nodes', allNodes) // Verbose
                        allNodes.forEach((n: any) => initDataBinds(n) )
                    } 
                })
            }
    
            // Detect removed nodes with custom event listeners
            if (mutation.removedNodes) {
                let nodes = Array.from(mutation.removedNodes)
                nodes.forEach((node: any) => { // <!> any by intent
                    // debug('Added node', node.tagName, node.classList) // Ultra verbose
                    if (node.tagName) {
                        let allNodes = [], collection = node.getElementsByTagName("*")
                        allNodes.push(node) // Just in case
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
export function initDataBinds(child: HTMLElement): void {
    
    let attributes: Attr[] = Array.from(child.attributes)
    attributes.forEach(attr => {
        if (isAttrDataBind(attr)) {
            let parent = getParentWebCmpContext(child)
            // debug('Parent web component', {parent, child}) // Ultra verbose
            debug('Parent web component', {parent, child}) // Ultra verbose
            if (parent) {
                
                // Block autobind via attribute
                if (parent.hasAttribute('nano-no-data-bind')) return

                debug('Init data binds', {parent, child})
                nanoBind(parent, child)
            }
            else console.warn('Cannot find parent for data bind', child)
        }
    })
}

/** Removes listeners that were setup by the data binds */
export function removeEventListeners(node: HTMLElement): void {
    let listeners: Listeners = (<any>node)._nano_listeners
    
    // Ignore non data bind elements
    if (!listeners) return
    let tagName: string = node.tagName.toLowerCase()
    debug(`Remove event listeners from "<${tagName}>"`, listeners)

    // Remove all listeners
    for (let eventName in listeners) {
        let eventHandler = listeners[eventName]
        document.removeEventListener(eventName, eventHandler)
        // debug(`Removed custom event listener "${eventName}" from "<${tagName}>"`) // Verbose
    }
}

/** Removes observables that were setup by the data binds */
export function removeSubscriptions(node: HTMLElement): void {
    let subscriptions: any = (<any>node)._nano_subscriptions
    
    // Ignore non data bind elements
    if (!subscriptions) return
    let tagName: string = node.tagName.toLowerCase()
    debug(`Remove subscriptions from "<${tagName}>"`, subscriptions)

    // Remove all listeners
    for (let id in subscriptions) {
        let subscription = subscriptions[id]
        subscription.unsubscribe()
        // debug(`Removed subscription "${id}" from "<${tagName}>"`) // Verbose
    }
}