# Write Assistant Extension

Chrome extension for writing support (blogs, textbooks, notes).

## Features
- Detects selected text and shows a floating top-right helper.
- Uses `POST /analyze` for selected-text analysis.
- OCR mode: draw a selection box (like snipping) and run high-level OCR + analysis.
- Renders mood, context, tone, readability, and suggestions.
- Supports change-list style responses (`results` with `type/original/suggested/reason`).
- Can replace selected text when API returns `modified_text` (or equivalent rewrite field).
- Configurable API base URL and paths in popup settings.

## Load in Chrome
1. Open `chrome://extensions`
2. Enable Developer mode
3. Click **Load unpacked**
4. Select this folder: `extension`

## Default API settings
- Base URL: `http://localhost:8000`
- Analyze path: `/analyze`
- OCR analyze path: `/ocr-analyze`

## Request shapes
Analyze:
```json
{ "text": "your selected text" }
```

OCR analyze:
```json
{
  "image_base64": "data:image/png;base64,...",
  "target_tone": "neutral"
}
```
