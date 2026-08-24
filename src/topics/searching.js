import { el, clear, buildControls, sleep, setButtonsDisabled } from '../viz.js';

function draw(stage, arr, highlights = {}) {
  clear(stage);
  const row = el('div', 'vrow');
  arr.forEach((val, i) => {
    const cls = ['vbox'];
    if (highlights.low === i || highlights.mid === i || highlights.high === i) cls.push('active');
    if (highlights.found === i) cls.push('found');
    if (highlights.dead && highlights.dead.includes(i)) cls.push('dead');
    let tag = '';
    if (highlights.low === i) tag += 'L';
    if (highlights.mid === i) tag += (tag ? '/' : '') + 'M';
    if (highlights.high === i) tag += (tag ? '/' : '') + 'H';
    const box = el('div', cls.join(' '), `<span class="vidx">${tag || i}</span>${val}`);
    row.appendChild(box);
  });
  stage.appendChild(row);
}

export default {
  id: 'searching',
  category: 'sorting-searching',
  icon: '🔍',
  title: 'Searching: Linear vs Binary',
  tagline: 'Two ways to find a needle in a haystack — one checks everything, the other halves the haystack each time.',
  definition: 'Linear search checks every element one by one until it finds the target (or reaches the end). Binary search only works on SORTED data — it looks at the middle element, and because the data is sorted, it instantly knows which half the target must be in, discarding the other half entirely. Repeat, and each step throws away half of what\'s left.',
  why: 'Linear search always works but scales badly — 1,000,000 elements means up to 1,000,000 checks. Binary search trades a requirement (data must be sorted) for a massive speedup: 1,000,000 elements takes at most ~20 checks (log₂ 1,000,000 ≈ 20). This is the single clearest, most teachable example of why "the right algorithm" beats "more hardware".',
  complexity: [
    ['Linear search', 'O(n)', 'O(1)'],
    ['Binary search', 'O(log n)', 'O(1)'],
    ['Binary search (recursive)', 'O(log n)', 'O(log n)'],
  ],
  glossary: [
    ['low / mid / high', 'The three pointers binary search maintains: the current search boundaries and the midpoint being checked.'],
    ['Search space', 'The range of elements still possibly containing the target — binary search halves it every step.'],
    ['Precondition', 'A requirement that must hold before an algorithm works correctly — here, "the array must already be sorted" — ignoring it silently gives wrong answers.'],
    ['log n', 'How many times you can halve n before reaching 1 — this is WHY binary search is so fast.'],
  ],
  examples: [
    { icon: '📖', title: 'Dictionary lookup', text: 'You never read a dictionary front to back to find "quartz" — you open near the middle and jump left/right. That instinct IS binary search.' },
    { icon: '📞', title: 'Old phone books', text: 'The classic teaching example: finding "Smith" by repeatedly flipping to the middle of the remaining pages.' },
    { icon: '🎮', title: '"Guess the number" games', text: 'A game that says "higher" or "lower" after each guess is guiding you to play binary search optimally.' },
  ],
  caseStudies: [
    { tag: 'Version control', title: 'git bisect', text: 'Git\'s "bisect" command finds which commit introduced a bug by binary-searching through your commit history — testing the middle commit, then discarding half the history each time. Hundreds of commits become ~8-10 tests.' },
    { tag: 'Databases', title: 'B-Tree indexes', text: 'Database indexes are essentially a generalized, disk-friendly version of binary search (a B-Tree), which is why a query like WHERE id = 4213 on an indexed column returns instantly even on a billion-row table.' },
    { tag: 'Interview classic', title: 'Search in Rotated Sorted Array', text: 'A famous interview twist: the array is sorted but then rotated (e.g. [4,5,6,7,0,1,2]). You still use binary search — you just add one extra check per step to figure out which half is properly sorted.' },
  ],
  code: [
    { code: 'public class BinarySearch {', explain: { what: 'Class wrapper.', why: '', symbols: [] } },
    { code: '    static int search(int[] arr, int target) {', explain: { what: 'Returns the index of target in arr, or -1 if not found. Assumes arr is already sorted ascending.', why: 'The -1 "not found" sentinel matches the convention used by java.util.Arrays.binarySearch and most search APIs.', symbols: [] } },
    { code: '        int low = 0, high = arr.length - 1;', explain: { what: 'Initializes the search boundaries to the whole array: from the first index to the last.', why: '', symbols: [['low', 'left edge of the current search range.'], ['high', 'right edge of the current search range.']] } },
    { code: '        while (low <= high) {', explain: { what: 'Keeps searching as long as there\'s still at least one element between low and high.', why: 'When low > high, the search space is empty — the target genuinely isn\'t in the array.', symbols: [] } },
    { code: '            int mid = low + (high - low) / 2;', explain: { what: 'Calculates the middle index of the current range.', why: 'Written as low + (high-low)/2 instead of (low+high)/2 to avoid integer overflow on very large arrays — a real, famous historical bug (it existed in Java\'s own binarySearch for years!).', symbols: [['mid', 'the index we check this round.']] } },
    { code: '            if (arr[mid] == target) return mid;', explain: { what: 'Found it exactly at the middle — return immediately.', why: '', symbols: [] } },
    { code: '            else if (arr[mid] < target) low = mid + 1;', explain: { what: 'The middle value is too small, so the target (if it exists) must be to the right — discard the entire left half by moving low past mid.', why: 'This is the "halving" step — the whole left portion, including mid, is thrown away in one instruction.', symbols: [] } },
    { code: '            else high = mid - 1;', explain: { what: 'The middle value is too big, so the target must be to the left — discard the entire right half by moving high before mid.', why: '', symbols: [] } },
    { code: '        }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
    { code: '        return -1;', explain: { what: 'Search space shrank to nothing without a match — the target is not in the array.', why: '', symbols: [] } },
    { code: '    }', explain: { what: 'Closes search.', why: '', symbols: [] } },
    { code: '}', explain: { what: 'Closes the class.', why: '', symbols: [] } },
  ],
  initViz({ stage, controls, log }) {
    let arr = [4, 9, 15, 22, 28, 35, 41, 50, 63, 77, 88];

    function redraw(hl) { draw(stage, arr, hl); }

    async function doLinear(valStr) {
      const target = parseInt(valStr, 10);
      if (isNaN(target)) { log.textContent = '⚠️ Enter a number to search for.'; return; }
      setButtonsDisabled(controls, true);
      const dead = [];
      for (let i = 0; i < arr.length; i++) {
        redraw({ low: i, dead: [...dead] });
        log.textContent = `Linear search — checking index ${i}: is ${arr[i]} == ${target}? (step ${i + 1})`;
        await sleep(380);
        if (arr[i] === target) {
          redraw({ found: i, dead });
          log.textContent = `✅ Found at index ${i} after ${i + 1} check(s).`;
          setButtonsDisabled(controls, false);
          return;
        }
        dead.push(i);
      }
      redraw({ dead });
      log.textContent = `❌ Not found — checked all ${arr.length} elements.`;
      setButtonsDisabled(controls, false);
    }

    async function doBinary(valStr) {
      const target = parseInt(valStr, 10);
      if (isNaN(target)) { log.textContent = '⚠️ Enter a number to search for.'; return; }
      setButtonsDisabled(controls, true);
      let low = 0, high = arr.length - 1, steps = 0;
      while (low <= high) {
        steps++;
        const mid = low + Math.floor((high - low) / 2);
        redraw({ low, high, mid });
        log.textContent = `Step ${steps}: low=${low}, high=${high}, mid=${mid} → arr[mid]=${arr[mid]}. Comparing to ${target}…`;
        await sleep(700);
        if (arr[mid] === target) {
          redraw({ found: mid });
          log.textContent = `✅ Found at index ${mid} in just ${steps} step(s) — versus up to ${arr.length} for linear search!`;
          setButtonsDisabled(controls, false);
          return;
        } else if (arr[mid] < target) {
          log.textContent = `${arr[mid]} < ${target} → target must be to the RIGHT. Discarding the left half.`;
          low = mid + 1;
        } else {
          log.textContent = `${arr[mid]} > ${target} → target must be to the LEFT. Discarding the right half.`;
          high = mid - 1;
        }
        await sleep(500);
      }
      redraw({});
      log.textContent = `❌ Not found — search space shrank to nothing after ${steps} step(s).`;
      setButtonsDisabled(controls, false);
    }

    const refs = buildControls(controls, [
      { type: 'input', ref: 'val', label: 'Target value', inputType: 'number', placeholder: '41' },
      { type: 'button', label: '▶ Linear Search', onClick: () => doLinear(refs.val.value) },
      { type: 'button', label: '▶ Binary Search', variant: 'primary', onClick: () => doBinary(refs.val.value) },
    ]);

    redraw({});
    log.textContent = 'Array is pre-sorted (required for binary search). Try target 63 with both and compare step counts.';
  },
};
