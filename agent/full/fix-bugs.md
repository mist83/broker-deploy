# Fix Bugs - Automated Bug Resolution

## TRIGGER
When the user says "fix bugs", "resolve bugs", "address bugs", or similar phrases requesting bug fixes.

## PURPOSE
Close the feedback loop by fetching reported bugs from Bug Beacon tracker, allowing user to select which to fix, then creating DallAIre tasks with full bug context.

## BUG BEACON API

**Base URL:** https://45dnvlvxc7zcganiggt7asor7y0vrotm.lambda-url.us-west-2.on.aws

**Endpoints:**
- GET `/api/bugs/list` - List all reported bugs
- GET `/api/bugs/{id}` - Get specific bug details
- DELETE `/api/bugs/{id}` - Delete bug after fixing

## IMPLEMENTATION STEPS

### Step 1: Fetch Bug List
```powershell
$response = Invoke-RestMethod -Uri "https://45dnvlvxc7zcganiggt7asor7y0vrotm.lambda-url.us-west-2.on.aws/api/bugs/list"
$bugs = $response.bugs
```

### Step 2: Present Bugs to User
Use `ask_followup_question` to let user select which bugs to fix:
- Show bug ID and timestamp
- Allow multiple selection
- Include "Fix all" option

### Step 3: Fetch Bug Details
For each selected bug:
```powershell
$bugDetails = Invoke-RestMethod -Uri "https://45dnvlvxc7zcganiggt7asor7y0vrotm.lambda-url.us-west-2.on.aws/api/bugs/$bugId"
```

### Step 4: Create Fix Task
Create a task in DallAIre with comprehensive context:

**Task Prompt Format:**
```
Fix bug: {Bug ID}

URL: {bug.url}
Timestamp: {bug.timestamp}

User Context:
{bug.userContext}

Errors ({count}):
{formatted error list with stack traces}

Please analyze these errors, identify the root cause, and implement a fix.
```

### Step 5: Delete Fixed Bugs
After task created successfully:
```powershell
Invoke-RestMethod -Uri "https://45dnvlvxc7zcganiggt7asor7y0vrotm.lambda-url.us-west-2.on.aws/api/bugs/$bugId" -Method Delete
```

## USER WORKFLOW

1. User encounters error in DallAIre
2. Bug Beacon FAB appears (red bug icon)
3. User opens panel, adds context
4. SHIFT+click "Auto Fix" → submits to tracker
5. Later: User says "fix bugs"
6. Cline lists bugs, user selects
7. Task created with full context
8. Bug automatically deleted after task creation

## COMPLETION MESSAGE

After creating tasks:
```
Created {count} bug fix tasks:
- Task {taskId}: {Bug ID}
- ...

Bugs automatically deleted from tracker.
Navigate to Tasks tab to monitor progress.
```

## IMPORTANT NOTES

1. **Auto-delete after task creation** - Bug is removed from tracker once task is queued
2. **Full context preservation** - Stack traces, user context, URL all included in task
3. **DallAIre integration** - Uses existing task creation API
4. **No manual cleanup needed** - Bugs vanish once addressed

## ERROR HANDLING

If bug fetch fails:
- Inform user tracker may be unavailable
- Suggest manual bug viewing at Lambda URL

If task creation fails:
- DO NOT delete bug from tracker
- Inform user to retry

## EXAMPLE USAGE

User: "fix bugs"
Cline: Lists 3 bugs with timestamps
User: Selects bugs 1 and 3
Cline: Creates 2 tasks with full error context, deletes bugs from tracker
Result: Tasks queued, bugs removed, loop closed
