**THe library is still work in progress. For the moment a true documentation does not exist. These are notes that will be used later for writting the documentation.**

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
