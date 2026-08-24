export default function Landing({ topics, onSelect }) {
  return (
    <section className="landing">
      <h1>Learn DSA the way it should've been taught.</h1>
      <p className="landing-sub">
        Pick a topic on the left. Every structure is <strong>alive</strong> — press a button and watch
        the array, stack, tree or graph rearrange itself in front of you. Java code, explained
        symbol‑by‑symbol. Real products that use it. Real interview‑style case studies.
      </p>
      <div className="landing-grid">
        {topics.map((t) => (
          <div className="landing-card" key={t.id} onClick={() => onSelect(t.id)}>
            <div className="lc-icon">{t.icon}</div>
            <h3>{t.title}</h3>
            <p>{t.tagline}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
