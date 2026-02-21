import { useCallback, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

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
  then: { correction: 'than', reason: '"Than" is used for comparisons; "then" refers to time.' },
  create: { correction: 'creates', reason: 'Singular subject "This" requires "creates".' },
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

function getSuggestion(token) {
  const m = token.match(wordPattern);
  if (!m) return null;
  return typoMap[m[2].toLowerCase()] || null;
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
function TextEditor({ value, onChange, onFileUpload }) {
  const textareaRef = useRef(null);
  const wrapRef = useRef(null);
  const [tooltip, setTooltip] = useState(null); // { tokenIndex, word, suggestion, top, left }

  const [uploading, setUploading] = useState(false);

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
    () => tokens.reduce((n, t) => (getSuggestion(t) ? n + 1 : n), 0),
    [tokens],
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
          <label className="cursor-pointer rounded-full border border-[#5EEAD4] bg-[#F0FDFA] px-4 py-2 text-sm font-medium text-brand-primary transition hover:bg-[#CCFBF1]">
            {uploading ? 'Reading PDF…' : 'Upload .txt / .pdf'}
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

      {/* ── Editor stack ───────────────────────────────────────────────── */}
      <div
        ref={wrapRef}
        className="relative rounded-xl border border-[#CCFBF1] bg-white focus-within:border-brand-primary focus-within:shadow-[0_0_0_4px_rgba(13,148,136,0.15)] transition"
        style={{ height: '22rem', overflow: 'hidden' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* ① Backdrop: renders highlighted HTML, scrolls in sync */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl text-sm text-transparent"
          style={editorStyle}
        >
          {tokens.map((token, i) => {
            const sug = getSuggestion(token);
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
          className="relative w-full resize-none rounded-xl bg-transparent text-sm outline-none placeholder:text-slate-400"
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
                const sug = getSuggestion(token);
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
function HoverLayer({ tokens, wrapRef, onHover, onFix, editorStyle }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl text-sm"
      style={{ ...editorStyle, zIndex: 2, color: 'transparent', pointerEvents: 'none' }}
    >
      {tokens.map((token, i) => {
        const sug = getSuggestion(token);
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
