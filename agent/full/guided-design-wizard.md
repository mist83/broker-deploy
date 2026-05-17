# Guided Design Wizard - HTML Questionnaire Version

## TRIGGER
When the user says any of:
- "design wizard"
- "app wizard"
- "click-through design"
- "turn this into an app"
- "guide me with html questionnaire"
- "questionnaire wizard"

## PHILOSOPHY
Transform vague ideas into concrete app specifications through an HTML questionnaire. Answer everything at once in a browser instead of back-and-forth chat.

**Goal:** Parallelism. Fill out form, copy synopsis, paste back to Cline.

## LIBRARY LOCATION
```
c:\code\git\ask-me\
```

**Files:**
- `questionnaire-template.html` - HTML template with placeholders
- `guided-design-wizard.clinerules` - Canonical rule (this is a reference copy)
- `README.md` - Full documentation and patterns

## IMPLEMENTATION STEPS

### Step 1: Analyze User Request
Extract key information:
- What they want to build
- Mentioned features
- Technical preferences
- Constraints

### Step 2: Determine Relevant Questions
Select 5-10 questions to clarify:
- Technical stack
- Architecture
- Features
- Deployment
- Integrations

### Step 3: Determine Input Types
For each question, choose:
- **Radio buttons** (single choice): Deployment model, primary tech stack, UI style
- **Checkboxes** (multiple choice): External services, data sources, features, integrations

### Step 4: Generate Questionnaire HTML
1. Read template from `c:\code\git\ask-me\questionnaire-template.html`
2. Replace `{{PROJECT_NAME}}` with project name
3. Replace `{{PROJECT_DESCRIPTION}}` with brief explanation of what's being built
4. Generate questions HTML using patterns from `c:\code\git\ask-me\README.md`
5. Replace `{{QUESTIONS}}` with generated HTML
6. Write to Desktop as `design-questionnaire-[timestamp].html`

### Step 5: Open in Browser
```powershell
start "C:\Users\{{username}}\Desktop\design-questionnaire-[timestamp].html"
```

### Step 6: Wait for User Response
Inform user:
```
Questionnaire generated: design-questionnaire-[timestamp].html

Instructions:
1. Fill out the questionnaire in your browser
2. Review the "Answer Synopsis" at the bottom
3. Click "Copy to Clipboard"
4. Paste the synopsis back here

I'll use your answers to create a complete implementation plan.
```

### Step 7: Process User's Synopsis
When user pastes synopsis:
- Parse their answers
- Create implementation plan
- Generate task with step-by-step checklist
- Proceed with implementation

## QUESTION HTML PATTERNS

See `c:\code\git\ask-me\README.md` for complete patterns.

**Quick reference:**
- Radio button: Single choice with "Decide later" first (checked)
- Checkbox: Multiple choice with "Decide later" first (checked)
- Both include: Additional notes textarea

## IMPORTANT NOTES

1. **Always "Decide later" first** - Default checked option
2. **Always include notes field** - On every question
3. **Throwaway HTML** - One-time use, no version control
4. **Desktop location** - Easy to find and delete
5. **Timestamp in filename** - Prevents collisions

## FINAL OUTPUT FORMAT

When user pastes synopsis back:
```
Received your design answers! ✅

**Project Summary:**
{{One-sentence project description}}

**Technical Stack:**
- {{Backend}}
- {{Frontend}}
- {{Database}}
- {{Deployment}}

**Key Features:**
- {{Feature 1}}
- {{Feature 2}}
- {{Feature 3}}

Creating implementation plan...
```

Then use /newtask to create task with step-by-step checklist.

## TONE

Direct and functional:
- "Questionnaire generated at [path]"
- "Fill it out, copy synopsis, paste back"

Not:
- "Great! I've created an amazing..."
