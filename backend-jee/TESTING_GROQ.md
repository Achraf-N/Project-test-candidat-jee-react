# Testing Groq Open Question Scoring

## Step 1: Set Groq API Key

```powershell
$env:GROQ_API_KEY="gsk_your_api_key_here"
```

Get your key from: https://console.groq.com/keys

## Step 2: Build and Deploy

```powershell
cd C:\Users\ASUS\Desktop\S7\jee\projects\testing-platform-jEE
./mvnw clean package -DskipTests
```

Copy `target/api-rest-1.0-SNAPSHOT.war` to WildFly deployments folder and restart.

## Step 3: Check Configuration

```powershell
curl http://localhost:8080/api-rest-1.0-SNAPSHOT/scoring/health
```

Expected response:
```json
{"status": "ready", "groqApiKey": "set"}
```

## Step 4: Test Scoring Endpoint

### Using curl:

```powershell
curl -X POST "http://localhost:8080/api-rest-1.0-SNAPSHOT/scoring/open-question" `
  -H "Content-Type: application/json" `
  -d '{
    "questionId": 3,
    "studentAnswer": "Dependency injection is when you pass objects to a class instead of creating them inside",
    "modelAnswer": "Dependency injection is a design pattern where objects receive their dependencies from external sources rather than creating them internally",
    "maxPoints": 15
  }'
```

### Using Postman:

**Request:**
- Method: `POST`
- URL: `http://localhost:8080/api-rest-1.0-SNAPSHOT/scoring/open-question`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "questionId": 3,
  "studentAnswer": "Dependency injection is when you pass objects to a class instead of creating them inside",
  "modelAnswer": "Dependency injection is a design pattern where objects receive their dependencies from external sources rather than creating them internally",
  "maxPoints": 15
}
```

**Expected Response:**
```json
{
  "questionId": 3,
  "score": 12,
  "feedback": "Good understanding of the core concept, but missing details about benefits like testability and loose coupling.",
  "maxPoints": 15
}
```

## Step 5: Test with Different Answers

### Perfect Answer (should get max points):
```json
{
  "questionId": 3,
  "studentAnswer": "Dependency injection is a design pattern where objects receive their dependencies from external sources rather than creating them internally",
  "modelAnswer": "Dependency injection is a design pattern where objects receive their dependencies from external sources rather than creating them internally",
  "maxPoints": 15
}
```
Expected score: 15/15

### Poor Answer (should get low score):
```json
{
  "questionId": 3,
  "studentAnswer": "I don't know",
  "modelAnswer": "Dependency injection is a design pattern where objects receive their dependencies from external sources rather than creating them internally",
  "maxPoints": 15
}
```
Expected score: 0-2/15

### Partial Answer:
```json
{
  "questionId": 3,
  "studentAnswer": "It's a design pattern",
  "modelAnswer": "Dependency injection is a design pattern where objects receive their dependencies from external sources rather than creating them internally",
  "maxPoints": 15
}
```
Expected score: 3-5/15

## Troubleshooting

### Error: "GROQ_API_KEY environment variable is not set"
- Ensure environment variable is set: `$env:GROQ_API_KEY="gsk_..."`
- Restart WildFly after setting the variable

### Error: "Connection refused" or timeout
- Check internet connection
- Verify Groq API is accessible: `curl https://api.groq.com`
- Check firewall settings

### Error: "Invalid API key"
- Verify API key is correct
- Generate new key at https://console.groq.com/keys

### Low/unexpected scores
- Groq's AI evaluation may vary slightly
- Temperature is set to 0.3 for consistency
- Review the feedback field for explanation
