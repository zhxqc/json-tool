/** Brand logo mark: a gradient JSON braces tile, matching app/icon.svg.
 *  Rendered server-side; static, no interactivity. */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2456c4" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="13" fill="url(#logo-g)" />
      <g
        transform="scale(2.6667)"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
        <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
      </g>
    </svg>
  );
}
