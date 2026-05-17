# Cline Playbooks (HMM - Help Me Make)

Thinking through creative solutions with executable commands.

**HMM Philosophy:** Bridge the gap between thinking and making. These playbooks help you articulate ideas, scaffold projects, polish code, and orchestrate workflows - all through simple trigger phrases that unlock powerful automation.

---

## Always-Active Standards

### Proactive Code Quality
**File:** `proactive-code-quality.clinerules`  
**Activation:** ALWAYS ACTIVE - automatically consulted when writing any code

**What it does:** Consolidated quality standards that guide all code generation without requiring explicit commands.

**Includes:**
- **HTML/CSS/JS Standards** - Semantic HTML5, flat design (no gradients), minimal nesting, vanilla JS preference
- **Code Formatting** - No emojis in code files, concise technical comments, Tabler icons for HTML
- **Legacy Code Philosophy** - Rewrite > patch, question assumptions, optimize for clarity
- **PowerShell Syntax** - Always use `;` for chaining, never `&&` or `||` (CRITICAL - breaks 100% on Windows)
- **Architecture** - Simplification over complexity, pragmatism over dogma, blast radius awareness

**When it applies:** Automatically during any code generation, regardless of language or task. No trigger phrase needed.

**Note:** This is NOT a command you invoke - it's a quality standard that's always in effect.

---

## Playbook Categories

### Generators
Create new things from scratch.

### Integrations  
Add capabilities to existing projects.

### Quality
Polish and refine existing code.

### Processes
Workflows and meta-tasks.

---

## Generators

These playbooks create new projects or components from scratch.

### 1. Make Lambda
**Trigger:** "make this into a lambda" | "make lambda" | "convert to lambda"
**What it does:** Converts a C# project into a deployable AWS Lambda using the proven template pattern. Automatically creates deployment configs, scripts, and updates project files with correct Lambda packages.

### 2. Make FAB
**Trigger:** "make a fab" | "make this into a fab" | "turn this into a fab"
**What it does:** Automates the FAB (Floating Action Button) wrapper pattern. Takes HTML content and wraps it with FAB Collection infrastructure - self-contained library that deploys to S3. Each FAB is a circular button in the bottom-right that opens a sidebar panel.

### 3. Make TV App
**Trigger:** "make a tv app" | "convert to tv" | "make this tv-friendly"
**What it does:** Creates fullscreen, keyboard-driven TV interface (10-foot viewing). Large text, minimal UI, high contrast. Optimized for couch interaction with remote control support.

---

## Integrations

These playbooks add capabilities to existing projects.

### 1. Add AI Assistance  
**Trigger:** "add AI assistance" | "add ai assistance"
**What it does:** Detects JavaScript or C# projects and creates complete AI helper code for interacting with the AI endpoint. Includes all 5 endpoints (test, ask, create, transform, convert) with hardcoded URL and simple error handling.

### 2. Use Liskov File System
**Trigger:** "use liskov file system" | "use liskov with [bucket-name] bucket"
**What it does:** Integrates the Liskov File System library - unified interface for local storage and AWS S3. Switch between storage providers without changing code.

### 3. Add SignalArgh
**Trigger:** "add signalargh" | "use signalargh" | "add signalr"
**What it does:** Integrates SignalArgh real-time messaging - free, no-registration SignalR hub. Creates complete client code for JavaScript, Python, or C# with channels, groups, and automatic reconnection.

---

## Quality

These playbooks polish and refine existing code.

### 1. KISS HTML/CSS/JS
**Trigger:** "KISS the html" | "KISS the css" | "KISS the js" | "keep it simple html"
**What it does:** Enforces minimalist, semantic web design principles. Removes CSS gradients, unnecessary animations, and "AI stink" patterns. Replaces bloated markup with clean, semantic HTML5, flat colors, and simple styling. Anti-bloat web development.

**Note:** Many KISS principles are now part of the proactive code quality standards and apply automatically. Use this command when you need to explicitly audit and clean existing code.

