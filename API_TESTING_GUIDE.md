# Complete FastAPI Testing Guide

## Quick Start

### 1. Start the Server
```bash
cd c:\Users\Maviya Shaikh\Desktop\HACK
python -m uvicorn ai_engine.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Access Swagger UI (Interactive Documentation)
Open your browser and navigate to:
```
http://localhost:8000/docs
```

This opens the **Swagger UI** where you can test all endpoints interactively.

Alternative OpenAPI documentation:
```
http://localhost:8000/redoc
```

---

## API Endpoints Overview

### **POST** `/analyze`
Full text analysis pipeline that evaluates narrative consistency, structure clarity, tone, and provides detailed explanations.

**Request Body:**
```json
{
  "text": "Your text here",
  "target_tone": "neutral"
}
```

**Response:**
```json
{
  "consistency_score": 0.85,
  "readability_score": 0.92,
  "detected_tone": "formal",
  "modified_text": "Modified text with tone adjustments",
  "changes": [
    {
      "type": "substitution",
      "before": "old word",
      "after": "new word"
    }
  ],
  "explanation": [
    "Detailed explanation of changes..."
  ]
}
```

---

## Testing Using Swagger UI (/docs)

### Step-by-Step Instructions

#### **Step 1: Access the Endpoint**
1. Navigate to `http://localhost:8000/docs`
2. Scroll down to find the **POST /analyze** endpoint
3. Click on it to expand the section

#### **Step 2: Click "Try it out"**
- Click the blue "Try it out" button on the right side

#### **Step 3: Enter Request Data**
The request body editor will appear. Enter your test data:

```json
{
  "text": "The quick brown fox jumps over the lazy dog. This is a very long sentence that contains many words and ideas.",
  "target_tone": "formal"
}
```

#### **Step 4: Execute the Request**
- Click the blue "Execute" button
- The API will process your request and return results below

#### **Step 5: View Response**
- **Response body**: Contains the analysis results
- **Status code**: Should be 200 (success) or 500 (error)
- **Response headers**: Metadata about the response

---

## Test Data Examples

### Example 1: Formal Tone Conversion
**Request:**
```json
{
  "text": "hey guys, this project is really awesome and I'm super excited about it lol",
  "target_tone": "formal"
}
```

**Expected Output Structure:**
- `consistency_score`: ~0.7-0.9
- `readability_score`: ~0.6-0.9
- `detected_tone`: "informal"
- `modified_text`: More formal version of the text
- `changes`: List of word/phrase replacements made

---

### Example 2: Informal Tone Conversion
**Request:**
```json
{
  "text": "The implementation of said algorithm demonstrated exceptional performance metrics and warranted comprehensive evaluation.",
  "target_tone": "informal"
}
```

**Expected Output Structure:**
- Tone-adjusted text becomes more casual
- Multiple changes documented in the `changes` array

---

### Example 3: Neutral Tone (Default)
**Request:**
```json
{
  "text": "I absolutely love this amazing product! It's wonderful and fantastic!",
  "target_tone": "neutral"
}
```

**Expected Output Structure:**
- Emotional language reduced
- More objective phrasing

---

### Example 4: Technical Content
**Request:**
```json
{
  "text": "The neural network architecture employs attention mechanisms to capture contextual relationships. The transformer model has revolutionized NLP tasks. We obtain SOTA results on multiple benchmarks.",
  "target_tone": "informal"
}
```

**Expected Output Structure:**
- Technical jargon potentially simplified
- More conversational tone

---

### Example 5: Long Document
**Request:**
```json
{
  "text": "When we examine the historical context of the technological revolution, we find that innovation has consistently driven societal progress. The emergence of digital systems has fundamentally transformed how we communicate, work, and interact. Through careful analysis of these mechanisms, we can better understand the trajectory of human advancement and prepare for future challenges.",
  "target_tone": "formal"
}
```

---

## Alternative Testing Methods

### Using cURL (Command Line)

#### Basic Request:
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "this is awesome",
    "target_tone": "formal"
  }'
```

#### With Pretty JSON Output:
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "what a cool project we have here",
    "target_tone": "formal"
  }' | python -m json.tool
```

---

