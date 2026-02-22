import { Bot, SendHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiChat } from '../services/api';

function AIChatPanel({ text, onTextUpdate, onGenerating }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I can help improve grammar, clarity, and tone. Ask me to rewrite any sentence.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const typoCount = useMemo(() => {
    if (!text.trim()) return 0;
    const dictionary = ['todays', 'peoples', 'oppurtunities', 'goverments', 'effect', 'dont', 'spends', 'then', 'create', 'medias'];
    return text
      .split(/\s+/)
      .map((word) => word.toLowerCase().replace(/[^a-z']/g, ''))
      .filter((word) => dictionary.includes(word)).length;
  }, [text]);

  const qualityScore = Math.max(35, 100 - typoCount * 7);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    if (onGenerating) onGenerating(true);

    try {
      const { reply, modifiedText } = await apiChat(trimmed, text);
      const aiReply = modifiedText ? `I've updated the text for you!\n\n${reply}` : reply;
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: aiReply }]);

      if (modifiedText && onTextUpdate) {
        onTextUpdate(modifiedText);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: 'Sorry, the server is unavailable. Please try again.' },
      ]);
    } finally {
      setSending(false);
      if (onGenerating) onGenerating(false);
    }
  };

  return (
    <aside className="glass-card h-fit p-4 md:sticky md:top-24">
      <div className="mb-4 flex items-center gap-2 border-b border-brand-border pb-3">
        <Bot size={17} className="text-brand-primary" />
        <h3 className="text-lg font-semibold text-brand-text">AI Chat</h3>
      </div>

      <div className="rounded-xl border border-brand-border bg-[#F8F7FF] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Writing Quality</p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-3xl font-bold text-brand-primary">{qualityScore}</p>
          <p className="text-sm text-brand-muted">/100</p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#E9E5FF]">
          <div className="h-2 rounded-full bg-brand-primary transition-all" style={{ width: `${qualityScore}%` }} />
        </div>
        <p className="mt-2 text-xs text-brand-muted">{typoCount} possible spelling issues found.</p>
      </div>

      <div className="mt-4 h-72 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-6 ${message.role === 'assistant' ? 'bg-[#F3F0FF] text-brand-text' : 'ml-auto bg-brand-primary text-white'
              }`}
          >
            {message.content}
          </article>
        ))}
        {sending && (
          <div className="text-xs text-brand-muted animate-pulse">AI is typing…</div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              sendMessage();
            }
          }}
          className="input-field py-2.5"
          placeholder="Ask AI to improve this draft..."
        />
        <button onClick={sendMessage} disabled={sending} className="btn-primary h-11 w-11 rounded-xl p-0 disabled:opacity-60">
          <SendHorizontal size={16} />
        </button>
      </div>
    </aside>
  );
}

export default AIChatPanel;
