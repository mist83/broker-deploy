# Agent Rule Creation Guide

## Token-Optimized Loading Pattern

This guide explains how to create new agent rules using the token-optimized pattern implemented on 2026-01-22.

## The Problem We Solved

**Before optimization:**
- 35 `.clinerules` files totaling ~150 KB
- All rules loaded on every request
- Starting context: 50k+ tokens
- Wasteful for rules that are rarely triggered

**After optimization:**
- Synopsis files: ~30 KB (always loaded)
- Full content: ~120 KB (loaded on-demand)
- **80% token reduction** on initial load
- Full content only loaded when trigger matches

## Pattern Overview

### Two-File System

1. **Synopsis (.clinerules)** - Always loaded, minimal size
   - Trigger phrases
   - One-sentence purpose
   - Reference to full content
   - Quick reference info

2. **Full Content (full/*.md)** - Loaded on-demand
   - Complete implementation details
   - Code examples
   - Step-by-step instructions
   - Edge cases and notes

## Creating a New Rule

### Step 1: Write Full Content First

Create `full/my-new-rule.md` with complete implementation:

```markdown
# My New Rule

## TRIGGER
When the user says "trigger phrase", "alternative phrase", or similar.

## PURPOSE
One-sentence description of what this rule does.

## DETAILED IMPLEMENTATION

[Full implementation details here]
[Code examples]
[Step-by-step instructions]
[Edge cases]
[Everything needed to execute the rule]
```

### Step 2: Create Synopsis

Create `my-new-rule.clinerules` with minimal synopsis:

```markdown
# My New Rule

## TRIGGER
"trigger phrase", "alternative phrase"

## PURPOSE
One-sentence description of what this rule does.

## FULL IMPLEMENTATION
When trigger detected, read complete implementation:
```powershell
$content = Get-Content "C:/Users/mike.ullman/OneDrive - Vizio, Inc/Documents/Cline/Rules/full/my-new-rule.md" -Raw
```

Or just read the sibling file directly:
`full/my-new-rule.md`

## QUICK REFERENCE
- **Key Point 1:** Brief info
- **Key Point 2:** Brief info
- **Key Point 3:** Brief info
```

### Step 3: Keep Synopsis Under 1 KB

**Target size:** 400-700 bytes
**Maximum size:** 1 KB

**What to include:**
- Trigger phrases (exact)
- One-sentence purpose
- Reference to full content
- 3-5 quick reference bullets

**What NOT to include:**
- Code examples
- Detailed instructions
- Long explanations
- Implementation steps

## Rule Categories

### Always-Active Rules (Keep Inline)

These rules are consulted on every request and should NOT use the synopsis pattern:

- `custom_instructions.md` - Core personality
- `proactive-code-quality.clinerules` - Code quality standards
- `powershell-enforcement.clinerules` - Critical syntax rules

**Why:** These need to be immediately available without file reads.

### Command-Triggered Rules (Use Synopsis Pattern)

These rules activate only when specific trigger phrases are detected:

- All "make X" commands
- All "add X" commands
- All "fix X" commands
- All workflow commands

**Why:** Only loaded when needed, saving tokens on every other request.

### Example Rules (Keep As-Is)

Reference implementations that demonstrate patterns:

- `example-error-handling.clinerules`
- `example-formatting.clinerules`
- `example-testing.clinerules`

**Why:** Small enough that optimization isn't needed.

## Best Practices

### Trigger Phrases

**Good:**
```markdown
## TRIGGER
"make a fab", "create a fab", "turn this into a fab"
```

**Bad:**
```markdown
## TRIGGER
When the user wants to create a FAB or mentions FABs or asks about FAB creation...
```

### Purpose Statement

**Good:**
```markdown
## PURPOSE
Automates FAB Collection library creation with deployment files and S3 commands.
```

**Bad:**
```markdown
## PURPOSE
This rule helps you create FABs which are floating action buttons that appear in the bottom right and when clicked open a sidebar panel and...
```

### Quick Reference

**Good:**
```markdown
## QUICK REFERENCE
- **Validation:** Kebab-case names, hex colors
- **Output:** {name}.js, test page, S3 commands
- **Deployment:** S3 bucket `vizio-data-ingestion-resources/other/fabs/`
```

**Bad:**
```markdown
## QUICK REFERENCE
- This rule will validate your input to make sure the FAB name is in kebab-case format which means lowercase letters with hyphens...
```

## Testing Your Rule

### 1. Check Synopsis Size

```powershell
Get-Item "my-new-rule.clinerules" | Select-Object Name, @{N='KB';E={[math]::Round($_.Length/1KB,2)}}
```

Target: < 1 KB

### 2. Verify Trigger Detection

Test that the active agent shell recognizes your trigger phrases and loads the full content.

### 3. Confirm Full Content Loads

When triggered, verify that the agent reads `full/my-new-rule.md` and executes correctly.

## Conversion Script

To convert an existing large rule to the synopsis pattern:

```powershell
pwsh ./convert-rules.ps1
```

The script will:
1. Move full content to `full/` directory
2. Extract trigger and purpose
3. Generate synopsis
4. Report size savings

## Maintenance

### When to Update Synopsis

- Trigger phrases change
- Purpose statement changes
- Quick reference info changes

### When to Update Full Content

- Implementation details change
- Code examples need updates
- New edge cases discovered
- Instructions need clarification

### Keep Them in Sync

When updating a rule:
1. Update full content first
2. Check if synopsis needs changes
3. Test trigger detection still works

## Token Savings Calculator

```powershell
# Before optimization
$before = 150  # KB

# After optimization
$after = Get-ChildItem "*.clinerules" | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum
$afterKB = [math]::Round($after/1KB, 2)

# Savings
$saved = $before - $afterKB
$pctSaved = [math]::Round(($saved / $before) * 100, 1)

Write-Host "Saved: $saved KB ($pctSaved% reduction)"
```

## Results

**Optimization completed:** 2026-01-22

**Files converted:** 29 rules
**Token savings:** 120 KB (80% reduction)
**Average rule size:** 0.5 KB (synopsis) vs 5 KB (full content)

**Impact:**
- Initial context load: 50k tokens → 10k tokens
- On-demand loading: Only when trigger matches
- No functionality lost: Full content still available

## Questions?

This pattern is now the standard for all new agent rules. If you're unsure whether a rule should use the synopsis pattern, ask:

1. Is it triggered by specific phrases? → Use synopsis pattern
2. Is it consulted on every request? → Keep inline
3. Is it under 1 KB already? → Keep as-is

When in doubt, use the synopsis pattern. It's better to optimize early than to bloat context later.
