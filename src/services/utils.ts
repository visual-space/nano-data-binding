// Interfaces
import { DataBind } from '../interfaces/nano-data-binding'

// Constants
import { 
    DEBUG, 
    HAS_DATA_BIND, 
    MATCH_RULE, 
    MATCH_PLACEHOLDER, 
    MATCH_CODE, 
    MATCH_SOURCE, 
    FOR_IF_ATTRIBUTES 
} from '../constants/nano-data-binding.const'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:Utils') : () => {}
debug('Instantiate Utils')

// ====== UTILS ======

/** Detect attributes with nano data bind syntax */
export function isAttrDataBind(attribute: Attr): boolean {
    let isListener: boolean = attribute.nodeName.search(MATCH_RULE) === 0
    DEBUG.verbose && debug('Is attribute data bind', attribute.nodeName, isListener) 
    return isListener
}

/** Detect placeholder comments defined after preprocessing templates */
export function isCommPlaceholder(node: Comment): boolean {
    let hasDataBinds: boolean = node.data.search(MATCH_PLACEHOLDER) === 0
    DEBUG.verbose && debug('Is comment data bind placeholder', node, hasDataBinds) 
    return hasDataBinds
}

/** Retrieves first web component in the parent chain for a given element */
export function getParentWebCmpContext (child: HTMLElement): HTMLElement {
    let el: any = child
    while (el.parentNode) {
        el = el.parentNode;
        if (customElements.get(el.tagName.toLowerCase()))
            return el
    }
    return null
}

export function getDataBindOrigin(attribute: Attr): string {
    let origin: string = attribute.nodeName.substring(0,2)
    DEBUG.verbose && debug('Get data bind rule', attribute.nodeName, origin) 
    return origin   
}

export function getDataBindRule(attribute: Attr): string {
    let rule: string = attribute.nodeName.substring(2,7)
    DEBUG.verbose && debug('Get data bind rule', attribute.nodeName, rule) 
    return rule   
}

export function getDataBindSource(attribute: Attr): string {
    let source: string = attribute.nodeValue.match(MATCH_SOURCE)[0].replace(',','')
    DEBUG.verbose && debug('Get data bind source', attribute.nodeName, source) 
    return source
}

export function getDataBindCode(attribute: Attr): string {
    let rule: string = attribute.nodeValue.match(MATCH_CODE)[0].replace(',','')
    DEBUG.verbose && debug('Get data bind code', attribute.nodeName, rule) 
    return rule
}

/** 
 * Evaluates a string in a given context. 
 * Useful to trigger behaviors associated with data bind rules.
 * <!> Used by all data binds, careful when changing anything here. Make sure you have the tests running.
 */
export function evalInContext(dataBind: DataBind): any {
    let { modifier, code, parent } = dataBind
    debug('Evaluate in context', { dataBind })

    // Evaluate data bind
    copyMethodRefsToChild(dataBind)
    eval(modifier + code)

    // Some expression might assign a value to `this._evalOutput`
    // These prefixes are added in `evaluateAttrString` depending on the data bind type
    debug('Eval output', this._evalOutput, { parent })

    // Returns undefined when the children context is not available (code is evaluated in global context)
    // This is a silent fail because it is a common one that it is actually expected.
    // The n-if rule if triggered again with a false value will not be able to evalute 
    // the code in a child context because it does not have a child, only the placeholder.
    return this._evalOutput
}

/** 
 * Scans the evaluated code for methods invoked from the child context (not globals)
 * If they are not defined in the child context it searches for them in parent context
 * If it finds any, it copies those methods from the parent to child 
 * <!> Throws error when collisions between parent and child methods happen.
 * <!> These methods need full access to the child element context.
 *     Anything less will create a lot of edge cases and collisions.
 *     Thus, it is necessary to copy their references to the child context and execute the evaluated code inside the child context.
 * <!> Private methods are still accessible for the data binds. 
 *     Typescript just pretends to have private modifiers.
 *     The js generated code actually keeps the references to the private methods.
 * TODO Delete the copied methods? Not sure yet what is better. MOst likely it's best not to leave any leftovers. Is this costly for performance?
 */
export function copyMethodRefsToChild(dataBind: DataBind): void {
    const MATCH_METHOD_CALLS = /(this.\S+\()/gm
    let { parent, child } = dataBind,
        methods = dataBind.code.match(MATCH_METHOD_CALLS)

    // No context methods are invoked
    if (!methods) return
    
    // Remove call, apply, bind
    methods = methods.map( method => 
        method.replace(/\.bind\($/,'')
        .replace(/\.apply\($/,'')
        .replace(/\.call\($/,'')
        .replace('(','') // Simpler than capturegroups
    )

    // Filter out methods defined in child context
    methods = methods.filter( method => (<any>child)[method] === undefined)
    let chains = methods.map(method => method.replace('this.','').split('.'))
    dataBind.copiedMethods = methods // For debug purposes
    DEBUG.verbose && debug('Methods not defined in child context', {methods, chains}) 

    // Validate that all methods exist in parent context
    chains.forEach((chain, i) => {
        chain.reduce( (chained, token) => {
            chained += token
            if (!(<any>parent)[chained]) {
                console.warn(`Method "${methods[i]}" is not defined in parent context. ${printDataBindInfo(dataBind)}`)
            }
            return chained
        }, '')
    })

    // Copy the method or method namespace
    chains.forEach( chain => (<any>child)[chain[0]] = (<any>parent)[chain[0]])

}

/** Render extra details about the data bind in debug log messages */
export function printDataBindInfo(dataBind: DataBind): string {
    let { parent, child, origin, source, rule, code } = dataBind,
        parentTagName = `<${parent.tagName.toLowerCase()}>`,
        childTagName = `<${child.tagName.toLowerCase()}>`

    return `Parent "${parentTagName}", Child "${childTagName}", Origin "${origin}", Source "${source}, Rule "${rule}, Code "${code}"`
}

/** Extract the rule if a tag has data binds */
export function getRule (tag: string) {
    let match = tag.match(HAS_DATA_BIND)
    if (match) {
        DEBUG.verbose && debug(`Get rule`, {match})
        return match[0].slice(2)
    }
    return match as null
}

/**
 * Warn if `__lookupGetter__` is deprecated.
 * Object.getOwnPropertyDescriptor works only for `Object.definePropert()`. `set` and `get` methods`defined on classes are ignored.
 * In case it gets deprecated we have a preety difficult problem to fix.
 */
export function checkLookupGetterIsDefined() {
    if (!(Object.prototype as any).__lookupGetter__) { 
        throw new Error('Object.prototype.__lookupGetter__ is undefined. This methods is necessary to recover getter setter methods from ES6 classes.')
    } else {
        DEBUG.verbose && debug(`Object.prototype.__lookupGetter__ is defined. Data binding can be executed successfully for all use cases.`)
    }
}

/** Usaully attributes are extracted from a DOM elemenet instance via the  */
export function getDataBindAttributesFromString(tag: string): Attr[] {
    let attributes: Attr[] = [],
        _ATTRIBUTES, _attributes 

    _ATTRIBUTES = new RegExp(FOR_IF_ATTRIBUTES, `gm`)
    while (_attributes = _ATTRIBUTES.exec(tag)) { // TODO better code, this is only one loop always
        attributes.push(<Attr>{ nodeName: _attributes[1], nodeValue: _attributes[4] || _attributes[5] }) 
    }

    DEBUG.verbose && debug('Get data bind attributes from string', { tag, attributes })
    return attributes
}