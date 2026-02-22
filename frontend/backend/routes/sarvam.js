import { Router } from "express";
import auth from "../middleware/auth.js";
import axios from "axios";

const router = Router();

// Support for Indian languages via Sarvam AI
const SUPPORTED_LANGUAGES = [
    { code: "hi-IN", name: "Hindi" },
    { code: "bn-IN", name: "Bengali" },
    { code: "kn-IN", name: "Kannada" },
    { code: "ml-IN", name: "Malayalam" },
    { code: "mr-IN", name: "Marathi" },
    { code: "od-IN", name: "Odia" },
    { code: "pa-IN", name: "Punjabi" },
    { code: "ta-IN", name: "Tamil" },
    { code: "te-IN", name: "Telugu" },
    { code: "gu-IN", name: "Gujarati" }
];

// ── GET /api/sarvam/languages ─────────────────────────────────────────────
router.get("/languages", auth, (req, res) => {
    res.json(SUPPORTED_LANGUAGES);
});

// ── POST /api/sarvam/translate ────────────────────────────────────────────
router.post("/translate", auth, async (req, res) => {
    const { text, target_language = "en-IN", source_language = "en-IN" } = req.body;

    console.log(`Translating to ${target_language} from ${source_language}...`);

    try {
        const apiKey = process.env.SARVAM_API_KEY;
        if (!apiKey) {
            throw new Error("Sarvam API key not configured on server");
        }

        const response = await axios.post(
            "https://api.sarvam.ai/translate",
            {
                input: text,
                source_language_code: source_language,
                target_language_code: target_language,
                model: "sarvam-translate:v1"
            },
            {
                headers: {
                    "api-subscription-key": apiKey,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Sarvam API Response:", response.data);
        res.json({ translated_text: response.data.translated_text || response.data.translatedText || response.data.output });
    } catch (err) {
        console.error("Sarvam Translation Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Translation failed", details: err.response?.data || err.message });
    }
});

// ── POST /api/sarvam/speech-to-text ───────────────────────────────────────
router.post("/speech-to-text", auth, async (req, res) => {
    const { audio_base64, language_code = "hi-IN" } = req.body;

    if (!audio_base64) {
        return res.status(400).json({ error: "No audio data provided" });
    }

    try {
        const apiKey = process.env.SARVAM_API_KEY;

        // This is a simplified representation. Usually Sarvam expects multipart/form-data for audio.
        // We assume the frontend handles the conversion or we handle it here.
        const response = await axios.post(
            "https://api.sarvam.ai/speech-to-text",
            {
                audio: audio_base64,
                language_code: language_code
            },
            {
                headers: {
                    "api-subscription-key": apiKey
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error("Sarvam STT Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Speech to text failed" });
    }
});

export default router;
