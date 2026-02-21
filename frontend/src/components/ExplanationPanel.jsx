function ExplanationPanel({ explanation }) {
  if (!explanation?.length) {
    return null;
  }

  return (
    <div className="glass-card card-interactive p-5">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-primary">AI Explanation</h4>
      <ul className="space-y-2 text-sm text-brand-text">
        {explanation.map((point) => (
          <li key={point} className="rounded-lg border border-brand-border bg-[#F8F7FF] px-3 py-2">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExplanationPanel;
