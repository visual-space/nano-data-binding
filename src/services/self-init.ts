import { Listeners, HtmlTagMatch } from '../interfaces/nano-data-binding'

// Services
import { nanoBind } from './selectors'
import { isAttrDataBind, getParentWebCmpContext, getRule } from './utils'

// Constants
import { HAS_DATA_BIND, SINGLETONE_TAG, CLOSE_TAG, HTML_TAG, TAG_NAME } from '../constants/nano-data-binding.const'

// Debug
let Debug = require('debug'), debug = Debug ? Debug('ndb:AutoInit') : () => {}
debug('Instantiate AutoInit')

/**
 * ====== SELF INIT ======
 * Automatically init nano data bind syntax.
 * By default, the first web component encountered in the ancestors hierarchy is selected as the parent context.
 * `_nano_no-auto-init` flag can be used to disable the autobind behavior for automatic testing purposes.
 * <!> Data binds are initialised by a mutation observer.
 *     As a side effect this means that synchronous code will not see the change made in template imediatly due to the 'end-of-microtask' timing model
 *     IN case you really need to start a data bind imediatly then initialise it manually using `nanoBind()`
 */

 /**
  * <!> Sets up DOM API wrapper methods that intercept templates for pre-processing before attaching to DOM.
  *     The preprocessing step is needed in order to prevent executing constructors of templates before they are actually requested via data binding.
  * <!> Sets up mutation observalbe that triggers the data binds.
  *     So far, the best option to keep minimal 
  */
export function setupAutoBindUnbind(): void {
    debug('Setup auto bind, unbind')

    // Prepare templates
    // templatePreprocessing() // Restore
    
    // Bind
    autoBindUnbind()
}

let mockTemplate = `
    <!-- Ignore comments -->

    <!-- Ignore tags starting with new line or white space -->
    < /br></ br>< meta><	meta>
    <
    a
    > 

    <mock-web-cmp class="parent">

        <!-- Ignore less than and greater than when between quotes -->
        <div class="t'e'a's' >d<f>s t" (input)='t"e"a"s" >d<f>s t'> </div>
        <div class='t"e"a"s" >d<f>s t' (input)="t'e'a's' >d<f>s t"> </div>

        <!-- Include multiline div with mixed quotes -->
        <div
            id="test" 
            class="child" 
            e-for="mockEvent1, event.detail"> 

            <!-- Include css classes -->
            <div class="item"> </div>
            <base class="test" />
            
            <div class=> </div> 

            <!-- Ignore text and greater less than synmbols -->
            some> text > with> brackets
            more>confusing<>text
            test
            <_input><!><+"*ç%&/()=?¦@#°§¬|¢´~>

            <!-- Various spacing and closings of tags -->
            <br> <br/> <br /> <br / > <br	/	> <br	/	>

            <span>

                <!-- Ignore singletones tags when counting pairs -->
                <area> <base> <br> <col> <embed> <hr> <img> <input> 
                <keygen> <link> <meta> <param> <source> <track> <wbr>

                <asp:Label ID="CustomerNameLabel" runat="server" 
                        Text='<%#Eval("CustomerName") %>' >
                <web-cmp> <!-- Ignore unclosed tag when counting pairs (chrome autocloses) -->

                <!-- Ignore stamdalome tag names -->
                div, p, a, table, button, web-component class="dummy"
                area, base, br, col, embed, hr, img, input, 
                keygen, link, meta, param, source, track, wbr

            </span>
                                        
        </div>
    </mock-web-cmp0>
    </mock-web-cmp1>
    </mock-web-cmp2>
    </mock-web-cmp3>
`

cacheDynamicTemplates(mockTemplate)

// /** Wrap DOM API mezhods used to add DOM elements in the document */
// function templatePreprocessing(): void {
//     debug('Template preprocessing')

//     var setInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set

//     Object.defineProperty(Element.prototype, 'innerHTML', {
//         set: function (value: string) {
//             setInnerHTML.call(this, cacheDynamicTemplates(value))    
//         }
//     })

// }

// let count = 0

// TEST
// Removes FOR rule template so that the iterated item's constructor is not called by default for no reason
// Removes IF rule template so that the iterated item's constructor is not called by default for no reason
/**
 * <!> Removes data bind templates from html
 *     Prevents parsing of the dynamic templates before they are required at runtime by changes in the data binds 
 * TODO Removes IF rule template so that the iterated item^s constructor is not called by default for no reason
 * TODO Parse template interpolation syntax
 */
