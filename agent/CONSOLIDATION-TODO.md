# Agent Consolidation - Questions to Answer

## Decision Points

### 1. Consolidation Scope
**Question:** Do you want to consolidate ALL 35 synopsis files into ONE master file, or keep the current structure but add a cloud-hosted version?

**Options:**

**Current state:** 35 synopsis files (~30 KB) + 26 full implementations (~120 KB)

---

### 2. Cloud Hosting Strategy
**Question:** Should agent.mikesendpoint.com mirror local structure or serve consolidated format?

**Options:**

**Note:** This affects how the agent loads rules from the cloud

---

### 3. Personality Bucketing
**Question:** How should rules be categorized for "personality slicing"?

**Suggested categories:**

**Goal:** Enable per-task or per-request rule selection in future "ai-brain-carvery"

---

### 4. Deployment Pattern
**Question:** How should deployment to agent.mikesendpoint.com work?

**Options:**

**Existing patterns:** You have upload-to-mikesendpoint.clinerules that uses Index Lambda API

---

## Current System Analysis

**What works well:**
- Token-optimized loading (80% reduction)
- Synopsis + full content pattern
- Clear separation of concerns
- Well-documented in RULE-CREATION-GUIDE.md

**What needs improvement:**
- No cloud deployment workflow
- No categorization/bucketing system
- No dynamic rule selection mechanism
- Context still includes all 35 synopsis files

---

## Next Steps (After Decisions)

Once you answer the questions above, we'll:
1. Design the consolidated structure
4. Set foundation for ai-brain-carvery

---

## Notes

- Current repo: `c:\code\git\tools\agent`
- Target: `agent.mikesendpoint.com`
- Total size: ~150 KB (30 KB synopsis + 120 KB full)
- Files: 35 synopsis + 26 full implementations + 9 support files
