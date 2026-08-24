import { el, clear, buildControls, sleep, setButtonsDisabled } from '../viz.js';

// Fixed demo graph, positions as % of stage size.
const NODES = {
  A: { x: 50, y: 10 },
  B: { x: 20, y: 32 },
  C: { x: 80, y: 32 },
  D: { x: 8, y: 60 },
  E: { x: 35, y: 60 },
  F: { x: 65, y: 60 },
  G: { x: 92, y: 60 },
  H: { x: 50, y: 88 },
};
const EDGES = [
  ['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'F'], ['C', 'G'], ['E', 'H'], ['F', 'H'],
];
const ADJ = {};
Object.keys(NODES).forEach((n) => (ADJ[n] = []));
EDGES.forEach(([a, b]) => { ADJ[a].push(b); ADJ[b].push(a); });
Object.values(ADJ).forEach((list) => list.sort());

function render(stage, state) {
  clear(stage);
  stage.style.position = 'relative';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tree-svg');
  svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
  svg.style.position = 'absolute'; svg.style.inset = '0';

  EDGES.forEach(([a, b]) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', NODES[a].x + '%'); line.setAttribute('y1', NODES[a].y + '%');
    line.setAttribute('x2', NODES[b].x + '%'); line.setAttribute('y2', NODES[b].y + '%');
    const visited = state.visitedEdges && state.visitedEdges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    line.setAttribute('class', 'graph-edge' + (visited ? ' visited' : ''));
    svg.appendChild(line);
  });
  stage.appendChild(svg);

  Object.entries(NODES).forEach(([name, pos]) => {
    const cls = ['graph-node'];
    if (state.visited && state.visited.includes(name)) cls.push('visited');
    if (state.frontier && state.frontier.includes(name)) cls.push('frontier');
    if (state.current === name) cls.push('current');
    const div = el('div', cls.join(' '), name);
    div.style.left = pos.x + '%'; div.style.top = pos.y + '%';
    stage.appendChild(div);
  });
}

