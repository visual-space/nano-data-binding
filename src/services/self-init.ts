// Interfaces
import { Listeners, HtmlTagMatch, TemplateRef } from '../interfaces/nano-data-binding'

// Services
// import { nanoBind } from './selectors' // DEPRECATED
import { initElDataBinds } from './bind'
import { templates } from './template-cache'
import { isAttrDataBind, getParentWebCmpContext, getRule } from './utils'

// Constants
import { HAS_DATA_BIND, SINGLETONE_TAG, CLOSE_TAG, HTML_TAG, TAG_NAME } from '../constants/nano-data-binding.const'

/**
 * Data binds are initialised automatically just by typing them in templates.
 * <!> A mutation observer scans all new dom elements for data binds and triggers theyr initialisation.
 *     The parent context (source values) is detected by searching for the first web component in the ancestors hierarchy.
 *     Synchronous code will not see the data bind executed imeditatly due to the 'end-of-microtask' timing model
 *     `_nano_no-auto-init` flag can be used to disable the autobind behavior for automatic testing purposes.
 */

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:AutoInit') : () => { }
debug('Instantiate AutoInit')

/** Start watching for added and removed elements */
export function setupAutoBindUnbind(): void {
    debug('Setup auto bind, unbind')

    // Prepare templates
    templatePreprocessing()

    // Bind
    autoBindUnbind()
}

// ====== PREPROCESSING TEMPLATES ======

/** 
 * <!> Sets up DOM API wrapper methods that intercept templates for pre-processing before attaching to DOM.
 *     The preprocessing step prevents initilisation of dom elements before the data bind is activated with non-empty values.
 *     This is achieved by removing the dynamic parts from the html template before the browser parses them. 
 * <!> Wraps DOM API mezhods used to add DOM elements in the document 
 */
function templatePreprocessing(): void {
    debug('Template preprocessing')

    var setInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set

    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function (template: string) {
            try {
                setInnerHTML.call(this, cacheDynamicTemplates(template))
            } catch {
                throw new Error('Check the template for syntax errors/n' + template)
            }
        }
    })

}

/**
 * <!> Removes data bind templates from html
 *     Prevents parsing of the dynamic templates before they are required at runtime by changes in the data binds 
 * <!> This method is exported only for testing purposes
 */
export function cacheDynamicTemplates(template: string) {
    // debug('Cache dynamic templates') // Verbose
    let tags: HtmlTagMatch[] = <HtmlTagMatch[]>[],
        bindsWithTemplates: HtmlTagMatch[],
        templateRef: TemplateRef = { template }, // Easy access via reference between multiple iterations
        match, tag, _tagName, tagName

    // Match all tags
    while (match = HTML_TAG.exec(template)) {
        tag = match[0]

        // Tag name
        let _TAG_NAME = new RegExp(TAG_NAME, `gm`)
        while (_tagName = _TAG_NAME.exec(tag)) { // TODO better code, this is only one loop always
            tagName = _tagName[1]
        }

        // Metadata
        tags.push({
            tag,
            index: HTML_TAG.lastIndex,
            isDataBind: HAS_DATA_BIND.test(tag),
            isOpenTag: !(new RegExp(CLOSE_TAG, `gm`).test(tag)),
            isSingletone: new RegExp(SINGLETONE_TAG, `gm`).test(tag),
            tagName: tagName,
            rule: getRule(tag)
        })

    }

    // For and If Data binds (need preprocessing)
    bindsWithTemplates = tags.filter(({ rule }) => rule === 'for' || rule === 'if')
    // debug('Matched tags', tags) // Verbose
    // debug('Binds with dynamic templates', bindsWithTemplates) // Verbose

    // Reversing prevents mismatched tag indexes when caching the template
    bindsWithTemplates.reverse()

    // Extract dynamic templates
    // bindsWithTemplates.forEach( bind => extractTemplate(bind, tags, templateRef) )
    bindsWithTemplates.forEach(bind => extractTemplate(bind, tags, templateRef) )

    return templateRef.template
}

/**
 * Match pairs of tags, ignore unclosed tags and singletone tags
 * When the closing tag of the current data bound tag is found return the template 
 */
function extractTemplate(bind: HtmlTagMatch, tags: HtmlTagMatch[], templateRef: TemplateRef) {
    let i = tags.indexOf(bind),
        queue: HtmlTagMatch[] = tags.slice(i), // Tags starting from the current data bind
        stack: HtmlTagMatch[] = [], // Starting tag adds, Closing tag removes
        tag: HtmlTagMatch,
        prev: HtmlTagMatch,
        closing: HtmlTagMatch,
        dynamicTemplate: string,
        { template } = templateRef,
        oi: number, // Opening index
        ci: number, // Closing index
        ti: number // Template index

    while (true) {

        // Extract first tag and add or remove from queue if tag is starting or closing tag
        tag = queue.shift()

        // Stack open tags
        if (tag.isOpenTag && tag.isSingletone === false) stack.push(tag)

        // Unstack closed pairs
        if (tag.isOpenTag === false) {

            // Unstack unclosed tags (browsers autoclose them)
            // <a><b><c></b></a> - c is ignored
            prev = stack[stack.length - 1]
            while (prev && tag.tagName !== prev.tagName) {
                stack.pop()
                prev = stack[stack.length - 1]
                // debug('- Removed unclosed tag', prev.tagName) // Verbose
            }

            // Unstack closed pairs
            stack.pop()
            // prev && debug('- Removed closed pair', prev.tagName, `/` + tag.tagName) // Verbose

        }

        // Debug
        // debug((tag && tag.isOpenTag && tag.isOpenTag === true ? '' : '/') + tag.tagName, '-', printStackedXpath(stack), queue.length) // Verbose

        // Closing tag matched
        if (stack.length === 0) {
            closing = tag

            // Template
            dynamicTemplate = template.substring(bind.index, closing.index - closing.tag.length)
            // debug('Dynamic template \n', dynamicTemplate) // Verbose

            // Cache & Remove
            templates.push(dynamicTemplate)
            oi = bind.index - 1 //+ indexOffset
            ci = closing.index - closing.tag.length //+ indexOffset
            ti = templates.length - 1 //+ indexOffset
            templateRef.template = `${template.substring(0, oi)} tpl="${ti}">${template.substring(ci)}`

            // debug('Cleaned up template \n', templateRef.template) // Verbose
            // debug('Opening tag', bind) // Verbose
            // debug('Closing tag', closing) // Verbose

            break
        }

    }
}

// ====== AUTO BIND, UNBIND ======

/**
 * A mutation observer is scanning for added and removed elements
 * <!> Automatically bind elements with nano data binds.
 * <!> Automatically remove event listeners and cancel subscriprions-
 *     `child.disconectedCallback` is not available so we need to use mutation observer
 *     Also mixin classes don't have access to `super.disconnectedCallback()`. REVIEW this one.
 * TODO This part of the scirpt could be probably improved a lot performance-wise
 */
function autoBindUnbind(): void {
    debug('Auto bind unbind')

    var mutObs = new MutationObserver(mutations => {
        // debug('Document body mutated', mutations) // Verbose

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
                        // debug('All nodes', allNodes) // Verbose

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
        // debug(`Removed custom event listener "${eventName}" from "<${tagName}>"`) // Verbose
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
        // debug(`Removed subscription "${id}" from "<${tagName}>"`) // Verbose
    }
}

// // Debug // DEPRECATE (maybe)
// function printStackedXpath(stack: HtmlTagMatch[]) {
//     let log = ''
//     stack.forEach(tag => log += tag.tagName + ' ')
//     return log
// }