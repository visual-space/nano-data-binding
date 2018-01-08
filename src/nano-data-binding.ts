import { nanoBind, nanoBindAll } from './services/selectors'
import { setupAutoBindUnbind } from './services/self-init'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:NanoDataBinding') : () => {}
debug('Instantiate NanoDataBinding')
       
// TODO Search for better alternative. 
// Object.getOwnPropertyDescriptor works only for `Object.definePropert()`. `set` and `get` methods`defined on classes are ignored.
if (!(Object.prototype as any).__lookupGetter__) { 
    throw new Error('Cannot reliably detect all getter/setter methods. Object.prototype.__lookupGetter__ is undefined')
}

/**
 * ====== Nano Data Bindings ======
 * <!> Nomenclature
 *     Origin - The source type of the value: context property, event or observable
 *     Source - The name of the property, event or observable
 *     Rule - Is the expected behavior that happens when a databind is created
 *     Code - In order to execute that behavior a certain code syntax is expected as input in the data bind
 */

// <!> Self init
// A mutation observer watches for added and removed nodes and binds/unbinds them
setupAutoBindUnbind()

// Expose bind methods globally
if ((window as any).nanoBind) console.warn('Some other lib is using the same globals as nano-data-bind')
if ((window as any).nanoBindAll) console.warn('Some other lib is using the same globals as nano-data-bind')
;(window as any).nanoBind = nanoBind
;(window as any).nanoBindAll = nanoBindAll
