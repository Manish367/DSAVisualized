import { el, clear, buildControls, sleep } from '../viz.js';

function draw(stage, arr, highlight) {
  clear(stage);
  const wrap = el('div', '', '');
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;';
  const labels = el('div', '', `<span style="color:var(--accent-2)">⬅ FRONT (dequeue here)</span>`);
  labels.style.cssText = 'font-family:var(--font-code);font-size:.75rem;width:100%;display:flex;justify-content:space-between;color:var(--text-mute);';
  labels.innerHTML = `<span style="color:var(--accent-2)">⬅ FRONT (dequeue here)</span><span style="color:var(--accent-3)">REAR (enqueue here) ➡</span>`;
  const row = el('div', 'queue-stage');
  arr.forEach((val, i) => {
    const cls = ['vbox'];
    if (highlight === i) cls.push('active', 'pop-anim');
    row.appendChild(el('div', cls.join(' '), val));
  });
  wrap.appendChild(labels);
  wrap.appendChild(row);
  stage.appendChild(wrap);
}

export default {
  id: 'queue',
  category: 'linear',
  icon: '🚶‍♂️',
  title: 'Queue',
  tagline: 'First In, First Out — like a checkout line, whoever arrived first is served first.',
  definition: 'A queue is a collection where elements are added at the back (enqueue) and removed from the front (dequeue). Whoever got in line first gets served first — FIFO, First In First Out. Unlike a stack, you touch two different ends.',
  why: 'Lots of real processes must preserve arrival order fairness: printing jobs, customer support tickets, and CPU task scheduling all need "oldest request handled first". A queue enforces that ordering in O(1) per operation, which is why it\'s the backbone of almost every task-processing system.',
  complexity: [
    ['Enqueue (add to rear)', 'O(1)', 'O(1)'],
    ['Dequeue (remove front)', 'O(1)', 'O(1)'],
    ['Peek (front)', 'O(1)', 'O(1)'],
    ['Search for a value', 'O(n)', 'O(1)'],
  ],
  glossary: [
    ['FIFO', 'First In, First Out — the defining rule of a queue.'],
    ['Enqueue', 'Add an element to the rear (back) of the queue.'],
    ['Dequeue', 'Remove and return the element at the front.'],
    ['Front / Rear', 'The two ends of the queue — removal happens at front, insertion at rear.'],
    ['Circular queue', 'A fixed-size array queue that wraps the rear index back to 0 to reuse freed space — avoids wasted memory from naive array shifting.'],
  ],
  examples: [
    { icon: '🖨️', title: 'Print queue', text: 'Send 5 documents to a printer — they print in the order you sent them, not randomly, because the print spooler is a queue.' },
    { icon: '🎫', title: 'Customer support tickets', text: 'Support systems like Zendesk process tickets oldest-first by default — a queue keeps the promise "first come, first served".' },
    { icon: '🚦', title: 'Traffic / ride requests', text: 'Ride-hailing apps often queue nearby driver-matching requests so earlier riders aren\'t starved by later ones.' },
  ],
  caseStudies: [
    { tag: 'Operating systems', title: 'CPU task scheduling', text: 'Round-robin CPU schedulers keep a ready-queue of processes; each gets a time slice, then goes to the back of the queue — fairness by construction, not by coincidence.' },
    { tag: 'Graph algorithms', title: 'Breadth-First Search', text: 'BFS (used for shortest-path in unweighted graphs, like "degrees of separation" on LinkedIn) is literally "use a queue to always explore the oldest-discovered node next" — the queue topic and the graph topic connect directly here.' },
    { tag: 'Distributed systems', title: 'Message queues (Kafka, RabbitMQ, SQS)', text: 'Large-scale systems decouple services using message queues so a slow downstream service doesn\'t block a fast upstream one — the same FIFO idea, scaled to millions of messages across machines.' },
  ],
  code: [
    { code: 'import java.util.LinkedList;', explain: { what: 'Imports LinkedList — Java\'s LinkedList class implements the Queue interface.', why: 'A linked list can add/remove from both ends in O(1) without shifting, which is exactly what a queue needs.', symbols: [] } },
    { code: 'import java.util.Queue;', explain: { what: 'Imports the Queue interface, which defines what operations a queue must support (offer, poll, peek).', why: 'Coding against the interface (Queue) instead of the concrete class (LinkedList) makes it easy to swap implementations later.', symbols: [] } },
    { code: 'public class QueueDemo {', explain: { what: 'Class wrapper.', why: '', symbols: [] } },
    { code: '    public static void main(String[] args) {', explain: { what: 'Entry point.', why: '', symbols: [] } },
    { code: '        Queue<String> line = new LinkedList<>();', explain: { what: 'Declares a variable "line" of type Queue<String>, backed by a LinkedList instance.', why: 'This is "program to an interface" — the variable type is the general Queue, the object is the specific LinkedList.', symbols: [['Queue<String>', 'a queue that will hold String values.'], ['new LinkedList<>()', 'the actual object created — LinkedList knows HOW to be a queue.']] } },
    { code: '        line.offer("Alice");', explain: { what: 'Adds "Alice" to the rear of the queue. Queue: [Alice].', why: 'offer() is the standard way to enqueue in Java\'s Queue interface (add() works too, but offer() fails gracefully instead of throwing on a full bounded queue).', symbols: [['.offer("Alice")', 'enqueues the string "Alice".']] } },
    { code: '        line.offer("Bob");', explain: { what: 'Adds "Bob". Queue: [Alice, Bob].', why: '', symbols: [] } },
    { code: '        line.offer("Chen");', explain: { what: 'Adds "Chen". Queue: [Alice, Bob, Chen].', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '        System.out.println("Next to be served: " + line.peek());', explain: { what: 'Prints the front element WITHOUT removing it — prints "Alice".', why: '', symbols: [['.peek()', 'returns the front element but leaves the queue unchanged.']] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '        while (!line.isEmpty()) {', explain: { what: 'Loops until the queue is empty.', why: '', symbols: [] } },
    { code: '            System.out.println("Serving: " + line.poll());', explain: { what: 'Removes AND returns the front element, then prints it. Order printed: Alice, then Bob, then Chen — arrival order preserved.', why: 'poll() demonstrates FIFO directly — the FIRST one enqueued (Alice) is the FIRST one served.', symbols: [['.poll()', 'removes the front element and returns its value (returns null instead of throwing if empty).']] } },
    { code: '        }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
    { code: '    }', explain: { what: 'Closes main.', why: '', symbols: [] } },
    { code: '}', explain: { what: 'Closes the class.', why: '', symbols: [] } },
  ],
  initViz({ stage, controls, log }) {
    let arr = ['A', 'B', 'C'];

    function refresh(hl) { draw(stage, arr, hl); }

    async function doEnqueue(valStr) {
      const val = (valStr || '').trim();
      if (!val) { log.textContent = '⚠️ Enter a value to enqueue.'; return; }
      if (arr.length >= 8) { log.textContent = '⚠️ Queue full for this demo (max 8) — dequeue something first.'; return; }
      arr.push(val);
      refresh(arr.length - 1);
      log.textContent = `enqueue("${val}") → placed at the REAR in O(1). Queue size: ${arr.length}.`;
    }

    async function doDequeue() {
      if (!arr.length) { log.textContent = 'Queue is empty — nothing to dequeue.'; return; }
      const val = arr[0];
      refresh(0);
      await sleep(300);
      arr.shift();
      refresh();
      log.textContent = `dequeue() → removed "${val}" from the FRONT. It was the element that had been waiting the longest.`;
    }

    function doPeek() {
      if (!arr.length) { log.textContent = 'Queue is empty — nothing to peek.'; return; }
      refresh(0);
      log.textContent = `peek() → "${arr[0]}" (front element, NOT removed).`;
    }

    const refs = buildControls(controls, [
      { type: 'input', ref: 'val', label: 'Value', placeholder: 'Dave' },
      { type: 'button', label: 'Enqueue', variant: 'good', onClick: () => doEnqueue(refs.val.value) },
      { type: 'button', label: 'Dequeue', variant: 'warn', onClick: () => doDequeue() },
      { type: 'button', label: 'Peek', onClick: () => doPeek() },
      { type: 'button', label: 'Clear', onClick: () => { arr = []; refresh(); log.textContent = 'Queue cleared.'; } },
    ]);

    refresh();
    log.textContent = 'Enqueue a few names, then Dequeue — notice the FIRST one you added is the FIRST one served.';
  },
};
