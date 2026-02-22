import axios from "axios";

const API_BASE = "http://localhost:8001/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ── Attach JWT token to every request ────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sarthak_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────────
export async function apiSignup(name, email, password) {
  const res = await api.post("/auth/signup", { name, email, password });
  return res.data; // { token, user }
}

export async function apiLogin(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { token, user }
}

export async function apiGetMe() {
  const res = await api.get("/auth/me");
  return res.data; // { user }
}

export async function apiUpdatePlan(plan) {
  const res = await api.patch("/auth/plan", { plan });
  return res.data; // { user }
}

// ── Analyze ──────────────────────────────────────────────────────────────
export async function analyzeText({ text, style = "clear" }) {
  const res = await api.post("/analyze", { text, style });
  return res.data; // { output, consistency, explanation, diff }
}

export async function apiLiveCheck({ text, topic }) {
  const res = await api.post("/analyze/live", { text, topic });
  return res.data; // { is_on_topic, relevance_score, suggestion }
}

// ── Chat ─────────────────────────────────────────────────────────────────
export async function apiChat(message, context = "") {
  const res = await api.post("/chat", { message, context });
  return res.data; // { reply }
}

// ── Sessions ─────────────────────────────────────────────────────────────
export async function apiGetSessions() {
  const res = await api.get("/sessions");
  return res.data; // { sessions }
}

// ── Multilang (Sarvam AI) ────────────────────────────────────────────────
export async function apiGetLanguages() {
  const res = await api.get("/sarvam/languages");
  return res.data;
}

export async function apiTranslate({ text, target_language, source_language }) {
  const res = await api.post("/sarvam/translate", { text, target_language, source_language });
  return res.data;
}

// ── Game Backend Integration ──────────────────────────────────────────
export async function apiRedeemXP(userId, amount) {
  const res = await axios.post("http://localhost:8001/user/redeem-xp",
    { amount },
    { headers: { "X-User-ID": userId } }
  );
  return res.data;
}

export default api;
