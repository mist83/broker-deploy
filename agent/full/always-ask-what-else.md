# Always Ask What Else - Task Completion Directive

## TRIGGER
ALWAYS ACTIVE - After every attempt_completion.

## PURPOSE
Force explicit acknowledgment of remaining work. Never leave the user guessing if the task is actually done.

## RULES

### Before Using attempt_completion
Ask yourself:
1. Is there ANY remaining work?
2. Did I address ALL parts of the user's request?
3. Are there follow-up tasks that should be mentioned?
4. Did I test everything I was supposed to test?

### In Your attempt_completion Result
**ALWAYS end with this section:**

```
## 🚨 WHAT ELSE NEEDS DOING?

[If nothing:]
✅ TASK COMPLETE - Nothing else needed

[If something remains:]
⚠️ REMAINING WORK:
- 🔥 [Critical item with urgency]
- ⚠️ [Important item]
- 📋 [Nice-to-have item]

[If you're unsure:]
❓ VERIFY WITH USER:
- Does [X] need to be done?
- Should I also handle [Y]?
```

### Language Guidelines
- **Use emojis** - 🚨 ⚠️ 🔥 ✅ ❌ 📋 ❓ 💣 ⏰ 🎯
- **Be direct** - "This needs fixing" not "You might want to consider..."
- **Show urgency** - "CRITICAL", "MUST", "BLOCKING"
- **Be honest** - "I fucked up X" not "There may be an issue with..."
- **Guide clearly** - "Next: Do Y, then Z"

### When Task Is NOT Done
Don't say:
- "The task is complete"
- "Everything is working"
- Vague statements about success

DO say:
- "⚠️ NOT DONE - Still need to [X]"
- "🔥 BLOCKING ISSUE - [X] is broken"
- "❌ FAILED - [X] didn't work, here's why..."

### Examples

**Good ending (task complete):**
```
## 🚨 WHAT ELSE NEEDS DOING?

✅ TASK COMPLETE - Nothing else needed

All 3 scenarios tested and passing. Disposal fix verified in production.
```

**Good ending (work remains):**
```
## 🚨 WHAT ELSE NEEDS DOING?

⚠️ REMAINING WORK:
- 🔥 Deploy to Lambda (timeout still 30s, need 60s)
- ⚠️ Run concurrent test to verify fix
- 📋 Update documentation

Next: Deploy, test, document.
```

**Good ending (uncertain):**
```
## 🚨 WHAT ELSE NEEDS DOING?

❓ VERIFY WITH USER:
- Should I test the freeze pattern?
- Do you want browser UI verification?
- Is the current test coverage sufficient?
```

## ENFORCEMENT

This is NON-NEGOTIABLE. Every attempt_completion must explicitly address "what else" even if the answer is "nothing".

If you don't include this section, you're doing it wrong.
