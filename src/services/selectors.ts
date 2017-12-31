import { StringOrHTMLElement } from '../interfaces/nano-data-binding'
import { initDataBinds } from './bind'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:Selectors') : () => {}
debug('Instantiate Selectors')

/**
 * ====== SELECTORS ======
 * Manual or automatic, all data binds start with selecting the DOM elements that exhibit data biond syntax
 */

/** 
 * Creates references in the child context to all the methods in the parent context, including the inherited ones from abstract classes 
 * Accepts both css selectors and DOM elements
 */
export function nanoBind(parent: HTMLElement, ...selectors: StringOrHTMLElement[]): HTMLElement[] {
    debug('Nano bind', { parent, selectors })
    let children: HTMLElement[],
        child: HTMLElement,
        selAreStrings: boolean,
        selAreElements: boolean

    // Validation
    selAreStrings = selectors.reduce((val, sel) => val && typeof sel === 'string', true)
    selAreElements = selectors.reduce((val, sel) => val && sel instanceof HTMLElement, true)
    // debug('All selectors are strings', selAreStrings) // Verbose
    // debug('All selectors are elements', selAreElements) // Verbose
    
    if (arguments.length < 1)
        throw Error('nanoBind() failed. First param missing. Provide a HTMLElement.')

    if (parent instanceof HTMLElement === false)
        throw Error('nanoBind() failed. First parameter is not a HTMLElement.')
    
    if (selectors.length < 1)
        throw Error('nanoBind() failed. Second parameter missing. Provide a css selector string or a HTMLElement.')

    if (selectors[0] instanceof HTMLElement === false && typeof selectors[0] !== 'string')
        throw Error('nanoBind() failed. Second parameter is not a css selector string or a HTMLElement.')

    if (selAreStrings === false && selAreElements === false)
        throw Error('nanoBind() failed. Not all selectors have the same type.')

    if (selAreStrings) {

        // Get the dom elements
        children = selectors.map(selector => {
            child = parent.querySelector(selector as string)

            // Failsafe
            if (child === null) console.warn(`Selector "${selector}" is invalid. No child element matched in "<${parent.tagName.toLowerCase()}>"`)

            return child
        })

        // Filter out invalid selectors
        children = children.filter(child => child !== null)

    } else if (selAreElements) {
        // Just reuse the params under chilren name
        children = [...selectors as HTMLElement[]]
    }

    initDataBinds(parent, children)
    return children
}

/** 
 * Creates references in the child context to all the methods in the parent context, including the inherited ones from abstract classes 
 * Accepts onöy css selectors and calls `querySelectorAll()`
 * `nanoBindAll()` does not accept HTMLElement selectors. Use `nanoBind()` instead.
 */
export function nanoBindAll(parent: HTMLElement, ...selectors: string[]): HTMLElement[] {
    debug('Nano bind', { parent, selectors })
    let children: HTMLElement[] = [],
        childrenCache: HTMLElement[],
        selAreStrings: boolean
        
    // Validation
    selAreStrings = selectors.reduce((val, sel) => val && typeof sel === 'string', true)
    debug('All selectors are strings', selAreStrings)
    
    if (arguments.length < 1)
        throw Error('nanoBind() failed. First param missing. Provide a HTMLElement.')

    if (parent instanceof HTMLElement === false)
        throw Error('nanoBind() failed. First parameter is not a HTMLElement.')
    
    if (selectors.length < 1)
        throw Error('nanoBind() failed. Second parameter missing. Provide a css selector string or a HTMLElement.')

    if (typeof selectors[0] !== 'string')
        throw Error('nanoBind() failed. Second parameter is not a css selector string.')

    if (selAreStrings === false)
        throw Error('nanoBind() failed. Not all selectors have the same type.')

    // Get the dom elements
    selectors.forEach(selector => {
        childrenCache = Array.from(parent.querySelectorAll(selector))
        childrenCache.forEach(child => children.push(child))

        // Failsafe
        if (childrenCache.length === 0) console.warn(`Selector "${selector}" is invalid. No element matched in "<${parent.tagName.toLowerCase()}>"`)
    })

    // Filter out invalid selectors
    children = children.filter(child => child !== null)

    initDataBinds(parent, children)
    return children
}