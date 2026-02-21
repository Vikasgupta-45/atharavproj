import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileClock, Files, Sparkles, UserCircle2, Zap, Award } from 'lucide-react';
import AIChatPanel from '../components/AIChatPanel';
import AnalyzeButton from '../components/AnalyzeButton';
import ConsistencyPanel from '../components/ConsistencyPanel';
import DiffPanel from '../components/DiffPanel';
import ExplanationPanel from '../components/ExplanationPanel';
import OutputViewer from '../components/OutputViewer';
import StyleSelector from '../components/StyleSelector';
import TextEditor from '../components/TextEditor';
import { useAuth } from '../context/AuthContext';
import { analyzeText } from '../services/api';
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
  const [result, setResult] = useState(null);
  const [gameStats, setGameStats] = useState({ level: 1, xp: 0 });

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
              <div className="section-soft p-4">
                <h2 className="section-title">Writer Workspace</h2>
                <p className="mt-1 text-sm text-brand-muted">Edit your draft and hover flagged words to apply quick corrections.</p>
              </div>

              <TextEditor value={text} onChange={setText} onFileUpload={setText} />
              <StyleSelector value={style} onChange={setStyle} />
              <AnalyzeButton onClick={handleAnalyze} loading={loading} disabled={!text.trim()} />

              <div className="grid gap-4 xl:grid-cols-2">
                <OutputViewer output={result?.output} />
                <ConsistencyPanel data={result?.consistency} />
                <DiffPanel diff={result?.diff} />
                <ExplanationPanel explanation={result?.explanation} />
              </div>
            </div>
            <div className="hidden xl:block">
              <AIChatPanel text={text} />
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
