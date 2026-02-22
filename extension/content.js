let lastSelectedText = "";
let activeRange = null;
let hostNode = null;
let shadow = null;

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "get_selection") {
    sendResponse({ text: lastSelectedText || "" });
    return true;
  }

  if (request.type === "popup_action") {
    const action = request.action || "analyze";

    const text = (request.text || lastSelectedText || "").trim();
    if (!text) {
      sendResponse({ ok: false, message: "No selected text." });
      return true;
    }
    runAnalyze(text);
    sendResponse({ ok: true });
    return true;
  }

  return false;
});

document.addEventListener("mouseup", () => {
  setTimeout(captureSelectionAndRenderTrigger, 20);
});

document.addEventListener("selectionchange", () => {
  setTimeout(captureSelectionAndRenderTrigger, 20);
});

document.addEventListener("mousedown", (e) => {
  const path = e.composedPath ? e.composedPath() : [];
  const clickedInside = path.some((el) => el?.id === "wa-host");
  if (!clickedInside) {
    removeTrigger();
  }
});

function ensureHost() {
  if (!hostNode) {
    hostNode = document.createElement("div");
    hostNode.id = "wa-host";
    hostNode.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
    shadow = hostNode.attachShadow({ mode: "open" });

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("content.css");
    shadow.appendChild(link);

    document.documentElement.appendChild(hostNode);
  }

  return shadow;
}

function removeTrigger() {
  if (!shadow) return;
  const t = shadow.querySelector(".wa-trigger");
  if (t) t.remove();
}

function showTrigger(text) {
  const root = ensureHost();
  removeTrigger();

  const trigger = document.createElement("div");
  trigger.className = "wa-trigger";
  trigger.style.pointerEvents = "auto";
  trigger.innerHTML = `
    <span>Writing helper ready</span>
    <button id="wa-open">Analyze</button>
  `;

  root.appendChild(trigger);

  root.getElementById("wa-open").addEventListener("click", () => runAnalyze(text));
}

function showPanel(title, contentHtml) {
  const root = ensureHost();
  const existing = root.querySelector(".wa-panel");
  if (existing) existing.remove();

  const panel = document.createElement("div");
  panel.className = "wa-panel";
  panel.style.pointerEvents = "auto";
  panel.innerHTML = `
    <div class="wa-head">
      <h3>${escapeHtml(title)}</h3>
      <button class="wa-close" id="wa-close">x</button>
    </div>
    <div class="wa-body" id="wa-body">${contentHtml}</div>
  `;

  root.appendChild(panel);
  root.getElementById("wa-close").addEventListener("click", () => panel.remove());
  return panel;
}

function showLoading(title = "Writing Analysis", message = "Processing...") {
  showPanel(title, `<div class="wa-loading">${escapeHtml(message)}</div>`);
}

async function runAnalyze(text) {
  showLoading("Writing Analysis", "Analyzing selected text...");

  try {
    const settings = await getSettings();
    const res = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: "api_fetch",
        url: `${settings.apiBaseUrl}${settings.analyzePath || "/analyze"}`,
        options: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, target_tone: settings.targetTone || "neutral" })
        }
      }, resolve);
    });

    if (!res || res.error) {
      throw new Error(res?.error || "Extension communication failed");
    }

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = res.json || JSON.parse(res.text || "{}");
    renderAnalysis(text, data);
  } catch (err) {
    showPanel("Writing Analysis", `<div class="wa-error">${escapeHtml(err.message || "Request failed")}</div>`);
  }
}

