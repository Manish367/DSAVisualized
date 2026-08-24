import array from './array.js';
import string from './string.js';
import stack from './stack.js';
import queue from './queue.js';
import linkedlist from './linkedlist.js';
import sorting from './sorting.js';
import searching from './searching.js';
import recursion from './recursion.js';
import tree from './tree.js';
import graph from './graph.js';
import hashing from './hashing.js';

export const categories = [
  { id: 'basics', label: 'Basics' },
  { id: 'linear', label: 'Linear Structures' },
  { id: 'sorting-searching', label: 'Sorting & Searching' },
  { id: 'recursion', label: 'Recursion' },
  { id: 'trees', label: 'Trees' },
  { id: 'graphs', label: 'Graphs' },
  { id: 'hashing', label: 'Hashing' },
];

export const topics = [array, string, stack, queue, linkedlist, sorting, searching, recursion, tree, graph, hashing];
