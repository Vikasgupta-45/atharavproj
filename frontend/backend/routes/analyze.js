import { Router } from "express";
import auth from "../middleware/auth.js";
import Session from "../models/Session.js";

const router = Router();

// ── Style Prompts ────────────────────────────────────────────────────────
// (Keep for potential future use or local logic)
const stylePrompts = {
    clear: "Clear and concise",
    formal: "Formal and polished",
    creative: "Creative and expressive",
    persuasive: "Persuasive and action-oriented",
};

// ── Auth Middleware Helper ──
// (Imported from middleware/auth.js)

// ── POST /api/analyze ────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
    try {
        const { text, style = "clear" } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Text is required for analysis." });
        }

        const sentences = text.split(/[.!?]+/).filter(Boolean);
        const words = text.trim().split(/\s+/).filter(Boolean);

        // Map frontend style to FastAPI target_tone
        const toneMap = {
            clear: "neutral",
            formal: "formal",
            creative: "informal",
            persuasive: "formal"
        };
        const target_tone = toneMap[style] || "neutral";

        // Call the FastAPI engine
        const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
        const aiResponse = await fetch(`${fastApiUrl}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, target_tone })
        });

        if (!aiResponse.ok) {
            const errorDetail = await aiResponse.text();
            console.error("FastAPI Error:", errorDetail);
            throw new Error(`AI Engine error: ${aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();

        // Mapping response to frontend expectations
        const output = aiData.modified_text || text;
        const consistency = {
            score: Math.round((aiData.consistency_score || 0) * 100),
            sentenceCount: sentences.length,
            wordCount: words.length,
            tone: aiData.detected_tone || style,
        };

        const explanation = aiData.explanation || [];
        const outputWords = output.trim().split(/\s+/).filter(Boolean);

        const diff = {
            beforeWords: words.length,
            afterWords: outputWords.length,
            beforePreview: text.slice(0, 160),
            afterPreview: output.slice(0, 160),
            changes: aiData.changes || []
        };

        // Save session to DB
        await Session.create({
            userId: req.userId,
            title: words.slice(0, 6).join(" ") || "Untitled session",
            style,
            preview: output.slice(0, 160),
            input: text,
            output,
            consistency,
        });

        return res.json({ output, consistency, explanation, diff });
    } catch (err) {
        console.error("Analysis route error:", err);
        return res.status(500).json({ error: err.message });
    }
});

// ── POST /api/analyze/live ───────────────────────────────────────────────
router.post("/live", auth, async (req, res) => {
    try {
        const { text, topic } = req.body;
        const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

        const aiResponse = await fetch(`${fastApiUrl}/live-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, topic })
        });

        if (!aiResponse.ok) {
            throw new Error(`AI Engine error: ${aiResponse.statusText}`);
        }

        const data = await aiResponse.json();
        return res.json(data);
    } catch (err) {
        console.error("Live check route error:", err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
