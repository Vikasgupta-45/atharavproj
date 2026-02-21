import { motion } from 'framer-motion';
import { ArrowRight, Bot, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { setupScrollAnimations } from '../animations/scrollAnimations';

/* ── Typewriter cycling component ───────────────────────────────────── */
const PHRASES = ['AI co-writer', 'AI editor', 'AI enhancer'];
const TYPE_SPEED = 110; // ms per character typed
const DELETE_SPEED = 55;  // ms per character deleted
const PAUSE_AFTER = 1500; // ms pause after fully typed
const PAUSE_BEFORE = 280;  // ms pause before next phrase

function TypewriterCycle() {
  const [displayed, setDisplayed] = useState('');
  const timerRef = useRef(null);
  // All mutable counters live in a ref — mutations never trigger effect restarts
  const state = useRef({ phraseIdx: 0, charIdx: 0, deleting: false });

  useEffect(() => {
    const tick = () => {
      const s = state.current;
      const target = PHRASES[s.phraseIdx];

      if (!s.deleting) {
        /* ── Type one character ── */
        s.charIdx = Math.min(s.charIdx + 1, target.length);
        setDisplayed(target.slice(0, s.charIdx));

        if (s.charIdx === target.length) {
          /* Fully typed — wait then start deleting */
          timerRef.current = setTimeout(() => {
            s.deleting = true;
            timerRef.current = setTimeout(tick, DELETE_SPEED);
          }, PAUSE_AFTER);
          return;
        }
      } else {
        /* ── Delete one character ── */
        s.charIdx = Math.max(s.charIdx - 1, 0);
        setDisplayed(target.slice(0, s.charIdx));

        if (s.charIdx === 0) {
          /* Fully deleted — wait then move to next phrase */
          s.deleting = false;
          s.phraseIdx = (s.phraseIdx + 1) % PHRASES.length;
          timerRef.current = setTimeout(tick, PAUSE_BEFORE);
          return;
        }
      }

      timerRef.current = setTimeout(tick, s.deleting ? DELETE_SPEED : TYPE_SPEED);
    };

    timerRef.current = setTimeout(tick, TYPE_SPEED);
    return () => clearTimeout(timerRef.current);
  }, []); // ← runs ONCE on mount, never restarts

  return (
    <span className="text-brand-primary">
      {displayed}
      {/* Blinking cursor */}
      <span
        className="ml-0.5 inline-block w-[2px] align-middle bg-brand-primary"
        style={{ height: '0.85em', animation: 'blink-caret 0.72s step-end infinite' }}
      />
      <style>{`@keyframes blink-caret{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </span>
  );
}

/* ── Page data ───────────────────────────────────────────────────────── */
const features = [
  {
    icon: FileText,
    title: 'Smart Drafting',
    text: 'Write faster with structured AI suggestions while keeping your original intent.',
  },
  {
    icon: Bot,
    title: 'Tone Intelligence',
    text: 'Adapt your writing style for business, creative, persuasive, or clear communication.',
  },
  {
    icon: ShieldCheck,
    title: 'Consistency Guard',
    text: 'Track writing quality, logical flow, and clarity scores in every session.',
  },
  {
    icon: Sparkles,
    title: 'Explainable Changes',
    text: 'See why each sentence changed with transparent explanations and diff previews.',
  },
];

const aboutPoints = [
  {
    title: 'Why Sarthak AI',
    text: 'Built for students, creators, and teams who need clean writing fast without losing original meaning.',
  },
  {
    title: 'What It Improves',
    text: 'Grammar, tone consistency, sentence structure, and readability with transparent suggestions.',
  },
  {
    title: 'How It Works',
    text: 'Paste your draft, choose style, run analysis, and apply guided edits in one focused workspace.',
  },
];

const stats = [
  { label: 'Avg editing time saved', value: '42%' },
  { label: 'Draft quality uplift', value: '+31%' },
  { label: 'Tone consistency score', value: '94/100' },
];

/* ── Page component ──────────────────────────────────────────────────── */
function Home() {
  useEffect(() => {
    const cleanup = setupScrollAnimations('.scroll-reveal');
    return cleanup;
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8">
      <section className="scroll-reveal">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex rounded-full border border-[#5EEAD4] bg-[#F0FDFA] px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">
            AI Writing Workspace
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-brand-text md:text-6xl">
            Write cleaner, faster, and smarter with{' '}
            <br />
            <TypewriterCycle />
          </h1>
          <p className="mt-4 max-w-2xl text-base text-brand-muted md:text-lg">
            A modern assistant for writers, students, and teams. Upload drafts, edit in real time, and improve consistency with actionable insights.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-primary glow-button">
              Start Free
            </Link>
            <Link to="/login" className="btn-secondary inline-flex items-center gap-2">
              Continue <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-2">
        {features.map((feature) => (
          <article key={feature.title} className="scroll-reveal glass-card card-interactive p-6">
            <feature.icon className="mb-4 text-brand-primary" size={22} />
            <h3 className="text-xl font-bold text-brand-text">{feature.title}</h3>
            <p className="mt-2 text-sm text-brand-muted">{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <article className="scroll-reveal section-soft p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">About Sarthak AI</p>
          <h2 className="mt-3 text-2xl font-bold text-brand-text md:text-3xl">A focused writing platform for serious output.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted md:text-base">
            Sarthak AI combines grammar correction, rewrite intelligence, and explainable suggestions so you can ship better writing with less effort.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-brand-border bg-white p-4">
                <p className="text-2xl font-bold text-brand-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-brand-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="scroll-reveal space-y-4">
          {aboutPoints.map((item) => (
            <article key={item.title} className="glass-card card-interactive p-5">
              <h3 className="text-base font-semibold text-brand-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-brand-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
