import ThemeToggle from './ThemeToggle.jsx';

export default function TopBar({ onToggleSidebar, exploredCount, total, theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <button className="hamburger" aria-label="Toggle menu" onClick={onToggleSidebar}>
        <span></span><span></span><span></span>
      </button>
      <div className="brand">
        <span className="brand-mark">🧩</span>
        <span className="brand-text">DSA<span className="accent">Visualized</span></span>
      </div>
      <div className="topbar-right">
        <span className="lang-badge">☕ Java</span>
        <a className="gh-link" href="#">
          <span>{exploredCount} / {total} topics explored</span>
        </a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
