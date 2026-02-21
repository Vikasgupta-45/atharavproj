import axios from "axios";

const API_BASE = "http://localhost:8000/api";

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

// ── Game Backend Integration ──────────────────────────────────────────
export async function apiRedeemXP(userId, amount) {
  const res = await axios.post("http://localhost:8001/user/redeem-xp",
    { amount },
    { headers: { "X-User-ID": userId } }
  );
  return res.data;
}

export default api;
