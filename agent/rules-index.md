# Agent Rules Index
**Token-Optimized Loading System**

This index provides summaries of all available rules. Full content is loaded on-demand when trigger patterns match.

---

## Always-Active Rules (Loaded Every Request)

### custom_instructions.md
**Always loaded** - Core personality and workflow preferences

### proactive-code-quality.clinerules
**Always loaded** - Code quality standards for HTML/CSS/JS, formatting, PowerShell syntax

### powershell-enforcement.clinerules
**Always loaded** - CRITICAL: Use `;` not `&&` in PowerShell commands

---

## Command-Triggered Rules (Load on Demand)

### add-ai-assistance
**Triggers:** "add AI assistance", "add ai assistance"  
**Summary:** Creates AI helper code for JavaScript or C# projects to interact with AI endpoint  
**Full content:** `full/add-ai-assistance.md`

### add-ai-integration
**Triggers:** When adding AI features with CORS issues  
**Summary:** Backend proxy pattern to avoid CORS errors with external AI endpoints  
**Full content:** `full/add-ai-integration.md`

### add-signalargh
**Triggers:** "add signalargh", "use signalargh", "add signalr"  
**Summary:** Integrates SignalArgh real-time messaging (no-registration SignalR hub)  
**Full content:** `full/add-signalargh.md`

### always-ask-what-else
**Triggers:** After every attempt_completion  
**Summary:** Force explicit acknowledgment of remaining work with "What else?" section  
**Full content:** `full/always-ask-what-else.md`

### auto-deploy-slack
**Triggers:** After successful Lambda deployment  
**Summary:** Posts Slack notification with deployment URL and cache-busted link  
**Full content:** `full/auto-deploy-slack.md`

### bug-beacon-shortcuts
**Triggers:** "bbfix", "bug beacon", "BB", "check bug beacon"  
**Summary:** Auto-fetch and analyze bugs from Bug Beacon tracker  
**Full content:** `full/bug-beacon-shortcuts.md`

### deep-planning-triage
**Triggers:** "/deep-planning", "architectural triage"  
**Summary:** Simplify codebase architecturally, question dogma, reduce blast radius  
**Full content:** `full/deep-planning-triage.md`

### destank
**Triggers:** "destank", "destink", "unslop", "remove ai stink"  
**Summary:** Removes AI-generated code patterns (verbose comments, gradients, sales pitch language)  
**Full content:** `full/destank.md`

### fix-bugs
**Triggers:** "fix bugs", "resolve bugs", "address bugs"  
**Summary:** Fetches bugs from Bug Beacon, creates DallAIre tasks, deletes from tracker  
**Full content:** `full/fix-bugs.md`

### fix-nitpicks
**Triggers:** "fix nitpicks", "fix nits", "obliterate nits"  
**Summary:** Fetches UI nitpicks from Nit Picker, creates DallAIre tasks, deletes from tracker  
**Full content:** `full/fix-nitpicks.md`

### kiss-html-css-js
**Triggers:** "KISS the html", "KISS the css", "KISS the js", "keep it simple"  
**Summary:** Enforces minimalist web design: no gradients, semantic HTML, flat colors, vanilla JS  
**Full content:** `full/kiss-html-css-js.md`

### make-fab
**Triggers:** "make a fab", "make this into a fab", "turn this into a fab"  
**Summary:** Wraps HTML in Floating Action Button (FAB) Collection library for S3 deployment  
**Full content:** `full/make-fab.md`

### make-lambda
**Triggers:** "make this into a lambda", "make lambda", "convert to lambda"  
**Summary:** Converts C# project to deployable AWS Lambda with proven template pattern  
**Full content:** `full/make-lambda.md`

### make-tv-app
**Triggers:** "make a tv app", "convert to tv", "make this tv-friendly"  
**Summary:** Creates fullscreen, keyboard-driven TV interface optimized for 10-foot viewing  
**Full content:** `full/make-tv-app.md`

### no-emojis-no-fluff
**Triggers:** Always active during communication  
**Summary:** No emojis in code files, use Tabler icons, matter-of-fact communication style  
**Full content:** `full/no-emojis-no-fluff.md`

### no-inline-styles
**Triggers:** When writing JavaScript/HTML  
**Summary:** Use CSS classes instead of inline styles, CSS variables for themes  
**Full content:** `full/no-inline-styles.md`

### prefer-controllers
**Triggers:** When creating ASP.NET Core APIs  
**Summary:** Use proper MVC Controllers instead of minimal API MapGet/MapPost patterns  
**Full content:** `full/prefer-controllers.md`

### refactor
**Triggers:** "/refactor"  
**Summary:** Reads refactor.txt for quick architectural alignment checks  
**Full content:** `full/refactor.md`

### refresh-me
**Triggers:** "refresh me", "I have selective amnesia", "tell me about this"  
**Summary:** Provides brief high-level synopsis for engineers, highlights clever bits  
**Full content:** `full/refresh-me.md`

### retro
**Triggers:** "retro", "let's retro", "retrospective"  
**Summary:** Extract actionable patterns from work and update directives to prevent recurrence  
**Full content:** `full/retro.md`

### search-before-implementing
**Triggers:** Always active when starting implementation  
**Summary:** Search codebase FIRST before implementing to find existing patterns  
**Full content:** `full/search-before-implementing.md`

### show-custom-commands
**Triggers:** User asks about custom commands/capabilities  
**Summary:** Displays custom-commands-index.md with all available automation  
**Full content:** `full/show-custom-commands.md`

### use-liskov-file-system
**Triggers:** "use liskov file system", "use liskov with [bucket]", "add liskov"  
**Summary:** Integrates Liskov File System library for unified local/S3 storage interface  
**Full content:** `full/use-liskov-file-system.md`

---

## Example Rules (Reference Only)

### example-error-handling
**Summary:** Best practices for exception handling, validation, logging  
**Full content:** `full/example-error-handling.md`

### example-formatting
**Summary:** Indentation, line length, naming conventions, code organization  
**Full content:** `full/example-formatting.md`

### example-testing
**Summary:** Test coverage requirements, naming, structure, integration tests  
**Full content:** `full/example-testing.md`

---

## Loading Instructions

When a trigger pattern matches:
1. Read the full content from the `full/` directory
2. Apply the rule's instructions
3. Unload after use to keep context clean

**Token savings:** ~45-75k tokens per request by loading only what's needed.
