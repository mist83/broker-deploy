# Fix Nitpicks - Automated UI Issue Resolution

## TRIGGER
When the user says any phrase containing "nit" related to fixing/removing them:
- "fix nitpicks"
- "fix nits"
- "resolve nitpicks"
- "obliterate nits"
- "address nitpicks"
- "nit fix"
- Or similar phrases requesting nitpick fixes

## PURPOSE
Close the feedback loop by fetching UI nitpicks from Nit Picker tracker, allowing user to select which to fix, then creating DallAIre tasks with full context.

## NIT PICKER API

**Base URL:** https://ap32hythbvomw6gm4t5amch5n40bpkqn.lambda-url.us-west-2.on.aws

**Endpoints:**
- GET `/api/nits/list` - List all nitpick files
- GET `/api/nits/{fileName}` - Get specific nitpick file
- DELETE `/api/nits/{fileName}` - Delete nitpick file after fixing

## IMPLEMENTATION STEPS

### Step 1: Fetch Nitpick List
```powershell
$response = Invoke-RestMethod -Uri "https://ap32hythbvomw6gm4t5amch5n40bpkqn.lambda-url.us-west-2.on.aws/api/nits/list"
$nitFiles = $response
```

### Step 2: Present Nitpicks to User
Use `ask_followup_question` to let user select which nitpick files to fix:
- Show fileName and timestamp
- Allow multiple selection
- Include "Fix all" option

### Step 3: Fetch Nitpick Details
For each selected file:
```powershell
$nitDetails = Invoke-RestMethod -Uri "https://ap32hythbvomw6gm4t5amch5n40bpkqn.lambda-url.us-west-2.on.aws/api/nits/$fileName"
```

### Step 4: Create Fix Task
Create a task in DallAIre with comprehensive context:

**Task Prompt Format:**
```
Fix UI nitpicks: {fileName}

Page URL: {nitDetails.pageUrl}
Timestamp: {nitDetails.timestamp}

Notes ({count}):
{formatted list of UI issues with selectors}

For each note:
- Selector: {note.selector}
- Element: {note.tagName}.{note.className}
- Issue: {note.note}

Please analyze these UI issues, identify the root cause, and implement fixes.
```

### Step 5: Delete Fixed Nitpicks
After task created successfully:
```powershell
Invoke-RestMethod -Uri "https://ap32hythbvomw6gm4t5amch5n40bpkqn.lambda-url.us-west-2.on.aws/api/nits/$fileName" -Method Delete
```

## USER WORKFLOW

1. User sees UI issue in app
2. UI Nit Picker FAB (orange target icon)
3. User clicks "Start Picking Elements"
4. User clicks problem element, adds note
5. User clicks "Send All Notes to API" → submits to tracker
6. Later: User says "fix nitpicks"
7. Cline lists nitpick files, user selects
8. Task created with full context
9. Nitpick file automatically deleted after task creation

## COMPLETION MESSAGE

After creating tasks:
```
Created {count} nitpick fix tasks:
- Task {taskId}: {fileName}
- ...

Nitpick files automatically deleted from tracker.
Navigate to Tasks tab to monitor progress.
```

## IMPORTANT NOTES

1. **Auto-delete after task creation** - Nitpick file is removed from tracker once task is queued
2. **Full context preservation** - Selectors, element info, user notes all included in task
3. **DallAIre integration** - Uses existing task creation API
4. **No manual cleanup needed** - Nitpicks vanish once addressed

## ERROR HANDLING

If nitpick fetch fails:
- Inform user tracker may be unavailable
- Suggest manual viewing at Lambda URL

If task creation fails:
- DO NOT delete nitpick file from tracker
- Inform user to retry

## EXAMPLE USAGE

User: "obliterate nits"
Cline: Lists 2 nitpick files with timestamps
User: Selects both
Cline: Creates 2 tasks with full UI issue context, deletes files from tracker
Result: Tasks queued, nitpicks removed, loop closed
