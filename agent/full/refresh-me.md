# Refresh Me - Project Synopsis Command

## TRIGGER
When the user says any of:
- "refresh me"
- "I have selective amnesia"
- "tell me about this"
- "get me tf back up to speed"
- "what did we build"
- "give me the manager brief"
- Or similar phrases requesting a high-level overview

## COMMAND PREFIX
Can be forced with:
- `directive: refresh me`
- `force: refresh me`

## PHILOSOPHY
You're briefing a capable software engineer who can read code. They want:
- **High-level architecture** - not implementation details
- **Clever bits highlighted** - where you did something exceptional
- **Glue code ignored** - standard CRUD, obvious patterns, boilerplate
- **Brief and punchy** - manager synopsis that tickles the dev/nerd parts

## RULES

### What to Include
1. **Project purpose** - one sentence
2. **Key architectural decisions** - only the interesting ones
3. **Clever implementations** - highlight exceptional work
4. **Tech stack** - bullet points only
5. **Deployment model** - where/how it runs

### What to Exclude
1. Standard CRUD operations
2. Obvious REST API patterns
3. Basic file structures
4. Standard configuration
5. Boilerplate code

### Language Guidelines
- "Stored in cloud" NOT "stored in S3 via keys with async batch processing..."
- "Easily retrieved" NOT detailed query explanation
- Only include code snippets for truly exceptional implementations
- Use terms like "clever", "interesting", "notable" to flag special work
- Skip phrases like "implements standard", "follows typical pattern"

## OUTPUT FORMAT

```
# [Project Name]

[One sentence purpose]

## Key Architecture
- [Only interesting architectural choices]
- [Skip obvious patterns]

## Clever Bits
- [Highlight exceptional implementations]
- [Call out smart solutions]

## Tech Stack
- [Bulleted list]

## Deployment
- [Where/how it runs]

## Next Steps
- [What remains or how to use it]
```

## EXAMPLE (Good)

```
# Tixplain

Analyzes GitHub PRs and JIRA tickets to build an AI-powered semantic knowledge base of problem-solution patterns.

## Key Architecture
- **Idempotent repository caching** - checks existence before cloning, reuses across analyses
- **Dual storage model** - SQLite for speed, auto-syncs to S3 for persistence
- **Vector similarity search** - 1536-dim embeddings with cosine similarity for pattern recognition

## Clever Bits
- **Repository manager** applies PR changes locally for real diff analysis (not just API metadata)
- **Liskov File System abstraction** - transparent local/S3 switching without code changes
- **Semantic tag extraction** - AI generates searchable taxonomy automatically

## Tech Stack
- .NET 8 Lambda with Function URL
- Bedrock Claude + Titan Embeddings
- SQLite → S3 via Liskov
- Octokit + git CLI

## Deployment
Lambda with 2GB RAM, 5min timeout, Function URL enabled

## Next Steps
Configure GitHub/JIRA tokens, deploy with `.\scripts\deploy_tixplain.ps1`
```

## EXAMPLE (Bad - Too Verbose)

```
# Tixplain

This is a comprehensive ticket explanation and knowledge extraction system that has been designed to analyze GitHub pull requests and JIRA tickets using advanced AI capabilities. The system creates a searchable knowledge base...

## Architecture
- Uses ASP.NET Core Web API with standard REST endpoints
- Implements dependency injection for all services
- Has three controllers following standard MVC pattern
- Uses Entity Framework Core for database access
- Stores data in SQLite database with standard schema
- Implements standard CRUD operations...
[Goes on for pages about obvious stuff]
```

## IMPORTANT
This is for engineers who know how things work. They don't need:
- Explanations of what REST APIs are
- Details on how dependency injection works
- Standard patterns spelled out
- Boilerplate acknowledged

They DO need:
- What makes THIS implementation special
- Smart decisions that aren't obvious
- Trade-offs and why you picked them
- How to actually use it

Keep it punchy. Keep it interesting. Skip the obvious.
