import RecursionVisualizer from '../components/RecursionVisualizer.jsx';
import { RECURSION_EXAMPLES } from './recursionExamples.js';

const codeVariants = {};
Object.entries(RECURSION_EXAMPLES).forEach(([key, ex]) => {
  codeVariants[key] = { label: ex.label, code: ex.code };
});

export default {
  id: 'recursion',
  category: 'recursion',
  icon: '🌀',
  title: 'Recursion',
  tagline: 'A function that calls itself on a smaller version of the problem, until it doesn\'t need to anymore.',
  definition: 'Recursion is when a function solves a problem by calling itself with a smaller/simpler input, until it reaches a "base case" simple enough to answer directly without recursing further. Each call is pushed onto the real call stack; once a call hits its base case, results "bubble back up" as each pending call finishes and returns.',
  why: 'Some problems are naturally defined in terms of smaller versions of themselves — a factorial, a tree, nested folders, a fractal. Recursion lets your code mirror that natural definition directly, which is often far shorter and clearer than the equivalent loop-based version — at the cost of extra memory for the call stack, and risk of a stack overflow if it never reaches its base case.',
  complexity: [
    ['Factorial(n)', 'O(n)', 'O(n) — call stack depth'],
    ['Sum of digits(n)', 'O(log₁₀ n)', 'O(log₁₀ n)'],
    ['Power(base, n) — naive', 'O(n)', 'O(n)'],
    ['Fibonacci (naive recursive)', 'O(2ⁿ)', 'O(n)'],
    ['Fibonacci (memoized)', 'O(n)', 'O(n)'],
    ['Binary search (recursive)', 'O(log n)', 'O(log n)'],
  ],
  glossary: [
    ['Base case', 'The simplest input the function can answer directly, without calling itself again — without one, recursion never stops.'],
    ['Recursive case', 'The part where the function calls itself with a smaller input, moving toward the base case.'],
    ['Call stack', 'The real stack (see the Stack topic!) that stores each in-progress function call, including its local variables, while it waits for its recursive call to return.'],
    ['Stack overflow', 'A crash caused by recursion going too deep — usually because the base case is missing or unreachable.'],
    ['Memoization', 'Caching results of expensive recursive calls (like fibonacci(30)) so they\'re computed once instead of exponentially many times.'],
    ['Branching recursion', 'A function that calls itself MORE than once per call (like Fibonacci\'s fib(n-1) + fib(n-2)) — the call "tree" grows exponentially instead of linearly.'],
  ],
  examples: [
    { icon: '📁', title: 'Folder size calculator', text: 'To get a folder\'s total size, you sum its files PLUS the size of every subfolder — and each subfolder is solved the exact same way. That\'s recursion mirroring a naturally nested structure.' },
    { icon: '🪆', title: 'Russian nesting dolls', text: 'Open a doll, find a smaller doll inside, open THAT one too — until you reach the smallest doll (the base case) with nothing inside.' },
    { icon: '🌳', title: 'Family tree / org chart traversal', text: '"List everyone who reports to this manager" naturally recurses: list direct reports, then recursively list each of THEIR reports.' },
  ],
  caseStudies: [
    { tag: 'Compilers & parsers', title: 'Parsing nested expressions', text: 'Parsing (a + (b * (c - d))) requires handling arbitrarily deep nested parentheses — compilers use recursive-descent parsers, where parseExpression() calls itself for each nested group.' },
    { tag: 'File systems', title: 'Recursive directory deletion (rm -rf)', text: 'Deleting a folder with nested subfolders requires recursing into each subfolder first before it can be removed — this is why rm -rf is recursive by nature, and also why it\'s dangerous if the base case (permission checks) is skipped.' },
    { tag: 'Interview classic', title: 'Fibonacci & why memoization matters', text: 'Naive recursive Fibonacci (try it above with n=6 and watch how many frames stack up!) recomputes the same sub-values millions of times — O(2ⁿ). Adding a cache (memoization) so each fib(k) is computed only once instantly drops it to O(n), the core idea behind dynamic programming.' },
  ],
  practice: [
    { title: 'Reverse a string recursively', prompt: 'Write reverse(s) that returns a string reversed, without using a loop.', approach: 'Base case: an empty or 1-character string is its own reverse. Recursive case: reverse(s) = reverse(s.substring(1)) + s.charAt(0) — reverse everything after the first character, then tack the first character on the end.', answer: 'Mirrors the Sum of Digits pattern above: peel off one piece, recurse on the rest, combine on the way back.' },
    { title: 'Check if an array is sorted, recursively', prompt: 'Write isSorted(arr, i) that returns true if arr is sorted ascending, with no loops.', approach: 'Base case: i == arr.length - 1 (reached the last element) → true. Recursive case: return arr[i] <= arr[i+1] && isSorted(arr, i + 1) — check the current pair, and let recursion handle the rest.', answer: 'Short-circuiting && means it stops as soon as one out-of-order pair is found — no need for an explicit early return.' },
    { title: 'Fast power — power(base, n) in O(log n)', prompt: 'The Power example above is O(n) — one multiplication per level. Can you make it O(log n)?', approach: 'Use the identity base^n = (base^(n/2))², halving n each call instead of decrementing it by 1. Handle odd n by pulling out one extra factor of base.', answer: 'This "fast exponentiation" trick is the same halving idea as binary search, applied to multiplication instead of comparison.' },
  ],
  codeVariants,
  CustomVisualizer: RecursionVisualizer,
};
