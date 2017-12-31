# 0.0.9
* Automatically init data binds. 
    * Smart defaults over configuration. Eliminates the need to have unique class or id identifiers. Exceptions can be handled manually.
    * Observe DOM mutations, bind the new elements. Triggered by nano data binds.
    * Search for the closest web component
    * `nano-no-auto-init` flag can be used to disable the autobind behavior for automatic testing purposes.
    * Prevent double data bind initlisation by using a cached boolean on the dom node.
    
* Instead of copying the references, methods are invoked with binding the children context. 
    * All methods will be accessible, no more collisions between contexts, 
    * No problems if additional methods are added after init at runtime.
    * References to primitves from parent context will read the latest value.
    * It binds to setters and getters by invoking them. No need to `Object.defineProperty()`
    * To get rid of copying references we need to replace all inline event handlers with custom ones. `onclick=""` becomes `(click)=""`
    * Data bind throws error if invoked method is not defined on parent context.
    * Auto init actually requres invoking from parent context isntaed of copying, due to the tiny delay of mutation observable used for self init (micro task timing model).

* Data binding to context properties.
* Better syntax - Origin prefixes in the attributes. It was confusing to read the origin tokens [".", ":", "$"] especially for the short notations. Attributes prefixes are far easier to read ["p-if", "e-if", "o-if"]. Side effect of this change, simpler code, easier to maintain.
* Restore debug logs.
* Split in smaller files.
* Default to context property if no origin is defined in the syntax.
* Improved README, added examples, added samples.

# 0.0.8
* Return control to the developer over the context from which the method is called for the `n-call` rule 
* Ignore typescript definition file in karma config.
* Fixed `n-call` rule not executing the callback.

# 0.0.1, 0.0.2, 0.0.3, 0.0.4, 0.0.5, 0.0.6, 0.0.7
* Added installation instructions.
* Fixed issues related to publishing a package on npm. The typescript definition is now recognized automatically.
* All tests have an unique events triggered. (prevents cross-talk between events)

# 0.0.0
* Basic set of data bindings extracted from visual space project.