import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileClock, Files, Sparkles, UserCircle2, Zap, Award, Languages } from 'lucide-react';
import AIChatPanel from '../components/AIChatPanel';
import AnalyzeButton from '../components/AnalyzeButton';
import ConsistencyPanel from '../components/ConsistencyPanel';
import DiffPanel from '../components/DiffPanel';
import ExplanationPanel from '../components/ExplanationPanel';
import OutputViewer from '../components/OutputViewer';
import StyleSelector from '../components/StyleSelector';
import TextEditor from '../components/TextEditor';
import LanguageSupport from '../components/LanguageSupport';
import { useAuth } from '../context/AuthContext';
import { analyzeText, apiLiveCheck } from '../services/api';
import { getUserStats } from '../games/lib/api';

const menu = [
  { key: 'docs', label: 'Docs', icon: Files },
  { key: 'history', label: 'Version History', icon: FileClock },
  { key: 'account', label: 'Account', icon: UserCircle2 },
];

const plans = [
  { name: 'Free', price: '$0', features: '3 AI checks/day, basic rewrite' },
  { name: 'Pro', price: '$12/mo', features: 'Unlimited checks, full style controls' },
  { name: 'Team', price: '$39/mo', features: 'Shared history, priority compute' },
];

function Dashboard() {
  const { user, sessions, activity, addSession, updatePlan, credits, deductCredits } = useAuth();
  const [active, setActive] = useState('docs');
  const [text, setText] = useState('');
  const [style, setStyle] = useState('clear');
  const [loading, setLoading] = useState(false);
  const [isChatGenerating, setIsChatGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const [gameStats, setGameStats] = useState({ level: 1, xp: 0 });

  // ── Live Recommendations State ──
  const [topic, setTopic] = useState('');
  const [liveResult, setLiveResult] = useState(null);
  const [isLiveChecking, setIsLiveChecking] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchGameStats = async () => {
        try {
          const stats = await getUserStats(user.email || user._id);
          setGameStats({ ...stats, xp: 2000 }); // HARDCODED FOR DEMO
        } catch (err) {
          console.error('Failed to fetch game stats:', err);
        }
      };
      fetchGameStats();
    }
  }, [user]);

  const usageCount = useMemo(() => sessions.length, [sessions.length]);

  // ── Live Check Logic (Debounced) ──
  useEffect(() => {
    if (!text.trim() || !topic.trim()) {
      setLiveResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLiveChecking(true);
      try {
        const res = await apiLiveCheck({ text, topic });
        setLiveResult(res);
      } catch (err) {
        console.error("Live check failed:", err);
      } finally {
        setIsLiveChecking(false);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [text, topic]);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeText({ text, style });
      setResult(response);
      addSession({
        title: text.split(' ').slice(0, 6).join(' ') || 'Untitled session',
        style,
        preview: response.output.slice(0, 160),
      });
    } finally {
      setLoading(false);
    }
  };

  const planPrices = { Free: 0, Pro: 12, Team: 39 };

  const choosePlan = async (planName) => {
    if (!user) return;
    const price = planPrices[planName] || 0;

    if (price > 0 && credits < price) {
      alert(`You need $${price.toFixed(2)} in credits to select the ${planName} plan. You currently have $${credits.toFixed(2)}. Earn more XP in games and redeem them for credits!`);
      return;
    }

    try {
      if (price > 0) {
        deductCredits(price);
      }
      await updatePlan(planName);
    } catch (err) {
      console.error('Failed to update plan:', err);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-[1400px] gap-6 p-4 md:grid-cols-[260px_1fr] md:p-6">
      <aside className="glass-card flex h-fit flex-col p-3 md:sticky md:top-24">
        <div className="space-y-1">
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active === item.key ? 'bg-[#F3F0FF] text-brand-primary' : 'text-brand-muted hover:bg-[#F8F7FF]'
                }`}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-brand-border pt-4 text-xs text-brand-muted">
          <p>{user?.email}</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F0FDFA] p-2 border border-[#CCFBF1]">
            <Zap size={14} className="text-[#0D9488] fill-current" />
            <span className="font-bold text-[#0D9488]">Level {gameStats.level} Writer</span>
          </div>
          <p className="mt-3">Plan: {user?.plan || 'Free'}</p>
          <p className="mt-2">Total sessions: {usageCount}</p>
          <div className="mt-8 space-y-4">
            {user?.plan === 'Free' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Free Plan Usage</span>
                  <span className="text-xs font-black text-orange-700">{sessions.length} / 8 Sessions</span>
                </div>
                <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(sessions.length / 8) * 100}%` }}
                    className="h-full bg-orange-500"
                  />
                </div>
                <p className="mt-2 text-[10px] text-orange-600 font-medium text-center">
                  Upgrade to Pro for unlimited AI-powered editing!
                </p>
              </div>
            )}

            <div className="p-4 bg-[#F0FDFA] border border-[#5EEAD4] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-[#0D9488]">
                  <Award size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Available Credits</p>
                  <p className="text-lg font-black text-[#0D9488] leading-none">${credits.toFixed(2)}</p>
                  <p className="text-[9px] text-[#0D9488]/70 mt-1 font-bold">Extra ${((2000 / 100) * 0.4).toFixed(2)} in XP</p>
                </div>
              </div>
              <Link to="/games/profile" className="text-[10px] font-black text-[#0D9488] hover:underline uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-[#5EEAD4]">
                Earn More
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <section className="pr-1">
        {active === 'docs' && (
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <div className="space-y-4 pr-2">
              <div className="section-soft p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="section-title">Writer Workspace</h2>
                  <p className="mt-1 text-sm text-brand-muted">Edit your draft and hover flagged words to apply quick corrections.</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Enter focus topic (e.g. Climate Change)"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="text-xs px-3 py-2 rounded-lg border border-[#CCFBF1] bg-white w-56 focus:border-brand-primary outline-none transition-all shadow-sm"
                    />
                    <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white text-[10px] px-2 py-1 rounded">
                      Live Recommendations track your focus
                    </div>
                  </div>
                  <LanguageSupport text={text} onTranslated={setTranslatedText} />
                </div>
              </div>

              <AnimatePresence>
                {liveResult?.suggestion && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-3 rounded-xl border flex items-center gap-3 mb-2 ${liveResult.is_on_topic ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
                      <span className="text-xl">{liveResult.is_on_topic ? '💡' : '⚠️'}</span>
                      <p className={`text-xs font-medium ${liveResult.is_on_topic ? 'text-blue-700' : 'text-amber-700'}`}>
                        {isLiveChecking ? 'Analyzing...' : liveResult.suggestion}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <TextEditor
                value={text}
                onChange={setText}
                onFileUpload={setText}
                isGenerating={isChatGenerating}
                aiSuggestions={result?.changes}
              />

              <AnimatePresence>
                {translatedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <div id="translated-result-card" className="glass-card border-2 border-[#0D9488] p-6 bg-[#F0FDFA] mt-4 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-2 bg-[#0D9488] text-white text-[9px] font-black uppercase rounded-bl-xl">
                        Sarvam Translation
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-xl text-[#0D9488] border border-[#CCFBF1]">
                          <Languages size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-[#0D9488]">Translated Script</h3>
                          <p className="text-[10px] text-brand-muted font-bold uppercase">Multilingual conversion successful</p>
                        </div>
                      </div>

                      <div className="text-base text-gray-800 leading-relaxed font-semibold whitespace-pre-wrap bg-white p-5 rounded-2xl border border-[#CCFBF1] shadow-inner mb-4">
                        {translatedText}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => { setText(translatedText); setTranslatedText(''); }}
                          className="flex-1 bg-[#0D9488] text-white text-xs font-black py-3 rounded-xl hover:bg-[#0F766E] transition-all shadow-lg uppercase tracking-wider"
                        >
                          Apply to Document Editor
                        </button>
                        <button
                          onClick={() => setTranslatedText('')}
                          className="px-6 bg-white border border-red-200 text-red-500 text-xs font-black py-3 rounded-xl hover:bg-red-50 transition-all uppercase tracking-wider"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <StyleSelector value={style} onChange={setStyle} />

              <AnalyzeButton onClick={handleAnalyze} loading={loading} disabled={!text.trim()} />
              <div className="grid gap-4 xl:grid-cols-2">
                <OutputViewer output={result?.output} />
                <ConsistencyPanel data={result?.consistency} />
                <DiffPanel diff={result?.diff} />
                <ExplanationPanel explanation={result?.explanation} />
              </div>
            </div>

            {/* Full Screen Loading Game Modal */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_0_50px_rgba(13,148,136,0.3)]"
                  >
                    {/* Close button that does NOT trigger the redirect */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // While the backend request will continue, we hide the visual loading screen
                        setLoading(false);
                      }}
                      className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition hover:bg-black/40"
                    >
                      ✕
                    </button>

                    {/* Wrapper for the clickable area */}
                    <div
                      onClick={() => window.location.href = 'http://localhost:5173/games'}
                      className="cursor-pointer hover:scale-[1.02] transition-transform origin-bottom"
                    >
                      {/* Top cool graphic area */}
                      <div className="bg-gradient-to-br from-[#0D9488] via-teal-500 to-[#2DD4BF] p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        <motion.div
                          animate={{
                            rotate: [0, -10, 10, -10, 10, 0],
                            y: [0, -15, 0]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="text-7xl mb-4 drop-shadow-2xl"
                        >
                          🎮
                        </motion.div>
                        <h3 className="text-2xl font-black text-white tracking-widest uppercase mt-4">
                          AI is Analyzing...
                        </h3>
                        <p className="text-teal-50 mt-2 font-medium text-sm drop-shadow-sm">
                          Our highly advanced AI engines are rewriting your script for perfection.
                        </p>
                      </div>

                      {/* Bottom action area */}
                      <div className="p-8 bg-white text-center">
                        <div className="flex justify-center mb-6">
                          <div className="flex gap-2">
                            <span className="h-3 w-3 rounded-full bg-[#0D9488] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="h-3 w-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="h-3 w-3 rounded-full bg-[#2DD4BF] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>

                        <h4 className="text-lg font-bold text-slate-800 mb-2">Don't just stare at a loading screen!</h4>
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                          Level up your writer profile, earn XP, and unlock Pro features by playing quick writing games. Click anywhere to play!
                        </p>

                        <div className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-black uppercase tracking-widest text-sm shadow-lg border-b-4 border-teal-700 active:border-b-0 active:translate-y-1 transition-all">
                          Play Games Now! <Zap size={18} className="fill-current" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="hidden xl:block">
              <AIChatPanel
                text={text}
                onTextUpdate={(newText) => {
                  setText(newText);
                  setResult(null); // Clear previous analysis results so it displays the fresh text
                }}
                onGenerating={setIsChatGenerating}
              />
            </div>
          </div>
        )}

        {active === 'history' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card p-5">
              <h3 className="text-xl font-bold text-brand-text">Session History</h3>
              <div className="mt-4 space-y-3">
                {sessions.length === 0 && <p className="text-sm text-brand-muted">No sessions yet.</p>}
                {sessions.map((session) => (
                  <article key={session.id} className="rounded-xl border border-brand-border bg-[#F8F7FF] p-3">
                    <p className="text-sm font-semibold text-brand-text">{session.title}</p>
                    <p className="mt-1 text-xs text-brand-muted">Style: {session.style}</p>
                    <p className="mt-1 text-xs text-brand-muted">{new Date(session.at).toLocaleString()}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-xl font-bold text-brand-text">Activity Log</h3>
              <div className="mt-4 space-y-3">
                {activity.length === 0 && <p className="text-sm text-brand-muted">No activity yet.</p>}
                {activity.map((item) => (
                  <article key={item.id} className="rounded-xl border border-brand-border bg-[#F8F7FF] p-3">
                    <p className="text-sm text-brand-text">{item.message}</p>
                    <p className="mt-1 text-xs text-brand-muted">{new Date(item.at).toLocaleString()}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === 'account' && (
          <div className="space-y-6">
            {/* User Info + Stats */}
            <div className="glass-card p-5">
              <h3 className="text-xl font-bold text-brand-text">Account</h3>
              <p className="mt-2 text-sm text-brand-muted">{user?.name} ({user?.email})</p>

              {/* XP + Credits + Sessions row */}
              <div className="grid gap-4 grid-cols-3 mt-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-gradient-to-br from-[#0D9488] to-[#14B8A6] rounded-2xl text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Game XP</p>
                  <p className="text-2xl font-black mt-1">{gameStats.xp?.toLocaleString() || 0}</p>
                  <p className="text-[10px] opacity-70 mt-1">Level {gameStats.level}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Credits</p>
                  <p className="text-2xl font-black mt-1">${credits.toFixed(2)}</p>
                  <p className="text-[10px] opacity-70 mt-1">100 XP = $0.40</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Sessions</p>
                  <p className="text-2xl font-black mt-1">{sessions.length}{user?.plan === 'Free' ? ' / 8' : ''}</p>
                  <p className="text-[10px] opacity-70 mt-1">{user?.plan || 'Free'} Plan</p>
                </motion.div>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const price = planPrices[plan.name] || 0;
                const canAfford = credits >= price;
                const isCurrent = user?.plan === plan.name;
                return (
                  <motion.article
                    key={plan.name}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`glass-card card-interactive p-5 relative ${isCurrent ? 'ring-2 ring-[#0D9488]' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-brand-text">{plan.name}</h4>
                      {isCurrent && <Sparkles size={16} className="text-brand-primary" />}
                    </div>
                    <p className="mt-3 text-2xl font-bold text-brand-primary">{plan.price}</p>
                    <p className="mt-2 text-sm text-brand-muted">{plan.features}</p>

                    {price > 0 && !isCurrent && (
                      <p className={`mt-2 text-[10px] font-bold ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
                        {canAfford
                          ? `✅ You have $${credits.toFixed(2)} credits — enough!`
                          : `❌ Need $${price.toFixed(2)}, you have $${credits.toFixed(2)}`}
                      </p>
                    )}

                    <button
                      onClick={() => choosePlan(plan.name)}
                      disabled={isCurrent}
                      className={`mt-5 w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${isCurrent
                        ? 'bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] cursor-default'
                        : canAfford || price === 0
                          ? 'bg-[#0D9488] text-white hover:bg-[#0F766E] shadow-md'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {isCurrent ? '✓ Current Plan' : price === 0 ? 'Downgrade' : canAfford ? `Buy with $${price} Credits` : 'Not enough credits'}
                    </button>
                  </motion.article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
