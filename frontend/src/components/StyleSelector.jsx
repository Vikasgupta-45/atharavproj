const options = [
  { value: 'clear', label: 'Clear' },
  { value: 'formal', label: 'Formal' },
  { value: 'creative', label: 'Creative' },
  { value: 'persuasive', label: 'Persuasive' },
];

function StyleSelector({ value, onChange }) {
  return (
    <div className="glass-card card-interactive p-5">
      <p className="mb-3 text-sm font-semibold text-brand-text">Tone Style</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-3 py-2 text-sm transition ${
              value === option.value
                ? 'border-brand-primary bg-[#F3F0FF] text-brand-primary'
                : 'border-brand-border bg-white text-brand-muted hover:border-brand-light hover:text-brand-primary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StyleSelector;
