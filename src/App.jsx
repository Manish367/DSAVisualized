import { useEffect, useState } from 'react';
import { topics, categories } from './topics/index.js';
import TopBar from './components/TopBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Landing from './components/Landing.jsx';
import TopicView from './components/TopicView.jsx';

const STORAGE_KEY = 'dsa-visualized-explored';
const THEME_KEY = 'dsa-visualized-theme';

function loadExplored() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export default function App() {
  const [currentId, setCurrentId] = useState(() => {
    const h = window.location.hash.replace('#', '');
    return topics.some((t) => t.id === h) ? h : null;
  });
  const [activeTab, setActiveTab] = useState('learn');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [explored, setExplored] = useState(loadExplored);
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...explored]));
  }, [explored]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    function onHashChange() {
      const h = window.location.hash.replace('#', '');
      if (topics.some((t) => t.id === h)) setCurrentId(h);
      else if (!h) setCurrentId(null);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function selectTopic(id) {
    setCurrentId(id);
    setActiveTab('learn');
    setExplored((prev) => new Set(prev).add(id));
    window.location.hash = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSidebarOpen(false);
  }

  const currentTopic = topics.find((t) => t.id === currentId) || null;
  const categoryLabel = currentTopic
    ? categories.find((c) => c.id === currentTopic.category)?.label || ''
    : '';

  return (
    <div className="app-shell">
      <TopBar
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        exploredCount={explored.size}
        total={topics.length}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      />
      <div className="body-row">
        <Sidebar
          categories={categories}
          topics={topics}
          currentId={currentId}
          search={search}
          setSearch={setSearch}
          explored={explored}
          onSelect={selectTopic}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="content">
          {currentTopic ? (
            <TopicView
              topic={currentTopic}
              categoryLabel={categoryLabel}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : (
            <Landing topics={topics} onSelect={selectTopic} />
          )}
        </main>
      </div>
    </div>
  );
}
