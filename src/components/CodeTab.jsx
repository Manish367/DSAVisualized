import { useEffect, useState } from 'react';
import { highlightLine } from '../highlight.js';

function Explain({ row }) {
  const ex = row.explain;
  return (
    <>
      <div className="ce-line">{row.code.trim() || '(blank line)'}</div>
      <div className="ce-block">
        <h4>What this line does</h4>
        <p>{ex.what}</p>
      </div>
      {ex.why ? (
        <div className="ce-block">
          <h4>Why it's here</h4>
          <p>{ex.why}</p>
        </div>
      ) : null}
      {ex.symbols && ex.symbols.length > 0 ? (
        <div className="ce-block">
          <h4>Symbols &amp; variables</h4>
          <ul className="ce-symbols">
            {ex.symbols.map(([sym, desc], i) => (
              <li key={i}><code>{sym}</code>{desc}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export default function CodeTab({ topic, active }) {
  const variantKeys = topic.codeVariants ? Object.keys(topic.codeVariants) : null;
  const [variant, setVariant] = useState(variantKeys ? variantKeys[0] : null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { setSelected(null); }, [variant]);

  const codeRows = topic.codeVariants ? topic.codeVariants[variant].code : topic.code;

  return (
    <section className={`tab-panel${active ? ' active' : ''}`}>
      <div className="card">
        <h2>Java implementation — click any line</h2>
        <p className="muted">Click a line of code to see exactly what it does, what each symbol means, and why it's there.</p>

        {variantKeys ? (
          <div className="viz-controls" style={{ marginBottom: 14, paddingBottom: 14 }}>
            <label>
              Algorithm{' '}
              <select className="viz-input" value={variant} onChange={(e) => setVariant(e.target.value)}>
                {variantKeys.map((k) => (
                  <option key={k} value={k}>{topic.codeVariants[k].label}</option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        <div className="code-wrap">
          <pre className="code-block">
            {codeRows.map((row, idx) => (
              <div
                key={idx}
                className={`code-line${selected === idx ? ' selected' : ''}`}
                onClick={() => setSelected(idx)}
              >
                <span className="ln">{idx + 1}</span>
                <span className="lc" dangerouslySetInnerHTML={{ __html: highlightLine(row.code) }} />
              </div>
            ))}
          </pre>
          <div className="code-explain">
            {selected === null ? (
              <span className="ce-placeholder">👈 Click a line of code to explain it</span>
            ) : (
              <Explain row={codeRows[selected]} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
