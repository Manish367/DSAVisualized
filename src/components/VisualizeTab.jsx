import { useEffect, useRef } from 'react';
import { Runner } from '../viz.js';

function ImperativeViz({ topic }) {
  const stageRef = useRef(null);
  const controlsRef = useRef(null);
  const logRef = useRef(null);
  const runnerRef = useRef(null);

  useEffect(() => {
    if (!runnerRef.current) runnerRef.current = new Runner();
    topic.initViz({
      stage: stageRef.current,
      controls: controlsRef.current,
      log: logRef.current,
      runner: runnerRef.current,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  return (
    <>
      <div className="viz-controls" ref={controlsRef}></div>
      <div className="viz-stage" ref={stageRef}></div>
      <div className="viz-log" ref={logRef} aria-live="polite"></div>
    </>
  );
}

export default function VisualizeTab({ topic, active }) {
  const Custom = topic.CustomVisualizer;
  return (
    <section className={`tab-panel${active ? ' active' : ''}`}>
      <div className="card viz-card">
        {Custom ? <Custom topic={topic} /> : <ImperativeViz topic={topic} />}
      </div>
    </section>
  );
}
