// Interfaces
// import { ElDataBinds } from '../interfaces/nano-data-binding' // Parked

/**
 * Elements hosting "if" amd "for" data binds are parsed in preprocessing because they are rendered conditionally (dynamic templates).
 * If not intercepted, these elements will call their constructors before the data bind receives the signal to render the element.
 * The entire element is replaced by a placeholder comment before the html template is actually passed to the DOM parser.
 * After the template is parsed a mutation observable will detect the placeholder and it will initialised the data bind.
 * Initialising the data bind means creating callbacks tied to the web component that will execute behavior when arbitrary values change.
 * TODO Store all data binds in a tree structure that reflects the existing DOM, not just placeholders.
 */
let conditionalTemplates: string[] = []

/**
 * All the data binds starting from the top level web component.
 * Generated at runtime, matches the shape of the dom.
 * <!> So far this tree is used for debugging purposes only.
 *     At the moment the web components take the lead in contrlling the data bind initialisation process.
 *     However if in the future we see drawbacks in this methods it might be changes to go the other way around.
 * IMPLEMENT - Not yet implemented
 */
// let dataBinds: ElDataBinds = []

export function cacheConditionalTemplate(template: string): number {
    conditionalTemplates.push(template)

    // Return the index for later retrieval
    return conditionalTemplates.length - 1
}

export function getConditionalTemplate(index: number) {
    return conditionalTemplates[index]
}