### 2. Destank
**Trigger:** "destank" | "destink" | "unslop" | "remove ai stink"
**What it does:** Removes telltale AI-generated code patterns that make code obviously non-human. Strips verbose comments, sales pitch language, legacy indicators, excessive error handling, and redundant abstractions while maintaining functionality.

### 3. Refresh Me
**Trigger:** "refresh me" | "I have selective amnesia" | "tell me about this" | "get me tf back up to speed"
**What it does:** Provides a brief, high-level synopsis of the project for engineers. Highlights clever implementations and key architecture while skipping obvious patterns and boilerplate. Manager-level brief that showcases exceptional work.

**Format:**
- One-sentence project purpose
- Key architectural decisions (interesting only)
- Clever bits (exceptional implementations highlighted)
- Tech stack (bullets)
- Deployment model
- Follow-up items

**Note:** Designed for capable engineers who can read code - focuses on what makes the implementation special, not standard patterns.

---

## Processes

These playbooks handle workflows and meta-tasks.

### 1. Capisce Protocol
**Trigger:** "capisce?" (at end of message)
**What it does:** Makes Cline read back your request in its own words and wait for button confirmation before proceeding. Prevents misunderstandings and wasted effort. Uses gatekeep mechanism - always requires button confirmation.

### 2. Guided Design Wizard (HTML Questionnaire)
**Trigger:** "design wizard" | "app wizard" | "click-through design" | "turn this into an app" | "guide me with html questionnaire"
**What it does:** Transforms vague ideas into concrete app specifications through an HTML questionnaire. Generates a throwaway HTML file with all questions that you answer in your browser, then copy the synopsis back to Cline. Parallelism - answer everything at once instead of back-and-forth chat.

**How it works:**
1. Analyzes your request (e.g., "I want to build a task management app")
2. Generates HTML questionnaire with 5-10 relevant questions
3. Opens questionnaire in your browser
4. You answer all questions at once (multiple choice + "Other" text fields)
5. Live synopsis updates as you select answers
6. Click "Copy to Clipboard"
7. Paste synopsis back to Cline
8. Cline creates implementation plan and proceeds

**Design:**
- Minimal/flat (KISS principles)
- Clean white background, simple form controls
- Functional only, no bloat
- Throwaway HTML (one-time use)

**For tiered questions:** If answers unlock follow-up questions, Cline generates questionnaire-2.html after reviewing your first answers.

**Philosophy:** Parallelism over back-and-forth. Answer everything in one browser session instead of typing responses in chat. Human still in the middle, but the process is streamlined.

**Note:** Separate from /deep-planning. Designed for "vibe development" where you want to answer design questions all at once without extensive typing.

### 3. Fix Bugs
**Trigger:** "fix bugs" | "resolve bugs" | "address bugs"
**What it does:** Fetches reported bugs from Bug Beacon tracker, allows user to select which to fix, then creates DallAIre tasks with full bug context. Closes the feedback loop by automatically deleting bugs from tracker once tasks are created.

### 4. Fix Nitpicks
**Trigger:** "fix nitpicks" | "fix nits" | "obliterate nits"
**What it does:** Fetches UI nitpicks from Nit Picker tracker, allows user to select which to fix, then creates DallAIre tasks with full context (selectors, element info, user notes). Automatically deletes nitpicks from tracker once tasks are created.

---

## Understanding Playbook Types

### Proactive Playbooks (Always Active)
- Apply automatically during code generation
- No trigger phrase needed
- Example: Code formatting, PowerShell syntax, semantic HTML preferences

### Command Playbooks (User-Triggered)
- Only activate when you use specific trigger phrases
- Useful for specific tasks or integrations
- Example: "make lambda", "add AI assistance", "KISS the html"

**Last Updated:** 2025-12-04  
**Total Playbooks:** 13  
**Categories:** Generators (3), Integrations (3), Quality (3), Processes (4)  
**Proactive Standards:** 1