function cacheDynamicTemplates(template: string) {
    // debug('Cache dynamic templates') // verbose
    let tags: HtmlTagMatch[] = <HtmlTagMatch[]>[],
        bindsWithTemplates: HtmlTagMatch[],
        match, tag, _tagName, tagName

    // Match all tags
    while (match = HTML_TAG.exec(template)) {
        tag = match[0]

        // Tag name
        let $TAG_NAME = new RegExp(TAG_NAME, `gm`)
        while (_tagName = $TAG_NAME.exec(tag)) {
            tagName = _tagName[1]
            // console.log(_tagName)
        }
    
        // console.log(tag)
        // console.log(tagName)
        // console.log('')
        // console.log(tag, (new RegExp(SINGLETONE_TAG, `gm`).test(tag)))

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
    console.log(tags)
    
    // debug('Matched tags', tags); // Verbose
    // console.log('+++Matched tags', tags);
    
    bindsWithTemplates = tags.filter( ({rule}) => rule === 'for' || rule === 'if' )
    // console.log('+++Binds with dynamic templates', bindsWithTemplates);

    bindsWithTemplates.forEach( bind => extractTemplate(bind, tags, template) )

    // // console.log('Template', template)
    // // console.log('hasDynamicTemplates', hasDynamicTemplates)
    // console.log('count', count++)
    return template
}

/**
 * Match pairs of tags, ignore unclosed tags and singletone tags
 * When the closing tag of the current data bound tag is found return the template 
 */
function extractTemplate(bind: HtmlTagMatch, tags: HtmlTagMatch[], template: string) {
    let i = tags.indexOf(bind),
        queue: HtmlTagMatch[] = tags.slice(i), // Tags starting from the current data bind
        stack: HtmlTagMatch[] = [], // Starting tag adds, Closing tag removes
        tag: HtmlTagMatch,
        prev: HtmlTagMatch,
        closing: HtmlTagMatch,
        dynamicTemplate: string

    while(true) {
        
        // Extract first tag and add or remove from queue if tag is starting or closing tag
        tag = queue.shift()

        // Stack open tags
        if ( tag.isOpenTag && tag.isSingletone === false ) stack.push(tag)
        
        // Unstack closed pairs
        if ( tag.isOpenTag === false ) {
            
            // Unstack unclosed tags (browsers autoclose them)
            // <a><b><c></b></a> - c is ignored
            prev = stack[stack.length-1]
            while (prev && tag.tagName !== prev.tagName) {
                stack.pop()
                prev = stack[stack.length-1]
                console.log('      Removed unclosed tag', prev.tagName)
            }

            // Unstack closed pairs
            stack.pop()
            prev && console.log('      Removed closed pair', prev.tagName, `/` + tag.tagName)
            
        }

        // Debug
        console.log((tag && tag.isOpenTag && tag.isOpenTag === true ? '' : '/') + tag.tagName, '---', printStackedXpath(stack), queue.length)
        function printStackedXpath(stack: HtmlTagMatch[]) {
            let log = ''
            stack.forEach(tag => log += tag.tagName + ' ')
            return log
        }

        // Clsoing tag matched
        if (stack.length === 0) {
            closing = tag
            
            dynamicTemplate = template.substring(bind.index, closing.index - closing.tag.length)
            console.log('OPENING', bind)
            console.log('CLOSING', closing)
            console.log('Dynamic template', dynamicTemplate)

            break
        }
        
    }
}

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
                nodes.forEach((node: any) => { // <!> any by intent
                    // debug('Added node', node.tagName, node.classList) // Ultra verbose
                    if (node.tagName) {
                        let allNodes = [], collection = node.getElementsByTagName("*")
                        allNodes.push(node) // Just in case
                        for (let n of collection) allNodes.push(n)
                        
                        // debug('All nodes', allNodes) // Verbose
                        allNodes.forEach((n: any) => initDataBinds(n) )
                    } 
                })
            }
    
            // Detect removed nodes with custom event listeners
            if (mutation.removedNodes) {
                let nodes = Array.from(mutation.removedNodes)
                nodes.forEach((node: any) => { // <!> any by intent
                    // debug('Added node', node.tagName, node.classList) // Ultra verbose
                    if (node.tagName) {
                        let allNodes = [], collection = node.getElementsByTagName("*")
                        allNodes.push(node) // Just in case
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
function initDataBinds(child: HTMLElement): void {
    
    let attributes: Attr[] = Array.from(child.attributes)
    attributes.forEach(attr => {
        if (isAttrDataBind(attr)) {
            let parent = getParentWebCmpContext(child)
            // debug('Parent web component', {parent, child}) // Ultra verbose
            if (parent) {
                
                // Block autobind via attribute (for testing purposes)
                if (parent.hasAttribute('no-auto-bind')) return

                debug('Init data binds', {parent, child})
                nanoBind(parent, child)
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