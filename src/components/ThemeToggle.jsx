export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      className="relative inline-flex h-8 w-[60px] shrink-0 items-center rounded-full border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      style={{
        borderColor: 'var(--border)',
        background: isLight
          ? 'linear-gradient(90deg, #dbe4ff, #eef0f8)'
          : 'linear-gradient(90deg, #161a2b, #0b0e14)',
      }}
    >
      <span className="pointer-events-none absolute left-1.5 text-[13px] opacity-70">🌙</span>
      <span className="pointer-events-none absolute right-1.5 text-[13px] opacity-70">☀️</span>
      <span
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[13px] shadow-md transition-transform duration-300 ease-out"
        style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          transform: isLight ? 'translateX(30px)' : 'translateX(4px)',
        }}
      >
        {isLight ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
