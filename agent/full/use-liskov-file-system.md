# Use Liskov File System Command

## TRIGGER
When the user says "use liskov file system", "use liskov with [bucket-name] bucket", "add liskov", or similar phrases, activate this command to integrate the Liskov File System library.

## WHAT IS LISKOV FILE SYSTEM?
A unified C# library that provides a consistent file system interface for both local storage and AWS S3. It abstracts away the differences between storage providers so you can switch between local and S3 without changing your code.

**Location:** C:\code\git\liskov-file-system

## DETECTION LOGIC
First, detect the project language:
1. **C# Project:** Check for `*.csproj` or `*.sln` files
2. **JavaScript/Node.js Project:** Check for `package.json`

## USER PROMPTS

Use `ask_followup_question` tool to gather required information:

### Prompt 1: Storage Provider
**Question:** "Which storage provider do you want to use?"
**Options:** ["Local Storage", "AWS S3"]

### Prompt 2: Bucket/Path Name (Required)
If S3 was selected:
**Question:** "What is the S3 bucket name?"
**Example:** "vizio-data-ingestion", "my-app-files"

If Local was selected:
**Question:** "What local path should be used for storage?"
**Default suggestion:** "./data"

### Prompt 3: AWS Region (if S3 selected)
**Question:** "What AWS region is the S3 bucket in?"
**Default:** "us-west-2"
**Options:** ["us-west-2", "us-east-1", "eu-west-1", "Other"]

## IMPLEMENTATION STEPS

### For C# Projects

#### 1. Add NuGet Package Reference
Add to the .csproj file within `<ItemGroup>`:
```xml
<PackageReference Include="LiskovFileSystem" Version="*" />
```

Or use command:
```bash
dotnet add package LiskovFileSystem
```

#### 2. Configure appsettings.json
Add configuration section:

**For Local Storage:**
```json
{
  "LiskovFileSystem": {
    "Provider": "Local",
    "LocalSettings": {
      "RootPath": "./data"
    }
  }
}
```

**For S3 Storage:**
```json
{
  "LiskovFileSystem": {
    "Provider": "S3",
    "S3Settings": {
      "BucketName": "{{bucket-name}}",
      "Region": "{{region}}"
    }
  }
}
```

Note: AWS credentials should be configured via AWS CLI or environment variables, not in appsettings.json.

#### 3. Register Service in Program.cs
Add after `var builder = WebApplication.CreateBuilder(args);`:

```csharp
// Register Liskov File System
builder.Services.AddLiskovFileSystem(builder.Configuration);
```

Add using statement at top:
```csharp
using LiskovFileSystem;
```

#### 4. Create Example Usage File
Create `Services/FileService.cs` or similar:

```csharp
using LiskovFileSystem;

namespace {{ProjectName}}.Services
{
    public class FileService
    {
        private readonly IFileSystem _fileSystem;

        public FileService(IFileSystem fileSystem)
        {
            _fileSystem = fileSystem;
        }

        public async Task<string> ReadFileAsync(string path)
        {
            return await _fileSystem.ReadTextFileAsync(path);
        }

        public async Task WriteFileAsync(string path, string content)
        {
            await _fileSystem.WriteTextFileAsync(path, content);
        }

        public async Task<bool> FileExistsAsync(string path)
        {
            return await _fileSystem.FileExistsAsync(path);
        }

        public async Task<IEnumerable<string>> ListFilesAsync(string prefix = "")
        {
            return await _fileSystem.ListFilesAsync(prefix);
        }
    }
}
```

### For JavaScript/Node.js Projects

#### 1. Inform User About MCP Server
Since Liskov File System is primarily a C# library with an MCP server interface, inform the user:

"Liskov File System is available as an MCP server that you can connect to Cline. This allows you to use file system operations through MCP tools rather than direct library integration.

To use it:
1. Start the Liskov API: `cd C:\code\git\liskov-file-system\src\LiskovFileSystem.Api && dotnet run`
2. Build the MCP server: `cd C:\code\git\liskov-file-system\mcp-server && npm run build`
3. Configure it in Cline's MCP settings

Would you prefer to:
- Use it as an MCP server for Cline tool access
- Look for a JavaScript S3 library alternative (like `@aws-sdk/client-s3`)
"

## COMPLETION MESSAGE

After successful setup, inform the user:

### For C# Projects

```
Liskov File System integrated! ✅

**Configuration:**
- Provider: {{Local or S3}}
- {{Bucket/Path}}: {{bucket-name or path}}
{{- Region: {{region}} (if S3)}}

**Available via dependency injection:**
```csharp
public class MyService
{
    private readonly IFileSystem _fileSystem;
    
    public MyService(IFileSystem fileSystem)
    {
        _fileSystem = fileSystem;
    }
}
```

**Common operations:**
- Read text: `await _fileSystem.ReadTextFileAsync(path)`
- Write text: `await _fileSystem.WriteTextFileAsync(path, content)`
- Check exists: `await _fileSystem.FileExistsAsync(path)`
- List files: `await _fileSystem.ListFilesAsync(prefix)`
- Delete: `await _fileSystem.DeleteFileAsync(path)`
- Copy: `await _fileSystem.CopyFileAsync(source, dest)`
- Move: `await _fileSystem.MoveFileAsync(source, dest)`

**Switch providers:** Just change "Provider" in appsettings.json. Your code stays the same!
```

## IMPORTANT NOTES

1. **Provider Abstraction:** The beauty of Liskov is you can switch between Local and S3 by just changing configuration
2. **AWS Credentials:** For S3, ensure AWS CLI is configured or environment variables are set
3. **Self-Explanatory:** Once you know the bucket name, that's all you need - the interface is intuitive
4. **Testing:** Always test with local provider first, then switch to S3
5. **MCP Server Option:** Can also be used as an MCP server for tool-based access
