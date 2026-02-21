function OutputViewer({ output }) {
  return (
    <div className="glass-card card-interactive p-5">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-primary">Refined Output</h4>
      <p className="min-h-24 whitespace-pre-wrap text-sm leading-7 text-brand-text">
        {output || 'Your improved writing draft will appear here after analysis.'}
      </p>
    </div>
  );
}

export default OutputViewer;
