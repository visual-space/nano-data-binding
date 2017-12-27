# Nano data binding

**Add basic data binding to native web components apps without importing any of the big frameworks.**

`nano-data-binding` is a small set of data binding attributes that replace the typical code you would write to get the same effect in vanilaJS without any frameworks around. The main objective is to keep the script easy to read in under 30 mins by most devs. Nothing fancy, easy to understand e2e.

Follow on twitter: [@visual-space](https://twitter.com/visual_space), [@adriancmoisa](https://twitter.com/adriancmoisa)

**This is first demo vesion, several improvements are still under way.**<br/>
**Samples, tutorials and better documentation coming soon.**
**Until then, the best place to learn more about this script is by running `npm run test` and reading the tests descriptions.**

## Installation and usage

Download latest package from npm: 

    npm i nano-data-binding --save

Require once in the `main.ts` file. One import is enough to register the global methods and the typescript definition.

    import ndb as 'nano-data-binding' 

No need to import anything. `nanoBind()` and `nanoBindAll()` are available as globals.
Now you can use in the html templates the following data bindings: `n-data`, `n-if`, `n-for`, `n-class`, `n-call`.

    <mock-web-cmp class="parent">
        <div class="data-bind child" 
            n-data="customEvent : { bar: event.detail }"
            n-if="customEvent : event.detail"
            n-for="customEvent : event.detail"
            n-class="customEvent : { active: event.detail }"
            n-call="customEvent : fooBar(event.detail)">
        </div>
    </mock-web-cmp>

In order to activate the data binds you just need to type the following in your web component.

    nanoBind(this, '.child')

## What to expect
* **Not a framework** - This is not a framework! This is a simple script that adds basic data binding syntax to web components. The objective of this entire script is to keep the codebase as close to vanila JS as possible while avoiding some boilerplate.
* **Eliminates boilerplate code** - Interpolation in multiline string templates is static, no actual data binds are created. In order to update a static template a lot of boilerplate code is needed. Using a few basic data binding tags can shrink a significant amount of code.
* **No crazy magic** - `nano-data-binding` does not implement any change detection or a virtual dom. Basically, you control precisly what property or event connects to what web component or dom element. This is just a fancy wrapper that automatically calls `Object.assign()` between the parent and the children and than waits for new values of the bound properties to arrive.
* **Unidirectional flow** - One fundamental expectation is that a state store is implemented (redux, nano-state-store). Having an unidirectional state management strategy, ensures that no extra operations are executed when state changes. Everything just reacts to the store. Basically there is no output data bind, only inputs. This is an intentional design choice meant to encourage proper implementation of state store architecture. 
* **Defined as globals** - All these utils will be used in all files, having them as globals spares a lot of imports. Each of these methods has a global typescript definition matched.
* **Manual init** - These data binds could be done automatically for every component, however this is not really needed, and it could actually be harmful. Having total control over the binding process gives opportunity for some creative binds. In practice it's best to create simple bindings between the parent web component and it's direct childrens. A develoepr would expect to see this kind of relation, anything else is confusing unless properly coded and documented.
* **No overengineering** - Before contributing any functionality please reconsider if it will keep the code simple. The main goal of this file is to be easy to read and understand in 30 minutes for most developers, all in under 600 lines of code. Anything more will result in a new framework that is as complex and mysterious as previous frameworks. Any PR that those not conform to these constraints will be rejected.
* **Simple code** - It is best if you spend 30 mins to read the source code to clearly understand what happens after a data bind is initialised. Extra effort was spent documenting the code so it can be easily digested.

## Planned features
The overall plan is to keep te script simple.
* This is still work in progress, so far only binding to custom events was implemented. This is because the host project uses an experimental events based state store. Soon binding to context properties will be done.
* Adding `trackkBy()`option for the `n-for` rule.
* Syntax for automatically binding to observables not just events.
* Finishing writting also the non-essential tests.
* Improving performance and checking for memory leaks.
* Adding performacne benchmarks

## Controlling which methods and properties are copied to the targeted elements
Functions are part of the `__proto__` lookup object. They will be ignored by `Object.assign()` in `nanoBind()` and in `nanoBindAll()`. `Object.assign()` only copies an object instance's own enumerable properties.

Altough it might seem this is a bug for the moment we use it as a feature in order to copy only the desired methods from a class. However these methods are part of the instance, that means they take extra space in memory. Further testing is necessary to understand what is the otpimal solution in this case. Considering that these data bindings should be used only in web components, the memory use is not that excessive.

Keeping methods on the prototype chain is not the same thing as private but what we need is to prevent property collision on data binding so non-enumerable is enough. Less thechnical knowledge is needed to understand this solution than wekmaps or symbols. It also expresses more clarity of intent.

When assigning from a node to another no other methods and properties are assigned besides the instance onse. All details about the node are preserved. Try this to see what happens `console.log(Object.assign({}, someElement))`.

You can also defined all methods in the protype and just make a local reference in the web component's context. Or by creating a custom made context object to be feed into the fir parameter of `nanoBind()`.

## Getters, Setters
The data binding behavior depends on getters and setters in order to react to value changes. Copying setters and getters via `Object.assign()` is not possible. Instead we need to defined a porperty with getters and setters in the constructor.

    Object.defineProperty(this, "aaa_mockObjectProperty", { get() { ... }, set(v) { ... } })

Using this approach, a data bind value can be passed down bellow trough all the levels of nesting. In case you want to prevent a property to bind to the children you can use `enumerable: false` in the property definition. Beware when using a `get, set` pair together with a private property to cache the value. ES6 classes don't have private, public modifiers so everything is copied. That means, a private property leaks in the children.

## No real private in typescript
Not having true privates in javascript ES6 classes is a terrible drawback. Currently, it's not possible trough some simple notatioan to gain truly private properties and methods. Onyl scoping odes the trick.

Either we declare them in constructor which has a performance penality of not using inheritance (each intsance gets a copy). Either we use scoped WeakMaps. This solution works to achieve true private while keeping performance intact. However the syntax is a bit elaborated, which definitely does not satisfy a lot of people (beginners in particular, very easy to forget about these details).

Using defineProperty with `enumerable: false` flag will prevent it from being copied. But again, it will be part of the instance. Considering that only properties (not methods) will need this treatment the memory consumtion is minimal and unavvoidable after all. Unique instances of vars for each class instance are required by default. Otherwise we ould have a singleton.

There is another way of doing a bit of "magic" and ignoring all properties that use underscore notation. This of course is not free of problems. Mainly the problem of breaking the language rules for some custom solution. Declaring variables outside of the class is going to leak in global ocntext in normal js or it is going to be stuck to the singletone of the imported file. Neither is good.

## Selective binds 
Not everytime you might want to bind to the `this` context a of the parent. A smaller selection of methods and values can be created. However, this in itself can become a source of confusion if other context are used instead of the parent. This is a powerful technique but it can backfire hard if not used with discipline and awareness. Unless you don't fully understand what are you doing just bind to the `this` content of the parent.

## Unidirectional
All data binds are unidirectional. This script is build around the idea of a state store, thus we want to have no back and forth comunication between components. For this reason no data bind for listening to events was provided
 
## Deep nesting of data binds
Chaining properties in multiple levels from the same web component is possible. However this practice is strongly discouraged. Developers already have a strong expectation taht a component will receive inputs just from the parent. Receiving inputs (data binds) from other levels than the parent can be hard to read, confusing, and hard to maintain.

## Avoid caching references 
Caching references of `n-if` elements will prevent them from being released and destroyed. The script does not intend to provide additional API that can safely get references without interfering with `n-if`. The developers need to be aware of this limitation in order to keep this script lightweight. Querying at runtime for the required `n-if` element is enough to prevent this obstruction of the element removal.