export default {
  id: 'graph',
  category: 'graphs',
  icon: '🕸️',
  title: 'Graphs: BFS & DFS',
  tagline: 'Nodes connected by edges — the structure behind maps, networks, and relationships.',
  definition: 'A graph is a set of nodes (vertices) connected by edges — more general than a tree, since a graph allows cycles and a node can connect to any number of others, not just "children". Breadth-First Search (BFS) explores level-by-level outward from a start node using a QUEUE. Depth-First Search (DFS) plunges as deep as possible down one path before backtracking, using a STACK (or recursion, which uses the call stack).',
  why: 'Most real networks — roads, social connections, the internet, dependency chains — aren\'t neatly nested like a tree; they\'re graphs. BFS and DFS are the two fundamental ways to systematically visit every reachable node. Which one you pick matters: BFS finds the SHORTEST path (fewest edges) in an unweighted graph; DFS is better for exploring all possibilities deeply, like detecting cycles or solving mazes.',
  complexity: [
    ['BFS', 'O(V + E)', 'O(V)'],
    ['DFS', 'O(V + E)', 'O(V)'],
  ],
  glossary: [
    ['Vertex (node)', 'A single point in the graph — V is the total count of vertices.'],
    ['Edge', 'A connection between two vertices — E is the total count of edges.'],
    ['Adjacency list', 'The standard way to store a graph: for each node, a list of its directly connected neighbors.'],
    ['Frontier', 'In BFS, the set of nodes discovered but not yet visited — literally the contents of the queue at any moment.'],
    ['Visited set', 'Nodes already processed — checked before visiting a neighbor again, to avoid infinite loops on cyclic graphs.'],
  ],
  examples: [
    { icon: '🗺️', title: 'GPS shortest route', text: 'Maps model roads as a graph (intersections = nodes, roads = edges) and use shortest-path algorithms built on the same "explore neighbors" idea as BFS.' },
    { icon: '👥', title: 'Social network "friends of friends"', text: '"People you may know" and "degrees of separation" (e.g. LinkedIn\'s 2nd/3rd connections) are literally BFS from you outward, level by level.' },
    { icon: '📦', title: 'Package/dependency resolution', text: 'npm, Maven, and pip resolve dependencies (and detect circular ones) by traversing a dependency graph, often with DFS.' },
  ],
  caseStudies: [
    { tag: 'Search & maps', title: 'Why BFS = shortest path (unweighted)', text: 'BFS visits nodes in increasing order of distance from the start — by the time it reaches a node, it\'s guaranteed to be via the fewest possible edges. This is exactly why "shortest number of hops" problems (like Word Ladder, or minimum connections between two people) always default to BFS, never DFS.' },
    { tag: 'Compilers & build tools', title: 'Detecting circular dependencies', text: 'Build systems (webpack, Maven) run DFS over the dependency graph; if DFS revisits a node that\'s still "in progress" (on the current recursion path), that\'s a cycle — e.g. module A imports B which imports A — and the build fails with a clear error instead of infinite-looping.' },
    { tag: 'Interview classic', title: 'Number of Islands / Flood Fill', text: 'Given a grid of land/water, count separate islands — solved by running DFS (or BFS) from every unvisited land cell, marking everything connected to it as visited. The same flood-fill idea powers the "paint bucket" tool in image editors.' },
  ],
  code: [
    { code: 'import java.util.*;', explain: { what: 'Imports everything from java.util (Queue, LinkedList, HashSet, etc.) with a wildcard.', why: 'BFS needs several utility classes — importing them individually would be repetitive for a short demo.', symbols: [] } },
    { code: 'public class GraphBFS {', explain: { what: 'Class wrapper.', why: '', symbols: [] } },
    { code: '    static void bfs(Map<String, List<String>> graph, String start) {', explain: { what: 'Runs BFS over an adjacency list graph, starting from "start", printing the order nodes are visited.', why: 'Map<String, List<String>> is the adjacency list: each key is a node, its value is the list of directly connected neighbors.', symbols: [] } },
    { code: '        Queue<String> queue = new LinkedList<>();', explain: { what: 'The queue that drives BFS\'s "explore level by level" behaviour.', why: 'This is the direct link to the Queue topic — BFS IS "graph traversal using a queue".', symbols: [] } },
    { code: '        Set<String> visited = new HashSet<>();', explain: { what: 'Tracks nodes we\'ve already discovered, so we never enqueue (or process) the same node twice.', why: 'Without this, a cyclic graph would make BFS loop forever, bouncing back and forth between connected nodes.', symbols: [['HashSet', 'gives O(1) "have we seen this?" checks — see the Hashing topic.']] } },
    { code: '        queue.offer(start);', explain: { what: 'Seeds the queue with the starting node.', why: '', symbols: [] } },
    { code: '        visited.add(start);', explain: { what: 'Marks the start node as visited IMMEDIATELY when it\'s enqueued (not when it\'s dequeued) — a subtle but important detail that prevents duplicate enqueues.', why: '', symbols: [] } },
    { code: '        while (!queue.isEmpty()) {', explain: { what: 'Keeps going until there\'s nothing left to explore.', why: '', symbols: [] } },
    { code: '            String node = queue.poll();', explain: { what: 'Removes the oldest-discovered node from the front — this is why BFS explores in order of distance from the start.', why: '', symbols: [] } },
    { code: '            System.out.println("Visiting: " + node);', explain: { what: 'Process the node — here, just printing it.', why: '', symbols: [] } },
    { code: '            for (String neighbor : graph.get(node)) {', explain: { what: 'Looks at every direct neighbor of the current node.', why: '', symbols: [['graph.get(node)', 'looks up the adjacency list for this node.']] } },
    { code: '                if (!visited.contains(neighbor)) {', explain: { what: 'Only process neighbors we haven\'t discovered yet.', why: '', symbols: [] } },
    { code: '                    visited.add(neighbor);', explain: { what: 'Mark it discovered right away.', why: '', symbols: [] } },
    { code: '                    queue.offer(neighbor);', explain: { what: 'Add it to the back of the queue — it\'ll be explored only after everything currently in the queue.', why: 'This is what creates the "level by level" spreading pattern of BFS.', symbols: [] } },
    { code: '                }', explain: { what: 'Closes the if.', why: '', symbols: [] } },
    { code: '            }', explain: { what: 'Closes the for loop.', why: '', symbols: [] } },
    { code: '        }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
    { code: '    }', explain: { what: 'Closes bfs.', why: '', symbols: [] } },
    { code: '}', explain: { what: 'Closes the class.', why: '', symbols: [] } },
  ],
  initViz({ stage, controls, log }) {
    function redraw(state) { render(stage, state); }

    async function doBFS(startNode) {
      setButtonsDisabled(controls, true);
      const visited = [startNode];
      const visitedEdges = [];
      const queue = [startNode];
      redraw({ visited: [], frontier: [startNode] });
      log.textContent = `Enqueue ${startNode}. Frontier: [${queue.join(', ')}]`;
      await sleep(600);
      while (queue.length) {
        const node = queue.shift();
        redraw({ visited: visited.filter((v) => v !== node), current: node, frontier: [...queue], visitedEdges });
        log.textContent = `Dequeue ${node} → visiting it now.`;
        await sleep(650);
        for (const nb of ADJ[node]) {
          if (!visited.includes(nb)) {
            visited.push(nb);
            queue.push(nb);
            visitedEdges.push([node, nb]);
            redraw({ visited: visited.filter((v) => v !== node), current: node, frontier: [...queue], visitedEdges });
            log.textContent = `${node} → neighbor ${nb} not visited yet → mark visited & enqueue.`;
            await sleep(450);
          }
        }
      }
      redraw({ visited, visitedEdges });
      log.textContent = `✅ BFS complete. Visit order shows increasing distance (in edges) from ${startNode}.`;
      setButtonsDisabled(controls, false);
    }

    async function doDFS(startNode) {
      setButtonsDisabled(controls, true);
      const visited = [];
      const visitedEdges = [];

      async function dfs(node, parent) {
        visited.push(node);
        if (parent) visitedEdges.push([parent, node]);
        redraw({ visited: [...visited], current: node, visitedEdges });
        log.textContent = `Visit ${node} → recurse into its unvisited neighbors first (deep before wide).`;
        await sleep(650);
        for (const nb of ADJ[node]) {
          if (!visited.includes(nb)) {
            await dfs(nb, node);
          }
        }
      }
      await dfs(startNode, null);
      redraw({ visited, visitedEdges });
      log.textContent = `✅ DFS complete. Notice it plunged down one branch fully before backtracking to try another.`;
      setButtonsDisabled(controls, false);
    }

    const refs = buildControls(controls, [
      { type: 'select', ref: 'start', label: 'Start node', options: Object.keys(NODES).map((n) => ({ value: n, text: n })) },
      { type: 'button', label: '▶ Run BFS', variant: 'primary', onClick: () => doBFS(refs.start.value) },
      { type: 'button', label: '▶ Run DFS', variant: 'good', onClick: () => doDFS(refs.start.value) },
    ]);

    redraw({});
    log.textContent = 'Pick a start node. BFS spreads level-by-level (queue); DFS dives deep first (recursion/stack).';
  },
};
