import { el, clear, buildControls, sleep, setButtonsDisabled } from '../viz.js';

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function insertNode(root, value) {
  if (!root) return new TreeNode(value);
  if (value < root.value) root.left = insertNode(root.left, value);
  else if (value > root.value) root.right = insertNode(root.right, value);
  return root;
}

function layout(root) {
  const positions = new Map();
  let counter = 0;
  function inorder(node, depth) {
    if (!node) return;
    inorder(node.left, depth + 1);
    positions.set(node, { x: counter, y: depth });
    counter++;
    inorder(node.right, depth + 1);
  }
  inorder(root, 0);
  return positions;
}

function render(stage, root, highlight = {}) {
  clear(stage);
  if (!root) {
    stage.appendChild(el('div', '', 'Tree is empty — insert a value to begin.')).style.cssText = 'color:var(--text-mute);text-align:center;width:100%;padding:40px 0;';
    return;
  }
  const positions = layout(root);
  const count = positions.size;
  const stageW = stage.clientWidth || 700;
  const xGap = Math.max(50, Math.min(80, (stageW - 60) / Math.max(count, 1)));
  const yGap = 70;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tree-svg');
  stage.style.position = 'relative';
  stage.style.minHeight = `${Math.max(...[...positions.values()].map((p) => p.y)) * yGap + 100}px`;

  positions.forEach((pos, node) => {
    pos.px = 30 + pos.x * xGap + xGap / 2;
    pos.py = 40 + pos.y * yGap;
  });

  positions.forEach((pos, node) => {
    [node.left, node.right].forEach((child) => {
      if (!child) return;
      const cp = positions.get(child);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', pos.px); line.setAttribute('y1', pos.py);
      line.setAttribute('x2', cp.px); line.setAttribute('y2', cp.py);
      const isVisitedEdge = highlight.path && highlight.path.includes(node) && highlight.path.includes(child);
      line.setAttribute('class', 'tree-edge' + (isVisitedEdge ? ' visited' : ''));
      svg.appendChild(line);
    });
  });
  stage.appendChild(svg);

  positions.forEach((pos, node) => {
    const cls = ['tree-node'];
    if (highlight.active === node) cls.push('active');
    if (highlight.visited && highlight.visited.includes(node)) cls.push('visited');
    if (highlight.found === node) cls.push('found');
    const div = el('div', cls.join(' '), node.value);
    div.style.left = pos.px + 'px';
    div.style.top = pos.py + 'px';
    stage.appendChild(div);
  });
}

