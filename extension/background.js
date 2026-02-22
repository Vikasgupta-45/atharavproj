chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["apiBaseUrl", "analyzePath", "targetTone"], (data) => {
    const validTones = ["formal", "informal", "neutral"];
    const tone = data.targetTone || "neutral";
    
    const defaults = {
      apiBaseUrl: data.apiBaseUrl || "http://localhost:8000",
      analyzePath: data.analyzePath || "/analyze",
      targetTone: validTones.includes(tone) ? tone : "neutral"
    };
    chrome.storage.sync.set(defaults);
  });

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "wa_analyze_selection",
      title: "Analyze with Write Assistant",
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "wa_analyze_selection" || !tab?.id) return;
  chrome.tabs.sendMessage(tab.id, {
    type: "popup_action",
    action: "analyze",
    text: info.selectionText || ""
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.type === "capture_visible_tab") {
    const windowId = sender?.tab?.windowId;
    if (windowId == null) {
      sendResponse({ ok: false, error: "No active tab window available." });
      return true;
    }

    chrome.tabs.captureVisibleTab(windowId, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      sendResponse({ ok: true, dataUrl });
    });

    return true;
  }

  if (request?.type === "api_fetch") {
    fetch(request.url, request.options)
      .then(async (res) => {
        const text = await res.text();
        let json = null;
        try { json = JSON.parse(text); } catch (e) { }
        sendResponse({ ok: res.ok, status: res.status, json, text });
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.message });
      });
    return true;
  }

  return false;
});


// No OCR extraction needed (removed)
