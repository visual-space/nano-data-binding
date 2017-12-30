import { Listeners } from '../interfaces/nano-data-binding'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:Destruct') : () => {}
debug('Instantiate Destruct')

/**
 * ====== AUTO INIT ======
 * Automatically init nano data bind syntax.
 * By default, the first web component encountered in the ancestors hierarchy is selected a the parent context.
 * `_nano_no-auto-init` flag can be used to disable the autobind behavior for automatic testing purposes.
 * Automatically remove event listeners, subscriptions.
 */

/**
 * Observe when child nodes are removed
 * <!> child.disconectedCallback is not available so we need to use mutation observer
 * <!> Also mixin classes don't have access to super.disconnectedCallback(). 
 *     This approach also solves their problem
 */
export function remListenersFromRemNodes(): void {
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
export function removeEventListeners(): void {
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
export function removeSubscriptions(): void {
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