type StringOrHTMLElement = string | HTMLElement
declare var nanoBind: (parent: HTMLElement, ...selectors: StringOrHTMLElement[]) => HTMLElement[];
declare var nanoBindAll: (parent: HTMLElement, ...selectors: string[]) => HTMLElement[];

declare module 'nano-data-binding' {
    export var nanoBind: (parent: HTMLElement, ...selectors: any[]) => HTMLElement[];
    export var nanoBindAll: (parent: HTMLElement, ...selectors: string[]) => HTMLElement[];
}
