import { Router } from "express";
import auth from "../middleware/auth.js";

const router = Router();

// ── POST /api/chat ───────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
    try {
        const { message, context = "" } = req.body;
        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) {
            return res.status(500).json({ error: "Missing GROQ_API_KEY in backend .env" });
        }

        const systemPrompt = `You are an AI writing assistant. The user will give you a draft text and a request. 
If the user asks to modify the text (e.g., "make this happier", "fix grammar", "make it shorter"), completely rewrite the text according to their request and return a JSON object with two keys:
- "reply": A brief conversational message about what you did.
- "modifiedText": The completely rewritten draft text reflecting their changes.

If the user just says "hello", asks a general question, or gives an invalid request, answer conversationally and return JSON:
- "reply": Your conversational response.
- "modifiedText": null

Respond ONLY with a valid JSON object matching this schema.`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${groqKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Draft: ${context}\n\nRequest: ${message}` }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API error:", errorText);
            throw new Error(`Failed to communicate with AI Chat Engine: ${errorText}`);
        }

        const data = await response.json();
        const aiJson = JSON.parse(data.choices[0].message.content);

        res.json({ reply: aiJson.reply, modifiedText: aiJson.modifiedText });
    } catch (err) {
        console.error("Chat Route Exception:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
