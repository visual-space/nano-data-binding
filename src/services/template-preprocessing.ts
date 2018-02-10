// Interfaces
import { HtmlTag } from '../interfaces/nano-data-binding'

// Services
import { cacheConditionalTemplate } from './data-binds-cache'
import { getRule } from './utils'

// Constants
import {
    DEBUG,
    HAS_DATA_BIND,
    SINGLETONE_TAG,
    CLOSE_TAG,
    HTML_TAG,
    TAG_NAME
} from '../constants/nano-data-binding.const'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:TemplatePreprocessing') : () => { }
debug('Instantiate TemplatePreprocessing')

/** 
 * Sets up DOM API wrapper methods that intercept templates for pre-processing before attaching to DOM.
 * <!> Prevent parsing of the dynamic templates before they are rendered at runtime.
 *     Achieved by removing "if" and "for" templates from the intercepted html
 */
export function setupTemplatePreprocessing(): void {
    debug('Setup template preprocessing')

    var setInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set

    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function (template: string) {
            try {

                // Cache dynamic templates
                setInnerHTML.call(this, preprocessTemplates(template))

            } catch {
                throw new Error('Check the template for syntax errors/n' + template)
            }
        }
    })

}

/** 
 * Search for elements generated conditionally from data binds and cache them.
 * The intercepted elements will be later retrieved and theyr data binds initialised. 
 * <!> Exported only for testing purposes 
 */
export function preprocessTemplates(template: string) {
    let allTags: HtmlTag[],
        forIfTags: HtmlTag[],
        closingTag: HtmlTag

    // Extract conditionally rendered tags
    allTags = matchAllTags(template)
    forIfTags = getForIfTags(allTags)
    forIfTags.reverse()

    // Replace conditional tempalte with placeholders  
    forIfTags.forEach(forIfTag => {
        closingTag = getClosingTag(forIfTag, allTags)
        template = replaceCondTemplateWithPlaceholder(forIfTag, closingTag, template)
    })

    // Pass back to innerHTML
    DEBUG.verbose && debug('Preprocess templates', template)
    return template
}

/** 
 * Match all tags in the template and capture data about them.
 * <!> A simple script was implemented in order to avoid loading the entire esprima library for this simple task.
 *     This can be upgraded if it becomes unsuitable.
 */
function matchAllTags(template: string): HtmlTag[] {
    DEBUG.verbose && debug('Cache dynamic templates')
    let tags: HtmlTag[] = <HtmlTag[]>[],
        match, tag: string, _tagName, tagName: string

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
function getClosingTag(openingTag: HtmlTag, allTags: HtmlTag[]): HtmlTag {
    DEBUG.verbose && debug('Cache dynamic template')
    let i = allTags.indexOf(openingTag),
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

            // Unstack closed pairs
            unstackClosedTag(currTag, stack)

        }

        // Log progress
        DEBUG.verbose && debug(getCurrTagName(currTag), '-', getTagXpath(stack), queue.length)

        // Closing tag found
        if (stack.length === 0) return currTag

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
 * "For" and "if" data bind templates are replaced with placeholder comments.
 * The placeholder comment links to a container of cached data binds.
 * This comment will be used to initialiose the "for" and "if" data binds at runtime.
 * REVIEW Passing the index/id via comment content (data) is probably not the best approach. Check if something better can be done.
 */
function replaceCondTemplateWithPlaceholder(forIfTag: HtmlTag, closingTag: HtmlTag, template: string): string {
    let condTemplate: string, // "for", "if" templates
        preprocessed: string,
        placeholder: string,
        start: number,
        end: number,
        index: number

    // Replace with placeholders
    condTemplate = getTemplateBeteenTags(forIfTag, closingTag, template)
    index = cacheConditionalTemplate(condTemplate)
    placeholder = `<!-- _nano_placeholder="${index}" -->`
    preprocessed = template.substring(0, start) + placeholder + template.substring(end)

    DEBUG.verbose && debug('Replace conditional template with placeholder', { template, placeholder, preprocessed })

    return preprocessed
}

function getTemplateBeteenTags(openingTag: HtmlTag, closingTag: HtmlTag, template: string): string {
    let templateSection: string,
        start: number,
        end: number

    start = openingTag.index - openingTag.tag.length
    end = closingTag.index
    templateSection = template.substring(start, end)

    DEBUG.verbose && debug('Template between tags', { openingTag, closingTag }, '\n' + templateSection)
    return templateSection
}

/** Debug helper */
function getCurrTagName(tag: HtmlTag) {
    return (tag && tag.isOpenTag && tag.isOpenTag === true ? '' : '/') + tag.tagName
}

/** Debug helper */
function getTagXpath(stack: HtmlTag[]) {
    let log = ''
    stack.forEach(tag => log += tag.tagName + ' ')
    return log
}