export default {
  id: 'tree',
  category: 'trees',
  icon: '🌳',
  title: 'Binary Search Tree',
  tagline: 'A tree where every node\'s left side is smaller, right side is bigger — sorted data with fast lookups AND fast inserts.',
  definition: 'A Binary Search Tree (BST) is a tree structure where each node has at most two children, and it obeys one rule everywhere: everything in a node\'s left subtree is smaller than the node, everything in its right subtree is bigger. That single rule is what lets you search, insert, and delete in roughly O(log n) time — the same trick as binary search, but on a linked structure that can grow without shifting anything.',
  why: 'A sorted array gives O(log n) search but O(n) insert (shifting). A linked list gives O(1) insert but O(n) search. A BST gets close to the best of both — O(log n) for search AND insert — as long as it stays reasonably balanced. This is why BSTs (and their self-balancing cousins like AVL and Red-Black trees) sit underneath databases, file systems, and language runtime maps.',
  complexity: [
    ['Search (balanced)', 'O(log n)', 'O(1)'],
    ['Insert (balanced)', 'O(log n)', 'O(1)'],
    ['Search (worst case, unbalanced)', 'O(n)', 'O(1)'],
    ['In-order traversal (visit all)', 'O(n)', 'O(n)'],
  ],
  glossary: [
    ['Root', 'The single top node of the tree — every search starts here.'],
    ['Leaf', 'A node with no children.'],
    ['Subtree', 'A node plus everything beneath it — itself a valid, smaller BST.'],
    ['In-order traversal', 'Visit left subtree → node → right subtree. For a BST, this always visits values in SORTED order — a very useful property.'],
    ['Balanced vs. unbalanced', 'Balanced: left/right subtree heights stay close, guaranteeing O(log n). Unbalanced: inserting sorted data in order can degrade a BST into a straight line — effectively a slow linked list, O(n).'],
  ],
  examples: [
    { icon: '🗂️', title: 'File system directories', text: 'Some file systems and database indexes organize entries in tree structures so "find file X" doesn\'t mean scanning every file.' },
    { icon: '🔤', title: 'Auto-complete / spell-check dictionaries', text: 'Ordered word structures (tree-based) let an app quickly check "is this a real word?" or find nearby valid words.' },
    { icon: '📈', title: 'Priority-based scheduling', text: 'Tree-based structures keep "next most important task" retrievable in O(log n), which is why they underlie many priority queues and event schedulers.' },
  ],
  caseStudies: [
    { tag: 'Databases', title: 'Why databases use B-Trees, not plain BSTs', text: 'A plain BST can become an unbalanced line in the worst case, and even balanced, its "depth" is expensive on disk (each level = a disk seek). Databases use B-Trees — a wider version of a BST where each node has many children — to keep the tree extremely shallow, minimizing slow disk reads. Same core idea as a BST, engineered for a different bottleneck.' },
    { tag: 'Language runtimes', title: 'Java\'s TreeMap / TreeSet', text: 'java.util.TreeMap is backed by a Red-Black Tree (a self-balancing BST) — it guarantees O(log n) get/put AND keeps keys sorted, which is why iterating a TreeMap always gives sorted output, unlike a HashMap.' },
    { tag: 'Interview classic', title: 'Validate a BST / find the Kth smallest', text: 'A very common trap: an interviewer gives a tree that LOOKS like a BST locally (each node > its direct left child) but violates the rule globally. The correct check passes a valid (min, max) range down recursively — testing real understanding of the BST invariant, not just "left < right".' },
  ],
  code: [
    { code: 'class Node {', explain: { what: 'One tree node: a value plus two children.', why: '', symbols: [] } },
    { code: '    int value;', explain: { what: 'The data stored at this node.', why: '', symbols: [] } },
    { code: '    Node left, right;', explain: { what: 'References to this node\'s left and right children — either can be null.', why: 'Two pointers instead of one (like a linked list) is exactly what turns a chain into a branching TREE.', symbols: [['left', 'root of the subtree containing all SMALLER values.'], ['right', 'root of the subtree containing all BIGGER values.']] } },
    { code: '    Node(int value) { this.value = value; }', explain: { what: 'Constructor — a brand-new node starts as a leaf (left and right default to null).', why: '', symbols: [] } },
    { code: '}', explain: { what: 'Closes Node.', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: 'public class BST {', explain: { what: 'Class wrapper.', why: '', symbols: [] } },
    { code: '    Node root;', explain: { what: 'The single entry point into the whole tree.', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '    void insert(int value) { root = insertRec(root, value); }', explain: { what: 'Public entry point for inserting — delegates to a recursive helper and reassigns root (needed for when the tree was empty).', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '    private Node insertRec(Node node, int value) {', explain: { what: 'Recursively finds the correct empty spot for "value" and links a new node there.', why: 'private hides this helper — callers should only ever use insert(value), not manage nodes directly.', symbols: [] } },
    { code: '        if (node == null) return new Node(value);', explain: { what: 'BASE CASE: we\'ve walked off the tree into empty space — this is exactly where the new value belongs. Create and return it.', why: 'The returned node gets wired back up by the caller\'s left/right assignment below.', symbols: [] } },
    { code: '        if (value < node.value) node.left = insertRec(node.left, value);', explain: { what: 'Value is smaller — it belongs in the left subtree, so recurse left and reattach whatever comes back.', why: 'This is the BST invariant enforced at every single step: smaller always goes left.', symbols: [] } },
    { code: '        else if (value > node.value) node.right = insertRec(node.right, value);', explain: { what: 'Value is bigger — recurse right and reattach.', why: '', symbols: [] } },
    { code: '        return node;', explain: { what: 'Returns the (possibly unchanged) current node back up to its caller, preserving the rest of the tree structure.', why: '', symbols: [] } },
    { code: '    }', explain: { what: 'Closes insertRec.', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '    boolean search(int target) {', explain: { what: 'Public search — walks down from the root using the BST rule to decide left or right, no need to check every node.', why: '', symbols: [] } },
    { code: '        Node cur = root;', explain: { what: 'Temporary pointer starting at the root.', why: '', symbols: [] } },
    { code: '        while (cur != null) {', explain: { what: 'Keep walking until we fall off the tree (cur becomes null).', why: '', symbols: [] } },
    { code: '            if (target == cur.value) return true;', explain: { what: 'Found it.', why: '', symbols: [] } },
    { code: '            cur = target < cur.value ? cur.left : cur.right;', explain: { what: 'Decide which single child to move into: left if target is smaller, right if bigger — the OTHER subtree is skipped entirely, unlike a linear scan.', why: 'This is the O(log n) magic: one comparison eliminates roughly half the remaining nodes.', symbols: [['? :', 'the ternary operator — a compact if/else that produces a value.']] } },
    { code: '        }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
    { code: '        return false;', explain: { what: 'Fell off the tree without a match.', why: '', symbols: [] } },
    { code: '    }', explain: { what: 'Closes search.', why: '', symbols: [] } },
    { code: '}', explain: { what: 'Closes the class.', why: '', symbols: [] } },
  ],
  initViz({ stage, controls, log }) {
    let root = null;
    [50, 30, 70, 20, 40, 60, 80].forEach((v) => { root = insertNode(root, v); });

    function redraw(hl) { render(stage, root, hl || {}); }

    async function doInsert(valStr) {
      const val = parseInt(valStr, 10);
      if (isNaN(val)) { log.textContent = '⚠️ Enter a number to insert.'; return; }
      setButtonsDisabled(controls, true);
      const path = [];
      let cur = root;
      while (cur) {
        path.push(cur);
        redraw({ active: cur, visited: [...path] });
        log.textContent = `${val} ${val < cur.value ? '<' : val > cur.value ? '>' : '=='} ${cur.value} → go ${val < cur.value ? 'LEFT' : val > cur.value ? 'RIGHT' : 'already exists, stop'}`;
        await sleep(600);
        if (val === cur.value) { setButtonsDisabled(controls, false); return; }
        cur = val < cur.value ? cur.left : cur.right;
      }
      root = insertNode(root, val);
      redraw({});
      log.textContent = `Inserted ${val} as a leaf, ${path.length} level(s) down from the root.`;
      setButtonsDisabled(controls, false);
    }

    async function doSearch(valStr) {
      const target = parseInt(valStr, 10);
      if (isNaN(target)) { log.textContent = '⚠️ Enter a number to search for.'; return; }
      setButtonsDisabled(controls, true);
      const visited = [];
      let cur = root;
      while (cur) {
        visited.push(cur);
        redraw({ active: cur, visited: [...visited] });
        log.textContent = `At node ${cur.value}: is ${target} == ${cur.value}?`;
        await sleep(600);
        if (target === cur.value) {
          redraw({ found: cur, visited });
          log.textContent = `✅ Found ${target} after visiting ${visited.length} node(s) — not the whole tree!`;
          setButtonsDisabled(controls, false);
          return;
        }
        cur = target < cur.value ? cur.left : cur.right;
      }
      redraw({ visited });
      log.textContent = `❌ ${target} is not in the tree — fell off after ${visited.length} node(s).`;
      setButtonsDisabled(controls, false);
    }

    async function doInorder() {
      setButtonsDisabled(controls, true);
      const visited = [];
      const order = [];
      async function walk(node) {
        if (!node) return;
        await walk(node.left);
        visited.push(node);
        order.push(node.value);
        redraw({ visited: [...visited], active: node });
        log.textContent = `In-order so far: ${order.join(', ')}`;
        await sleep(450);
        await walk(node.right);
      }
      await walk(root);
      redraw({ visited });
      log.textContent = `✅ In-order traversal complete — notice the values came out perfectly SORTED: ${order.join(', ')}`;
      setButtonsDisabled(controls, false);
    }

    const refs = buildControls(controls, [
      { type: 'input', ref: 'val', label: 'Value', inputType: 'number', placeholder: '55' },
      { type: 'button', label: 'Insert', variant: 'good', onClick: () => doInsert(refs.val.value) },
      { type: 'button', label: 'Search', onClick: () => doSearch(refs.val.value) },
      { type: 'button', label: '▶ In-order Traversal', variant: 'primary', onClick: doInorder },
      { type: 'button', label: 'Reset tree', onClick: () => { root = null; [50, 30, 70, 20, 40, 60, 80].forEach((v) => { root = insertNode(root, v); }); redraw(); log.textContent = 'Tree reset to default.'; } },
    ]);

    redraw();
    log.textContent = 'Insert/search follows one comparison per level — try In-order Traversal to see it print in sorted order.';
  },
};
