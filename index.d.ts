/**
 * ====== GLOBALS ======
 * <!> Do not add definitions here unless they are going to be used in every possible module of this app
 */

// These types are not visible. TODO fix type defs
declare module 'simplebar'
declare module 'universal-router'

 
/**
 * ====== GLOBALS ====== 
 * Matching the globals from globals.utils.ts
 * <!> Please be a good citisen and don't start dumping everything in the global context.
 *     Only the most used vars are allowed here and the main reason is that it saves a HUGE number of imports in ALL plugins.
 * TODO Other possible globals: engine, forEach, setState, actions
 */
 
/** Object used to store the references of dom leements */
interface Refs { [key:string]: HTMLElement }
 
/** Typescript CustomEvent has any type for detail, this adds the missing type. */
interface VsEvent<T> extends CustomEvent { detail: T }

/** bind() accepts either string or HTMLElement */
declare type StringOrHTMLElement = string | HTMLElement

/** Go to public/shared/services/nano.data.bind.ts */
declare var nanoBind: (context: HTMLElement, ...selectors: StringOrHTMLElement[]) => void
declare var nanoBindAll: (context: HTMLElement, ...selectors: string[]) => void