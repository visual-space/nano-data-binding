// Interfaces
import { Listeners, HtmlTag, TemplateRef } from '../interfaces/nano-data-binding'

// Services
import { initElDataBinds } from './bind'
import { templates } from './template-cache'
import { isAttrDataBind, getParentWebCmpContext, getRule } from './utils'

// Constants
import { DEBUG, HAS_DATA_BIND, SINGLETONE_TAG, CLOSE_TAG, HTML_TAG, TAG_NAME } from '../constants/nano-data-binding.const'

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

/** Sets up DOM API wrapper methods that intercept templates for pre-processing before attaching to DOM. */
function templatePreprocessing(): void {
    debug('Template preprocessing')

    var setInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set

    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function (template: string) {
            try {
                setInnerHTML.call(this, cacheForIfTemplates(template))
            } catch {
                throw new Error('Check the template for syntax errors/n' + template)
            }
        }
    })

}

/**
 * <!> Prevent parsing of the dynamic templates before they are rendered at runtime.
 *     Achieved by removing "if" and "for" templates from the intercepted html
 * <!> Exported only for testing purposes
 */
export function cacheForIfTemplates(template: string) {
    DEBUG.verbose && debug('Cache for if templates')
    let templateRef: TemplateRef = { template }, // Pass by ref
        allTags: HtmlTag[],
        forIfTags: HtmlTag[]

    // Extract dynamic templates  
    allTags = matchAllTags(template)
    forIfTags = getForIfTags(allTags)
    forIfTags.reverse()
    forIfTags.forEach(forIfTag => cacheForIfTemplate(forIfTag, allTags, templateRef))

    // Pass back to innerHTML
    return templateRef.template
}

/** Match all tags in the template and capture data about them */
function matchAllTags(template: string): HtmlTag[] {
    DEBUG.verbose && debug('Cache dynamic templates')
    let tags: HtmlTag[] = <HtmlTag[]>[],
        match, tag, _tagName, tagName

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

    DEBUG.verbose && debug('Matched tags', tags)
    return tags
}

function getForIfTags(tags: HtmlTag[]): HtmlTag[] {
    let ndbTags: HtmlTag[] = tags.filter(({ rule }) => rule === 'for' || rule === 'if')
    DEBUG.verbose && debug('Binds with dynamic templates', ndbTags)
    return ndbTags
}

/**
 * Match pairs of tags, ignore unclosed tags and singletone tags
 * When the closing tag of the current data bound tag is found return the template 
 */
function cacheForIfTemplate(forIfTag: HtmlTag, allTags: HtmlTag[], templateRef: TemplateRef) {
    DEBUG.verbose && debug('Cache dynamic template')
    let i = allTags.indexOf(forIfTag),
        queue: HtmlTag[] = allTags.slice(i), // Tags starting from the current data bind
        stack: HtmlTag[] = [], // Starting tag adds, Closing tag removes
        currTag: HtmlTag

    // Search the closing tag of the "for" or "if" data bind
    while (true) {

        // Current tag
        currTag = queue.shift()

        if (currTag.isOpenTag && 
            currTag.isSingletone === false
        ) {
            
            // Stack open tags, 
            stack.push(currTag)

        } else if (currTag.isOpenTag === false) {
            
            //unstack closed pairs
            unstackClosedTag(currTag, stack)

        }
        DEBUG.verbose && debug(getCurrTagName(currTag), '-', getTagXpath(stack), queue.length)

        // Closing tag found
        if (stack.length === 0) {
            extractTemplate(forIfTag, currTag, templateRef)
            break
        }

    }
}

function unstackClosedTag(tag: HtmlTag, stack: HtmlTag[]) {
    let prev: HtmlTag

    // Unstack unclosed tags (browsers autoclose them)
    // <a><b><c></b></a> - c is ignored
    prev = stack[stack.length - 1]
    while (prev && tag.tagName !== prev.tagName) {
        stack.pop()
        prev = stack[stack.length - 1]
        DEBUG.verbose && debug('- Removed unclosed tag', prev.tagName)
    }

    // Unstack closed pairs
    stack.pop()
    DEBUG.verbose && prev && debug('- Removed closed pair', prev.tagName, `/` + tag.tagName)
}

/** 
 * Once the data bind template is identified than replace it with a placeholder comment.
 * This comment will be used to initialiose the for and if data binds.
 */
function extractTemplate(forIfTag: HtmlTag, currTag: HtmlTag, templateRef: TemplateRef) {
    let closing: HtmlTag,
        forIfTemplate: string,
        { template } = templateRef,
        oi: number, // Opening index
        ci: number, // Closing index
        ti: number // Template index

    closing = currTag

    // Template (tags included)
    forIfTemplate = template.substring(forIfTag.index, closing.index - closing.tag.length)
    DEBUG.verbose && debug('Dynamic template \n', forIfTemplate)

    // Cache
    templates.push(forIfTemplate)

    // Replace with placeholder
    oi = forIfTag.index - 1 //+ indexOffset
    ci = closing.index - closing.tag.length //+ indexOffset
    ti = templates.length - 1 //+ indexOffset
    templateRef.template = `${template.substring(0, oi)} tpl="${ti}">${template.substring(ci)}`

    DEBUG.verbose && debug('Cleaned up template \n', templateRef.template)
    DEBUG.verbose && debug('Opening tag', forIfTag)
    DEBUG.verbose && debug('Closing tag', closing)
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

// ====== DEBUG ======

function getCurrTagName(tag: HtmlTag) {
    return (tag && tag.isOpenTag && tag.isOpenTag === true ? '' : '/') + tag.tagName
}

function getTagXpath(stack: HtmlTag[]) {
    let log = ''
    stack.forEach(tag => log += tag.tagName + ' ')
    return log
}