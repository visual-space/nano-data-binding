// Services
import { publishManualSelectors } from './services/manual-selectors'
import { setupTemplatePreprocessing } from './services/template-preprocessing'
import { setupAutoBindUnbind } from './services/auto-bind-unbind'
import { checkLookupGetterIsDefined } from './services/utils'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:NanoDataBinding') : () => {}
debug('Instantiate NanoDataBinding')

// <!> Self-init
init()

/** Once this library is improted, data binding notation is processed automatically. */
function init () {

    // Failsafe
    checkLookupGetterIsDefined()
    
    // Expose bind methods globally (testing purposes)
    publishManualSelectors()
    
    // Remove dynamic templates ("for", "if")
    setupTemplatePreprocessing()
    
    // A mutation observer watches for added and removed nodes and binds/unbinds them
    setupAutoBindUnbind()

}
