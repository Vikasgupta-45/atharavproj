function DiffPanel({ diff }) {
  if (!diff) {
    return null;
  }

  return (
    <div className="glass-card card-interactive p-5">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-primary">Diff Overview</h4>
      <div className="mb-3 grid grid-cols-2 gap-3 text-sm text-brand-text">
        <div className="rounded-lg border border-brand-border bg-[#F8F7FF] p-3">Before: {diff.beforeWords} words</div>
        <div className="rounded-lg border border-brand-border bg-[#F8F7FF] p-3">After: {diff.afterWords} words</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-brand-border bg-white p-3 text-xs text-brand-muted">{diff.beforePreview}</div>
        <div className="rounded-lg border border-brand-light bg-[#F3F0FF] p-3 text-xs text-brand-text">{diff.afterPreview}</div>
      </div>
    </div>
  );
}

export default DiffPanel;
