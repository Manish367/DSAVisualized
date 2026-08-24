import { el, clear, buildControls, sleep, setButtonsDisabled } from '../viz.js';

function draw(stage, arr, highlight = {}) {
  clear(stage);
  const row = el('div', 'll-stage');
  arr.forEach((val, i) => {
    const nodeCls = ['ll-node'];
    if (highlight.active === i) nodeCls.push('active');
    if (highlight.found === i) nodeCls.push('found');
    const node = el('div', nodeCls.join(' '), `
      <div class="ll-box">
        <div class="ll-data">${val}</div>
        <div class="ll-next">•</div>
      </div>
    `);
    row.appendChild(node);
    if (i < arr.length - 1) row.appendChild(el('span', 'll-arrow', '→'));
  });
  row.appendChild(el('span', 'll-null', arr.length ? '→ null' : '(empty list) → null'));
  stage.appendChild(row);
}

export default {
  id: 'linkedlist',
  category: 'linear',
  icon: '🔗',
  title: 'Linked List',
  tagline: 'A chain of boxes, each pointing to the next — scattered in memory, connected by pointers.',
  definition: 'A linked list is a sequence of "nodes", where each node stores a value AND a pointer (reference) to the next node. Unlike an array, the nodes are NOT next to each other in memory — the only way to get from one to the next is to follow the pointer, like a treasure hunt with clues.',
  why: 'Arrays are fast to read but expensive to grow or insert into the middle (everything shifts). A linked list flips that trade-off: inserting or deleting a node is O(1) once you\'re there, because you just rewire two pointers — nothing shifts. The cost is you lose instant "jump to index i" access; you must walk from the head, one node at a time.',
  complexity: [
    ['Access by index', 'O(n)', 'O(1)'],
    ['Search', 'O(n)', 'O(1)'],
    ['Insert at head', 'O(1)', 'O(1)'],
    ['Insert at tail (no tail ptr)', 'O(n)', 'O(1)'],
    ['Delete a known node', 'O(1)', 'O(1)'],
  ],
  glossary: [
    ['Node', 'A single element: it bundles a value with a reference to the next node.'],
    ['Head', 'The first node in the list — your only entry point if there\'s no tail pointer.'],
    ['Pointer / Reference', 'A variable holding the memory address of another node, not the value itself.'],
    ['null', 'The special "points to nothing" value — the last node\'s next is always null, marking the end.'],
    ['Singly vs. doubly linked', 'Singly: each node points only forward. Doubly: each node also points to the previous node, so you can walk backward too.'],
  ],
  examples: [
    { icon: '🎵', title: 'Music playlist "up next"', text: 'Many playlist players model "next song" as a pointer — skipping or reordering tracks means relinking pointers, not shifting a whole array of songs.' },
    { icon: '🧭', title: 'Browser history (doubly linked)', text: 'Back/forward navigation is a doubly linked list: each page points to the previous and next page you visited.' },
    { icon: '🖼️', title: 'Image viewer / carousel', text: 'Swiping through photos "next/previous" without loading a fixed array is naturally a linked structure — especially when photos are added or removed dynamically.' },
  ],
  caseStudies: [
    { tag: 'OS internals', title: 'Memory allocators (free lists)', text: 'Operating systems track free blocks of memory using a linked list ("free list") — when memory is freed, it\'s just relinked into the chain in O(1), without shifting anything.' },
    { tag: 'Interview classic', title: 'Reverse a Linked List / Detect a Cycle', text: 'Two of the most common interview questions: reverse a list in-place by rewiring next pointers, and detect a cycle using Floyd\'s slow/fast pointer technique — both rely purely on pointer manipulation, no array shifting.' },
    { tag: 'Product engineering', title: 'LRU Cache (used inside Redis-like systems)', text: 'A Least-Recently-Used cache is commonly built from a doubly linked list + hash map: the list keeps recency order (move-to-front is O(1)), the map gives O(1) lookup — a real combination of two DSA topics solving a production caching problem.' },
  ],
  code: [
    { code: 'class Node {', explain: { what: 'Defines a small helper class representing one node of the list.', why: 'A linked list is built from these tiny building blocks — value + pointer.', symbols: [] } },
    { code: '    int data;', explain: { what: 'The value stored in this node.', why: '', symbols: [['int data', 'field holding this node\'s payload — could be any type, int is used here for simplicity.']] } },
    { code: '    Node next;', explain: { what: 'A reference to the next node in the chain — or null if this is the last node.', why: 'This single field is what turns separate objects into a "list" — without it they\'d just be floating, unconnected nodes.', symbols: [['Node next', 'a field whose type is Node itself — a self-referential (recursive) structure.']] } },
    { code: '    Node(int data) { this.data = data; }', explain: { what: 'Constructor: creates a new Node holding the given value, with next defaulting to null.', why: 'Every new node starts disconnected (next = null) until something links it into the chain.', symbols: [['this.data', '"this" refers to the object being built — disambiguates the field from the constructor parameter, both named data.']] } },
    { code: '}', explain: { what: 'Closes the Node class.', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: 'public class LinkedListDemo {', explain: { what: 'Main class wrapper.', why: '', symbols: [] } },
    { code: '    Node head;', explain: { what: 'The single entry point into the whole list — a reference to the first node.', why: 'If you lose the head reference, the entire list becomes unreachable garbage (even though the nodes still technically exist in memory until garbage collected).', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '    void insertAtHead(int value) {', explain: { what: 'Method that adds a new node to the very front of the list.', why: 'Inserting at the head needs no traversal — that\'s why it\'s O(1), the cheapest possible insert.', symbols: [] } },
    { code: '        Node newNode = new Node(value);', explain: { what: 'Creates the new node holding "value". Its next is still null.', why: '', symbols: [] } },
    { code: '        newNode.next = head;', explain: { what: 'Points the new node forward to whatever used to be the first node (the old head).', why: 'You must do this BEFORE moving head, or you\'d lose the reference to the rest of the list forever.', symbols: [['newNode.next', 'the pointer field of the node we just created.']] } },
    { code: '        head = newNode;', explain: { what: 'Updates head to point at the new node — it is now officially the first node in the list.', why: 'This single pointer reassignment is the entire "insert" operation — no shifting of other elements at all.', symbols: [] } },
    { code: '    }', explain: { what: 'Closes insertAtHead.', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '    boolean search(int target) {', explain: { what: 'Method that walks the list looking for a value, returning true/false.', why: '', symbols: [] } },
    { code: '        Node current = head;', explain: { what: 'A temporary pointer starting at the head — used to walk the list WITHOUT losing the real head reference.', why: 'Never walk using "head" itself — you\'d strand the rest of the program with no way back to the start.', symbols: [] } },
    { code: '        while (current != null) {', explain: { what: 'Keeps going until we fall off the end of the list (current becomes null).', why: 'null is the built-in "end of chain" signal — no need for a separate length counter.', symbols: [] } },
    { code: '            if (current.data == target) return true;', explain: { what: 'If the current node\'s value matches, we found it — return immediately.', why: '', symbols: [] } },
    { code: '            current = current.next;', explain: { what: 'Moves the pointer forward to the next node in the chain.', why: 'This is the ONLY way to advance in a linked list — unlike an array, you can\'t jump to current+5.', symbols: [] } },
    { code: '        }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
    { code: '        return false;', explain: { what: 'We fell off the end without a match — the value isn\'t in the list.', why: '', symbols: [] } },
    { code: '    }', explain: { what: 'Closes search.', why: '', symbols: [] } },
    { code: '}', explain: { what: 'Closes the class.', why: '', symbols: [] } },
  ],
  initViz({ stage, controls, log }) {
    let arr = [10, 20, 30];

    function refresh(hl) { draw(stage, arr, hl); }

    async function doInsertHead(valStr) {
      const val = parseInt(valStr, 10);
      if (isNaN(val)) { log.textContent = '⚠️ Enter a value.'; return; }
      arr.unshift(val);
      refresh({ active: 0 });
      log.textContent = `insertAtHead(${val}) → new node points to old head, then head is repointed. O(1) — nothing else moved.`;
    }

    async function doInsertTail(valStr) {
      const val = parseInt(valStr, 10);
      if (isNaN(val)) { log.textContent = '⚠️ Enter a value.'; return; }
      setButtonsDisabled(controls, true);
      for (let i = 0; i < arr.length; i++) {
        refresh({ active: i });
        log.textContent = `Walking the chain… at node ${i} (value ${arr[i]}), following .next`;
        await sleep(300);
      }
      arr.push(val);
      refresh({ active: arr.length - 1 });
      log.textContent = `insertAtTail(${val}) → had to walk all the way to the end first (O(n) without a tail pointer), then linked the new node.`;
      setButtonsDisabled(controls, false);
    }

    async function doSearch(valStr) {
      const target = parseInt(valStr, 10);
      if (isNaN(target)) { log.textContent = '⚠️ Enter a value to search for.'; return; }
      setButtonsDisabled(controls, true);
      for (let i = 0; i < arr.length; i++) {
        refresh({ active: i });
        log.textContent = `current.data == ${target}?  Currently at node ${i}: ${arr[i]}`;
        await sleep(400);
        if (arr[i] === target) {
          refresh({ found: i });
          log.textContent = `✅ Found ${target} — but we had to follow ${i + 1} pointer(s) to get here (no random access in a linked list).`;
          setButtonsDisabled(controls, false);
          return;
        }
      }
      log.textContent = `❌ Reached null — ${target} is not in the list.`;
      setButtonsDisabled(controls, false);
    }

    async function doDeleteHead() {
      if (!arr.length) { log.textContent = 'List is empty.'; return; }
      refresh({ active: 0 });
      await sleep(300);
      const val = arr.shift();
      refresh({});
      log.textContent = `Deleted head (${val}) → head now points to what used to be the second node. O(1).`;
    }

    const refs = buildControls(controls, [
      { type: 'input', ref: 'val', label: 'Value', inputType: 'number', placeholder: '42' },
      { type: 'button', label: 'Insert at Head', variant: 'good', onClick: () => doInsertHead(refs.val.value) },
      { type: 'button', label: 'Insert at Tail', onClick: () => doInsertTail(refs.val.value) },
      { type: 'button', label: 'Search', onClick: () => doSearch(refs.val.value) },
      { type: 'button', label: 'Delete Head', variant: 'warn', onClick: () => doDeleteHead() },
    ]);

    refresh({});
    log.textContent = 'Insert at Head is instant. Insert at Tail must walk the whole chain — watch the difference.';
  },
};