function renderAnalysis(originalText, data, options = {}) {
  const parsed = normalizeAnalyzeResponse(originalText, data);

  const explanationItems = parsed.explanations.length
    ? `<ul class="wa-list">${parsed.explanations.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
    : `<div class="wa-box">No corrections needed — your text looks great!</div>`;


  const rewriteSection = parsed.rewrite
    ? `
      <div class="wa-section">
        <div class="title">Suggested Rewrite</div>
        <div class="wa-box">${escapeHtml(parsed.rewrite)}</div>
      </div>
      <div class="wa-actions">
        <button class="wa-btn" id="wa-close-result">Close</button>
        <button class="wa-btn primary" id="wa-replace">Replace Selection</button>
      </div>
    `
    : `
      <div class="wa-actions">
        <button class="wa-btn" id="wa-close-result">Close</button>
      </div>
    `;

  const sourceTextSection = options.sourceText
    ? `
      <div class="wa-section">
        <div class="title">Extracted Text</div>
        <div class="wa-box">${escapeHtml(options.sourceText)}</div>
      </div>
    `
    : "";

  const panel = showPanel(options.title || "Document Analysis", `
    ${sourceTextSection}
    <div class="wa-meta">
      <div class="wa-chip"><div class="k">Consistency</div><div class="v">${parsed.score}%</div></div>
      <div class="wa-chip"><div class="k">Words</div><div class="v">${parsed.wordCount}</div></div>
      <div class="wa-chip"><div class="k">Sentences</div><div class="v">${parsed.sentenceCount}</div></div>
      <div class="wa-chip"><div class="k">Tone</div><div class="v">${escapeHtml(parsed.tone)}</div></div>
    </div>

    <div class="wa-section">
      <div class="title">AI Corrections</div>
      ${explanationItems}
    </div>

    ${rewriteSection}
  `);

  panel.querySelector("#wa-close-result").addEventListener("click", () => panel.remove());

  const replaceBtn = panel.querySelector("#wa-replace");
  if (replaceBtn && parsed.rewrite) {
    replaceBtn.addEventListener("click", () => replaceSelectionWith(parsed.rewrite || originalText));
  }
}

function normalizeAnalyzeResponse(originalText, data) {
  const words = originalText.trim().split(/\s+/).filter(Boolean);
  const sentences = originalText.split(/[.!?]+/).filter(Boolean);

  const score = Math.round((data.consistency_score || 0) * 100);
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const tone = data.detected_tone || data.tone || data.style || "Neutral";

  const explanations = [];
  if (Array.isArray(data.explanation)) {
    for (const s of data.explanation) explanations.push(String(s));
  } else if (Array.isArray(data.suggestions)) {
    for (const s of data.suggestions) {
      explanations.push(typeof s === "string" ? s : s?.reason || JSON.stringify(s));
    }
  }

  const rewrite =
    data.modified_text ||
    data.rewritten_text ||
    data.rewrite ||
    data.suggested_text ||
    "";

  return {
    score,
    wordCount,
    sentenceCount,
    tone,
    explanations: dedupeTrim(explanations),
    rewrite
  };
}

function dedupeTrim(items) {
  const out = [];
  const seen = new Set();
  for (const raw of items) {
    const v = String(raw || "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function replaceSelectionWith(newText) {
  if (activeRange) {
    try {
      const node = document.createTextNode(newText);
      activeRange.deleteContents();
      activeRange.insertNode(node);
      return;
    } catch (_err) {
      // Continue to fallback methods.
    }
  }

  try {
    const ok = document.execCommand("insertText", false, newText);
    if (ok) return;
  } catch (_err) {
    // Continue to clipboard fallback.
  }

  navigator.clipboard?.writeText(newText).then(
    () => {
      showPanel(
        "Writing Analysis",
        "<div class=\"wa-box\">Could not replace directly in this editor. Rewritten text copied to clipboard. Paste with Ctrl+V.</div>"
      );
    },
    () => {
      showPanel(
        "Writing Analysis",
        "<div class=\"wa-box\">Could not replace directly in this editor. Copy the rewrite manually from the panel.</div>"
      );
    }
  );
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["apiBaseUrl", "analyzePath", "targetTone"], (data) => {
      // Validate tone against API expectations
      const validTones = ["formal", "informal", "neutral"];
      let tone = data.targetTone || "neutral";
      if (!validTones.includes(tone)) {
        tone = "neutral"; // Default to neutral if invalid
      }
      
      resolve({
        apiBaseUrl: data.apiBaseUrl || "http://localhost:8000",
        analyzePath: data.analyzePath || "/analyze",
        targetTone: tone
      });
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function captureSelectionAndRenderTrigger() {
  const { text, range } = getBestSelection();
  if (!text) {
    removeTrigger();
    return;
  }
  lastSelectedText = text;
  if (range) {
    activeRange = range;
  }
  showTrigger(text);
}

function getBestSelection() {
  const selection = window.getSelection();
  const selectedText = (selection?.toString() || "").trim();
  if (selectedText) {
    let range = null;
    if (selection.rangeCount > 0) {
      try {
        range = selection.getRangeAt(0).cloneRange();
      } catch (_err) { }
    }
    return { text: selectedText, range };
  }

  const active = document.activeElement;
  if (
    active &&
    (active.tagName === "TEXTAREA" ||
      (active.tagName === "INPUT" && active.type === "text"))
  ) {
    const start = active.selectionStart ?? 0;
    const end = active.selectionEnd ?? 0;
    const value = active.value || "";
    const text = value.slice(start, end).trim();
    if (text) {
      return { text, range: null };
    }
  }

  return { text: "", range: null };
}
