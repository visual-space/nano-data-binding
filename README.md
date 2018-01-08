# Nano data binding

**Minimalistic data binding for web components**

Use a small set of data binding attributes with similar to those available in the modern flagship frameworks. The entire library has a small foot-print and avoids interfering with the Web Components API.

Follow on twitter: [@visual-space](https://twitter.com/visual_space), [@adriancmoisa](https://twitter.com/adriancmoisa)

## Objectives
* **Reduce boilerlpate** - In theory it is possible to write entire web apps using only ES6 syntax. In practice, you will end up writting a lot of boilerplate code. The more code you write the harder it is to maintain the app. 
* **Easy to learn** - Modern frameworks have taught us a lot, but at the same time they have been a source of endless frustratiion due to complex code patterns and domain specific language. NDB library strives to be easy to read in under 30 mins by most developers. Nothing fancy, easy to understand, all of it.
* **Functional reactive** - The data bindings are unidirectional and are built to complement a state store library. This pattern has been highly successful for developing large stable apps.
* **Minimal footprint** - No base class for web components to inherit from. Avoids additional scopes and life cycle events. Web components already do a fantastic job in this regard. Avoids double data binding, change detection via dirty checking and virtual dom. Basically the script can be easily removed just by deleting the import. The refactoring work will be minimal.
* **You bring the router** - And the state store. To maintain a ligthweight, focused and easy to understand library a lot of features have been rejected. Not everybody will be happy with this approach and luckily there are plenty of strong alternative options to choose from ([Angular](https://github.com/angular/angular), [React](https://github.com/facebook/react), [Vue](https://github.com/vuejs/vue), [Polymer](https://github.com/Polymer/polymer), [Stencil](https://github.com/ionic-team/stencil), [Skatejs](https://github.com/skatejs/skatejs)). For the routing you can use [Universal Router](https://github.com/kriasoft/universal-router) and for the state store [Redux](https://github.com/reactjs/react-redux) will do an excelent job.

## Work in progress
**This library is still in early stages of development. It is currently developed for the [Visual Space](https://twitter.com/visual_space) CMS and the [Visual School](https://twitter.com/FunVisualSchool) learning platform. Samples, seed project, tutorials and better documentation are coming soon. Until then, the best place to learn more about this library is by running `npm test` command and reading the tests descriptions. Also read the [ROADMAP.md](https://github.com/visual-space/nano-data-binding/blob/master/ROADMAP.md) file to review the missing features planned for development.**

## Installation

Download the npm package:

```
npm install nano-data-binding --save
```

Import the package in the main file of your app.

```javascript
import ndb from 'nano-data-binding';
```

Now you can write the following data bindings in any of the web components.

```html
<mock-web-cmp class="parent">
    Text interpolation via {{curlyBraces}} notation.
    <div class="child" 
        (webCmpInput)="data"
        n-if="data"
        n-for="data"
        n-class="{ active: data }"
        n-call="doSomething(data)"
        (click)="doSomethingElse()">
    </div>
</mock-web-cmp>
```

The `data` property will be read from the parent web component context. The first web component that is identified in the parent node chain will provide the parent context.

## Data sources
Current syntax can connect to three types of data sources:
* **Context properties** - This is the basic and the most used source of data. These are properties defined in the web component context.
* **Custom events** - [Nano State Store](https://github.com/visual-space/nano-state-store) was implemented in the [Visual Space](https://github.com/visual-space/visual-space) CMS. It uses custom events to comunicate with the existing code base. Connecting data binds to events is very useful for cutting down on boilerplate code.
* **Observables** - Libraries such as Angular, Rxjs And Redux make use of the observable pattern with great success. Connecting to observables is again useful to trim down on boilerplate.

## Available data binds

**Interpolation**

Double curly brace notation can be used to instantiate data binds that update fragments of code with the latest value from the data model.

```html
<some-web-cmp>
    This text is static {{ andThisTextChanges }}. 
</some-web-cmp>
```

**Inline event handlers** 

Access to the parent scope is granted for the existing inline event handlers such as `onclick`. A regex will scan for invoked methods, if these methods are not already available in the child element context than they will be searched in the parent web component context. If found, theyr references will be copied in the context of the child. Copying method refs to the child is needed when execute arbitrary code fragements that are provided for the inline handler.

```html
<some-web-cmp>
    <div onclick="doSomethig(data)"></another-web-cmp>
</some-web-cmp>
```

**Data bind**

Transfer strings, numbers, booleans, objects and arrays from the parent context to the child element context using declarative syntax. Native web components are limited to transfering only strings via element attributes.

```html
<some-web-cmp>
    <another-web-cmp (webCmpInput)="inputData"></another-web-cmp>
</some-web-cmp>
```

**If bind** 

Toggle an existing dom element. The element will be completely removed from the DOM and in the case of web components it will also trigger the lify cycle events. This is achieved by using a code comment as a placeholder while the original element is removed.

```html
<some-web-cmp>
    <div n-if="divIsVisibile">
        This will be visible depending on the boolean value
    </div>
</some-web-cmp>
```

**For bind** 

Gemerate a repetitive template using an array as an input. A state store architecture requires always creating new objects instead of mutations to represent state changes. Therefore object references cannot be used to uniquely identify objects. In such a screnario, the template cannot be updated efficiently without doing wasteful DOM operations. A `trackBy()` method can be used to address this issue. Under these circumstances, a virtual DOM indeed can bailout developers, but not without the price of adding additional complexity.

```html
<list-cmp>
    <to-do-cmp n-for="toDos">This will be repeated as many todos there are</div>
</list-cmp>
```

**Class bind** 

Add CSS classes to control the visual appearance of elements in corelation with the curent state of the UI. 

```html
<some-web-cmp>
    <div n-if="{highlight: divIsHighlighted}">
        This div will become higlighted when the source value is true.
    </div>
</some-web-cmp>
```

**Call bind** 

If none of the above options is not good enough feel free to implement your own method that will satisfy your custom specifications. 

```html
<some-web-cmp>
    <div n-call="doSomething(data)">
        Invoke a method within the context of this div when the source value changes.
    </div>
</some-web-cmp>
```

## How it works (quick overview)
* **src/self-init.ts** - Importing the script triggers two initialisation actioms:
    * Several DOM API methods are wrapped so that new elements are intercepted for a small pre-processing step. This step prevents the browser from parsing the template straight away as it is. In the preprocessing step, some parts of the template are cached for later reuse when the data binds are active (IF and FOR rules). 
    * A mutation observable is activated to detect added and removed elements in order to bind and unbind them. Parsing and initialising the data binding syntax is triggered from here.
* **src/selectors.ts** - For testing purposes we need to enabled data binds manually in certain scenarios. This is where the selectors help us by providing validation.
* **src/bind.ts** - When a data bind is initialised the syntax is parsed and validated.
    * A descriptor object containing information about the data bind is generated. This descriptor contains the following esential informations:
        * **Origin**: context property, custom events, observable - This will determine the mechanism of change detection.
        * **Source** - The name of the variable, event or observable.
        * **Rule** - What behavior will be executed if the data bind is triggered: interpolation, data, if, for, class, call
        * **Code** - This code usually is additional syntax used by the data bind (class)
        * **Template** - The template that will be used by the IF and FOR rules.
    * Getter Setter methods are used to watch for context properties value changes. In the case of events. event listeners are created and cached for later automatic removal. Same for the observables.
* **src/parse.ts** - When one of the source values has changed, the associated data bind behavior is executed.
* **src/utils.ts** - An essential part of the entire process is evaluating the data bind code in the context of the child element.

## Tips and tricks
* **Runtime changes** - There is no compilation process. Data binds can be added at runtime just by inserting new elements with databind attributes. The mutation observable will take care of initialising the data binds for you. Responsible coding is adivsed, this pattern could be difficult to maintain if abused.
* **Mix Javascript and HTML** - React library demonstrated that mixing Javascript with HTML can be a successful pattern if used with reponsability. Web components together with string literals permit the same approach. The data binds can complement this approach resulting in a hybrid codebase.
* **Debugging** - In developement mode you can easily review the entire process by logging debug statements in the browser console. To enable all the debug statements type in the console `debug.enable(ndb:*)`. Of course, beforehand you need to install the [Debug](https://github.com/visionmedia/debug) library using the the follwing command `npm i debug -D`.

## Read the source, Luke...
You will do yourself a great service by spending 30 mins to read the source code. Clearly understanding what happens after a data bind is initialised can make all the difference when it comes to improving performance. Extra effort was spent documenting the code so it can be easily reviwed. Feel free to contribute if you see possible improvements. Keeping the same well document and minimalistic approach will be much appreciated!