### Using Python (requests library)

```python
import requests
import json

url = "http://localhost:8000/analyze"

payload = {
    "text": "This is a test sentence with informal language lol",
    "target_tone": "formal"
}

response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))
```

---

### Using PowerShell

```powershell
$body = @{
    text = "hey there, how is everything going?"
    target_tone = "formal"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/analyze" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json
```

---

## Request Parameters Explained

| Parameter | Type | Required | Default | Options | Description |
|-----------|------|----------|---------|---------|-------------|
| `text` | string | ✅ Yes | N/A | Any text | Input text to analyze (minimum 1 character) |
| `target_tone` | string | ❌ No | "neutral" | "formal", "informal", "neutral" | Desired output tone |

---

## Response Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `consistency_score` | float | Score indicating narrative consistency (0-1) |
| `readability_score` | float | Score indicating text readability (0-1) |
| `detected_tone` | string | The original detected tone of the input text |
| `modified_text` | string | The text converted to the target tone |
| `changes` | array | List of specific changes made (type, before, after) |
| `explanation` | array | Detailed explanations of the analysis and changes |

---

## Common Error Scenarios

### Error 1: Empty Text
**Request:**
```json
{
  "text": "",
  "target_tone": "neutral"
}
```
**Expected Response:** 422 Validation Error

---

### Error 2: Invalid Tone
**Request:**
```json
{
  "text": "Sample text",
  "target_tone": "sarcastic"
}
```
**Expected Response:** 422 Validation Error (invalid enum value)

---

### Error 3: Missing Required Field
**Request:**
```json
{
  "target_tone": "formal"
}
```
**Expected Response:** 422 Validation Error (missing required field: text)

---

## Tips for Testing

1. **Start Simple**: Begin with short, clear sentences to understand the API behavior
2. **Test Each Tone**: Try all three tone options (formal, informal, neutral)
3. **Use Various Text Types**: Test with stories, technical content, casual chat, etc.
4. **Monitor Response Time**: Note how long analysis takes for different text lengths
5. **Check Changes Array**: Verify that the `changes` correspond to your expected modifications
6. **Read Explanations**: The `explanation` field provides insight into what the engine detected

---

## Automated Testing Script

### Python Test Suite
Save this as `test_api.py`:

```python
import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(text, target_tone="neutral"):
    """Test the /analyze endpoint"""
    url = f"{BASE_URL}/analyze"
    payload = {
        "text": text,
        "target_tone": target_tone
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# Test cases
test_cases = [
    ("This is awesome!", "formal"),
    ("The system implementation is exemplary.", "informal"),
    ("I'm good but could be better.", "neutral"),
    ("Hey friend, how ya doin?", "formal"),
    ("The algorithmic approach demonstrates computational efficiency.", "informal"),
]

print("Running API Tests...\n")
for text, tone in test_cases:
    print(f"Testing: '{text}'")
    print(f"Target Tone: {tone}")
    result = test_endpoint(text, tone)
    print(f"Consistency Score: {result.get('consistency_score', 'N/A')}")
    print(f"Readability Score: {result.get('readability_score', 'N/A')}")
    print(f"Detected Tone: {result.get('detected_tone', 'N/A')}")
    print(f"Number of Changes: {len(result.get('changes', []))}")
    print("-" * 50)
```

Run it with:
```bash
python test_api.py
```

---

## Troubleshooting

### Server Won't Start
```bash
# Kill existing process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Try different port
python -m uvicorn ai_engine.main:app --reload --port 8001
```

### Swagger UI Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Try in incognito/private window
- Use http:// not https:// for localhost

### Connection Refused
- Ensure server is running
- Check port number is correct (default 8000)
- Verify firewall settings

---

## Performance Expectations

- **Small texts** (< 100 words): ~200-500ms
- **Medium texts** (100-1000 words): ~500ms-2s
- **Large texts** (> 1000 words): ~2-5s+

Response times depend on:
- Text length and complexity
- System resources
- Engine processing time

---

## Next Steps

1. Start the server
2. Visit `/docs` endpoint
3. Try the test data examples provided
4. Modify test data to match your use cases
5. Monitor response qualities and consistency
6. Use the automated test script for regression testing

