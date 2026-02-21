import { Router } from "express";
import auth from "../middleware/auth.js";
import Session from "../models/Session.js";

const router = Router();

// ── GET /api/sessions ────────────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.json({ sessions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
