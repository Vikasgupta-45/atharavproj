import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiGetMe, apiLogin, apiSignup, apiGetSessions, apiUpdatePlan, apiRedeemXP } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'sarthak_token';
const ACTIVITY_KEY = 'ai_writer_activity';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  // ── Bootstrap: check for existing token on mount ──
  useEffect(() => {
    const savedActivity = localStorage.getItem(ACTIVITY_KEY);
    if (savedActivity) setActivity(JSON.parse(savedActivity));

    const savedCredits = localStorage.getItem('sarthak_credits');
    if (savedCredits) setCredits(parseFloat(savedCredits));

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      apiGetMe()
        .then(({ user: u }) => { setUser(u); return loadSessions(); })
        .catch(() => localStorage.removeItem(TOKEN_KEY))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loadSessions = async () => {
    try {
      const { sessions: s } = await apiGetSessions();
      setSessions(s);
    } catch (_) { }
  };

  const persist = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const addActivity = (message) => {
    const record = { id: crypto.randomUUID(), message, at: new Date().toISOString() };
    const next = [record, ...activity].slice(0, 100);
    setActivity(next);
    persist(ACTIVITY_KEY, next);
  };

  const login = async (email, password) => {
    const { token, user: u } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    addActivity(`Logged in as ${email}`);
    await loadSessions();
    return u;
  };

  const signup = async (name, email, password) => {
    const { token, user: u } = await apiSignup(name, email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    addActivity(`Created account for ${email}`);
    return u;
  };

  const logout = () => {
    if (user?.email) addActivity(`Logged out ${user.email}`);
    setUser(null);
    setSessions([]);
    localStorage.removeItem(TOKEN_KEY);
  };

  const addSession = (session) => {
    // Session limit for Free plan
    if (user?.plan === 'Free' && sessions.length >= 8) {
      alert("You've reached the 8-session limit for the Free plan. Please upgrade to Pro for unlimited sessions.");
      return;
    }

    // Session was already saved server-side by /api/analyze — just add to local list
    const enriched = { ...session, _id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setSessions((prev) => [enriched, ...prev].slice(0, 100));
    addActivity('Ran writing analysis session');
  };

  const updatePlan = async (planName) => {
    if (!user) return;
    const { user: u } = await apiUpdatePlan(planName);
    setUser(u);
  };

  const redeemCredits = async (xpAmount) => {
    if (!user) return;
    const userId = user.email || user._id;
    const res = await apiRedeemXP(userId, xpAmount);
    if (res.success) {
      const addedCredits = (xpAmount / 100) * 0.4;
      const newCredits = credits + addedCredits;
      setCredits(newCredits);
      localStorage.setItem('sarthak_credits', newCredits.toString());
      addActivity(`Redeemed ${xpAmount} XP for $${addedCredits.toFixed(2)} credits`);
      return { success: true, newXP: res.new_xp };
    }
    return { success: false, message: res.message };
  };

  const deductCredits = (amount) => {
    const newCredits = Math.max(credits - amount, 0);
    setCredits(newCredits);
    localStorage.setItem('sarthak_credits', newCredits.toString());
    addActivity(`Spent $${amount.toFixed(2)} credits on plan upgrade`);
  };

  const value = useMemo(
    () => ({
      user,
      sessions,
      activity,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      addSession,
      addActivity,
      setUser,
      updatePlan,
      redeemCredits,
      deductCredits,
      credits,
      loadSessions,
    }),
    [user, sessions, activity, loading, credits]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
