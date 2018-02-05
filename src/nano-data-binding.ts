import { nanoBind, nanoBindAll } from './services/manual-selectors'
import { setupAutoBindUnbind } from './services/self-init'

/**
 * <!> Nomenclature
 *     Origin - The source type of the value: context property, event or observable
 *     Source - The name of the property, event or observable
 *     Rule - Is the expected behavior that happens when a databind is created
 *     Code - In order to execute that behavior a certain code syntax is expected as input in the data bind
 * REFACTOR Move self init in this file
 */

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:NanoDataBinding') : () => {}
debug('Instantiate NanoDataBinding')
       
// Warn if `__lookupGetter__` is deprecated.
// Object.getOwnPropertyDescriptor works only for `Object.definePropert()`. `set` and `get` methods`defined on classes are ignored.
// In case it gets deprecated we have a preety difficult problem to fix.
if (!(Object.prototype as any).__lookupGetter__) { 
    throw new Error('Cannot detect all getter/setter methods. Object.prototype.__lookupGetter__ is undefined')
}

// <!> Self init
// A mutation observer watches for added and removed nodes and binds/unbinds them
setupAutoBindUnbind()

// Expose bind methods globally
// DEPRECATE (also the definition interface)
if ((window as any).nanoBind) console.warn('Some other lib is using the same globals as nano-data-bind')
if ((window as any).nanoBindAll) console.warn('Some other lib is using the same globals as nano-data-bind')
;(window as any).nanoBind = nanoBind
;(window as any).nanoBindAll = nanoBindAll
