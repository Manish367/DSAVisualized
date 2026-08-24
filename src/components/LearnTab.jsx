import { Fragment } from 'react';

export default function LearnTab({ topic, active }) {
  return (
    <section className={`tab-panel${active ? ' active' : ''}`}>
      <div className="card">
        <h2>What is it?</h2>
        <p>{topic.definition}</p>
      </div>
      <div className="card">
        <h2>Why does it exist? <span className="muted">(the problem it solves)</span></h2>
        <p>{topic.why}</p>
      </div>
      <div className="card two-col">
        <div>
          <h2>Time &amp; Space</h2>
          <table className="complexity-table">
            <tbody>
              <tr><th>Operation</th><th>Time</th><th>Space</th></tr>
              {topic.complexity.map(([op, time, space], i) => (
                <tr key={i}>
                  <td>{op}</td>
                  <td><code>{time}</code></td>
                  <td><code>{space}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Key vocabulary</h2>
          <dl className="glossary">
            {topic.glossary.map(([term, def], i) => (
              <Fragment key={i}>
                <dt>{term}</dt>
                <dd>{def}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
