# 0.0.10
* FOR rule - Remove the FOR rule template before the rule is initialised. Previous behavior: Template was first rendered as a normal web component and then the data bind is intercepted and executed.
* FOr rule - Constructor is not called as expected when the component is addded in the template.

# 0.1.0
* Add inline interpolation of web component context variables
* Improve the detection of the parent by overloading the innerHTML setter. No matter what nesting level is provided the binds will be enabled with the right parent.
* Replace all inline event handlers with custom ones. `onclick=""` becomes `(click)=""`.
    * Automatic data binding will not work for standard inline event handlers.
* Default to context property if no origin is defined in the syntax.
* DATA rule syntax is a bit different. The target property is read from the string straicht away instead of using `evaluateinContext()` method.
* Separate debug lib from the build package.

# Other
* Improve naming of the parent element in the databinds. Maybe `cmp.` instead of `parent.` or even `$.` In this way we could actually completely get rif of copying the metdhods to the current child context. Altough it is a bit more ocmplicated as a syntax.
* Investigate if the FOR rule has trouble rendering when hosted on a web component, it might be related to the way the way the host component is identified. Find a solution that allows targeting the right host event for nested web components.
* Improve the FOR rule to accept custom data inputs for looped web components.
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