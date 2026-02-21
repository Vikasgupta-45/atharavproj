import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

/* ─────────────────────────────────────────────
   PHASE DURATIONS  (seconds)
   0.00 – 0.50   paper fade-in
   0.50 – 0.85   pen slides in
   0.85 – 3.70   ink strokes draw (SVG pathLength)
   3.70 – 4.10   pause, pen lifts
   4.10 – 5.30   GSAP zoom into text
   5.30 – 5.90   white-flash reveal
   ───────────────────────────────────────────── */

const BRAND_LINE1 = 'Sarthak AI';
const BRAND_LINE2 = 'Write Better. Think Smarter.';

/* Pre-built SVG path data for "Sarthak AI" handwritten style     */
/* We use a simple approach: render invisible <text> with         */
/* stroke-dasharray/offset animation via CSS custom property      */

function CinematicLoader({ onComplete }) {
    const overlayRef = useRef(null);
    const paperRef = useRef(null);
    const penRef = useRef(null);
    const sceneRef = useRef(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        /* ── Detect low-end device → skip animation ─── */
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.innerWidth < 480;
        if (prefersReduced || isMobile) {
            setTimeout(onComplete, 300);
            return;
        }

        /* ── Get elements ──────────────────────────── */
        const overlay = overlayRef.current;
        const paper = paperRef.current;
        const pen = penRef.current;
        const scene = sceneRef.current;

        /* ── Master GSAP timeline ──────────── ~2.5s total ── */
        const tl = gsap.timeline({
            onComplete: () => {
                setVisible(false);
                setTimeout(onComplete, 300);
            },
        });

        // 1. Paper fade-in — 0.35s
        tl.fromTo(paper,
            { opacity: 0, scale: 0.94, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' },
        );

        // 2. Pen slides in from right → lands at tip of line 1 text
        //    CSS: top=-43px left=36px  → tip rests at paper (36, 77) ≈ line1 baseline
        tl.fromTo(pen,
            { opacity: 0, x: 160, y: -60, rotate: -38 },
            { opacity: 1, x: 0, y: 0, rotate: -38, duration: 0.28, ease: 'back.out(1.2)' },
            '-=0.05',
        );

        // 3a. Pen sweeps line 1: "Sarthak AI" ~10 bold chars @40px ≈ 220px wide
        tl.to(pen, { x: 220, y: 0, duration: 0.42, ease: 'none' }, '+=0.05');

        // 3b. Snap to start of line 2 (y offset = separator + line2 gap ≈ 28px)
        tl.to(pen, { x: 0, y: 28, duration: 0.13, ease: 'power2.inOut' }, '+=0.18');

        // 3c. Pen sweeps line 2: "Write Better. Think Smarter." ~310px wide @18px
        tl.to(pen, { x: 310, y: 28, duration: 0.85, ease: 'none' });

        // 4. Pen lifts out — floats up and to right
        tl.to(pen,
            { opacity: 0, y: -40, x: 380, rotate: -10, duration: 0.22, ease: 'power2.in' },
            '+=0.12',
        );

        // 5. Zoom into scene — 0.65s
        tl.to(scene, {
            scale: 6, filter: 'blur(10px)', opacity: 0,
            duration: 0.65, ease: 'power2.inOut',
        }, '+=0.05');

        // 6. White flash — 0.35s (overlaps zoom)
        tl.to(overlay, { opacity: 1, duration: 0.35, ease: 'power1.inOut' }, '-=0.35');

        return () => { tl.kill(); };

    }, [onComplete]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
                    style={{ background: '#fff' }}
                >
                    {/* White flash overlay (starts transparent, GSAP brings it to 1 at end) */}
                    <div
                        ref={overlayRef}
                        className="pointer-events-none absolute inset-0 z-10 bg-white"
                        style={{ opacity: 0 }}
                    />

                    {/* ── Scene: paper + pen ───────────────── */}
                    <div ref={sceneRef} className="relative flex items-center justify-center">

                        {/* Paper card */}
                        <div
                            ref={paperRef}
                            className="relative flex flex-col items-start justify-start rounded-2xl bg-white"
                            style={{
                                width: 'min(440px, 88vw)',
                                minHeight: 200,
                                padding: '32px 36px',
                                boxShadow:
                                    '0 2px 4px rgba(0,0,0,0.04), ' +
                                    '0 8px 24px rgba(0,0,0,0.07), ' +
                                    '0 40px 80px rgba(139,92,246,0.10)',
                                backgroundImage:
                                    'repeating-linear-gradient(transparent, transparent 31px, rgba(196,181,253,0.18) 31px, rgba(196,181,253,0.18) 32px)',
                                backgroundPositionY: '48px',
                                opacity: 0,
                            }}
                        >
                            {/* Left margin rule */}
                            <div
                                className="pointer-events-none absolute bottom-0 left-[72px] top-0 w-px"
                                style={{ background: 'rgba(252,165,165,0.35)' }}
                            />

                            {/* Paper corner fold */}
                            <div
                                className="absolute right-0 top-0 h-10 w-10"
                                style={{
                                    background: 'linear-gradient(225deg,#f0fdfa 50%,transparent 50%)',
                                    borderLeft: '1px solid #ccfbf1',
                                    borderBottom: '1px solid #ccfbf1',
                                }}
                            />

                            {/* ── Line 1: "Sarthak AI" ─────────── */}
                            <div className="relative w-full">
                                <WritingText
                                    text={BRAND_LINE1}
                                    fontSize={40}
                                    fontWeight={700}
                                    color="#0F766E"
                                    delay={0}
                                />
                            </div>

                            {/* Separator */}
                            <motion.div
                                className="my-3 h-px w-20 rounded-full bg-[#5EEAD4]"
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                transition={{ delay: 1.1, duration: 0.25, ease: 'easeOut' }}
                                style={{ transformOrigin: 'left' }}
                            />

                            {/* ── Line 2: sub-phrase ───────────── */}
                            <div className="relative w-full">
                                <WritingText
                                    text={BRAND_LINE2}
                                    fontSize={18}
                                    fontWeight={500}
                                    color="#0D9488"
                                    delay={1.3}
                                />
                            </div>

                            {/* Ink dot that pulses at end of written text */}
                            <motion.div
                                className="mt-6 h-2 w-2 rounded-full bg-[#0D9488]"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 1.4, 0.9, 1], opacity: [0, 1, 1, 0.6] }}
                                transition={{ delay: 2.0, duration: 0.3, times: [0, 0.5, 0.75, 1] }}
                            />
                            {/* ── Pen SVG — sits ON the page ───── */}
                            <div
                                ref={penRef}
                                className="pointer-events-none absolute"
                                style={{
                                    /* tip lands at paper (36px, ~77px) = line1 baseline */
                                    top: '-43px',
                                    left: '36px',
                                    opacity: 0,
                                    transformOrigin: 'bottom center',
                                    zIndex: 10,
                                }}
                            >
                                <PenSVG width={32} height={120} />
                            </div>
                        </div>
                    </div>{/* ── end sceneRef ── */}

                    {/* Brand footer text */}
                    <motion.p
                        className="absolute bottom-10 text-xs font-semibold tracking-[0.22em] text-[#5EEAD4]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        SARTHAK AI
                    </motion.p>
                </motion.div>

            )}
        </AnimatePresence>
    );
}

