import { nanoBind, nanoBindAll } from './services/selectors'
import { remListenersFromRemNodes } from './services/destruct'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:NanoDataBinding') : () => {}
debug('Instantiate NanoDataBinding')

/**
 * ====== Nano Data Bindings ======
 * <!> Nomenclature
 *     Origin - The source type of the value: context property, event or observable
 *     Source - The name of the property, event or observable
 *     Rule - Is the expected behavior that happens when a databind is created
 *     Code - In order to execute that behavior a certain code syntax is expected as input in the data bind
 */

// Expose bind methods globally
if ((window as any).nanoBind) console.warn('Some other lib is using the same globals as nano-data-bind')
if ((window as any).nanoBindAll) console.warn('Some other lib is using the same globals as nano-data-bind')
;(window as any).nanoBind = nanoBind
;(window as any).nanoBindAll = nanoBindAll

// <!> Automatically remove listeners
remListenersFromRemNodes()
