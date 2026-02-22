# 🚀 FastAPI Testing Complete Guide

## Overview
This directory contains comprehensive guides, test scripts, and resources for testing all endpoints of your **AI Text Analysis Engine** FastAPI application.

---

## 📁 Files Included

| File | Purpose | For Whom |
|------|---------|----------|
| `API_TESTING_GUIDE.md` | Complete testing documentation with step-by-step instructions | Everyone - START HERE |
| `QUICK_REFERENCE.md` | Quick examples for cURL, Python, PowerShell, JavaScript | Developers |
| `test_api.py` | Automated Python test suite with 10+ test cases | Python developers |
| `Postman_Collection.json` | Ready-to-import Postman collection with all test cases | Postman users |
| `start_server.bat` | Batch script to start server and open docs (Windows) | Windows users |
| `start_server.ps1` | PowerShell script to start server and open docs (Windows) | PowerShell users |
| `TESTING_INDEX.md` | This file - navigation guide | Everyone |

---

## 🎯 Quick Start (Choose Your Method)

### Method 1️⃣: Fastest Way (Batch Script)
```bash
start_server.bat
```
- Activates venv
- Starts server
- Opens `/docs` in browser automatically
- ✨ Most beginner-friendly

### Method 2️⃣: PowerShell Way
```powershell
.\start_server.ps1
```
- Same as batch but with PowerShell
- Colored output
- Better error messages

### Method 3️⃣: Manual Way
```bash
# Activate venv
.venv\Scripts\activate.bat

# Start server
python -m uvicorn ai_engine.main:app --reload --host 0.0.0.0 --port 8000

# In browser, visit:
# http://localhost:8000/docs
```

---

## 📖 Documentation Files

### 📘 [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) - COMPREHENSIVE GUIDE
**Read this first for complete understanding**

Contains:
- ✅ Step-by-step instructions for Swagger UI
- ✅ 5 test data examples
- ✅ cURL, Python, and PowerShell examples
- ✅ Parameter explanations
- ✅ Response field descriptions
- ✅ Error scenarios
- ✅ Automated testing script
- ✅ Troubleshooting section
- ⏱️ Estimated reading time: 15-20 minutes

**When to use:** First time setup, detailed learning

---

### ⚡ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - QUICK LOOKUP
**Use this for quick copy-paste examples**

Contains:
- ✅ 15+ ready-to-use test examples
- ✅ cURL one-liners
- ✅ Python snippets
- ✅ PowerShell commands
- ✅ JavaScript/Node.js code
- ⏱️ Estimated reading time: 5-10 minutes

**When to use:** Need quick examples, testing specific scenarios

---

## 🧪 Testing Methods

### Method A: Swagger UI (Interactive) - RECOMMENDED FOR BEGINNERS ⭐
```
1. Start server (use start_server.bat)
2. Browser opens http://localhost:8000/docs
3. Click /analyze endpoint
4. Click "Try it out"
5. Paste test data
6. Click "Execute"
```
✅ No coding required
✅ Visual feedback
✅ Built-in validation
✅ Response preview

---

### Method B: Postman (API Client)
```
1. Download Postman: https://www.postman.com/downloads/
2. Open Postman
3. Click "Import" → Select Postman_Collection.json
4. Collection appears with 16 pre-built test cases
5. Click any request and "Send"
```
✅ Professional tool
✅ Request history
✅ Environment variables
✅ Test automation

---

### Method C: Python Script (Automated Testing)
```bash
python test_api.py
```
✅ Tests all 10 scenarios automatically
✅ Detailed results output
✅ Performance metrics
✅ Error handling included
✅ Saves results to JSON

---

### Method D: cURL (Command Line)
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text":"hey guys","target_tone":"formal"}'
```
✅ No installation needed
✅ Scriptable
✅ Lightweight

---

### Method E: Python Code (Direct)
```python
import requests
response = requests.post(
    "http://localhost:8000/analyze",
    json={"text": "your text", "target_tone": "formal"}
)
print(response.json())
```
✅ Integrates with your code
✅ Programmatic control
✅ Easy error handling

---

## 🧬 Available Endpoints

### POST `/analyze`
Full text analysis pipeline

**Request:**
```json
{
  "text": "Your text here",
  "target_tone": "formal|informal|neutral"
}
```

**Response:**
```json
{
  "consistency_score": 0.85,
  "readability_score": 0.92,
  "detected_tone": "formal",
  "modified_text": "Modified version...",
  "changes": [{...}],
  "explanation": ["..."]
}
```

---

## 📊 Test Data Examples

### Example 1: Simple Casual → Formal
```json
{
  "text": "hey dude, this is awesome",
  "target_tone": "formal"
}
```

### Example 2: Technical → Informal
```json
{
  "text": "The algorithm demonstrates exceptional performance metrics",
  "target_tone": "informal"
}
```

### Example 3: Emotional → Neutral
```json
{
  "text": "I absolutely LOVE this amazing product!!!",
  "target_tone": "neutral"
}
```

**➜ See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for 15+ more examples**

---

## 🔄 Workflow: Complete Testing Journey

```
┌─────────────────┐
│  Start Server   │  Use: start_server.bat or start_server.ps1
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Choose Testing Method              │
├─────────────────────────────────────┤
│  → Swagger UI (easiest)             │
│  → Postman (professional)           │
│  → Python script (automated)        │
│  → cURL/PowerShell (quick)          │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Select Test Data            │
├──────────────────────────────┤
│  Copy from:                  │
│  - API_TESTING_GUIDE.md      │
│  - QUICK_REFERENCE.md        │
│  - Postman Collection        │
│  - Or create your own        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Send Request to /analyze    │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Review Response             │
├──────────────────────────────┤
│  • Check scores              │
│  • Review changes            │
│  • Read explanation          │
│  • Analyze modified text     │
└──────────────────────────────┘
```

---

## 📚 Documentation Map

```
Your AI Engine Project
│
├── 📘 Complete Guide
│   └── API_TESTING_GUIDE.md
│       ├── How to use Swagger UI
│       ├── 5 detailed test examples
│       ├── Error scenarios
│       └── Troubleshooting
│
├── ⚡ Quick Reference
│   └── QUICK_REFERENCE.md
│       ├── 15+ code examples
│       ├── cURL commands
│       ├── Python snippets
│       ├── PowerShell commands
│       └── JavaScript code
│
├── 🧪 Automated Testing
│   └── test_api.py
│       ├── 10 test cases
│       ├── Performance metrics
│       ├── Error handling
│       └── Results export
│
├── 📮 Postman Collection
│   └── Postman_Collection.json
│       ├── 16 pre-built requests
│       ├── Error tests
│       ├── Info requests
│       └── Ready to import
│
├── 🚀 Startup Scripts
│   ├── start_server.bat (Windows Batch)
│   └── start_server.ps1 (PowerShell)
│
└── 📖 This Index
    └── TESTING_INDEX.md (navigation guide)
