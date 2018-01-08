# 0.0.10
* FOR rule - Fix bad timing of constructors
    * When adding the iterated component to the template, the constructor failed to execute. Fixed by parsing the template as HTML instead of XML.
    * The constructor of the iterated item is executed before the autobind (mutation observable) kicks in. This is basically a false execution which can lead to unwanted side effects or performance loss. Instead of simply rendering the host component template right away, a wrapper over `innerHTML`, `appendChild()`, `insertBefore()` is used to intercept that code and eliminate the iterated template. This stops the unwanted first execution of the constructor. Now the second part is the retrieval of this template for later reuse (when the data bind kicks in). This is done by caching the templates in a dictionary and storing the key as an attribute. Later when the dom element is finally detected by the MutationObserver the temlate is cache in the DOM element itself for easy retrieval at runtime.
* Separate debug lib from the build package.

# 0.0.9
* Automatically init data binds. 
    * Smart defaults over configuration. Eliminates the need to have unique class or id identifiers. Exceptions can be solved with manual data binds.
    * Observe DOM mutations, bind the new elements. Triggered by nano data binds.
    * Search for the closest web component
    * `no-auto-bind` flag can be used to disable the autobind behavior for automatic testing purposes.
    * Prevent double data bind initlisation by using a cached boolean on the dom node.
    
* Automatically copy references of invoked methods in the child context
    * All methods will be accessible
    * Methods that are already defined on the children will be used from there. 
    * No more overwrite collisions between parent and children contexts. 
    * No problems if additional methods are added after init at runtime.

* Data binding to context properties.
    * In the IF rule, instead of creating an exception to the general pattern, restore the call to `evaluateDataBind()`. In this way, all the rules have the same trigger mechanism.

* Better syntax - Origin prefixes in the attributes. It was confusing to read the origin tokens [".", ":", "$"] especially for the short notations. Attributes prefixes are far easier to read ["p-if", "e-if", "o-if"]. Side effect of this change, simpler code, easier to maintain.
* Restore debug logs.
* Split in smaller files.

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