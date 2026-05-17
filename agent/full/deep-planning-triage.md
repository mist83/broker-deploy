# Deep Planning & Architectural Triage

When the user requests `/deep-planning` or architectural triage, use this framework:

Simplify this codebase architecturally without losing functionality. "It's simple enough for a human to understand, good job!" is a valid answer. Suss out any discrepancies between the functionality and the README before you do, though - I want to make sure I set the record straight on what this app is supposed to DO (and what it actually does - those should ideally be one and the same!)

Ask yourself these kinds of questions:

How would you better develop against this library?

Assume you are free to cast any practice into doubt, including those in your agent instruction files.

I want to limit blast radius for things LIKE changing a css variable or a simple Javascript function - but eventually everything that's vibe-coded comes tumbling down like that in my experience - this text (yes, THIS VERY TEXT I AM TYPING RIGHT NOW) is an attempt to guard against that. (PS - feel free to call THIS text into question as well!)

I want your opinion as an expert in getting shit done (GSD). You're smart, tell it straight even when it conflicts with your perception of my understanding of the subject, and not afraid to cut corners where the corners stank of dog...ma (dogma, instead of practicality).

Mirror me in your response/responses.

## Analysis Framework

When conducting this architectural triage, follow this systematic approach:

### 1. Reality vs Documentation Audit
- **What does the code actually do?** - Examine the core functionality
- **What does the documentation claim?** - Check README, comments, and stated goals
- **Gap Analysis** - Where are the biggest disconnects?
- **Truth Alignment** - Recommend either fixing code to match docs, or docs to match code

### 2. Architectural Complexity Assessment
- **Core Functionality** - What are the 3-5 essential features this actually provides?
- **Unnecessary Abstractions** - What layers add complexity without value?
- **Coupling Analysis** - What requires extensive changes for simple modifications?
- **Blast Radius Evaluation** - Which changes would cascade into other systems?

### 3. Practical Simplification
- **Consolidation Opportunities** - What can be merged or eliminated?
- **Interface Clarity** - How could developers interact with this more simply?
- **Configuration Reduction** - What options/settings are actually needed?
- **Dependency Minimization** - What external dependencies add unnecessary weight?

### 4. Development Experience (DX) Evaluation
- **Local Development** - How easy is it to run/test/develop against this?
- **Debugging Experience** - Can developers easily understand what's happening?
- **Extensibility** - How hard is it to add new features?
- **Maintenance Burden** - What will be painful to maintain long-term?

### 5. Dogma vs Pragmatism Check
- **Best Practices Audit** - Which "best practices" are actually hindering progress?
- **Pattern Analysis** - What patterns are used because "that's how it's done" vs solving real problems?
- **Over-Engineering Detection** - What's been built for hypothetical future needs?
- **Practical Alternatives** - What simpler approaches would achieve the same goals?

## Expected Output

Provide a brutally honest assessment that includes:

1. **Executive Summary** - What this thing actually does in 2-3 sentences
2. **Architecture Reality Check** - Core components and their actual purpose
3. **Simplification Recommendations** - Specific, actionable changes to reduce complexity
4. **Blast Radius Analysis** - What changes would be high-impact vs low-risk
5. **Documentation Alignment** - How to make docs and code match reality
6. **Next Steps** - Prioritized list of improvements that maximize simplicity gains

Remember: The goal is to make this codebase understandable by humans and maintainable without requiring a PhD in the original developer's thought process.
