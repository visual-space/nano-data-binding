* Shorthand notations, Review if there is a better notation available. n-, p-, e-, o-. Or use the symbol as part of the attribute name. n-rule.="", n-rule:="", n-rule$=""
* Adding documentation
* Bind only metods that were requested in the data bind. This will reduce the chance of collisions a lot. Use a regex to identify them and look them up in the parent. Avoid prefixing method names or using scopes. Keep it simple.
* For rule improvements
	* A `trackBy()` method that takes care of the performance in case the references are lost
	* What if data has duplicate identifiers?
	* What if arrays have gaps? This is allowed in js.
* Automatically remove debug logs from the build
* Finish writting all the tests
* Data bind to observables and auto unsubscribe
* Testing for memory leaks, Most likely there are a lot of them right now
* Benchmarks
* Improvements in performance. Instead of creating 10K event listeners use one event listener that is executing all the registered operations.
* Maybe a default property for events would be useful. For complex pages rendering twice is not a good idea.
* Prevent double data bind initlisation by using a cached boolean on the dom node.