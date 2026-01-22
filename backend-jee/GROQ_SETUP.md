# Groq API Setup for Open Question Scoring

## 1. Get Groq API Key

1. Visit https://console.groq.com/keys
2. Sign up or login
3. Create a new API key
4. Copy the key (starts with `gsk_...`)

## 2. Set Environment Variable

### Windows (PowerShell - Temporary):
```powershell
$env:GROQ_API_KEY="gsk_your_api_key_here"
```

### Windows (System Environment - Permanent):
1. Open Start Menu → Search "Environment Variables"
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "System variables", click "New"
5. Variable name: `GROQ_API_KEY`
6. Variable value: `gsk_your_api_key_here`
7. Click OK

### Linux/Mac:
```bash
export GROQ_API_KEY="gsk_your_api_key_here"
```

Add to `~/.bashrc` or `~/.zshrc` for permanent setup.

## 3. Restart WildFly

After setting the environment variable, restart WildFly server to pick up the new value.

```powershell
# Stop WildFly
Ctrl+C

# Start WildFly
cd C:\opt\wildfly-39.0.0.Beta1\bin
.\standalone.bat
```

## 4. Test Groq Integration

Use the service in your JEE application:

```java
@Inject
private GroqScoringService groqService;

OpenQuestionScoreRequest request = new OpenQuestionScoreRequest(
    3,
    "Dependency injection passes dependencies to objects",
    "Dependency injection is a design pattern where objects receive their dependencies from external sources",
    15
);

OpenQuestionScoreResponse result = groqService.scoreOpenQuestion(request);
// result.getScore() = 12
// result.getFeedback() = "Good understanding but missing details..."
```

## Features

- ✅ **No Python needed** - Pure JEE solution
- ✅ **Fast** - Groq returns responses in < 1 second
- ✅ **Smart** - Llama 3.3 70B model understands context
- ✅ **Feedback** - Provides explanation with score
- ✅ **Free tier** - 14,400 requests/day free

## API Details

- **Model**: `llama-3.3-70b-versatile`
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Temperature**: 0.3 (consistent scoring)
- **Max tokens**: 500
