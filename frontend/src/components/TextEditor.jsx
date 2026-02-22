import { useCallback, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { Download, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* Point pdfjs to its worker (bundled by Vite from node_modules) */
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/* ─── Dictionary ─────────────────────────────────────────────────────────── */
const typoMap = {
  todays: { correction: "today's", reason: 'Missing apostrophe — should be "today\'s".' },
  peoples: { correction: 'people', reason: '"People" is already plural; "peoples" is not standard.' },
  depend: { correction: 'dependent', reason: 'The adjective form needed here is "dependent".' },
  technologyy: { correction: 'technology', reason: 'Extra "y" — spelling error.' },
  technologye: { correction: 'technology', reason: 'Extra "e" — spelling error.' },
  oppurtunities: { correction: 'opportunities', reason: 'Misspelling — correct is "opportunities".' },
  spends: { correction: 'spend', reason: 'Plural subject "students" takes "spend".' },
  medias: { correction: 'media', reason: '"Media" is already plural.' },
  effect: { correction: 'affect', reason: '"Affect" is the verb; "effect" is usually a noun.' },
  challengees: { correction: 'challenges', reason: 'Extra "e" — correct is "challenges".' },
  challanges: { correction: 'challenges', reason: 'Misspelling — correct is "challenges".' },
  severel: { correction: 'several', reason: 'Misspelling — correct is "several".' },
  concentrashun: { correction: 'concentration', reason: 'Phonetic misspelling — correct is "concentration".' },
  goverments: { correction: 'governments', reason: 'Missing "n" — correct is "governments".' },
  dont: { correction: "don't", reason: 'Contraction needs an apostrophe: "don\'t".' },
  noww: { correction: 'now', reason: 'Extra "w" — spelling error.' },
  consequencee: { correction: 'consequence', reason: 'Extra "e" — correct is "consequence".' },
  concequence: { correction: 'consequence', reason: 'Misspelling — correct is "consequence".' },
};

const wordPattern = /^([^A-Za-z']*)([A-Za-z']+)([^A-Za-z']*)$/;

function getSuggestion(token, aiSuggestions = []) {
  const m = token.match(wordPattern);
  if (!m) return null;
  const word = m[2].toLowerCase();

  // 1. Check local static dictionary (fast)
  if (typoMap[word]) return typoMap[word];

  // 2. Check AI suggestions from backend
  const aiMatch = aiSuggestions.find(s => s.before.toLowerCase() === word);
  if (aiMatch) {
    return {
      correction: aiMatch.after,
      reason: "Artificial Intelligence detected a grammar or spelling inconsistency here."
    };
  }

  return null;
}

/* shared styles for textarea + backdrop so they line up perfectly */
const editorStyle = {
  fontFamily: 'Manrope, sans-serif',
  fontSize: '14px',
  lineHeight: '2rem',      /* leading-8 = 2rem */
  padding: '1rem',
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
function TextEditor({ value, onChange, onFileUpload, isGenerating, aiSuggestions = [] }) {
  const textareaRef = useRef(null);
  const wrapRef = useRef(null);
  const [tooltip, setTooltip] = useState(null); // { tokenIndex, word, suggestion, top, left }

  const [uploading, setUploading] = useState(false);

  const handleExportPDF = () => {
    if (!value.trim()) return;
    try {
      const doc = new jsPDF();

      // Define styles
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(13, 148, 136); // brand-primary color #0D9488
      doc.text("Sarthak AI - Document", margin, 30);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, 38);

      doc.setDrawColor(204, 251, 241); // #CCFBF1
      doc.line(margin, 42, pageWidth - margin, 42);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55); // gray-800

      const splitContent = doc.splitTextToSize(value, contentWidth);
      doc.text(splitContent, margin, 55);

      doc.save(`Sarthak_AI_Document_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to export PDF. Please try again.");
    }
  };

  /* File upload — supports .txt and .pdf */
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';            // reset so same file can be re-uploaded

    if (file.name.toLowerCase().endsWith('.pdf')) {
      /* ── PDF: use pdfjs-dist to extract text ── */
      setUploading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = [];
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const content = await page.getTextContent();
          pages.push(content.items.map((item) => item.str).join(' '));
        }
        onFileUpload(pages.join('\n\n'));
      } catch (err) {
        console.error('PDF read error:', err);
        onFileUpload('[Could not read PDF — please try a different file.]');
      } finally {
        setUploading(false);
      }
    } else {
      /* ── Plain text ── */
      const reader = new FileReader();
      reader.onload = (ev) => onFileUpload(ev.target?.result || '');
      reader.readAsText(file);
    }
  };

  /* Tokenise text */
  const tokens = useMemo(() => value.split(/(\s+)/), [value]);

  /* Error count */
  const errorCount = useMemo(
    () => tokens.reduce((n, t) => (getSuggestion(t, aiSuggestions) ? n + 1 : n), 0),
    [tokens, aiSuggestions],
  );

  /* Apply correction */
  const applyFix = useCallback(
    (tokenIndex, correction) => {
      const updated = [...tokens];
      const token = updated[tokenIndex];
      const m = token.match(wordPattern);
      if (!m) return;
      const isCapital =
        m[2][0] === m[2][0].toUpperCase() && m[2][0] !== m[2][0].toLowerCase();
      const word = isCapital
        ? correction[0].toUpperCase() + correction.slice(1)
        : correction;
      updated[tokenIndex] = m[1] + word + m[3];
      onChange(updated.join(''));
      setTooltip(null);
      textareaRef.current?.focus();
    },
    [tokens, onChange],
  );

  /* Sync scroll: backdrop follows textarea scroll */
  const backdropRef = useRef(null);
  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  /* ── When mouse moves over the BACKDROP, detect which word is hovered ── */
  /*  We can't put onMouseMove on the textarea (it's transparent text).    */
  /*  Instead, wrap both in a div and use a separate overlay div for hover. */

  return (
    <section className="glass-card p-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-brand-text">Document Editor</h3>
          <p className="mt-0.5 text-xs text-brand-muted">
            Misspelled words are{' '}
            <span className="font-semibold text-red-500">highlighted in red</span>.
            Hover a word to see why · Click the card to fix.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {errorCount > 0 && (
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
              {errorCount} {errorCount === 1 ? 'issue' : 'issues'} found
            </span>
          )}
          {errorCount === 0 && value.trim() && (
            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
              ✓ All clear
            </span>
          )}
          {value.trim() && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-full border border-brand-primary bg-white px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              <Download size={15} />
              Export PDF
            </button>
          )}
          <label className={`flex cursor-pointer items-center gap-2 rounded-full border border-[var(--light-lav)] px-4 py-2 text-sm font-medium transition ${uploading ? 'bg-[var(--primary)] text-white shadow-[0_0_15px_rgba(13,148,136,0.5)] cursor-wait' : 'bg-[var(--bg-soft)] text-brand-primary hover:bg-[#CCFBF1]'}`}>
            {uploading ? (
              <>
                <div className="flex items-center gap-2 animate-pulse">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
                  </span>
                  Processing Text...
                </div>
              </>
            ) : (
              <>
                <Upload size={15} />
                Upload .txt / .pdf
              </>
            )}
            <input
              type="file"
              accept=".txt,.pdf,application/pdf"
              className="hidden"
              onChange={handleFile}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Extra Pop-up when uploading to encourage game exploration */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl animate-bounce">🎮</span>
              <div>
                <h4 className="font-bold text-indigo-900 text-sm">Processing your file...</h4>
                <p className="text-xs text-indigo-700 mt-1 font-medium">
                  This might take a few seconds. While you wait, why not check out the <a href="/games/profile" target="_blank" rel="noreferrer" className="underline font-bold text-indigo-600 hover:text-indigo-800 pointer-events-auto">Games Section</a>?
                  Earn XP and level up your writer profile!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Editor stack ───────────────────────────────────────────────── */}
      <div
        ref={wrapRef}
        className={`relative rounded-xl border border-[#CCFBF1] bg-white transition ${isGenerating ? 'select-none pointer-events-none' : 'focus-within:border-brand-primary focus-within:shadow-[0_0_0_4px_rgba(13,148,136,0.15)]'}`}
        style={{ height: '22rem', overflow: 'hidden' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {isGenerating && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-6 py-3 shadow-sm border border-[#CCFBF1]">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-primary"></span>
              </span>
              <p className="text-sm font-bold text-brand-primary animate-pulse">AI is rewriting your draft...</p>
            </div>
          </div>
        )}
        {/* ① Backdrop: renders highlighted HTML, scrolls in sync */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 overflow-hidden rounded-xl text-sm ${isGenerating ? 'blur-[3px] opacity-50 transition-all duration-300' : 'text-transparent'}`}
          style={{ ...editorStyle, color: isGenerating ? 'rgba(31,41,55,0.92)' : 'transparent' }}
        >
          {tokens.map((token, i) => {
            const sug = getSuggestion(token, aiSuggestions);
            return sug ? (
              <mark
                key={i}
                style={{
                  background: 'rgba(254,202,202,0.55)', /* red-200/55 */
                  color: 'transparent',
                  borderRadius: '3px',
                  textDecoration: 'underline wavy #ef4444',
                  textDecorationSkipInk: 'none',
                  textUnderlineOffset: '4px',
                }}
              >
                {token}
              </mark>
            ) : (
              <span key={i}>{token}</span>
            );
          })}
          {/* trailing space so backdrop height matches textarea */}
          {'\u200b'}
        </div>

        {/* ② Transparent textarea on top — handles all input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder="Paste your draft or start typing here. Misspelled words will be highlighted in red instantly…"
          spellCheck={false}
          className={`relative w-full resize-none rounded-xl bg-transparent text-sm outline-none placeholder:text-slate-400 ${isGenerating ? 'opacity-0' : ''}`}
          style={{
            ...editorStyle,
            height: '22rem',
            overflowY: 'auto',
            color: 'rgba(31,41,55,0.92)',
            caretColor: '#1f2937',
            zIndex: 1,
          }}
        />

        {/* ③ Hover-detection layer: invisible spans positioned after each render */}
        {/*   We use a separate absolutely-positioned div with pointer-events   */}
        <HoverLayer
          tokens={tokens}
          wrapRef={wrapRef}
          onHover={setTooltip}
          onFix={applyFix}
          editorStyle={editorStyle}
          aiSuggestions={aiSuggestions}
        />

        {/* ④ Tooltip / hover card */}
        {tooltip && (
          <HoverCard
            tooltip={tooltip}
            onFix={applyFix}
            onClose={() => setTooltip(null)}
          />
        )}
      </div>

      {/* ── AI Correction Explanations Card ──────────────────────────────── */}
      {value.trim() && (
        <div className="mt-4 rounded-2xl border border-[#CCFBF1] bg-[#F0FDFA]">
          {/* Card header */}
          <div className="flex items-center gap-2 border-b border-[#99F6E4] px-4 py-3">
            <span className="text-base">🤖</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#0D9488]">AI Corrections</p>
              <p className="text-[11px] text-[#6B7280]">
                {errorCount > 0
                  ? `Explaining ${errorCount} correction${errorCount > 1 ? 's' : ''} found in your document`
                  : 'No corrections needed — your text looks great!'}
              </p>
            </div>
          </div>

          {/* Correction rows */}
          {errorCount === 0 ? (
            <div className="flex items-center gap-2 px-4 py-4">
              <span className="text-xl">✅</span>
              <p className="text-sm font-medium text-[#0D9488]">All clear! No spelling or grammar issues detected.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#CCFBF1]">
              {tokens.reduce((acc, token, tokenIndex) => {
                const sug = getSuggestion(token, aiSuggestions);
                if (!sug) return acc;
                const word = token.trim();
                // Deduplicate: skip if same wrong word already shown
                if (acc.seen.has(word.toLowerCase())) return acc;
                acc.seen.add(word.toLowerCase());
                acc.rows.push(
                  <div key={tokenIndex} className="flex items-start gap-3 px-4 py-3">
                    {/* Wrong → right */}
                    <div className="flex min-w-[140px] flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600 line-through">
                          {word}
                        </span>
                        <span className="text-xs text-slate-400">→</span>
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-700">
                          {sug.correction}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="flex-1 text-xs leading-relaxed text-slate-600">
                      <span className="font-semibold text-slate-800">Why: </span>
                      {sug.reason}
                    </p>

                    {/* Fix button */}
                    <button
                      onClick={() => applyFix(tokenIndex, sug.correction)}
                      className="shrink-0 rounded-full bg-[#0D9488] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#0F766E] active:scale-95"
                    >
                      Fix
                    </button>
                  </div>
                );
                return acc;
              }, { rows: [], seen: new Set() }).rows}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ─── HoverLayer: mirrors backdrop text, makes typo spans pointer-interactive ─ */
function HoverLayer({ tokens, wrapRef, onHover, onFix, editorStyle, aiSuggestions }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl text-sm"
      style={{ ...editorStyle, zIndex: 2, color: 'transparent', pointerEvents: 'none' }}
    >
      {tokens.map((token, i) => {
        const sug = getSuggestion(token, aiSuggestions);
        if (!sug) return <span key={i}>{token}</span>;

        return (
          <span
            key={i}
            title={`Click to fix: ${token.trim()} → ${sug.correction}`}
            style={{
              pointerEvents: 'auto',
              color: 'transparent',
              cursor: 'pointer',
              borderRadius: '3px',
              position: 'relative',
              display: 'inline',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onFix(i, sug.correction);   // ← instantly apply on click
              onHover(null);              // close any open tooltip
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const wrapRect = wrapRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
              const wrapWidth = wrapRef.current?.offsetWidth || 600;
              const cardWidth = 264;
              let left = rect.left - wrapRect.left;
              if (left + cardWidth > wrapWidth) left = wrapWidth - cardWidth - 4;
              onHover({
                tokenIndex: i,
                word: token.trim(),
                suggestion: sug,
                top: rect.bottom - wrapRect.top + 6,
                left: Math.max(0, left),
              });
            }}
            onMouseLeave={() => onHover(null)}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
}

/* ─── HoverCard ──────────────────────────────────────────────────────────── */
function HoverCard({ tooltip, onFix, onClose }) {
  const { tokenIndex, word, suggestion, top, left } = tooltip;

  return (
    <div
      className="absolute z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      style={{ top, left, pointerEvents: 'all' }}
      onMouseEnter={() => {/* keep open */ }}
      onMouseLeave={onClose}
    >
      {/* Red header */}
      <div className="flex items-start gap-2 border-b border-red-100 bg-red-50 px-3 py-2.5">
        <span className="mt-0.5 text-base leading-none">🔴</span>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-red-400">
            Spelling Issue
          </span>
          <span className="block text-sm font-bold text-red-600">"{word}"</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Why wrong */}
        <p className="mb-3 text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">Why: </span>
          {suggestion.reason}
        </p>

        {/* Correction + click-to-fix button */}
        <button
          onClick={() => onFix(tokenIndex, suggestion.correction)}
          className="w-full rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-left transition hover:bg-green-100 active:scale-95"
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider text-green-500">
            ✓ Correct Spelling
          </span>
          <span className="mt-0.5 block text-sm font-bold text-green-700">
            {suggestion.correction}
          </span>
          <span className="mt-1 block text-[10px] italic text-slate-400">
            Click to apply correction
          </span>
        </button>
      </div>
    </div>
  );
}

export default TextEditor;
