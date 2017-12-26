declare type StringOrHTMLElement = string | HTMLElement
declare var nanoBind: (context: HTMLElement, ...selectors: StringOrHTMLElement[]) => void
declare var nanoBindAll: (context: HTMLElement, ...selectors: string[]) => void