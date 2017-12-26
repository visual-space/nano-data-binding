# Nano data binding

## Controlling which contetxt memebers are bound 
* Functions are part of the `__proto__` lookup object.
* They will be ignored by Object.assign in `nanoBind()` and in `nanoBindAll()`.
* Object.assign only copies an object instance's own properties.
* Altough it might seem this is a bug for the moment we use it as a feature in order to copy only the desired methods from a class.
* However these methods are part of the instance, that means they take extra space in memory.
* Further testing is necessary to understand what is the otpimal solution in this case.
* Considering that these data bindings should be used only in web components, the memory use is not that great.
* This solution is not truly private but what we need is to prevnet property collision on data binding so non-enumerable is enough.
* Less thechnical knowledge is needed to understand this solution than wekmaps os symbols. It also expresses more clarity of intent.
* When assigning from a node to another no other methods and properties are assigned besides the instance onse. 
* All details about the node are preserved.
* console.log(Object.assign({}, parent)).
* One extra way to control this behavior is to copy a method from the prototype and in the instance.
* Pushing methods from the prototzpe can be done also by explcitly adding them to the `parent` context param.

## Getters, Setters
* The data binding behavior depends on getters and setters in oreder to react to value changes.
* Copying setters and getters via Object.assign is not possible.
* Instead we need to defined a porperty with getters and setters in the constructor.
* `Object.defineProperty(this, "aaa_mockObjectProperty", { get() { ... }, set(v) { ... } })`.
* Then, a data bind value can be passed down bellow trough all the levels of nesting.
* In case you want to prevent a property to bind to the children you can use `enumerable: false` in the property definition.
* Beware when using a `get, set` pair together with a private property to cache the value. 
* ES6 classes don't have private, public modifiers so everything is copied. That means, a private property leaks in the children.

## No real private in typescirpt
* Not having true privates in javascript ES6 classes is a terrible drawback
* It is not possible trough some simple notatioan to gain truly private variables and methods
* Either we declare them in constructor which has a performance penality of not using inheritance (each intsance gets a copy)
* Either we use scoped WeakMaps. This solution works to achieve true private while keeping performance intact.
* However the syntax is a bit elaborated, which definitely does not satisfy a lot of people (beginners in particular, very easy to forget about these details).
* Using defineProperty with `enumerable: false` flag will prevent it from being copied. But again, it will be part of the instance.
* Considering that only properties (not methods) will need this treatment the memory consumtion is minimal and unavvoidable after all. 
* Unique instances of vars for each class instance are required by default. Otherwise we ould have a singleton.
* There is another way of doing a bit of "magic" and ignoring all properties that use underscore notation.
* This of course is not free of problems. Mainly the problem of breaking the language rules for some custom solution.
* Declaring variables outside of the class is going to leak in global ocntext in normal js or it is going to be stuck to the singletone
* of the imported file. Neither is good.

## Selective binds 
* Not everytime you might want to bind to the `this` context a of the parent. A smaller selection of methods and values can be created.
* However, this in itself can become a source of confusion if other context are used isntead of the parent.
* THis is a powerful technique but can backfire hard if not used with discipline and awareness.
* Unless you don't fully understand what are you doing just bind to the `this` content of the parent.

## Unidirectional
* All data binds are unidirectional
* This script is build around the idea of a state store, thus we want to have no back and forth comunication between components
* For this reason no data bind for listening to events was provided
 
## Deep nesting of data binds
* Chaining properties in multiple levels from the same web component is possible
* However this practice is strongly discouraged.
* Developers already have a strong expectation taht a component will receive inputs just from the parent
* Receiving inputs (data binds) from other levels than the parent can be hard to read, confusing, and hard to maintan.

## Avoid Caching references 
* Caching references of `n-if` elements will prevent them from being released and destroyed.
* The script does not intend to provide additional API that can safely get references without interfering with `n-if`. 
* The developers need to be aware of this limitation in order to keep this script lightweight.
* Querying at runtime for the required `n-if` element is enough to prevent this obstruction of the element removal.
