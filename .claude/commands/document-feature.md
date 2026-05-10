# Document generation command

Generate developer and user documentation for $FEATURENAME

## Document content standards
Examples of excellent developer documentation that you should match the structure, style convention of:
docs/dev/export-feature-implementation.md

Examples of excellent user documentation that you should match the structure, style convention of:
docs/user/how-to-export.md

## Process
1. **First**: Read the example files above to understand our structure, style and conventions
2. **Second**: Analyze $ARGUMENTS against these standards
3. **Third**: Create detailed critique covering:
For developer-documentation
   - File map
   - Categorize if this is a front-end/back-end/full-stack
   - Interfaces if any
   - Explanation of logic used
   - Limitations and constraints, for example max file size supported, timeouts etc.
   - Maintainability information

For user-documentation
    - Brief description of what the feature does for user
    - Where to find the feature on UI
    - Mention any expected error messages and how invalid inputs are handled
    - User decisions and what they mean for the final results
    - Insert screenshots as applicable

## Output Requirements
- Save developer documentation as `docs/dev/{featurename}-implementation.md` for each feature for which the documentation is generated
- Save user documentation as `docs/user/how-to-{featurename}.md` for each feature for which the documentation is generated

