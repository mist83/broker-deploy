# Destank/Destink/Unslop Command

## TRIGGER
When the user says any of: "destank", "destink", "unslop", "unsloppify", "remove ai stink", "remove ai stank", "this code reeks of ai", "this is stinky with AI", "this is stanky with ai", or similar phrases indicating AI-generated code patterns should be removed.

## PHILOSOPHY
AI-generated code often has telltale patterns that make it obvious it wasn't written by a human. This command removes those patterns while maintaining functionality.

## DETECTION PATTERNS

### Code Patterns to Remove
1. **Overly verbose comments:**
   - "This function does X by doing Y and returns Z"
   - "Note: This was added to handle edge case..."
   - Comments explaining obvious things
   
2. **Sales pitch language:**
   - "amazing", "powerful", "elegant", "beautiful"
   - "This provides a robust solution..."
   - "leverages", "utilizes" (use "uses" instead)

3. **Legacy indicators:**
   - "This replaces the old..."
   - "Previously this was..."
   - "Changed from X to Y because..."

4. **AI conversation artifacts:**
   - "The user asked for..."
   - "As requested..."
   - References to prompts or instructions

5. **Excessive error handling boilerplate:**
   - Try-catch wrapping every single line
   - Redundant null checks
   - Over-defensive coding

6. **Redundant type annotations:**
   - `string myString = "hello"` → `var myString = "hello"`
   - Obvious type declarations

7. **Unnecessary abstractions:**
   - Interfaces with single implementations
   - Wrapper classes that just delegate
   - Factory patterns for simple object creation

### CSS Patterns to Remove
1. **Gradients** - Replace with flat colors
2. **Complex shadows** - Simplify or remove
3. **Excessive animations** - Remove non-functional ones
4. **Overly rounded corners** - Reduce border-radius

### Comment Patterns to Remove
1. **Region markers** - `#region`, `// #endregion`
2. **Divider comments** - `// =============================`
3. **TODO with excessive explanation** - Keep TODO, remove essay
4. **Commented-out code** - Remove entirely

## RULES FOR DESTANKING

### Must Maintain
1. **Functionality** - Code must work identically after destanking
2. **Clarity** - Simpler is better, but not at expense of meaning
3. **Naming** - Keep descriptive variable/function names

### Must Remove
1. **Emojis** - All emojis in code
2. **Gradients** - Replace with solid colors
3. **Verbose comments** - Keep technical notes, remove explanations
4. **AI artifacts** - Any reference to prompts, users, or generation
5. **Legacy mentions** - Don't document what changed, just the current state
6. **Sales language** - Direct technical language only

### Must Simplify
1. **Nested wrappers** - Flatten unnecessary nesting
2. **Redundant abstractions** - Remove single-use interfaces/wrappers
3. **Over-defensive code** - Reasonable error handling only
4. **Complex CSS** - Flat design, minimal effects

## EXECUTION PROCESS

1. **Scan all code files** for detection patterns
2. **Remove AI stink** systematically
3. **Verify functionality** unchanged
4. **Run again** to double-check (destanking is not partial)
5. **Report changes** made

## EXAMPLE TRANSFORMATIONS

### Before (Stinky):
```csharp
// This is an amazing helper function that leverages the power of
// async/await to fetch user data from the API. Previously, this
// was implemented using callbacks, but we changed it to provide
// a more elegant solution.
public async Task<User> GetUserAsync(string userId)
{
    try
    {
        // The user requested that we add validation here
        if (string.IsNullOrEmpty(userId))
        {
            throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
        }
        
        // This utilizes the HTTP client to make the request
        var response = await _httpClient.GetAsync($"/api/users/{userId}");
        
        // Handle the response
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Failed to fetch user: {response.StatusCode}");
        }
        
        return await response.Content.ReadFromJsonAsync<User>();
    }
    catch (Exception ex)
    {
        // Log the error for debugging purposes
        _logger.LogError(ex, "Error fetching user");
        throw;
    }
}
```

### After (Destanked):
```csharp
// Fetch user by ID from API
public async Task<User> GetUserAsync(string userId)
{
    if (string.IsNullOrEmpty(userId))
        throw new ArgumentException("User ID required", nameof(userId));
    
    var response = await _httpClient.GetAsync($"/api/users/{userId}");
    response.EnsureSuccessStatusCode();
    
    return await response.Content.ReadFromJsonAsync<User>();
}
```

### CSS Before (Stinky):
```css
.button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    border-radius: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 15px 50px rgba(0,0,0,0.4);
}
```

### CSS After (Destanked):
```css
.button {
    background: #667eea;
    border: 1px solid #5568d3;
    border-radius: 4px;
}

.button:hover {
    background: #5568d3;
}
```

## COMPLETION MESSAGE

After destanking, report:
- Number of files processed
- Types of patterns removed
- Verification that functionality maintained
- Suggest running tests to confirm

## IMPORTANT NOTES

1. **Run to completion** - Not a partial operation
2. **Double-check** - Run scan twice to catch missed patterns
3. **Maintain functionality** - Critical requirement
4. **Be thorough** - Check all file types (code, CSS, HTML, etc.)
5. **No apologies** - Just report what was cleaned

## TONE

Be direct: "Removed verbose comments from 12 files. Replaced gradients with flat colors in 3 CSS files. Functionality verified."

Not: "Great! I've successfully cleaned up your code and it's looking much better now!"
