import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

function signToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// ── POST /api/auth/signup ────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "name, email, and password are required" });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const user = await User.create({ name, email, password });
        const token = signToken(user);

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = signToken(user);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /api/auth/plan ─────────────────────────────────────────────────
router.patch("/plan", auth, async (req, res) => {
    try {
        const { plan } = req.body;
        if (!["Free", "Pro", "Team"].includes(plan)) {
            return res.status(400).json({ error: "Invalid plan" });
        }
        const user = await User.findByIdAndUpdate(req.userId, { plan }, { new: true });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
