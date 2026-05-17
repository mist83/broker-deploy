# Prefer Controllers Over Minimal APIs

## TRIGGER
ALWAYS ACTIVE - When creating or modifying ASP.NET Core APIs.

## PHILOSOPHY
Use proper MVC Controllers instead of minimal API (MapGet/MapPost) patterns. Controllers provide better organization, testability, and maintainability.

## RULES

### Always Use Controllers For:
- REST API endpoints
- Any HTTP endpoint beyond simple redirects
- Business logic that requires services

### Controller Structure
```csharp
[ApiController]
[Route("api/[controller]")]
public class MyController : ControllerBase
{
    private readonly IService _service;
    
    public MyController(IService service)
    {
        _service = service;
    }
    
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        // Implementation
    }
}
```

### Organize Code
- **Controllers/** - API endpoints
- **Services/** - Business logic
- **Models/** - Data structures
- **Program.cs** - Minimal, just registration and middleware

### Program.cs Should Only:
- Register services
- Configure middleware
- Add controllers with `builder.Services.AddControllers()`
- Map controllers with `app.MapControllers()`
- Simple redirects (like "/" → "/index.html")

### What NOT to Put in Program.cs:
- Business logic
- Multiple MapGet/MapPost endpoints
- Complex HTTP handlers
- Data access logic

## BENEFITS
- **Testability** - Controllers are easily unit tested
- **Organization** - Clear separation of concerns
- **Scalability** - Easy to add more endpoints
- **Dependency Injection** - Built-in support
- **Attributes** - Rich routing and validation options

## EXAMPLE: BAD (Minimal API)
```csharp
app.MapGet("/api/users", async (UserService service) => {
    var users = await service.GetUsers();
    return Results.Ok(users);
});

app.MapPost("/api/users", async (User user, UserService service) => {
    await service.CreateUser(user);
    return Results.Created();
});
```

## EXAMPLE: GOOD (Controller)
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _service;
    
    public UsersController(UserService service)
    {
        _service = service;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _service.GetUsers();
        return Ok(users);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] User user)
    {
        await _service.CreateUser(user);
        return Created();
    }
}
```

## ENFORCEMENT
When you see minimal API patterns (MapGet, MapPost, etc.) with business logic:
1. Create appropriate Controller class
2. Move logic to Controller action methods
3. Update Program.cs to just use MapControllers()
4. Organize services in Services/ directory
5. Keep models in Models/ directory
