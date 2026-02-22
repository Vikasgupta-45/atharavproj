# 🎯 FASTAPI TESTING CHEAT SHEET

## ⚡ 60-Second Quick Start

```bash
# 1. Start server (Windows Batch)
start_server.bat

# 2. Browser opens: http://localhost:8000/docs
# 3. Click /analyze → "Try it out" → Paste test data → Execute
```

---

## 🧪 Copy-Paste Test Data

### Test 1: Casual → Formal (MOST COMMON)
```json
{
  "text": "hey guys, this is awesome",
  "target_tone": "formal"
}
```

### Test 2: Technical → Informal
```json
{
  "text": "The algorithmic approach demonstrates computational efficiency",
  "target_tone": "informal"
}
```

### Test 3: Emotional → Neutral
```json
{
  "text": "I absolutely LOVE this amazing product!!!",
  "target_tone": "neutral"
}
```

### Test 4: Default (Uses neutral)
```json
{
  "text": "This is a test sentence"
}
```

### Test 5: Long Text
```json
{
  "text": "When examining the historical context of technological advancement, we observe that innovation has consistently driven societal transformation. The proliferation of digital systems has fundamentally altered how we communicate and work together in modern organizations.",
  "target_tone": "informal"
}
```

---

## 🔌 One-Line Commands

### cURL
```bash
curl -X POST "http://localhost:8000/analyze" -H "Content-Type: application/json" -d '{"text":"hey dude","target_tone":"formal"}' | python -m json.tool
```

### Python
```bash
python -c "import requests; print(requests.post('http://localhost:8000/analyze', json={'text':'test','target_tone':'formal'}).json())"
```

### PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/analyze" -Method Post -ContentType "application/json" -Body (@{text='test';target_tone='formal'}|ConvertTo-Json)|ConvertTo-Json
```

---

## 📍 URL Quick Links

| Link | Purpose |
|------|---------|
| `http://localhost:8000/docs` | **Swagger UI (USE THIS)** |
| `http://localhost:8000/redoc` | ReDoc Documentation |
| `http://localhost:8000/openapi.json` | OpenAPI Schema |

---

## 📦 Response Fields

```json
{
  "consistency_score": 0.85,          // 0-1: How consistent the text is
  "readability_score": 0.92,          // 0-1: How readable it is
  "detected_tone": "formal",          // Original tone detected
  "modified_text": "...",             // Your text in target tone
  "changes": [                        // What was changed
    {"type": "substitution", "before": "hey", "after": "hello"}
  ],
  "explanation": ["..."]              // Why changes were made
}
```

---

## 🎯 Tone Options

| Tone | Use Case |
|------|----------|
| **formal** | Business, official documents |
| **informal** | Casual, friendly communication |
| **neutral** | News, objective writing |

---

## ✅ Testing Checklist

- [ ] Server running? (`start_server.bat`)
- [ ] Browser at http://localhost:8000/docs?
- [ ] Endpoint visible? (scroll down, find `/analyze`)
- [ ] Test data copied? (use examples above)
- [ ] Response returned? (should see JSON)
- [ ] Changes detected? (check `changes` array)
- [ ] Explanation present? (check `explanation` array)

---

## ❌ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| Connection refused | Run `start_server.bat` |
| Empty text error | Ensure `text` has at least 1 character |
| Invalid tone error | Use only: formal, informal, or neutral |
| Missing text field | Add `"text": "..."` to request |
| 500 server error | Check server logs for details |

---

## 🧬 Complete Minimal Example

**In Swagger UI:**
1. Click `/analyze` endpoint
2. Click "Try it out"
3. Replace request body with:
```json
{"text":"yo what's up","target_tone":"formal"}
```
4. Click "Execute"
5. ✅ See response below

---

## 📊 Performance Reference

| Text Size | Expected Time |
|-----------|---------------|
| < 50 words | ~200ms |
| 50-200 words | ~500ms |
| 200-500 words | ~1-2s |
| > 500 words | ~2-5s |

---

## 🔗 File Guide

| File | Use for |
|------|---------|
| `API_TESTING_GUIDE.md` | Detailed walkthrough |
| `QUICK_REFERENCE.md` | Code examples |
| `test_api.py` | Automated testing |
| `Postman_Collection.json` | Postman import |
| `start_server.bat` | Start server (Windows) |
| `start_server.ps1` | Start server (PowerShell) |

---

## 💡 Pro Tips

✓ Always test with your own text
✓ Try all 3 tone options to see differences
✓ Check the `explanation` field for insights
✓ Monitor `consistency_score` and `readability_score`
✓ Review actual text changes in `modified_text`
✓ Use Swagger UI for interactive testing
✓ Use `test_api.py` for batch testing

---

## 🚀 Next Steps

1. Run: `start_server.bat`
2. Open: http://localhost:8000/docs
3. Copy test data from this sheet
4. Click `/analyze` → "Try it out"
5. Paste data → "Execute"
6. 🎉 Done!

---

## 📞 Help Resources

- **Full Guide**: `API_TESTING_GUIDE.md`
- **Quick Examples**: `QUICK_REFERENCE.md`
- **Automated Tests**: `python test_api.py`
- **Interactive Docs**: http://localhost:8000/docs

---

**Print this sheet for quick reference!**

