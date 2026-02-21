import { AnimatePresence, motion } from 'framer-motion';

/* ─── SVG paths for the "written lines" on the paper ─────────────────────── */
const LINES = [
  { y: 82, width: 140, delay: 0.3 },
  { y: 102, width: 110, delay: 0.9 },
  { y: 122, width: 128, delay: 1.5 },
  { y: 142, width: 95, delay: 2.1 },
  { y: 162, width: 120, delay: 2.7 },
];

/* Line draw animation using stroke-dashoffset */
function WrittenLine({ y, width, delay }) {
  return (
    <motion.line
      x1="30"
      y1={y}
      x2={30 + width}
      y2={y}
      stroke="#C4B5FD"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { delay, duration: 0.55, ease: 'easeOut' },
        opacity: { delay, duration: 0.1 },
      }}
    />
  );
}

function Loader({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 40% 40%, rgba(139,92,246,0.10) 0%, transparent 60%), ' +
              'radial-gradient(circle at 70% 70%, rgba(196,181,253,0.12) 0%, transparent 50%), ' +
              '#ffffff',
          }}
        >
          {/* ── Paper + Pen scene ───────────────────────────────────────── */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <svg
              width="220"
              height="260"
              viewBox="0 0 220 260"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── Paper drop-shadow ── */}
              <defs>
                <filter id="paper-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#8B5CF6" floodOpacity="0.13" />
                </filter>
                <filter id="pen-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#6D28D9" floodOpacity="0.25" />
                </filter>
                <linearGradient id="paper-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FDFCFF" />
                  <stop offset="100%" stopColor="#F5F0FF" />
                </linearGradient>
                <linearGradient id="pen-body" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>

              {/* ── Paper ── */}
              <rect
                x="10" y="10" width="180" height="230"
                rx="12"
                fill="url(#paper-grad)"
                stroke="#E9E5FF"
                strokeWidth="1.5"
                filter="url(#paper-shadow)"
              />

              {/* Left margin line */}
              <line x1="40" y1="20" x2="40" y2="230" stroke="#EDE9FE" strokeWidth="1" />

              {/* Ruled lines (static, faint) */}
              {[82, 102, 122, 142, 162].map((y) => (
                <line
                  key={y}
                  x1="30" y1={y} x2="175" y2={y}
                  stroke="#EDE9FE" strokeWidth="1"
                />
              ))}

              {/* Animated ink lines being written */}
              {LINES.map((l) => (
                <WrittenLine key={l.y} {...l} />
              ))}

              {/* ── Pen (animates like it's writing) ── */}
              {/* The pen moves right across the page in sync with each line */}
              <motion.g
                filter="url(#pen-shadow)"
                animate={{
                  x: [0, 115, 0, 102, 0, 118, 0, 84, 0, 108, 0],
                  y: [-20, -20, 0, 0, 20, 20, 40, 40, 60, 60, 80],
                  rotate: [-38, -38, -38, -38, -38, -38, -38, -38, -38, -38, -38],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.09, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.72, 0.81, 1],
                }}
              >
                {/* Pen body */}
                <rect x="25" y="20" width="10" height="46" rx="3" fill="url(#pen-body)" />
                {/* Pen clip */}
                <rect x="33" y="22" width="2" height="38" rx="1" fill="#6D28D9" opacity="0.5" />
                {/* Pen grip */}
                <rect x="25" y="54" width="10" height="10" rx="1.5" fill="#6D28D9" opacity="0.4" />
                {/* Nib taper */}
                <path d="M25 64 L30 78 L35 64 Z" fill="#5B21B6" />
                {/* Nib tip shine */}
                <circle cx="30" cy="78" r="1.5" fill="#C4B5FD" />

                {/* Ink dot at tip */}
                <motion.circle
                  cx="30" cy="80" r="1.8"
                  fill="#7C3AED"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
                  transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.g>
            </svg>

            {/* Subtle glow underneath the paper */}
            <motion.div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-6 w-36 rounded-full blur-xl"
              style={{ background: 'rgba(139,92,246,0.18)' }}
              animate={{ scaleX: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* ── Text block ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="mt-8 flex flex-col items-center gap-1"
          >
            <p className="text-base font-bold tracking-[0.18em] text-[#7C3AED]">
              Sarthak AI
            </p>
            {/* Animated ellipsis "Preparing..." */}
            <motion.p className="text-xs tracking-[0.12em] text-[#9CA3AF]">
              {'Preparing your workspace'}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                ...
              </motion.span>
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Loader;
