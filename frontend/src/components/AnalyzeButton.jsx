function AnalyzeButton({ onClick, loading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-primary glow-button w-full rounded-xl disabled:cursor-not-allowed disabled:opacity-45"
    >
      {loading ? 'Analyzing...' : 'Analyze Writing'}
    </button>
  );
}

export default AnalyzeButton;
