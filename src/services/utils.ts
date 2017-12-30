// Interfaces
import { DataBind } from '../interfaces/nano-data-binding'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:Utils') : () => {}
debug('Instantiate Utils')

// ====== UTILS ======

/** Detect attributes with nano data bind syntax */
export function isAttrDataBind(attribute: Attr): boolean {
    const MATCH_DATA_BIND = /(^[peo]-(data|if|for|class|call)$)/g
    let isListener: boolean = attribute.nodeName.search(MATCH_DATA_BIND) === 0
    // debug('Is attribute data bind', attribute.nodeName, isListener) // Verbose
    return isListener
}

export function getDataBindOrigin(attribute: Attr): string {
    let origin: string = attribute.nodeName.substring(0,2)
    // debug('Get data bind rule', attribute.nodeName, origin) // Verbose
    return origin   
}

export function getDataBindRule(attribute: Attr): string {
    let rule: string = attribute.nodeName.substring(2,7)
    // debug('Get data bind rule', attribute.nodeName, rule) // Verbose
    return rule   
}

export function getDataBindSource(attribute: Attr): string {
    const MATCH_SOURCE = /(^[^.]*,)/gm
    let source: string = attribute.nodeValue.match(MATCH_SOURCE)[0].replace(',','')
    // debug('Get data bind source', attribute.nodeName, source) // Verbose
    return source
}

export function getDataBindCode(attribute: Attr): string {
    const MATCH_CODE = /(,[\s\S]*)/gm
    let rule: string = attribute.nodeValue.match(MATCH_CODE)[0].replace(',','')
    // debug('Get data bind code', attribute.nodeName, rule) // Verbose
    return rule
}

/** 
 * Evaluates a string in a given context. 
 * Useful to trigger behaviors associated with data bind rules.
 */
export function evalInContext(dataBind: DataBind): any {
    let { modifier, code } = dataBind
    debug('Evaluate in context', { dataBind })

    eval(modifier + code)

    // Some expression might assign a value to `this._evalOutput`
    // These prefixes are added in `evaluateAttrString` depending on the data bind type
    debug('Eval output', this._evalOutput)

    // Returns undefined when the children context is not available (code is evaluated in global context)
    // This is a silent fail because it is a common one that it is actually expected.
    // The n-if rule if triggered again with a false value will not be able to evalute 
    // the code in a child context because it does not have a child, only the placeholder.
    return this._evalOutput
}

/** Render extra details about the data bind in debug log messages */
export function mapLogDataBindInfo(dataBind: DataBind): string {
    let { parent, child, origin, source, rule, code } = dataBind,
        parentTagName = `<${parent.tagName.toLowerCase()}>`,
        childTagName = `<${child.tagName.toLowerCase()}>`

    return `Parent "${parentTagName}", Child "${childTagName}", Origin "${origin}", Source "${source}, Rule "${rule}, Code "${code}"`
}