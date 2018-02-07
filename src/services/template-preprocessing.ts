// Interfaces
import { HtmlTag, TemplateRef } from '../interfaces/nano-data-binding'

// Services
import { templates } from './template-cache'
import { getRule } from './utils'

// Constants
import { DEBUG, HAS_DATA_BIND, SINGLETONE_TAG, CLOSE_TAG, HTML_TAG, TAG_NAME } from '../constants/nano-data-binding.const'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:TemplatePreprocessing') : () => { }
debug('Instantiate TemplatePreprocessing')

/** 
 * Sets up DOM API wrapper methods that intercept templates for pre-processing before attaching to DOM.
 * <!> Prevent parsing of the dynamic templates before they are rendered at runtime.
 *     Achieved by removing "if" and "for" templates from the intercepted html
 */
export function initTemplatePreprocessing(): void {
    debug('Initialise template preprocessing')

    var setInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set

    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function (template: string) {
            try {

                // Cache dynamic templates
                setInnerHTML.call(this, cacheForIfTemplates(template))

            } catch {
                throw new Error('Check the template for syntax errors/n' + template)
            }
        }
    })

}

/** <!> Exported only for testing purposes */
export function cacheForIfTemplates(template: string) {
    DEBUG.verbose && debug('Cache for if templates')
    let templateRef: TemplateRef = { template }, // Pass by ref
        allTags: HtmlTag[],
        forIfTags: HtmlTag[]

    // Basic html tags parsing
    allTags = matchAllTags(template)
    forIfTags = getForIfTags(allTags)
    forIfTags.reverse()
    
    // Extract dynamic templates  
    forIfTags.forEach(forIfTag => cacheForIfTemplate(forIfTag, allTags, templateRef))

    // Pass back to innerHTML
    return templateRef.template
}

/** 
 * Match all tags in the template and capture data about them.
 * <!> A simple script was implemented in order to avoid loading the entire esprima library for this simple task.
 *     This can be upgraded if it becomes unsuitable.
 */
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

/** "For" and "if" data binds define dynamic templates that need to be cached */
function getForIfTags(tags: HtmlTag[]): HtmlTag[] {
    let ndbTags: HtmlTag[] = tags.filter(({ rule }) => rule === 'for' || rule === 'if')
    DEBUG.verbose && debug('', ndbTags)
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

/**
 * Unstack unclosed tags (browsers autoclose them)
 * Example: <a><b><c></b></a> - c is ignored 
 */
function unstackClosedTag(tag: HtmlTag, stack: HtmlTag[]) {
    let prev: HtmlTag

    prev = stack[stack.length - 1]

    // Ignore unclosed tags 
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
 * Once the data bind template is identified then we replace it with a placeholder comment.
 * This comment will be used to initialiose the "for" and "if" data binds at runtime.
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

function getCurrTagName(tag: HtmlTag) {
    return (tag && tag.isOpenTag && tag.isOpenTag === true ? '' : '/') + tag.tagName
}

function getTagXpath(stack: HtmlTag[]) {
    let log = ''
    stack.forEach(tag => log += tag.tagName + ' ')
    return log
}