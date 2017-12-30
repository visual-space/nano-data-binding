# 0.0.9
* Better syntax - Origin prefixes in the attributes. It was confusing to read the origin tokens [".", ":", "$"] especially for the short notations. Attributes prefixes are far easier to read ["p-if", "e-if", "o-if"]. Side effect of this change, simpler code, easier to maintain.
* Restore optional debug logs.
* Split in smaller files.
* Automatically init data binds. Smart defaults over configuration. Eliminates the need to have unique class or id identifiers. Exceptions can be handled manually.
    * Observe DOM mutations, bind the new elements.
    * Search for the closest web component
* Data binding to context properties.
* Default to context property if no origin is defined in the syntax.
* Adding examples
* Update README to something easier to read

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