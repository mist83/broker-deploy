# Search Before Implementing - Pattern Discovery First

## TRIGGER
ALWAYS ACTIVE when working in ANY codebase, especially Angular/TypeScript projects

## PHILOSOPHY
The codebase is RIGHT THERE. Search it FIRST. Don't implement blind.

## MANDATORY WORKFLOW

### When Starting ANY Implementation Task:

**Step 1: Read the Ticket/Request**
- Identify key terms and features mentioned
- Note any references to "similar to...", "we already do this in...", "like the existing..."

**Step 2: SEARCH THE CODEBASE (Required)**
Before writing ANY code:

```bash
# Search for similar features
git grep "similar_feature_keyword"

# Search for specific patterns
search_files tool with relevant regex

# Check existing implementations
read_file on similar components

# Look at model definitions
read_file on relevant model files
```

**Step 3: Search Git History (If Needed)**
Only AFTER searching current code:

```bash
git log --grep="feature_keyword"
git log -S "code_pattern" --oneline
```

**Step 4: Model Your Implementation**
Base your code on what you found:
- Copy patterns, not invent new ones
- Match naming conventions
- Use same libraries/components
- Follow established structure

**Step 5: Implement**
Now you can write code with confidence.

## RED FLAGS - Stop and Search

When you see these phrases, STOP and SEARCH first:
- "We already do this in..."
- "Similar to existing..."
- "Like the [feature] we have..."
- "Following the pattern of..."
- "This should work like..."

## EXAMPLE: This Task

**Ticket said:** "We already do this in WFP AVOD text search"

**What I should have done:**
1. `git grep "itemMetadata"` - find existing usage
2. `search_files` for similar UI patterns
3. `read_file` on similar components
4. Model implementation after findings
5. Implement with confidence

**What I actually did:**
1. Implement based on assumptions ❌
2. Get questioned
3. Then search (backwards)

## FOR ANGULAR/TYPESCRIPT PROJECTS

**Always search for:**
- Model interfaces (`*.model.ts`)
- Existing component patterns (`*component.ts`)
- Service methods (`*.service.ts`)
- Similar UI sections in templates (`*.html`)

**Common patterns to look for:**
- How metadata is stored (arrays vs objects)
- How form controls are named
- How change handlers are structured
- Which UI component libraries are used

## ENFORCEMENT

Before ANY implementation:
- [ ] Searched codebase for similar features?
- [ ] Found existing patterns to follow?
- [ ] Understood the established conventions?

If all three are YES → proceed with implementation
If any are NO → search more first

## REMEMBER

"The codebase is your documentation. Read it before you extend it."
