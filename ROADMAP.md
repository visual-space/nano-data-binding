# 0.0.10
* Replace all inline event handlers with custom ones. `onclick=""` becomes `(click)=""`.
    * Automatic data binding will not work for stard inline event hanlders.

* Default to context property if no origin is defined in the syntax.

# Other
* Multiple data binds inputs. CUrrently only one is possible with current notation
* Build for ES5, test in IE 11
* Improve README, add examples, add samples.
* Add documentation
* Shorthand notations, Review if there is a better notation available. n-, p-, e-, o-. Or use the symbol as part of the attribute name. n-rule.="", n-rule:="", n-rule$=""
	* Check for abnormal notation. A regex should find only one token without any punctuation. Warn if any issues are discovered.
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
* We need a reliable way to retrieve setter methods so we can wrap them in an additional method call. Proxy cannot be reliably used to detect changes. We can patch the `querySelector` mehod but this is only one way to walk the dom. THere are many other ways to get dom refs and they are hard to patch with a Proxy. So in this case we have to use setters for change deteciton on context properties. However we need to make sure thath we also wrap all existing setters. Object.setOwnPropertyDescriptor works only for `Object.definePropert()`. `set` and `get` methods`defined on classes are ignored. `parent.hasOwnProperty()`, `typeof` are also useless in this scenario.