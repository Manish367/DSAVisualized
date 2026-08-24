# 🧩 DSA Visualized

**Learn Data Structures & Algorithms by watching them happen, not just reading about them.**

An interactive learning platform where every structure is *alive* — press a button and watch the array, stack, tree, or graph rearrange itself in real time. Built for anyone learning DSA, not just CS students: plain-English explanations, Java code broken down line by line, real-world examples, and interview-style case studies for every topic.

👉 **[Live demo](#)** *(add your Vercel URL here once deployed)*

## ✨ What's inside

Every topic follows the same four-tab structure:

- **📖 Learn** — plain-English definition, why the structure exists, a time/space complexity table, and key vocabulary
- **🎬 Visualize** — a live, interactive animation you control (insert, delete, search, sort, traverse...)
- **☕ Java Code** — click any line to see exactly what it does, why it's there, and what every symbol/variable means
- **🌍 Real World** — 3 real-world examples, 3 case studies, and worked practice problems

### Topics covered

| Category | Topics |
|---|---|
| Basics | Array (access, insert/delete, linear & binary search, reverse, rotate, Kadane's algorithm), Strings (traverse, reverse, palindrome/anagram checks, substring search) |
| Linear structures | Stack, Queue, Linked List |
| Sorting & Searching | Bubble, Selection, Insertion, Merge, Quick, and Heap Sort · Linear vs Binary Search |
| Recursion | Live code-execution visualizer with current-line highlighting — Factorial, Fibonacci, Sum of Digits, Power |
| Trees | Binary Search Tree (insert, search, in-order traversal) |
| Graphs | BFS & DFS |
| Hashing | Hash table with chaining |

### Other features

- 🌗 Light/dark theme toggle (persists your choice, respects system preference on first visit)
- 📱 Responsive — works on mobile and desktop
- 🔍 Sidebar search across all topics
- ✅ Progress tracking (which topics you've explored)

## 🛠️ Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) for UI styling
- Vanilla DOM-driven animations for the interactive visualizers (no charting/animation library — everything is hand-built)
- No backend, no database — 100% static, deploys anywhere

## 🚀 Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

## 📦 Deploying

This is a static Vite app, so it deploys anywhere with zero config — [Vercel](https://vercel.com/new), Netlify, GitHub Pages, etc. On Vercel: import this repo, it auto-detects the Vite framework preset, and you're live.

## 📁 Project structure

```
src/
  topics/          topic content + interactive visualizer logic (one file per topic)
  components/      React shell: sidebar, tabs, code viewer, theme toggle, etc.
  viz.js           shared helpers for the imperative DOM-based visualizers
  highlight.js      minimal Java syntax highlighter for the code panel
```

Adding a new topic means adding one file to `src/topics/` (definition, complexity table, glossary, examples, case studies, Java code, and an `initViz` function for the animation) and registering it in `src/topics/index.js`.

## 📄 License

MIT — see [LICENSE](LICENSE).
