function ConsistencyPanel({ data }) {
  if (!data) {
    return null;
  }

  const items = [
    { label: 'Consistency Score', value: `${data.score}%` },
    { label: 'Words', value: data.wordCount },
    { label: 'Sentences', value: data.sentenceCount },
    { label: 'Tone', value: data.tone },
  ];

  return (
    <div className="glass-card card-interactive p-5">
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-primary">Consistency</h4>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-brand-border bg-[#F8F7FF] p-3">
            <p className="text-xs text-brand-muted">{item.label}</p>
            <p className="mt-1 text-base font-semibold text-brand-text">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConsistencyPanel;
