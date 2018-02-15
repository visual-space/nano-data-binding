# 0.0.11
* Try catch errors from preprocessing invalid templates. They were throwing hard to debug errors.
* Cleaned up code and updated comments.
* Removed data binds attributes after init. Prevents double initialisation for the "if" and "for" rules. Also cleaner html.
* Fixed major design flaw. Parsing multiple data binds on the same element will overwrite each other.
* Upgraded "if" and "for" rules to cache the entire tag not just the contents.
* "If" and "for" rules use conditional templates. These templates are replaced with placeholder comments at preprocessing. This step prevents initiliasing DOM elements from the data binds before the rendering signal is received.
* Improved handling of placeholders and data bind initialisation, streamlined, simpler, architecture.
* Removed manual selectors.
* Provided samples.
* Evaluate data binds at init. This will trigger all rules depending on the initial source value.
    * "If" and "for" data binds share the same template.
    * Deprecate the call method. Very little benefit. Maybe recycle it for the inline handlers.
    * Simpler declaration syntax. Distinguishing between change trigger value and source value only makes the code more complicated. This pattern stems from the original design where a value would evaluate arbitrary code in the data binds. This is no longer the case.
    * Simplify the evaluation of rules after simplifying the syntax.
    * Added string interpolation for text nodes.
    * Added inline events syntax.
    * Update documentation.
    * custom data inputs for the "for" rule

# 0.0.10
* "For" rule, fixed bad timing of constructors.
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