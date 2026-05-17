# Assign Port - Register New Project Port

## TRIGGER
When the user says "assign port", "register port", "add port", "new port for [project]", or similar phrases requesting port assignment.

## PURPOSE
Automatically assign and register a new port for a project using the Port Directory API.

## PORT DIRECTORY API

**Base URL:** https://jq654klina2q4yts42o5qkrp3m0yvlit.lambda-url.us-west-2.on.aws

**Endpoints:**
- GET `/api/ports` - List all ports
- GET `/api/ports/{projectName}` - Get specific port
- POST `/api/ports` - Add/update port (body: `{"projectName":"name","port":5001}`)
- DELETE `/api/ports/{projectName}` - Delete port
- GET `/api/ports/check/{port}` - Check if port in use

**Web Interface:** https://ports.mikesendpoint.com

## IMPLEMENTATION STEPS

### Step 1: Determine Project Name
If user provided project name, use it. Otherwise, ask:

**Question:** "What is the project name?"
**Validation:** Should be a valid project/folder name (alphanumeric, hyphens, underscores)

### Step 2: Determine Port Number
If user provided port, use it. Otherwise, randomly select an available port between 2000-9999.

To find random available port:
```powershell
$response = Invoke-RestMethod -Uri "https://jq654klina2q4yts42o5qkrp3m0yvlit.lambda-url.us-west-2.on.aws/api/ports"
$usedPorts = $response.ports | ForEach-Object { $_.port }
$randomPort = Get-Random -Minimum 2000 -Maximum 10000
while ($usedPorts -contains $randomPort) { 
    $randomPort = Get-Random -Minimum 2000 -Maximum 10000 
}
```

**Question:** "What port number? (Suggested: {randomPort})"
**Validation:** 2000-9999, not already in use

### Step 3: Check if Port is Available
```powershell
$checkResponse = Invoke-RestMethod -Uri "https://jq654klina2q4yts42o5qkrp3m0yvlit.lambda-url.us-west-2.on.aws/api/ports/check/$port"
if ($checkResponse.inUse) {
    # Port is taken, suggest another
}
```

### Step 4: Register Port
```powershell
$body = @{
    projectName = $projectName
    port = $port
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://jq654klina2q4yts42o5qkrp3m0yvlit.lambda-url.us-west-2.on.aws/api/ports" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Step 5: Confirm Registration
Report success with:
- Project name
- Assigned port
- Link to web interface

## COMPLETION MESSAGE

```
Port assigned! ✅

Project: {projectName}
Port: {port}

View all ports: https://ports.mikesendpoint.com

To use this port in your project:
dotnet run --urls "http://localhost:{port}"
```

## EXAMPLE WORKFLOWS

### Example 1: User provides everything
```
User: "assign port 5001 to my-api"
Cline: Checks if 5001 is available
Cline: Registers my-api on port 5001
Cline: Confirms registration
```

### Example 2: User provides project only
```
User: "assign port for dashboard-app"
Cline: Finds next available port (e.g., 5003)
Cline: Suggests port 5003
User: Confirms
Cline: Registers dashboard-app on port 5003
```

### Example 3: User provides nothing
```
User: "assign port"
Cline: "What is the project name?"
User: "analytics-service"
Cline: Finds next available port (e.g., 5004)
Cline: "What port number? (Suggested: 5004)"
User: "5004"
Cline: Registers analytics-service on port 5004
```

## ERROR HANDLING

**If port is already in use:**
```
Port {port} is already assigned to {existingProject}.
Suggested alternative: {nextAvailablePort}
```

**If project already has a port:**
```
Project {projectName} already has port {existingPort} assigned.
Do you want to update it to {newPort}?
```

**If API is unavailable:**
```
Port Directory API is unavailable. Please try again later.
```

## IMPORTANT NOTES

1. **Always check availability** before assigning
2. **Suggest next available** starting from 5000
3. **Confirm before registering** if user didn't provide port
4. **Update existing** if project already registered
5. **Link to web interface** in completion message

## TONE

Direct and helpful:
- "Port 5001 assigned to my-api"
- "Next available port: 5003"
- "View at https://ports.mikesendpoint.com"

Not:
- "Great! I've successfully assigned..."
