export default function WorldTab({ topic, active }) {
  return (
    <section className={`tab-panel${active ? ' active' : ''}`}>
      <div className="card">
        <h2>Real-world examples</h2>
        <div className="chip-grid">
          {topic.examples.map((x, i) => (
            <div className="chip-card" key={i}>
              <span className="cc-icon">{x.icon}</span>
              <h4>{x.title}</h4>
              <p>{x.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>Case studies</h2>
        <div className="case-grid">
          {topic.caseStudies.map((c, i) => (
            <div className="case-card" key={i}>
              <span className="case-tag">{c.tag}</span>
              <h4>{c.title}</h4>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
      {topic.practice && topic.practice.length ? (
        <div className="card">
          <h2>Practice problems — worked examples</h2>
          <div className="practice-list">
            {topic.practice.map((p, i) => (
              <div className="practice-card" key={i}>
                <div className="practice-num">{i + 1}</div>
                <div>
                  <h4>{p.title}</h4>
                  <p className="practice-prompt">{p.prompt}</p>
                  <div className="practice-approach">
                    <strong>Approach:</strong> {p.approach}
                  </div>
                  {p.answer ? <div className="practice-answer">{p.answer}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
