# Quickstart - Just Run It

## TRIGGER
When the user says "quickstart", "just run it", "start this", "run this project", or similar phrases.

## PHILOSOPHY
Don't read docs. Don't ask questions. Just detect project type and run it.

## DETECTION & EXECUTION

### .NET Projects (C#)
**Detect:** `*.csproj` or `*.sln` files exist
**Run:**
```powershell
dotnet run
```

### Node.js Projects
**Detect:** `package.json` exists
**Run:**
```powershell
npm start
```
Or if no start script:
```powershell
npm install; node index.js
```

### Python Projects
**Detect:** `requirements.txt` or `*.py` files exist
**Run:**
```powershell
python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt; python main.py
```
Or if Flask:
```powershell
python app.py
```
Or if Django:
```powershell
python manage.py runserver
```

### Static HTML Projects
**Detect:** `index.html` exists but no other project files
**Run:**
```powershell
start index.html
```

### Docker Projects
**Detect:** `Dockerfile` or `docker-compose.yml` exists
**Run:**
```powershell
docker-compose up
```
Or:
```powershell
docker build -t app .; docker run -p 8080:8080 app
```

### Go Projects
**Detect:** `go.mod` exists
**Run:**
```powershell
go run main.go
```

### Rust Projects
**Detect:** `Cargo.toml` exists
**Run:**
```powershell
cargo run
```

### Ruby Projects
**Detect:** `Gemfile` exists
**Run:**
```powershell
bundle install; bundle exec ruby app.rb
```

## EXECUTION RULES

1. **Detect project type** by scanning for marker files
2. **Execute immediately** - no confirmation, no questions
3. **Report what you did** - one line only
4. **Show URL** if it's a web app

## MULTIPLE PROJECT TYPES

If multiple project types detected (e.g., Dockerfile + package.json):
- Prefer Docker if Dockerfile exists
- Otherwise use the most specific marker

## OUTPUT FORMAT

Just one line:
```
Running .NET app at http://localhost:5000
```

Or:
```
Running Node.js app at http://localhost:3000
```

Not:
```
Great! I've detected this is a .NET application and I'll start it for you...
```

## AFTER EXECUTION

Don't ask "Would you like me to..." or "Let me know if..."

Just:
```
App running at {URL}
```

## TONE

Direct:
- "Running .NET app"
- "Started at http://localhost:5000"
- "Docker container up"

Not:
- "I've successfully launched..."
- "Your application is now running..."
