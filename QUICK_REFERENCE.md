# Quick Reference - Testing API Endpoints

## 🚀 Quick Start (3 Steps)

### Step 1: Start Server
```bash
cd c:\Users\Maviya Shaikh\Desktop\HACK
python -m uvicorn ai_engine.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Open Browser
Navigate to: **http://localhost:8000/docs**

### Step 3: Test in Swagger UI
- Click the `/analyze` endpoint
- Click "Try it out"
- Paste test data (see examples below)
- Click "Execute"

---

## 📋 Test Data Examples

### Simple Example
```json
{
  "text": "Hey guys, this is awesome!",
  "target_tone": "formal"
}
```

### Minimal Example (uses default tone)
```json
{
  "text": "This is a test sentence."
}
```

### Real-World Example 1: Customer Support Email
```json
{
  "text": "Hey there! Thanks so much for reaching out to us. We really appreciate your business and would love to help you out with whatever you need. Let us know how we can assist you!",
  "target_tone": "formal"
}
```

### Real-World Example 2: Technical Documentation
```json
{
  "text": "The machine learning model leverages convolutional neural networks to perform image classification tasks with state-of-the-art accuracy metrics across diverse datasets.",
  "target_tone": "informal"
}
```

### Real-World Example 3: Product Review
```json
{
  "text": "OMG this product is literally AMAZING!!! I absolutely LOVE it!!! It's the BEST thing ever!!!",
  "target_tone": "neutral"
}
```

---

## 🔌 Testing with cURL (Command Line)

### Basic Test
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "yo whats up",
    "target_tone": "formal"
  }'
```

### With Pretty Output
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "this is awesome",
    "target_tone": "formal"
  }' | python -m json.tool
```

### Save Response to File
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "test text",
    "target_tone": "formal"
  }' > response.json
```

---

## 🐍 Testing with Python (requests)

### Basic Script
```python
import requests
import json

response = requests.post(
    "http://localhost:8000/analyze",
    json={
        "text": "hey guys, check this out",
        "target_tone": "formal"
    }
)

print(json.dumps(response.json(), indent=2))
```

### With Error Handling
```python
import requests
import json

try:
    response = requests.post(
        "http://localhost:8000/analyze",
        json={
            "text": "Your text here",
            "target_tone": "formal"
        },
        timeout=30
    )
    response.raise_for_status()
    data = response.json()
    
    print(f"Consistency: {data['consistency_score']}")
    print(f"Readability: {data['readability_score']}")
    print(f"Modified Text: {data['modified_text']}")
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Batch Testing
```python
import requests

test_cases = [
    ("casual", "hey dude", "formal"),
    ("technical", "The algorithm implements X", "informal"),
    ("emotional", "I LOVE this!!!", "neutral"),
]

for name, text, tone in test_cases:
    response = requests.post(
        "http://localhost:8000/analyze",
        json={"text": text, "target_tone": tone}
    )
    result = response.json()
    print(f"{name}: Consistency={result['consistency_score']:.2f}")
