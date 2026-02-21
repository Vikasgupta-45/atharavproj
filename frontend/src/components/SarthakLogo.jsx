/* Sarthak AI – S-pencil logo SVG component */
function SarthakLogo({ size = 32 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer circle */}
            <circle cx="60" cy="60" r="52" stroke="#5EEAD4" strokeWidth="3" fill="none" />

            {/* S-shaped pencil body */}
            <defs>
                <linearGradient id="sgrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5EEAD4" />
                    <stop offset="50%" stopColor="#0D9488" />
                    <stop offset="100%" stopColor="#0F766E" />
                </linearGradient>
                <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#CCFBF1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* S curve (thick stroke that forms the pencil body) */}
            <path
                d="M 75 18 C 90 18, 95 30, 80 42 C 65 54, 40 54, 38 68 C 36 82, 50 96, 68 96"
                stroke="url(#sgrad)"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
            />
            {/* Shine highlight on S */}
            <path
                d="M 75 18 C 90 18, 95 30, 80 42 C 65 54, 40 54, 38 68 C 36 82, 50 96, 68 96"
                stroke="url(#shine)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
            />

            {/* Pencil top eraser band */}
            <rect x="71" y="11" width="13" height="6" rx="2" fill="#99F6E4" transform="rotate(-38 71 11)" />
            <rect x="73" y="8" width="13" height="4" rx="2" fill="#0D9488" transform="rotate(-38 73 8)" />

            {/* Pencil tip at bottom */}
            <path d="M 68 96 L 60 110 L 53 98 Z" fill="#CCFBF1" />
            <path d="M 60 110 L 55 101 L 60 100 Z" fill="#0F766E" />

            {/* Dots (bezier curve handles) */}
            <circle cx="37" cy="76" r="2.5" fill="#5EEAD4" />
            <circle cx="30" cy="82" r="2" fill="#5EEAD4" />
            <circle cx="23" cy="76" r="2" fill="#5EEAD4" />
            <line x1="23" y1="76" x2="37" y2="76" stroke="#5EEAD4" strokeWidth="1" />
            <line x1="23" y1="76" x2="30" y2="82" stroke="#5EEAD4" strokeWidth="1" />
        </svg>
    );
}

export default SarthakLogo;
