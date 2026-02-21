import { Router } from "express";
import auth from "../middleware/auth.js";

const router = Router();

// ── POST /api/chat ───────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
    try {
        const { message, context = "" } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: "message is required" });
        }

        const lower = message.toLowerCase();
        let reply;

        if (lower.includes("fix") || lower.includes("grammar") || lower.includes("correct")) {
            reply =
                "Use the highlighted words in the editor preview and click each suggestion to apply instant corrections. You can also click 'Analyze Writing' for a full rewrite.";
        } else if (lower.includes("tone") || lower.includes("formal") || lower.includes("style")) {
            reply =
                "For a stronger tone, prefer shorter sentences and more direct verbs. Select a style from the Style Selector and click Analyze to generate it.";
        } else if (lower.includes("short") || lower.includes("compress") || lower.includes("condense")) {
            reply =
                "I can compress your draft by 25-35% while keeping the meaning. Click 'Analyze Writing' to generate a compressed version.";
        } else if (lower.includes("rewrite") || lower.includes("improve") || lower.includes("enhance")) {
            reply =
                "Choose your preferred writing style ('Creative', 'Formal', 'Persuasive') from the selector, then click Analyze to get an AI-improved version.";
        } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
            reply = "Hello! I'm your AI writing assistant. Ask me about grammar, tone, style, or text compression — I'm here to help!";
        } else {
            reply =
                'I can help improve your writing! Try asking:\n• "Fix my grammar"\n• "Rewrite this in formal tone"\n• "Make this shorter"\n• "Improve the style"';
        }

        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