/* ─── Char-by-char writing animation component ──────────────────────────── */
function WritingText({ text, fontSize, fontWeight, color, delay }) {
    return (
        <div className="relative inline-flex flex-wrap" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {text.split('').map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        delay: delay + i * (char === ' ' ? 0.02 : 0.035),
                        duration: 0.01,
                    }}
                    style={{
                        fontSize,
                        fontWeight,
                        color,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.15,
                        display: 'inline-block',
                        whiteSpace: char === ' ' ? 'pre' : 'normal',
                    }}
                >
                    {char}
                </motion.span>
            ))}
        </div>
    );
}

/* ─── Realistic pen SVG ─────────────────────────────────────────────────── */
function PenSVG({ width = 32, height = 120 }) {
    return (
        <svg width={width} height={height} viewBox="0 0 56 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="penBody" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="45%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6D28D9" />
                </linearGradient>
                <linearGradient id="penGrip" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#5B21B6" />
                </linearGradient>
                <filter id="penGlow">
                    <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#8B5CF6" floodOpacity="0.5" />
                </filter>
            </defs>

            {/* Clip */}
            <rect x="31" y="4" width="5" height="80" rx="2.5" fill="#DDD6FE" />
            <rect x="32.5" y="4" width="2" height="78" rx="1" fill="#EDE9FE" opacity="0.6" />

            {/* Body */}
            <rect x="10" y="8" width="26" height="120" rx="5" fill="url(#penBody)" filter="url(#penGlow)" />

            {/* Shine */}
            <rect x="13" y="12" width="4" height="110" rx="2" fill="white" opacity="0.2" />

            {/* Brand band */}
            <rect x="10" y="122" width="26" height="5" rx="1" fill="#DDD6FE" />
            <rect x="10" y="130" width="26" height="2" rx="1" fill="#C4B5FD" />

            {/* Grip */}
            <rect x="11" y="133" width="24" height="24" rx="3" fill="url(#penGrip)" />
            {[138, 142, 146, 150].map((y) => (
                <rect key={y} x="11" y={y} width="24" height="1.5" rx="0.75" fill="white" opacity="0.1" />
            ))}

            {/* Nib */}
            <path d="M11 157 L28 190 L45 157 Z" fill="#5B21B6" />
            <line x1="28" y1="158" x2="28" y2="188" stroke="#7C3AED" strokeWidth="1.5" opacity="0.5" />
            <path d="M13 157 L20 175 L11 157 Z" fill="white" opacity="0.14" />

            {/* Tip */}
            <ellipse cx="28" cy="190" rx="3.5" ry="2" fill="#4C1D95" />
            <circle cx="28" cy="190" r="2" fill="#C4B5FD" opacity="0.85" />

            {/* Eraser cap */}
            <rect x="14" y="2" width="18" height="8" rx="4" fill="#EDE9FE" />
            <rect x="16" y="3" width="14" height="4" rx="2" fill="#FCA5A5" opacity="0.6" />
        </svg>
    );
}

export default CinematicLoader;

