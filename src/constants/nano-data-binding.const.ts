/** Where is the source value caming from */
export const ORIGIN = {
    Property: 'p-',
    Event: 'e-',
    Observable: 'o-'
}

/** Each rule triggers a specific behavior */
export const RULE = {
    Data: 'data',
    If: 'if',
    For: 'for',
    Class: 'class',
    Call: 'call',
}

/** 
 * It detects valid HTML tags in a variety of situations
 * <!> The basic logic is the follosing:
 *     Search for tags that start with or without a slash
 *     First character needs to be a letter
 *     It can be followed by any non-white space any number of times non-greedy
 *     A caputer group create out of three smaller capture groups
 *         Group 1: attributes="with double quotes"
 *         Group 1: attributes='with single quotes'
 *         Group 1: anything else that does not contain greater/less then and quotes < > " '
 * <!> This regex was tested against a lot of uncommon tags.
 * <!> Performance is in acceptable bounds, 1000 queries take 120 ms in a large document. 
 *     This is far more work than what a typical app needs to do.
 * <!> This procedure goes against common wisdom of not using regex to parse html.
 *     Because it was not desired to introduce an entire additional library (esprima) for 1 single task this solution was preferred.
 *     This might be subject to change if performance in real world apps is affected by this approach.
 * TODO Additionaly the auto scan can be limited only for the init phase. Still not decided.
 */
export const HTML_TAG = /(<\/?[a-z](:?\S*?)?(:?(:?\s*?\S+?=".*?")*?(:?\s*?\S+?='.*?')*?(:?\s*?[^\s\<\>"']*?)*?)*?>)/gm
export const SINGLETONE_TAG = 'area|base|br|col|command|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr'
export const CLOSE_TAG = '^<\\/' // <!> Missing the closing slash
export const TAG_NAME = '^<\\/?([a-z][^\\s\\>\\/]*)' // Exclude greater than and slash
export const FIRST_TAG = '(<.*>)'
export const FOR_IF_ATTRIBUTES = '([peo]-(if|for))(="(.*?)"|=\'(.*?\'))'

/** Regexes used to detect data bind attributes */
export const HAS_DATA_BIND = /([peo]-(data|if|for|class|call))/g
export const MATCH_RULE = /(^[peo]-(data|if|for|class|call)$)/g
export const MATCH_CODE = /(,[\s\S]*)/gm
export const MATCH_SOURCE = /(^[^.]*,)/gm
export const MATCH_PLACEHOLDER = /^ _nano_placeholder="(\d)" $/g

/** Debug options */
export const DEBUG = {
    verbose: false
}