import { DEBUG } from '../../../../config/app.config'

/**
 * ====== NANO DATA BIND MOCK ======
 * Mock webcompoents used in the testing of nano data bindings
 * <!> Using es6 notaion straight in the .js tests throws an error (unknown syntax)
 *     Best approach is to emualte the ES6 classes using the entire build system exactly how the real web components are defined
 * <!> aaa_ prefix is used to make the methods easy to spot in the console when debigging the tests
 */

export type MockArr = {[key: string]: number}[]

// Debug
let debug = require('debug')('vs:MockWebCmp')
DEBUG.instance && debug('Instantiate MockWebCmp')

/** Mocks core web components (abstract classes used by templates) */
class _MockWebCmp extends HTMLElement {

    constructor() {
        super()
    }

    // In instance (property)
    aaa_Parent_Instance_Public_Medhod = (val: number): number => {
        return ++val
    }

    // In prototype (function)
    aaa_Parent_Proto_Public_Medhod(val: number): number {
        return ++val
    }

}

/** 
 * Mocks web components used in the theme
 * No render function was implemented. It keeps the original innerHTML.
 */
export class MockWebCmp extends _MockWebCmp {

    // <!> Setter getters are not copied by Object assign
    private aaa_SetGet_Value: number
    set aaa_SetGet(val: number) {
        this.aaa_SetGet_Value = val
        DEBUG.input && debug('aaa_SetGet', val)
    }
    get aaa_SetGet(): number {
        return this.aaa_SetGet_Value
    }

    // Typical properties on a ES6 class
    // <!> Typescript will simply generate public properties on these objects.
    //     These properties are only private for typescript static checking.
    //     They will collide with properties/methods from other contexts if copied in batch.
    //     Using just typescript is an accident waiting to happen soon.
    public aaa_Public_Property: number = 1
    private aaa_Private_Property: number = 2

    // Properties defined in the constructor
    // <!> We still need to provide a type for static checking.
    public aaa_SetGet_DefinedProperty: number = 3 // Private in the sense that it is not copied by Object.assign()
    private aaa_NonEnumerable_Property: number // = 4 <!> Initial value is overwritten from constructor

    // Typical property in a class
    public count: number = 0

    constructor() {
        super()
        DEBUG.constr && debug('Construct MockWebCmp')

        // Truly private values
        let value: number

        // <!> A defined property will be copied by objects assign
        //     Using this as a host for getters setters will fix the problem of pushing inputs down in the nseting layers
        Object.defineProperties( this, {

            // Component inputs used for data binding
            aaa_SetGet_DefinedProperty: {
                get() {
                    return value
                },
                set(val: number) {
                    value = val
                    DEBUG.input && debug('aaa_SetGet_DefinedProperty', val)
                }
            },

            // Prevents data binding
            // <!> The chance of colliding with private props from childrne components / HTMLELements it's preety high
            //     It's best to be caustios and prevent any of these collisions from happening
            //     Typescript private is only working for static checking
            aaa_NonEnumerable_Property: { writable: true, enumerable: false }
            
        })

        // Double check that this poperty is writable
        // Also make sure that intelissense is not ignring this property
        this.aaa_NonEnumerable_Property = 2
        
        DEBUG.constr && debug('Initial values', this.aaa_Private_Property, this.aaa_NonEnumerable_Property)
    }

    // In instance (property)
    aaa_Child_Instance_Public_Medhod = (val: number): number => {
        return ++val
    }

    // In prototype (function)
    aaa_Child_Proto_Public_Medhod(val: number): number {
        return ++val
    }

    // Mock method with normal name
    // Reafin the tests is less confusing
    increment = function (val?: number): number {
        if (val) return this.count = ++val 
        else return ++this.count
    }

}

// Component
window.customElements.define('mock-web-cmp', MockWebCmp)