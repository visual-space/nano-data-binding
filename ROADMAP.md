# 0.1.0
* Replace all inline event handlers with custom ones. `onclick=""` becomes `(click)=""`. Automatic data binding will not work for standard inline event handlers.
* Add inline interpolation of web component context variables. This can be done using DOM API wrappers. Make sure that the for rule and the if rule can safely pass data to the generated template. The chagnge deteciton is easy, the hard part is the update of template wihout rerendering.
* Multiple data bind inputs. Currently only one is possible with current notation. This can be achieved by using attirbute normalisation rules. Even the DOM API wrappers can be useful somehow for this task.

# Other
* Improved data binding tracing of the tree. Data should be easily acccessed via `_nano_inspectDataBinds()`. Generate separate data strcutre that tracks all data binds. This would make the preprocessing step easier to follow. Currently, the for rule uses one way to retreive the template nad the if rule uses another one. This is really confusing. 
* Fully deprecate manual data binds.
* Update existing methods tu use functional programming style.
* Remove all traces of syntax from the final dom elements. It is confusing to read for unexperienced devs.
* The same problem of initial constructor execution that was found in the FOR rule is also happening for the IF rule. The same fix needs to be applied also for the IF rule. 
* Remove the manual initialisation of data binds all together. Manual data binds can bypass the rule of finding the right parent and then the templates get a whole lot harder to read.
* Security - Interpolation automatically escapes any HTML. This helps to protect us from malicious attacks such as XSS by sanitizing any data that may contain script tags. 
* Default to context property if no origin is defined in the syntax.
* DATA rule syntax is a bit different. The target property is read from the string straicht away instead of using `evaluateinContext()` method.
* Improve the detection of the parent by overloading the innerHTML setter. No matter what nesting level is provided the binds will be enabled with the right parent.(Using the innerHTML wrapper could fail if elements are added at runtime). Another possible solution is to mark a webcomponet with an attribute to be ignored in the parent lookup method. A web component could add a child to another one, resolving the proper parent in this case is impossible with current DOM api, unless the bind contains specific info on who is the child, but this is going to create complex code. 
* Improve naming of the parent element in the databinds. Maybe `cmp.` instead of `parent.` or even `$.` In this way we could actually completely get rif of copying the metdhods to the current child context. Altough it is a bit more ocmplicated as a syntax.
* Investigate if the FOR rule has trouble rendering when hosted on a web component, it might be related to the way the way the host component is identified. Find a solution that allows targeting the right host event for nested web components.
* Improve the FOR rule to accept custom data inputs for looped web components.
* Build for ES5, test in IE 11
* Improve README, add examples, add samples.
* Add documentation
* Shorthand notations, Review if there is a better notation available. n-, p-, e-, o-. Or use the symbol as part of the attribute name. n-rule.="", n-rule:="", n-rule$=""
	* Check for abnormal notation. A regex should find only one token without any punctuation. Warn if any issues are discovered.
* For rule improvements
	* A `trackBy()` method that takes care of the performance in case the references are lost
	* What if data has duplicate identifiers?
	* What if arrays have gaps? This is allowed in js.
* Automatically remove debug logs from the build. Dev build keeps the logs. Prod build removes them.
* Finish writting all the tests
* Data bind to observables and auto unsubscribe
* Testing for memory leaks, Most likely there are a lot of them right now
* Benchmarks
* Improvements in performance. Instead of creating 10K event listeners use one event listener that is executing all the registered operations.
* Maybe a default property for events would be useful. For complex pages rendering twice is not a good idea.
* We need a reliable way to retrieve setter methods so we can wrap them in an additional method call. Proxy cannot be reliably used to detect changes. We can patch the `querySelector` mehod but this is only one way to walk the dom. THere are many other ways to get dom refs and they are hard to patch with a Proxy. So in this case we have to use setters for change deteciton on context properties. However we need to make sure thath we also wrap all existing setters. Object.setOwnPropertyDescriptor works only for `Object.definePropert()`. `set` and `get` methods`defined on classes are ignored. `parent.hasOwnProperty()`, `typeof` are also useless in this scenario.
* Optimis for rule. Add all new items in one step (benchmark the difference)