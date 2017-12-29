* Update README to something easier to rea
* Shorthand notations, Review if there is a better notation available. n-, p-, e-, o-. Or use the symbol as part of the attribute name. n-rule.="", n-rule:="", n-rule$=""
* Adding documentation
* Adding examples
* Automatically bind data bind attributes. Smart defaults over configuration. Eliminates the need to have unique identifiers.
	* Reliably detect who is the parent component. Web components can be nested in the same template. Thus the rule of looking up for the first parent does not work. /[\S]+\s?\(/
	* What if content is added at runtime? How do you bind to the right context? Binding at runtime could be done from outside of the curent context (parent web component). Valid cases exist where this could happen. One possible solution: If not stated otherwiseuse first parent. CSS selectors can be used to target another context `n-call="('.parent').value : this.cssActive(event)"`. Events don't need css selectors, they are allways bound to document. This notation could work but it also opens the door for missues, complicating the data binding structure. Best is to secure it by allowing only one data bind "scope" per web component. Meaning that components that receive templates at init should parse them within theyr own data bind scope. Problem is that if you automatically request methods by regexing after theyr use than you cannot pass the same method 2 layers deep. You could use `n-bind="[this.method, this.method]"`. Or you can used `nanoBind()` to push them all manually. Again, nesting of methods should not be done this way. Each component should import it's own methods in the scope if it needs them.
* Bind only metods that were requested in the data bind. This will reduce the chance of collisions a lot. Use a regex to identify them and look them up in the parent. Avoid prefixing method names or using scopes. Keep it simple.
* For rule improvements
	* A `trackBy()` method that takes care of the performance in case the references are lost
	* What if data has duplicate identifiers?
	* What if arrays have gaps? (This is allowed in js)
	* For the moment a standard socket property is used. But in order to make this work with any components we need a way to specify what info goes to what inputs while also specifying which part of the event is the soruce
* Automatically remove debug logs from the build
* Remove them in the build process
* Finish writting all the tests
* Improved webpack configuration
* Data binding to observables and auto unsubscribe
* Testing for memory leaks, Most likely there are a lot of them right now
* Benchmarks
* Improvements in performance. Instead of creating 10K event listeners use one event listener that is executing all the registered operations.
* Maybe a default property for events would be useful. For complex pages rendering twice is not a good idea.