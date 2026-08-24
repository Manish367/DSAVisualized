import { useEffect, useRef, useState } from 'react';
import { highlightLine } from '../highlight.js';
import { RECURSION_EXAMPLES } from '../topics/recursionExamples.js';

const EXAMPLE_KEYS = Object.keys(RECURSION_EXAMPLES);

export default function RecursionVisualizer() {
  const [exampleKey, setExampleKey] = useState(EXAMPLE_KEYS[0]);
  const example = RECURSION_EXAMPLES[exampleKey];

  const [param, setParam] = useState(example.defaultParam);
  const [frames, setFrames] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [logMsg, setLogMsg] = useState('Pick an example, choose a value, and hit Run.');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  speedRef.current = speed;
  const runIdRef = useRef(0);

  useEffect(() => {
    runIdRef.current++;
    setParam(RECURSION_EXAMPLES[exampleKey].defaultParam);
    setFrames([]);
    setCurrentLine(null);
    setRunning(false);
    setLogMsg('Pick a value and hit Run.');
  }, [exampleKey]);

  async function handleRun() {
    if (running) return;
    setRunning(true);
    setFrames([]);
    setCurrentLine(null);
    const myRunId = ++runIdRef.current;
    const alive = () => runIdRef.current === myRunId;
    const ctx = {
      setLine: (idx) => { if (alive()) setCurrentLine(idx); },
      log: (msg) => { if (alive()) setLogMsg(msg); },
      pushFrame: (label) => { if (alive()) setFrames((prev) => [...prev, { label, result: undefined }]); },
      updateTopFrame: (patch) => {
        if (!alive()) return;
        setFrames((prev) => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], ...patch };
          return next;
        });
      },
      popFrame: () => { if (alive()) setFrames((prev) => prev.slice(0, -1)); },
      sleep: (ms = 550) => new Promise((res) => setTimeout(res, ms / speedRef.current)),
    };
    const result = await example.run(param, ctx);
    if (alive()) {
      setCurrentLine(null);
      setLogMsg(`✅ Result: ${example.label}(${param}) = ${result}`);
      setRunning(false);
    }
  }

  return (
    <>
      <div className="viz-controls">
        <label>
          Example{' '}
          <select className="viz-input" value={exampleKey} disabled={running} onChange={(e) => setExampleKey(e.target.value)}>
            {EXAMPLE_KEYS.map((k) => (
              <option key={k} value={k}>{RECURSION_EXAMPLES[k].label}</option>
            ))}
          </select>
        </label>
        <label>
          {example.paramLabel}{' '}
          <input
            type="number"
            className="viz-input"
            style={{ width: 90 }}
            value={param}
            disabled={running}
            min={0}
            max={example.maxParam}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setParam(isNaN(v) ? 0 : Math.max(0, Math.min(example.maxParam, v)));
            }}
          />
        </label>
        <button className="btn primary" disabled={running} onClick={handleRun}>▶ Run</button>
        <label>
          Speed{' '}
          <input type="range" min={0.5} max={3} step={0.5} value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
        </label>
      </div>

      <div className="recursion-viz">
        <pre className="exec-code">
          {example.code.map((row, idx) => (
            <div key={idx} className={`exec-line${currentLine === idx ? ' current' : ''}`}>
              <span className="ln">{idx + 1}</span>
              <span className="lc" dangerouslySetInnerHTML={{ __html: highlightLine(row.code) }} />
            </div>
          ))}
        </pre>
        <div className="exec-side">
          <div className="callstack-stage">
            {frames.length === 0 ? (
              <div style={{ color: 'var(--text-mute)', textAlign: 'center' }}>Call stack is empty.</div>
            ) : (
              frames.map((f, i) => (
                <div key={i} className={`call-frame${f.result !== undefined ? ' returning' : ''}`}>
                  <span>{f.label}</span>
                  {f.result !== undefined ? <span className="cf-ret">→ {f.result}</span> : <span className="muted">running…</span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="exec-log">{logMsg}</div>
    </>
  );
}
