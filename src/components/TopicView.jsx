import LearnTab from './LearnTab.jsx';
import VisualizeTab from './VisualizeTab.jsx';
import CodeTab from './CodeTab.jsx';
import WorldTab from './WorldTab.jsx';

const TABS = [
  { id: 'learn', label: '📖 Learn' },
  { id: 'visualize', label: '🎬 Visualize' },
  { id: 'code', label: '☕ Java Code' },
  { id: 'world', label: '🌍 Real World' },
];

export default function TopicView({ topic, categoryLabel, activeTab, setActiveTab }) {
  return (
    <article className="topic-view">
      <div className="topic-hero">
        <div className="topic-hero-icon">{topic.icon}</div>
        <div>
          <div className="crumb">{categoryLabel}</div>
          <h1>{topic.title}</h1>
          <p className="tagline">{topic.tagline}</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <LearnTab key={`learn-${topic.id}`} topic={topic} active={activeTab === 'learn'} />
      <VisualizeTab key={`viz-${topic.id}`} topic={topic} active={activeTab === 'visualize'} />
      <CodeTab key={`code-${topic.id}`} topic={topic} active={activeTab === 'code'} />
      <WorldTab key={`world-${topic.id}`} topic={topic} active={activeTab === 'world'} />
    </article>
  );
}
