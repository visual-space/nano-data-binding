// Debug
let debug = require('debug')('ndb:MockWebCmp')
debug('Instantiate MockWebCmp')

/** Mocks core web components (abstract classes used by templates) */
abstract class _MockWebCmp extends HTMLElement {

    constructor() {
        super()
    }

    // In instance (property)
    Parent_Instance_increment = (val: number): number => {
        if (!this.count) this.count = 0
        this.count += val
        // debug('Parent class instance increment', this.count)
        return this.count
    }

    // In prototype (function)
    Parent_Proto_increment(val: number): number {
        if (!this.count) this.count = 0
        this.count += val
        // debug('Parent class instance increment', this.count)
        return this.count
    }

    abstract increment: () => number
    abstract count: number

}

/** 
 * Mocks web components used in the theme
 * Instead of the usual `render()` method a simple `increment()` was implemented
 */
export class MockWebCmp extends _MockWebCmp {

    // Typical properties on a ES6 class
    // <!> Typescript will simply generate public properties on these objects.
    //     These properties are only private for typescript static checking.
    //     The same applies for methods, so expect to see that data binds have access to private methods.
    public Public_Property: number = 1
    private Private_Property: number = 2
    public count: number = 0

    // Used to test data bind to context property (set, get will be wrapped)
    private _setGet: number
    set setGet(val: number) {
        this._setGet = val
        debug('Set setGet', val)
    }
    get setGet(): number {
        return this._setGet
    }

    constructor() {
        super()
        debug('Construct MockWebCmp')
        debug('Initial values', this.Private_Property) // Prevent static checking no unused error

        // Truly private values
        let value: number
        
        // Used to test data bind to context property (set, get will be wrapped)
        Object.defineProperties( this, {
            SetGet_DefinedProperty: {
                get() { return value },
                set(val: number) { 
                    value = val
                    debug('Set SetGet_DefinedProperty', val) 
                }
            },
            NonEnumerable_Property: { writable: true, enumerable: false }
        })

    }

    // In instance (property)
    Child_Instance_increment = (val: number): number => {
        if (!this.count) this.count = 0
        this.count += val
        // debug('Child class instance increment', this.count)
        return this.count
    }

    // In prototype (function)
    Child_Proto_increment(val: number): number {
        if (!this.count) this.count = 0
        this.count += val
        // debug('Child class prototype increment', this.count) // verbose
        return this.count
    }

    // Mock method with normal name
    // <!> All tests share this method
    increment = function (val?: number): number {
        if (!this.count) this.count = 0
        this.count += val
        // debug('Increment', this.count) // verbose
        console.log('Increment', this.count)
        return this.count
    }

}

// Component
window.customElements.define('mock-web-cmp', MockWebCmp)