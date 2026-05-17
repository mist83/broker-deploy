# Upload to mikesendpoint.com - Universal S3 Subdomain Deployment

## TRIGGER
When the user says "upload to mikesendpoint" or similar phrases, deploy the current workspace to a subdomain at mikesendpoint.com.

## PURPOSE
Universal deployment command that works from ANY repo. Automatically uses the workspace folder name as the subdomain.

## GATEKEEP
This command uses gatekeeping - requires button confirmation before deployment to prevent accidental uploads.

## DETECTION
Extract subdomain name from current workspace:
- Workspace path: `c:/code/git/my-project` → Subdomain: `my-project`
- Result: https://my-project.mikesendpoint.com

## DEPLOYMENT PATTERN

Uses the proven deployment system from c:/code/git/project-and:
- Script: `c:/code/git/project-and/scripts/deploy-subdomain.ps1`
- Bucket: `mikesendpoint-sites`
- Distribution: `E1M52KIEPYIWE5`
- Deployment time: 7-10 seconds

## IMPLEMENTATION STEPS

### Step 1: Extract Subdomain Name
From current working directory, extract folder name:
```powershell
$workspacePath = Get-Location
$subdomainName = Split-Path $workspacePath -Leaf
$subdomainName = $subdomainName.ToLower() -replace '[^a-z0-9\-]', '-'
```

### Step 2: Confirm Deployment (GATEKEEP)
Use `ask_followup_question` with button confirmation:

**Question:** "Deploy this workspace to mikesendpoint.com?"

**Details to show:**
- Workspace: {current folder}
- Subdomain: {subdomain-name}.mikesendpoint.com
- Source: {current directory}
- Target: s3://mikesendpoint-sites/{subdomain-name}/

**Button:** ["Deploy to {subdomain-name}.mikesendpoint.com"]

**CRITICAL:** Do NOT proceed until button is clicked. If user responds with text, they're adjusting - handle accordingly.

### Step 3: Execute Deployment
Once confirmed, run:
```powershell
cd c:/code/git/project-and/scripts
.\deploy-subdomain.ps1 {subdomain-name} {workspace-path}
```

### Step 4: Report Success
After deployment completes:
```
Deployed to: https://{subdomain-name}.mikesendpoint.com

Deployment time: X seconds
Files uploaded: Y files

Wait 30-60 seconds for cache invalidation, then test the site.
```

## SUBDOMAIN NAME RULES

- Convert to lowercase
- Replace invalid characters with hyphens
- Valid: `my-project`, `test-app`, `demo-123`
- Invalid chars: Spaces, underscores, special chars → Convert to hyphens

## DEPLOYMENT CONFIGURATION

**Script Location:** `c:/code/git/project-and/scripts/deploy-subdomain.ps1`

**Parameters:**
- SubdomainName: Extracted from folder name
- SourceFolder: Current workspace path

**Infrastructure (already set up):**
- S3 Bucket: mikesendpoint-sites
- CloudFront: E1M52KIEPYIWE5
- Domain: *.mikesendpoint.com
- Certificate: Validated and ready

## EXAMPLE WORKFLOWS

### Example 1: Deploy Dashboard
```
Working directory: c:/code/git/my-dashboard
User: "upload to mikesendpoint"
Extracted subdomain: "my-dashboard"
Deployment: https://my-dashboard.mikesendpoint.com
```

### Example 2: Deploy Test Site
```
Working directory: c:/code/git/test-site
User: "upload to mikesendpoint"
Extracted subdomain: "test-site"
Deployment: https://test-site.mikesendpoint.com
```

### Example 3: Custom Name (Override)
```
Working directory: c:/code/git/project-x
User: "upload to mikesendpoint as demo"
Extracted subdomain: "demo" (override folder name)
Deployment: https://demo.mikesendpoint.com
```

## OVERRIDE PATTERN

If user specifies "as {name}", use that instead of folder name:
- "upload to mikesendpoint as demo" → demo.mikesendpoint.com
- "upload to mikesendpoint as test-123" → test-123.mikesendpoint.com

## ERROR HANDLING

**If script doesn't exist:**
```
ERROR: Deployment script not found at c:/code/git/project-and/scripts/deploy-subdomain.ps1
Cannot proceed with deployment.
```

**If infrastructure not configured:**
```
ERROR: Infrastructure not configured. Run setup-infrastructure.ps1 first.
Location: c:/code/git/project-and/scripts/setup-infrastructure.ps1
```

**If invalid subdomain name:**
```
ERROR: Invalid subdomain name: {name}
Must use lowercase letters, numbers, and hyphens only.
```

## CONFIRMATION MESSAGE

After successful deployment:
```
Deployed to mikesendpoint.com! ✅

URL: https://{subdomain-name}.mikesendpoint.com
Files: {count} uploaded
Time: {seconds} seconds

Cache invalidation in progress (30-60 seconds).
Test your site after cache propagates.

Subdomain added to service directory: https://index.mikesendpoint.com
```

## SECURITY NOTE

Deployed sites are protected by CloudFront header validation:
- Requires X-Site-Key header from Chrome extension
- Without extension: 403 Forbidden
- Exception: favicon.ico always loads

## IMPORTANT

This is a GLOBAL rule - works from any workspace. The deployment scripts in project-and are the canonical implementation and should not be modified without updating this rule.

## TONE

Direct and efficient:
- "Deploying to my-project.mikesendpoint.com..."
- "Deployment complete: 8.2 seconds"
- "Site live at https://my-project.mikesendpoint.com"

Not:
- "Great! I'll deploy this for you..."
