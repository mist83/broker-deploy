# Auto-Deploy Slack Notifications - Global Rule

## TRIGGER
After any successful Lambda deployment that completes with a Function URL.

## PURPOSE
Automatically post to Slack whenever you deploy an app, providing immediate notification with the deployed URL.

## ACTIVATION
This rule activates automatically after:
- Successful `dotnet lambda deploy-function` completion
- AWS CLI returns Function URL
- Deployment script finishes without errors

## SLACK CONFIGURATION

**Hardcoded Values:**
- Channel ID: C07J7THR8KF
- User ID: U01SCCXAQSF
- Private: false (public channel)
- Endpoint: https://3y5fdemhmbauwcyo7jc2eib5te0zsuer.lambda-url.us-west-2.on.aws/Slack/chat

## EMOJI ROTATION

Random emoji pool for variety:
- :rocket: - For most deployments
- :globe_with_meridians: - For web apps
- :sparkles: - For new features
- :tada: - For major releases
- :satellite: - For APIs
- :zap: - For performance updates
- :package: - For deployments

## MESSAGE FORMAT

```
{emoji} {ProjectName} deployed
{LambdaUrl}?cacheBust={timestamp}
```

**Example:**
```
:rocket: DallAIre deployed
https://abc123.lambda-url.us-west-2.on.aws?cacheBust=1732847097
```

## IMPLEMENTATION

After deployment script completes successfully, execute:

```powershell
# Get current timestamp for cache bust
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

# Random emoji selection
$emojis = @(':rocket:', ':globe_with_meridians:', ':sparkles:', ':tada:', ':satellite:', ':zap:', ':package:')
$emoji = $emojis | Get-Random

# Get project/function name from deployment config or context
$projectName = "App"  # Replace with actual project name from context

# Get Lambda URL from deployment output or AWS CLI
$lambdaUrl = "https://your-function.lambda-url.us-west-2.on.aws"  # Replace with actual URL

# Format message
$message = "$emoji $projectName deployed`n${lambdaUrl}?cacheBust=$timestamp"

# Post to Slack
try {
    $response = Invoke-RestMethod -Uri "https://3y5fdemhmbauwcyo7jc2eib5te0zsuer.lambda-url.us-west-2.on.aws/Slack/chat?message=$([uri]::EscapeDataString($message))&channelId=C07J7THR8KF&userId=U01SCCXAQSF&isPrivate=false" -Method Post -Headers @{"accept"="*/*"; "Content-Type"="application/json-patch+json"} -Body "{}"
    
    Write-Host "Slack notification sent!" -ForegroundColor Green
} catch {
    Write-Host "Slack notification failed (non-blocking): $_" -ForegroundColor Yellow
}
```

## INTEGRATION WITH DEPLOYMENT SCRIPTS

To integrate with your deployment scripts, add this snippet after successful deployment:

```powershell
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment successful!" -ForegroundColor Green
    
    if ($config.'function-url-enable') {
        $functionUrl = aws lambda get-function-url-config `
            --function-name $config.'function-name' `
            --region $config.region `
            --query 'FunctionUrl' `
            --output text
        
        if ($functionUrl) {
            # AUTO-DEPLOY SLACK NOTIFICATION
            $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
            $emojis = @(':rocket:', ':globe_with_meridians:', ':sparkles:', ':tada:', ':satellite:', ':zap:', ':package:')
            $emoji = $emojis | Get-Random
            $projectName = $config.'function-name'
            $message = "$emoji $projectName deployed`n${functionUrl}?cacheBust=$timestamp"
            
            try {
                Invoke-RestMethod -Uri "https://3y5fdemhmbauwcyo7jc2eib5te0zsuer.lambda-url.us-west-2.on.aws/Slack/chat?message=$([uri]::EscapeDataString($message))&channelId=C07J7THR8KF&userId=U01SCCXAQSF&isPrivate=false" -Method Post -Headers @{"accept"="*/*"; "Content-Type"="application/json-patch+json"} -Body "{}" | Out-Null
                Write-Host "Slack notification sent!" -ForegroundColor Green
            } catch {
                Write-Host "Slack notification failed (non-blocking)" -ForegroundColor Yellow
            }
            
            # BROADCAST THOUGHT TO LIVE USAGE
            try {
                $thoughtData = @{
                    id = "deploy-$(Get-Date -Format 'yyyyMMddHHmmss')"
                    timestamp = (Get-Date).ToUniversalTime().ToString("o")
                    thought = "$emoji $projectName deployed - version $timestamp"
                    source = "auto-deploy"
                    metadata = @{
                        taskId = "deployment"
                        workspace = "lambda"
                        artifactType = $null
                    }
                } | ConvertTo-Json -Compress
                
                Invoke-RestMethod -Uri "${functionUrl}/api/thoughts/broadcast" -Method Post -ContentType "application/json" -Body $thoughtData | Out-Null
                Write-Host "Live Usage thought broadcasted!" -ForegroundColor Green
            } catch {
                Write-Host "Thought broadcast failed (non-blocking)" -ForegroundColor Yellow
            }
        }
    }
}
```

## USAGE NOTES

1. **Non-Blocking** - If Slack notification fails, deployment is still considered successful
2. **Cache Busting** - Always includes Unix timestamp to force fresh page loads
3. **Random Emoji** - Adds variety to notifications
4. **Project Name** - Automatically derived from function name in deployment config
5. **URL Validation** - Only sends notification if Function URL is available

## ERROR HANDLING

Slack notification errors are caught and logged but do not fail the deployment. This ensures:
- Deployment success is not dependent on Slack availability
- Network issues don't block deployments
- Missing configuration doesn't cause failures

## GLOBAL SCOPE

This rule applies to ALL projects that deploy to AWS Lambda with Function URLs enabled. No per-project configuration needed.

To disable for a specific deployment, comment out the Slack notification section in the deployment script.
