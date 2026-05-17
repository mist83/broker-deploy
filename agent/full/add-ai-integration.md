# Add AI Integration with CORS Proxy Pattern

## TRIGGER
When the user requests AI-powered features that need to fetch from external AI endpoints, use this pattern to avoid CORS issues.

## THE CORS PROBLEM
External AI endpoints often have misconfigured CORS headers (duplicate `Access-Control-Allow-Origin` values) that cause browser CORS errors when called directly from JavaScript.

**Example Error:**
```
Access-Control-Allow-Origin header contains multiple values '*, https://example.com', but only one is allowed
```

## THE SOLUTION: Backend Proxy Pattern

Instead of calling the AI endpoint directly from JavaScript, create a backend proxy endpoint that:
1. Receives requests from your frontend
2. Makes server-side HTTP calls to the AI service (no CORS)
3. Returns the response to your frontend

### Implementation Steps

#### 1. Add HttpClient to Backend (C#)

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
builder.Services.AddHttpClient();  // Add this line

var app = builder.Build();
```

#### 2. Create Proxy Endpoint

```csharp
// Program.cs - Add after app.UseStaticFiles()
app.MapPost("/api/ai/question", async (HttpClient httpClient) =>
{
    try
    {
        var aiEndpoint = "https://your-ai-endpoint.com/AI/create";
        var content = new StringContent("{\"queryType\":\"trivia\"}", System.Text.Encoding.UTF8, "application/json");
        
        var response = await httpClient.PostAsync(aiEndpoint, content);
        var result = await response.Content.ReadAsStringAsync();
        
        return Results.Content(result, "application/json");
    }
    catch (Exception ex)
    {
        return Results.Json(new { success = false, error = ex.Message });
    }
});
```

#### 3. Update JavaScript to Use Proxy

**Before (Direct call - causes CORS):**
```javascript
const AI_ENDPOINT = 'https://external-ai-service.com/AI/create';

fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queryType: 'trivia' })
}).then(r => r.json())
```

**After (Through proxy - no CORS):**
```javascript
const AI_ENDPOINT = '/api/ai/question';  // Local endpoint

fetch(AI_ENDPOINT, {
    method: 'POST'
}).then(r => r.json())
```

## WHY THIS WORKS

1. **Browser → Your Backend:** Same origin, no CORS check
2. **Your Backend → AI Service:** Server-to-server, no CORS restrictions
3. **Your Backend → Browser:** Same origin, no CORS check

The backend acts as a "CORS shield" - browsers don't apply CORS rules to server-to-server communication.

## IMPORTANT NOTES

1. **Always use this pattern** when integrating external AI services
2. **Don't add CORS headers** to your backend trying to "fix" external service CORS - it won't work
3. **Keep proxy simple** - just pass through requests, don't transform unless needed
4. **Error handling** - catch and return friendly errors
5. **Security** - consider rate limiting if the AI service has costs

## WHEN TO USE

Use this pattern whenever:
- External API has CORS issues
- You need to hide API keys (keep them server-side)
- You want to add rate limiting
- You need to transform/validate requests before sending to external service

## DEPLOYMENT

After implementing:
1. Test locally first
2. Deploy backend with new endpoint
3. Deploy frontend with updated fetch URL
4. Verify in browser console - no CORS errors should appear

This pattern has been used successfully in:
- Clue Commander AI Mode integration
- Other projects requiring external AI service calls
