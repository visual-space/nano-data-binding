// /** bind() accepts either string or HTMLElement */
// declare type StringOrHTMLElement = string | HTMLElement

/** Go to public/shared/services/nano.data.bind.ts */
declare var nanoBind: (context: HTMLElement, ...selectors: StringOrHTMLElement[]) => void
declare var nanoBindAll: (context: HTMLElement, ...selectors: string[]) => void