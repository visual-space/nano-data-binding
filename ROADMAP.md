* Automatically bind data bind attributes. Smart defaults over configuration. Eliminates the need to have unique identifiers.
	* Reliably detect who is the parent component. Web components can be nested in the same template. Thus the rule of looking up for the first parent does not work. /[\S]+\s?\(/
	* What if content is added at runtime? How do you bind to the right context? Binding at runtime could be done from outside of the curent context (parent web component). Valid cases exist where this could happen. One possible solution: If not stated otherwiseuse first parent. CSS selectors can be used to target another context `n-call="('.parent').value : this.cssActive(event)"`. Events don't need css selectors, they are allways bound to document. This notation could work but it also opens the door for missues, complicating the data binding structure. Best is to secure it by allowing only one data bind "scope" per web component. Meaning that components that receive templates at init should parse them within theyr own data bind scope. Problem is that if you automatically request methods by regexing after theyr use than you cannot pass the same method 2 layers deep. You could use `n-bind="[this.method, this.method]"`. Or you can used `nanoBind()` to push them all manually. Again, nesting of methods should not be done this way. Each component should import it's own methods in the scope if it needs them.
* Bind only metods that were requested in the data bind. This will reduce the chance of collisions a lot. Use a regex to identify them and look them up in the parent. Avoid prefixing method names or using scopes. Keep it simple.
* Restore debug statements
* Remove them in the build process
* Finish writting all the tests
* Improved webpack configuration
* Restore optional debug logs
* Update README to something easier to read
* Adding documentation
* Adding examples
* Data binding to context properties
* Data binding to observables
* Testing for memory leaks
* Benchmarks
* Improvements in performance