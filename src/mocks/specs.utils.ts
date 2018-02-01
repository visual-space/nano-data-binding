// Give acccess to debug in testing environment^s console
// Sometimes tests can be fixed by studying the debug statements
;(window as any).debug = require('debug')
declare var debug: any
if (debug.enabled !== true) console.log(`
During testing all logs can be enabled if needed. Just type in console and refresh the page: \n debug.enable(\'ndb:*\') \n debug.disable() \n\n
`)

/** 
 * Each tests needs an unique event name, otherwise the tests will have interferance from one to the other 
 * Events fire in previouse tests, show up as events in the later tests
 */
let _id: number = 0

/** 
 * Each test needs to start with a fresh template
 * <!> Unique ids are automatically added to events 
 */
export function setupTemplate(template: string) {

    // Container
    var container = document.createElement('div') 
    container.classList.add('container')
    
    // <!> Suffix all event names with a unique id
    // The counter increments once per test, exactly what we need
    template = template.replace(/(mockEvent)/g, `mockEvent${++_id}`)
    
    // Simple nested web component with basic content
    // debug('ORIGINAL template', template) // Verbose
    container.innerHTML = template
    // debug('INTERCEPTED template', container.innerHTML) // Verbose
        
    // Connect
    document.body.appendChild(container)
    debug.enabled === true && console.log('======Template ready======')
}

export function dispatchEvent(eventName: string, val: any) {
    debug.enabled === true && console.log('======Dispatch event======', eventName, val)
    let customEvent = new CustomEvent(eventName, { detail: val })
    document.dispatchEvent(customEvent)
}

/** <!> Each test receives it's own unique event. This is done via the `setupTemplate` method automatically.*/
export var id = () => _id
