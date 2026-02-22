document.addEventListener("DOMContentLoaded", () => {
  const selPreview = document.getElementById("selection-preview");
  const status = document.getElementById("status");

  const inputApiBase = document.getElementById("api-base");
  const inputAnalyze = document.getElementById("path-analyze");
  const selectTone = document.getElementById("target-tone");

  chrome.storage.sync.get(["apiBaseUrl", "analyzePath", "targetTone"], (data) => {
    inputApiBase.value = data.apiBaseUrl || "http://localhost:8000";
    inputAnalyze.value = data.analyzePath || "/analyze";
    selectTone.value = data.targetTone || "neutral";
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs?.[0]?.id;
    if (!tabId) return;
    chrome.tabs.sendMessage(tabId, { type: "get_selection" }, (res) => {
      const text = (res?.text || "").trim();
      if (!text) return;
      selPreview.style.display = "block";
      selPreview.textContent = text.length > 140 ? `${text.slice(0, 140)}...` : text;
    });
  });

  document.getElementById("save-settings").addEventListener("click", () => {
    const validTones = ["formal", "informal", "neutral"];
    const tone = validTones.includes(selectTone.value) ? selectTone.value : "neutral";
    
    chrome.storage.sync.set({
      apiBaseUrl: inputApiBase.value.trim() || "http://localhost:8000",
      analyzePath: normalizePath(inputAnalyze.value, "/analyze"),
      targetTone: tone
    }, () => {
      status.textContent = "Settings saved.";
      setTimeout(() => { status.textContent = ""; }, 1500);
    });
  });

  document.getElementById("btn-analyze").addEventListener("click", () => runAnalyzeAction());
  document.getElementById("btn-clipboard").addEventListener("click", () => runClipboardAction());

  function runAnalyzeAction() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs?.[0]?.id;
      if (!tabId) return;

      chrome.tabs.sendMessage(tabId, { type: "get_selection" }, (res) => {
        const text = (res?.text || "").trim();
        if (!text) {
          status.textContent = "Select text on the page first.";
          return;
        }
        chrome.tabs.sendMessage(tabId, { type: "popup_action", action: "analyze", text });
        window.close();
      });
    });
  }

  async function runClipboardAction() {
    try {
      const text = (await navigator.clipboard.readText() || "").trim();
      if (!text) {
        status.textContent = "Clipboard is empty. Copy text first (Ctrl+C).";
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs?.[0]?.id;
        if (!tabId) return;
        chrome.tabs.sendMessage(tabId, { type: "popup_action", action: "analyze", text });
        window.close();
      });
    } catch (_err) {
      status.textContent = "Clipboard read blocked. Copy text first, then retry.";
    }
  }

  function normalizePath(path, fallback) {
    const p = (path || "").trim();
    if (!p) return fallback;
    return p.startsWith("/") ? p : `/${p}`;
  }
});
