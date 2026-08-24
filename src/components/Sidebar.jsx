export default function Sidebar({ categories, topics, currentId, search, setSearch, explored, onSelect, open, onClose }) {
  const f = search.trim().toLowerCase();
  return (
    <>
      <nav className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search a topic…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          {categories.map((cat) => {
            const items = topics.filter(
              (t) => t.category === cat.id &&
                (!f || t.title.toLowerCase().includes(f) || cat.label.toLowerCase().includes(f))
            );
            if (!items.length) return null;
            return (
              <div className="nav-group" key={cat.id}>
                <div className="nav-group-title">{cat.label}</div>
                {items.map((t) => (
                  <div
                    key={t.id}
                    className={`nav-item${currentId === t.id ? ' active' : ''}`}
                    onClick={() => onSelect(t.id)}
                  >
                    <span className="ni-icon">{t.icon}</span>
                    <span>{t.title}</span>
                    {explored.has(t.id) && <span className="ni-done">●</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="sidebar-footer">
          Built for visual learners.<br />No CS degree required.
        </div>
      </nav>
      <div className={`sidebar-backdrop${open ? ' show' : ''}`} onClick={onClose}></div>
    </>
  );
}
