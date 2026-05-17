# Bug Beacon Shortcuts - Automatic Detection

## TRIGGER
When the user mentions any of these phrases, automatically fetch and analyze bugs from Bug Beacon:
- "bbfix"
- "bug beacon"
- "BB" (standalone, capital)
- "bug was beaconed"
- "check bug beacon"
- "info in bug beacon"
- "bug beacon has"
- "reported via bug beacon"

## ACTIVATION
Immediately fetch bug list without asking for confirmation or explanation.

## PROCESS

### Step 1: Fetch Bug List
```powershell
$response = Invoke-RestMethod -Uri "https://45dnvlvxc7zcganiggt7asor7y0vrotm.lambda-url.us-west-2.on.aws/api/bugs/list"
$bugs = $response.bugs
```

### Step 2: If Bugs Found
For each bug:
1. Fetch full details
2. Analyze the error
3. Identify root cause
4. Fix the issue
5. Delete bug from tracker after fix

### Step 3: Report Findings
Brief summary: "Found {count} bugs in Bug Beacon. Fixing..."

### Step 4: Auto-Delete After Fix
Once fix is deployed and verified:
```powershell
Invoke-RestMethod -Uri "https://45dnvlvxc7zcganiggt7asor7y0vrotm.lambda-url.us-west-2.on.aws/api/bugs/{bugId}" -Method Delete
```

## TONE
Direct and efficient:
- "Found 2 bugs in Bug Beacon"
- "Bug 1: insertBefore on null - fixed"
- "Bug 2: display name JSON - fixed"
- "Deleted bugs from tracker"

NOT:
- "Great! I found some bugs..."
- "Let me check Bug Beacon for you..."

## REMEMBER
This is a workflow accelerator. When user mentions Bug Beacon, I immediately check it without asking or explaining.
