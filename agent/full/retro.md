# Retro - Pattern Extraction & Prevention

## TRIGGER
When the user says "retro", "let's retro", "retro this issue", "retrospective", or similar phrases requesting pattern analysis.

## PURPOSE
Extract actionable patterns from completed work and update directives to prevent recurrence. NO documentation - just behavioral changes.

## PROCESS

### Step 1: Analyze
- What problem was solved?
- What caused the issue?
- Was it preventable?

### Step 2: Extract Pattern
- Is there a generalizable rule?
- Does it apply to specific file types/situations?
- Can it be codified as a behavior?

### Step 3: Update Directives
- Which existing directive should be updated?
- OR should a new directive be created?
- Add prevention logic, not documentation

### Step 4: Apply
- Update the relevant .clinerules file
- Make the change behavior-driven
- Skip the whitepaper

## EXAMPLE: Sidebar Consolidation Retro

**Problem:** Multiple sidebar classes (.chat-sidebar, .task-sidebar, etc.) for identical styling  
**Pattern:** When N classes have same properties and purpose → consolidate to ONE class  
**Prevention:** Add to KISS CSS directive - "Class consolidation" principle  
**Action:** Updated kiss-html-css-js.clinerules with consolidation rule

## ANTI-PATTERN

❌ Creating "lessons-learned.md" document  
❌ Writing retrospective reports  
❌ Documenting the issue for reference  

✅ Update kiss-html-css-js.clinerules with new principle  
✅ Create new directive for recurring pattern  
✅ Change future behavior to prevent issue  

## ENFORCEMENT

When user triggers retro:
1. Ask: "What issue should we retro?"
2. Analyze the completed work
3. Extract the preventable pattern
4. Determine which directive to update
5. Make the change
6. Confirm: "Directive updated - this won't happen again"

NO documentation. NO reports. Just prevention.

## TONE

Direct and action-oriented:
- "Extracted pattern: class duplication"
- "Updated KISS directive with consolidation rule"
- "This won't recur"

Not:
- "Let me write up a retrospective document..."
- "I've documented the lessons learned..."
