using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add Lambda hosting
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

// Add memory cache
builder.Services.AddMemoryCache();

// Add CORS for public CSS access
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

// Serve static files from project root (where index.html, tabs/, etc. are located)
var projectRoot = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", ".."));

// Default file serving (index.html) - MUST come before UseStaticFiles
app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(projectRoot),
    RequestPath = ""
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(projectRoot),
    RequestPath = ""
});

// Health check
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Dynamic CSS generation endpoint
app.MapGet("/style.css", async (HttpContext context, IMemoryCache cache) =>
{
    var query = context.Request.Query;
    
    // Extract parameters
    var primary = query["primary"].ToString() ?? "0071CE";
    var secondary = query["secondary"].ToString() ?? "FFC220";
    var baseStyle = query["base"].ToString() ?? "walmart";
    var theme = query["theme"].ToString();
    var cacheSeconds = int.TryParse(query["cache"].ToString(), out var c) ? c : 300;
    
    // Validate hex colors
    primary = ValidateHexColor(primary);
    secondary = ValidateHexColor(secondary);
    
    // Generate cache key
    var cacheKey = GenerateCacheKey(primary, secondary, baseStyle, theme);
    
    // Try get from cache
    if (cache.TryGetValue<string>(cacheKey, out var cachedCss))
    {
        return Results.Content(cachedCss, "text/css", Encoding.UTF8);
    }
    
    // Generate CSS
    var css = await GenerateCSS(primary, secondary, baseStyle, theme);
    
    // Cache for 1 hour
    cache.Set(cacheKey, css, TimeSpan.FromHours(1));
    
    // Set cache headers
    context.Response.Headers["Cache-Control"] = $"max-age={cacheSeconds}, must-revalidate";
    
    return Results.Content(css, "text/css", Encoding.UTF8);
});

// Colors only endpoint
app.MapGet("/colors.css", async (HttpContext context, IMemoryCache cache) =>
{
    var query = context.Request.Query;
    var primary = ValidateHexColor(query["primary"].ToString() ?? "0071CE");
    var secondary = ValidateHexColor(query["secondary"].ToString() ?? "FFC220");
    var baseStyle = query["base"].ToString() ?? "walmart";
    var cacheSeconds = int.TryParse(query["cache"].ToString(), out var c) ? c : 300;
    
    var cacheKey = $"colors-{primary}-{secondary}-{baseStyle}";
    
    if (cache.TryGetValue<string>(cacheKey, out var cachedCss))
    {
        return Results.Content(cachedCss, "text/css", Encoding.UTF8);
    }
    
    var css = await GenerateColorsCSS(primary, secondary, baseStyle);
    cache.Set(cacheKey, css, TimeSpan.FromHours(1));
    
    context.Response.Headers["Cache-Control"] = $"max-age={cacheSeconds}, must-revalidate";
    return Results.Content(css, "text/css", Encoding.UTF8);
});

app.Run();

// Helper functions
string ValidateHexColor(string color)
{
    if (string.IsNullOrEmpty(color)) return "0071CE";
    
    color = color.TrimStart('#');
    
    if (color.Length == 6 && color.All(c => "0123456789ABCDEFabcdef".Contains(c)))
    {
        return color.ToUpper();
    }
    
    return "0071CE";
}

string GenerateCacheKey(string primary, string secondary, string baseStyle, string? theme)
{
    var input = $"{primary}-{secondary}-{baseStyle}-{theme}";
    using var md5 = MD5.Create();
    var hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
    return Convert.ToHexString(hash);
}

async Task<string> GenerateCSS(string primary, string secondary, string baseStyle, string? theme)
{
    var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    
    // For now, generate CSS with @import and cache busting
    var css = new StringBuilder();
    
    css.AppendLine("/**");
    css.AppendLine($" * Dynamic Styles - Generated {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
    css.AppendLine($" * Primary: #{primary}");
    css.AppendLine($" * Secondary: #{secondary}");
    css.AppendLine($" * Base: {baseStyle}");
    if (!string.IsNullOrEmpty(theme)) css.AppendLine($" * Theme: {theme}");
    css.AppendLine(" */");
    css.AppendLine();
    
    // Import base colors with cache busting
    css.AppendLine($"@import url('https://ui.mullmania.com/{baseStyle}/colors.css?v={timestamp}');");
    css.AppendLine($"@import url('https://ui.mullmania.com/{baseStyle}/layout.css?v={timestamp}');");
    css.AppendLine();
    
    // Override colors
    css.AppendLine(":root {");
    css.AppendLine($"    --color-primary: #{primary};");
    css.AppendLine($"    --color-secondary: #{secondary};");
    css.AppendLine("}");
    css.AppendLine();
    
    // Apply theme if specified
    if (!string.IsNullOrEmpty(theme))
    {
        css.AppendLine($"/* Theme hint: {theme} */");
    }
    
    return css.ToString();
}

async Task<string> GenerateColorsCSS(string primary, string secondary, string baseStyle)
{
    var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    
    var css = new StringBuilder();
    
    css.AppendLine("/**");
    css.AppendLine($" * Dynamic Colors - Generated {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
    css.AppendLine($" * Primary: #{primary}");
    css.AppendLine($" * Secondary: #{secondary}");
    css.AppendLine(" */");
    css.AppendLine();
    
    css.AppendLine($"@import url('https://ui.mullmania.com/{baseStyle}/colors.css?v={timestamp}');");
    css.AppendLine();
    
    css.AppendLine(":root {");
    css.AppendLine($"    --color-primary: #{primary};");
    css.AppendLine($"    --color-secondary: #{secondary};");
    css.AppendLine("}");
    
    return css.ToString();
}
