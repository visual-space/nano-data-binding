
/** 
 * Configuration of the nano data bind.
 * Nano data bind is small set of util methods used to introduce a basic data bind useful for web components.
 * These basic data bindgings are designed to reduce boilerplate in a functional ractive app built with web components.
 * This object is useful to pass information between the various stages of a data binding evaluation cycle
 */
export interface DataBind {

    // The original attribute
    attribute: Attr

    // Custom event (optional)
    // If the origin of the data bind is an custom event than this property is defined
    event?: CustomEvent

    // Context of the parent element (web componet).
    parent: HTMLElement
    
    // Context of the child element (host of the data bind attribute).
    child: HTMLElement
    
    // The origin from where the source value is read.
    // Custom event, Context property
    origin: string

    // The rule influences the final behavior of the evaluated code.
    // Data, If, For, Class, Call
    rule: string

    // The source name is used in order to avoid complex chande detection schemes (dirty checking, virual dom).
    // Behavior is linked strictly only with the data the it is meant to control it.
    // This approach is 100% compatible with functional reactive programming.
    // It is actually preffered in order to discourage the usage of OOP tecniques that lead to spaghetti code.
    // Property name, Event name
    source: string

    // Modifier used to capture the evaluated code
    modifier?: string

    // Code to be evaluated
    // This code usually returns processed values that are used by the data binding or executes callback code
    code: string

    // The n-if rule needs a placeholder in order to maintain the position of the child element
    placeholder?: Comment

    // The n-for rule keeps a copy of the original template for later reuse
    template?: string

    // The m-for rule can use a trackBy method in case the references are lost (similar to angular)
    trackBy: () => any

    // The methods that were copied from parent to child - For debugging
    copiedMethods: string[] 
}

/** bind() accepts either string or HTMLElement */
export type StringOrHTMLElement = string | HTMLElement

/** Custom event listener */
export type Listener = (e: CustomEvent) => void

/** Dictionary of listeners used to cached them for later deletion */
export type Listeners = { [key: string]: Listener }
export type Subscriptions = { [key: string]: any }

/** Delta between old items and new items. Used in n-for. */
export interface Changes {
    added: any[],
    removed: any[]
}

export type MockArr = {[key: string]: number}[]

/** 
 * Matched html tags are analysed to extract the templates for the data binds.
 * Without this step, the element will trigger a constructor before the rule is enabled.
 */
export interface HtmlTag {
    tag: string,
    tagName: string,
    index: number,
    isSingletone: boolean,
    isOpenTag: boolean
    isDataBind: boolean
    rule: string
}

/**
 * Placeholders are used to store a reference to the data binds that have been intercepted in preprocessing.
 * Elements hosting "if" amd "for" databinds are replaced with placeholder comments to prevent the execution of constructors 
 *     before the data binds renders the element conditionally.
 */
export type ElDataBinds = DataBind[]