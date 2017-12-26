import { StringOrHTMLElement } from './interfaces/nano-data-binding';
export declare function nanoBind(parent: HTMLElement, ...selectors: StringOrHTMLElement[]): HTMLElement[];
export declare function nanoBindAll(parent: HTMLElement, ...selectors: string[]): HTMLElement[];