```

---

## 🟢 Testing with PowerShell

### Basic Test
```powershell
$body = @{
    text = "hey there, how ya doin?"
    target_tone = "formal"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/analyze" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

$response | ConvertTo-Json
```

### Pretty Output
```powershell
$body = @{
    text = "this is awesome"
    target_tone = "formal"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/analyze" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body | Format-List
```

---

## 🌐 Testing with JavaScript/Node.js

### Basic Fetch API
```javascript
const data = {
    text: "hey guys, this is cool",
    target_tone: "formal"
};

fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(json => {
    console.log("Consistency:", json.consistency_score);
    console.log("Readability:", json.readability_score);
    console.log("Modified Text:", json.modified_text);
})
.catch(error => console.error("Error:", error));
```

### Using axios (Node.js)
```javascript
const axios = require('axios');

axios.post('http://localhost:8000/analyze', {
    text: 'test text here',
    target_tone: 'formal'
})
.then(response => {
    console.log(JSON.stringify(response.data, null, 2));
})
.catch(error => {
    console.error('Error:', error.message);
});
```

### Async/Await (Node.js)
```javascript
async function testAPI() {
    try {
        const response = await fetch("http://localhost:8000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: "your text here",
                target_tone: "formal"
            })
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error:", error);
    }
}

testAPI();
```

---

## 📊 Response Structure

All successful responses follow this structure:

```json
{
  "consistency_score": 0.85,
  "readability_score": 0.92,
  "detected_tone": "formal",
  "modified_text": "The modified version of your text with tone adjustments",
  "changes": [
    {
      "type": "substitution",
      "before": "hey",
      "after": "hello"
    },
    {
      "type": "substitution",
      "before": "awesome",
      "after": "excellent"
    }
  ],
  "explanation": [
    "Changed casual greetings to formal equivalents",
    "Replaced colloquial expressions with professional terminology",
    "Adjusted punctuation for formal writing standards"
  ]
}
```

---

## 🎯 Available Tones

| Tone | Description | Best For |
|------|-------------|----------|
| **formal** | Professional, official language | Business emails, documentation, academic writing |
| **informal** | Casual, conversational language | Friendly messages, blog posts, casual communication |
| **neutral** | Objective, unbiased language | News articles, technical specs, objective reports |

---

## ⚡ Common Test Scenarios

### Scenario 1: Casual to Professional
**Input:**
```json
{
  "text": "yo what's good, just wanted to let you know this project is lit",
  "target_tone": "formal"
}
```
**Expected:** Professional version with structured language

---

### Scenario 2: Complex to Simple
**Input:**
```json
{
  "text": "the multifaceted implementation architecture necessitates comprehensive evaluation metrics",
  "target_tone": "informal"
}
```
**Expected:** Simplified, conversational version

---

### Scenario 3: Emotional to Objective
**Input:**
```json
{
  "text": "I absolutely LOVE this amazing product!!!",
  "target_tone": "neutral"
}
```
**Expected:** Neutral version without emotional language

---

## 🔍 Response Fields Explained

| Field | Type | Meaning |
|-------|------|---------|
| `consistency_score` | float (0-1) | How consistent the narrative is |
| `readability_score` | float (0-1) | How readable the text is |
| `detected_tone` | string | Original tone detected |
| `modified_text` | string | Text in target tone |
| `changes` | array | Specific modifications made |
| `explanation` | array | Detailed analysis of changes |

---

## ✅ Validation Rules

| Parameter | Rules |
|-----------|-------|
| `text` | Required, minimum 1 character |
| `target_tone` | Optional, must be: "formal", "informal", or "neutral" |

---

## ❌ Error Responses

### 422 Validation Error (Bad Input)
```json
{
  "detail": [
    {
      "loc": ["body", "text"],
      "msg": "ensure this value has at least 1 character",
      "type": "value_error.string.min_length"
    }
  ]
}
```

### 500 Server Error (Processing Failed)
```json
{
  "detail": "Analysis pipeline failed: [error message]"
}
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Make sure server is running on port 8000 |
| "Invalid JSON" | Ensure all JSON is properly formatted and quoted |
| "422 Validation Error" | Check that required fields are present and valid |
| "Long wait time" | Large texts take longer; be patient or reduce text size |
| "CORS errors" | CORS is enabled in the server, should work from any origin |

---

## 📎 Postman Collection

A Postman collection is provided: **Postman_Collection.json**

To use it:
1. Download the file
2. Open Postman
3. Click "Import" 
4. Select the JSON file
5. Collection will appear with all test cases

---

## 🔗 Useful Links

- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

---

## 💡 Tips

✓ Start with simple text to understand behavior
✓ Try all three tones to see differences
✓ Use long text to see how complex analysis works
✓ Check the `explanation` field for insights
✓ Review `changes` array to understand modifications
✓ Test error cases to understand validation
✓ Monitor response times to gauge performance