```

---

## 🎓 Learning Path

### Beginner (First Time Users)
1. Read: [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) - Overview section
2. Run: `start_server.bat`
3. Test: Use Swagger UI with provided examples
4. Reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for more examples

### Intermediate (Developers)
1. Review: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) 
2. Run: `python test_api.py`
3. Study: Code examples in various languages
4. Test: Use Postman collection or write custom code

### Advanced (Automation/Integration)
1. Study: `test_api.py` for patterns
2. Write: Custom test suites
3. Integrate: Into CI/CD pipelines
4. Automate: Regression testing

---

## 🔗 Direct Links

| What | Link | When |
|------|------|------|
| **Interactive Docs** | http://localhost:8000/docs | Testing via browser |
| **Alternative Docs** | http://localhost:8000/redoc | Alternative format |
| **OpenAPI Schema** | http://localhost:8000/openapi.json | For integrations |

---

## ✨ Feature Highlights

✅ **Full API Documentation** - Step-by-step guides included
✅ **Multiple Testing Methods** - Choose your preferred approach
✅ **Real-World Examples** - 15+ practical test cases
✅ **Automated Testing** - Python script for batch testing
✅ **Postman Ready** - Import collection for professional testing
✅ **Multi-Language** - cURL, Python, PowerShell, JavaScript examples
✅ **Error Testing** - Scenarios for validation and error handling
✅ **Quick Start** - Automated startup scripts

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Server won't start | Run `start_server.bat` - it checks and installs requirements |
| Port 8000 in use | Edit startup script to use different port (e.g., 8001) |
| Virtual env issues | Delete `.venv` folder and restart scripts (they recreate it) |
| Postman import fails | Ensure JSON file is in correct format |
| Browser doesn't auto-open | Manually navigate to http://localhost:8000/docs |

---

## 📞 Quick Help

**Q: Where do I start?**
A: Run `start_server.bat` then open http://localhost:8000/docs

**Q: What should I test first?**
A: Use the "Simple Casual → Formal" example from this file

**Q: How do I test multiple requests at once?**
A: Use `python test_api.py` for automated testing

**Q: Can I use Postman?**
A: Yes! Import `Postman_Collection.json`

**Q: How do I integrate with my code?**
A: See cURL, Python, and JavaScript examples in QUICK_REFERENCE.md

---

## 📋 Request Parameters

| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| `text` | string | ✅ Yes | - | Any text (min 1 char) |
| `target_tone` | string | ❌ No | "neutral" | "formal", "informal", "neutral" |

---

## 📊 Response Structure

```
{
  consistency_score    → float (0-1) - Narrative consistency
  readability_score    → float (0-1) - Text readability  
  detected_tone        → string - Original tone detected
  modified_text        → string - Text in target tone
  changes              → array - Specific modifications
  explanation          → array - Analysis details
}
```

---

## 🎯 Next Steps

1. ✅ Review this file (you are here!)
2. ✅ Choose a testing method
3. ✅ Run `start_server.bat`
4. ✅ Visit http://localhost:8000/docs
5. ✅ Try first test example
6. ✅ Explore other examples
7. ✅ Integrate into your workflow

---

## 📝 Notes

- Generated: 2025-02-21
- FastAPI Version: Latest
- Python Version: 3.9+
- Supports: Windows, macOS, Linux

---

## 🌟 Pro Tips

💡 **Start simple** - Begin with short test strings
💡 **Test all tones** - Try formal, informal, neutral
💡 **Review changes** - Look at the changes array to understand modifications
💡 **Monitor performance** - Check response times for different text lengths
💡 **Use Swagger UI** - Best for interactive testing and learning
💡 **Use Postman** - Best for professional/team testing
💡 **Use Python script** - Best for automation and regression testing

---

## 📄 Document Structure

```
TESTING_INDEX.md (Navigation - START HERE)
├─ API_TESTING_GUIDE.md (Detailed walkthrough)
├─ QUICK_REFERENCE.md (Code examples & snippets)
├─ test_api.py (Automated test suite)
├─ Postman_Collection.json (For Postman application)
├─ start_server.bat (Windows batch launcher)
└─ start_server.ps1 (PowerShell launcher)
```

---

**Ready to test? Start with `start_server.bat` →→→**

---

*For detailed information, see [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)*
*For quick examples, see [QUICK_REFERENCE.md](QUICK_REFERENCE.md)*
