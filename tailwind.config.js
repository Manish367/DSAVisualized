/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        elev: 'var(--bg-elev)',
        elev2: 'var(--bg-elev-2)',
        line: 'var(--border)',
        text: 'var(--text)',
        strong: 'var(--text-strong)',
        dim: 'var(--text-dim)',
        mute: 'var(--text-mute)',
        accent: 'var(--accent)',
        accent2: 'var(--accent-2)',
        accent3: 'var(--accent-3)',
        good: 'var(--good)',
        warn: 'var(--warn)',
        bad: 'var(--bad)',
      },
      fontFamily: {
        head: ['Sora', 'system-ui', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--radius)',
      },
    },
  },
  plugins: [],
};
