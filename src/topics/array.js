import { el, clear, buildControls, sleep, randomArray, setButtonsDisabled } from '../viz.js';

function draw(stage, arr, highlights = {}) {
  clear(stage);
  const row = el('div', 'vrow');
  arr.forEach((val, i) => {
    const cls = ['vbox'];
    if (highlights.active === i) cls.push('active');
    if (highlights.compare && highlights.compare.includes(i)) cls.push('compare');
    if (highlights.found === i || (highlights.foundRange && highlights.foundRange.includes(i))) cls.push('found');
    if (highlights.low === i || highlights.mid === i || highlights.high === i) cls.push('active');
    if (highlights.dead && highlights.dead.includes(i)) cls.push('dead');
    let tag = `${i}`;
    if (highlights.low === i || highlights.mid === i || highlights.high === i) {
      tag = '';
      if (highlights.low === i) tag += 'L';
      if (highlights.mid === i) tag += (tag ? '/' : '') + 'M';
      if (highlights.high === i) tag += (tag ? '/' : '') + 'H';
    }
    const box = el('div', cls.join(' '), `<span class="vidx">${tag}</span>${val}`);
    row.appendChild(box);
  });
  stage.appendChild(row);
}

const basicCode = [
  { code: 'int[] scores = new int[5];', explain: { what: 'Creates a new array of 5 integers, all initialized to 0.', why: 'You must tell Java the size up front — arrays are fixed-length blocks of contiguous memory.', symbols: [['new int[5]', 'allocates a block of memory big enough for 5 ints.']] } },
  { code: 'scores[0] = 90;', explain: { what: 'Stores 90 into the box at index 0.', why: 'Direct addressing — Java computes the memory address instantly instead of scanning from the start.', symbols: [['scores[0]', 'index access — square brackets select a position.']] } },
  { code: 'int first = scores[0];', explain: { what: 'Reads the value back out — O(1), same direct-address trick in reverse.', why: '', symbols: [] } },
  { code: 'System.out.println(scores.length);', explain: { what: 'Prints how many slots the array has (5) — fixed at creation time.', why: 'Unlike ArrayList.size(), .length is a field, not a method — no parentheses.', symbols: [['.length', 'a built-in field every array has, holding its fixed size.']] } },
];

const linearCode = [
  { code: 'static int linearSearch(int[] arr, int target) {', explain: { what: 'Returns the index of target, or -1 if it\'s not in arr.', why: '', symbols: [] } },
  { code: '    for (int i = 0; i < arr.length; i++) {', explain: { what: 'Checks every index in order, from 0 to the end.', why: 'No assumption about the array being sorted — this is the only search that works on ANY array.', symbols: [] } },
  { code: '        if (arr[i] == target) return i;', explain: { what: 'Found it — return immediately without checking the rest.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the loop.', why: '', symbols: [] } },
  { code: '    return -1;', explain: { what: 'Checked every element without a match.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes linearSearch.', why: 'Worst case touches every element once — O(n).', symbols: [] } },
];

const binaryCode = [
  { code: 'static int binarySearch(int[] arr, int target) {', explain: { what: 'Returns the index of target in a SORTED arr, or -1.', why: '', symbols: [] } },
  { code: '    int low = 0, high = arr.length - 1;', explain: { what: 'Search boundaries covering the whole array initially.', why: '', symbols: [] } },
  { code: '    while (low <= high) {', explain: { what: 'Keep going while the search space still has at least one element.', why: '', symbols: [] } },
  { code: '        int mid = low + (high - low) / 2;', explain: { what: 'The midpoint of the current range.', why: 'Avoids integer overflow versus (low+high)/2 on huge arrays.', symbols: [] } },
  { code: '        if (arr[mid] == target) return mid;', explain: { what: 'Found it at the midpoint.', why: '', symbols: [] } },
  { code: '        else if (arr[mid] < target) low = mid + 1;', explain: { what: 'Target must be to the right — discard the entire left half.', why: '', symbols: [] } },
  { code: '        else high = mid - 1;', explain: { what: 'Target must be to the left — discard the entire right half.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
  { code: '    return -1;', explain: { what: 'Search space shrank to nothing without a match.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes binarySearch.', why: 'Halves the search space every step — O(log n).', symbols: [] } },
];

const reverseCode = [
  { code: 'static void reverse(int[] arr) {', explain: { what: 'Reverses arr in place using two pointers, no extra array.', why: '', symbols: [] } },
  { code: '    int left = 0, right = arr.length - 1;', explain: { what: 'Two pointers starting at opposite ends.', why: '', symbols: [] } },
  { code: '    while (left < right) {', explain: { what: 'Keep swapping until the pointers meet or cross in the middle.', why: '', symbols: [] } },
  { code: '        int temp = arr[left];', explain: { what: 'Saves the left value before overwriting it.', why: '', symbols: [] } },
  { code: '        arr[left] = arr[right];', explain: { what: 'Copies the right value into the left slot.', why: '', symbols: [] } },
  { code: '        arr[right] = temp;', explain: { what: 'Completes the swap.', why: '', symbols: [] } },
  { code: '        left++; right--;', explain: { what: 'Move both pointers one step closer to the middle.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes reverse.', why: 'O(n/2) swaps, O(1) extra space — no second array needed.', symbols: [] } },
];

const rotateCode = [
  { code: 'static void rotateLeft(int[] arr, int k) {', explain: { what: 'Rotates arr left by k positions in place, using the "3 reversals" trick.', why: '', symbols: [] } },
  { code: '    k = k % arr.length;', explain: { what: 'Rotating by arr.length brings you back to the start — this drops any full extra rotations.', why: 'Also protects against k being larger than the array length.', symbols: [] } },
  { code: '    reverse(arr, 0, k - 1);', explain: { what: 'Reverses just the first k elements (the part that will move to the end).', why: '', symbols: [] } },
  { code: '    reverse(arr, k, arr.length - 1);', explain: { what: 'Reverses the remaining elements (the part that will move to the front).', why: '', symbols: [] } },
  { code: '    reverse(arr, 0, arr.length - 1);', explain: { what: 'Reverses the WHOLE array — this flips both reversed chunks back into correct order, but now rotated.', why: 'Three reversals of the whole/left/right achieve a rotation using only O(1) extra space — no temporary array needed.', symbols: [] } },
  { code: '}', explain: { what: 'Closes rotateLeft.', why: 'Same reverse(arr, i, j) helper as the Reverse example above, called three times.', symbols: [] } },
];

const kadaneCode = [
  { code: 'static int maxSubArray(int[] arr) {', explain: { what: 'Returns the largest possible sum of a contiguous subarray (Kadane\'s Algorithm).', why: '', symbols: [] } },
  { code: '    int currentSum = arr[0], maxSum = arr[0];', explain: { what: 'Starts both trackers at the first element.', why: '', symbols: [] } },
  { code: '    for (int i = 1; i < arr.length; i++) {', explain: { what: 'Scans the rest of the array once, left to right.', why: '', symbols: [] } },
  { code: '        currentSum = Math.max(arr[i], currentSum + arr[i]);', explain: { what: 'At each step, decide: is it better to EXTEND the current subarray (currentSum + arr[i]), or START FRESH from just arr[i]?', why: 'If currentSum is negative, dragging it along only hurts — starting over is always at least as good.', symbols: [['Math.max(a, b)', 'returns whichever of the two values is larger.']] } },
  { code: '        maxSum = Math.max(maxSum, currentSum);', explain: { what: 'Records the best currentSum seen so far, across the whole scan.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the loop.', why: '', symbols: [] } },
  { code: '    return maxSum;', explain: { what: 'The largest contiguous sum found anywhere in the array.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes maxSubArray.', why: 'One single pass — O(n) time, O(1) space, versus a brute-force O(n²) check of every possible subarray.', symbols: [] } },
];

const MODES = {
  basic: { label: 'Basic Operations (Access / Insert / Delete)' },
  linear: { label: 'Linear Search' },
  binary: { label: 'Binary Search' },
  reverse: { label: 'Reverse Array' },
  rotate: { label: 'Rotate Array (3-reversal trick)' },
  kadane: { label: "Max Subarray Sum (Kadane's Algorithm)" },
};

export default {
  id: 'array',
  category: 'basics',
  icon: '🔢',
  title: 'Array',
  tagline: 'A row of numbered boxes sitting next to each other in memory.',
  definition: 'An array is a fixed-size, ordered collection of elements stored in contiguous memory, each reachable instantly by an index (0, 1, 2, …). Think of it as a street of houses, all the same size, numbered in order — if you know the house number, you can walk straight to it without checking every house before it.',
  why: 'Before arrays, you had no way to store many related values without giving each one its own variable name. Arrays let you group values together AND jump straight to any one of them in constant time — because the computer just does "start address + index × size" to find it. That single trick (direct addressing) is why arrays are the fastest structure for reading a known position, and why searching, reversing, rotating and scanning for patterns (like the max subarray) all build directly on top of that guarantee.',
  complexity: [
    ['Access by index', 'O(1)', 'O(1)'],
    ['Linear search', 'O(n)', 'O(1)'],
    ['Binary search (sorted)', 'O(log n)', 'O(1)'],
    ['Insert / delete at end', 'O(1)*', 'O(1)'],
    ['Insert / delete at index', 'O(n)', 'O(1)'],
    ['Reverse', 'O(n)', 'O(1)'],
    ['Rotate (3-reversal trick)', 'O(n)', 'O(1)'],
    ["Max subarray (Kadane's)", 'O(n)', 'O(1)'],
  ],
  glossary: [
    ['Index', 'The position of an element, always starting at 0 in Java.'],
    ['Contiguous memory', 'All elements sit back-to-back in RAM, with no gaps — this is what makes O(1) access possible.'],
    ['Fixed size', 'A plain Java array cannot grow — you declare its length once (ArrayList grows for you by copying into a bigger array).'],
    ['Out of bounds', 'Accessing an index that doesn\'t exist — Java throws ArrayIndexOutOfBoundsException instead of silently corrupting memory.'],
    ['Two-pointer technique', 'Using two indices that move toward or away from each other — the trick behind array reversal, palindrome checks and many search problems.'],
    ['Subarray', 'A contiguous run of elements from the original array (not to be confused with a "subset", which can skip elements).'],
  ],
  examples: [
    { icon: '🖼️', title: 'Image pixels', text: 'A photo is literally a 2D array of pixel color values — that\'s why zooming in shows "square" artifacts at the array boundaries.' },
    { icon: '📊', title: 'Spreadsheet rows', text: 'A sheet\'s columns for one row are stored as an array so formulas like SUM(A1:A10) can walk through them by index.' },
    { icon: '📈', title: 'Stock price tracking', text: 'A day\'s stock prices stored as an array is exactly the setup for "best time to buy and sell" problems — a sliding max/min scan very close to Kadane\'s algorithm.' },
  ],
  caseStudies: [
    { tag: 'Interview classic', title: 'Two Sum', text: 'Given an array of prices, find two that add up to a budget. The naive O(n²) double loop is the first thing interviewers expect you to improve using a hash map — see the Hashing topic for the O(n) version.' },
    { tag: 'Systems design', title: 'CPU cache lines', text: 'CPUs fetch memory in blocks called cache lines. Because array elements are contiguous, looping through an array is dramatically faster than looping through a linked list of the same size — a real, measurable performance case study in low-latency systems.' },
    { tag: 'Finance & analytics', title: 'Kadane\'s Algorithm in trading systems', text: 'Finding the most profitable contiguous stretch of days (or the steepest single-pass gain) is a direct real-world use of the max-subarray idea — the same one-pass "extend or restart" logic scans price deltas instead of raw numbers.' },
  ],
  practice: [
    { title: 'Two Sum', prompt: 'Given an array of numbers and a target, find the indices of two numbers that add up to the target.', approach: 'Brute force checks every pair — O(n²), which is exactly what Linear Search-style nested scanning looks like. The fast version uses a hash map: for each number, check if (target - number) has already been seen — O(n). Try the Hashing topic to see this pattern in action.', answer: 'e.g. [2,7,11,15], target 9 → indices [0,1] since 2+7=9.' },
    { title: 'Maximum Subarray (Kadane\'s Algorithm)', prompt: 'Given an array that may contain negative numbers, find the contiguous subarray with the largest sum.', approach: 'Switch to "Max Subarray Sum" mode above and hit Run — watch currentSum reset to 0 whenever it dips below the next element\'s value alone, and maxSum track the best seen so far.', answer: 'Classic example [-2,1,-3,4,-1,2,1,-5,4] → answer is 6, from subarray [4,-1,2,1].' },
    { title: 'Rotate Array by K', prompt: 'Rotate an array left (or right) by k positions, ideally without using O(n) extra space.', approach: 'The naive approach copies into a new array — O(n) space. Switch to "Rotate Array" mode above to see the in-place O(1)-space trick: reverse the first k, reverse the rest, then reverse the whole thing.', answer: 'e.g. [1,2,3,4,5] rotated left by 2 → [3,4,5,1,2].' },
  ],
  codeVariants: {
    basic: { label: 'Basic Operations', code: basicCode },
    linear: { label: 'Linear Search', code: linearCode },
    binary: { label: 'Binary Search', code: binaryCode },
    reverse: { label: 'Reverse', code: reverseCode },
    rotate: { label: 'Rotate (3-reversal)', code: rotateCode },
    kadane: { label: "Kadane's Algorithm", code: kadaneCode },
  },
  initViz({ stage, controls, log }) {
    let arr = randomArray(7, 10, 99);
    let mode = 'basic';

    function refresh(hl) { draw(stage, arr, hl || {}); }

    // ---------- Basic ops ----------
    async function doAccess(idxStr) {
      const i = parseInt(idxStr, 10);
      if (isNaN(i) || i < 0 || i >= arr.length) { log.textContent = `⚠️ Index must be between 0 and ${arr.length - 1}.`; return; }
      refresh({ active: i });
      log.textContent = `arr[${i}] → ${arr[i]}   (direct jump — O(1), no scanning needed)`;
    }
    async function doInsert(idxStr, valStr) {
      let i = parseInt(idxStr, 10);
      const val = parseInt(valStr, 10);
      if (isNaN(val)) { log.textContent = '⚠️ Enter a value to insert.'; return; }
      if (isNaN(i)) i = arr.length;
      i = Math.max(0, Math.min(i, arr.length));
      setButtonsDisabled(controls, true);
      for (let k = arr.length; k > i; k--) {
        arr[k] = arr[k - 1];
        refresh({ active: k });
        log.textContent = `Shifting ${arr[k]} from index ${k - 1} → ${k} to make room…`;
        await sleep(350);
      }
      arr[i] = val;
      refresh({ active: i });
      log.textContent = `Inserted ${val} at index ${i}. Everything after it had to shift right — that's why insert-in-middle is O(n).`;
      setButtonsDisabled(controls, false);
    }
    async function doDelete(idxStr) {
      const i = parseInt(idxStr, 10);
      if (isNaN(i) || i < 0 || i >= arr.length) { log.textContent = `⚠️ Index must be between 0 and ${arr.length - 1}.`; return; }
      setButtonsDisabled(controls, true);
      refresh({ active: i });
      log.textContent = `Removing arr[${i}] = ${arr[i]}…`;
      await sleep(400);
      for (let k = i; k < arr.length - 1; k++) {
        arr[k] = arr[k + 1];
        refresh({ active: k });
        log.textContent = `Shifting ${arr[k]} left from index ${k + 1} → ${k} to close the gap…`;
        await sleep(350);
      }
      arr.pop();
      refresh();
      log.textContent = `Deleted. Elements after the gap shifted left — delete-in-middle is also O(n).`;
      setButtonsDisabled(controls, false);
    }

    // ---------- Linear search ----------
    async function doLinearSearch(valStr) {
      const target = parseInt(valStr, 10);
      if (isNaN(target)) { log.textContent = '⚠️ Enter a number to search for.'; return; }
      setButtonsDisabled(controls, true);
      const dead = [];
      for (let i = 0; i < arr.length; i++) {
        refresh({ active: i, dead: [...dead] });
        log.textContent = `Checking index ${i}: is ${arr[i]} == ${target}? (step ${i + 1})`;
        await sleep(400);
        if (arr[i] === target) {
          refresh({ found: i, dead });
          log.textContent = `✅ Found ${target} at index ${i} after checking ${i + 1} box(es).`;
          setButtonsDisabled(controls, false);
          return;
        }
        dead.push(i);
      }
      refresh({ dead });
      log.textContent = `❌ Not found — had to check all ${arr.length} boxes (worst case, O(n)).`;
      setButtonsDisabled(controls, false);
    }

    // ---------- Binary search ----------
    function sortedCopy() { return [...arr].sort((a, b) => a - b); }
    async function doBinarySearch(valStr) {
      const target = parseInt(valStr, 10);
      if (isNaN(target)) { log.textContent = '⚠️ Enter a number to search for.'; return; }
      const sorted = sortedCopy();
      arr = sorted;
      refresh();
      setButtonsDisabled(controls, true);
      let low = 0, high = arr.length - 1, steps = 0;
      while (low <= high) {
        steps++;
        const mid = low + Math.floor((high - low) / 2);
        refresh({ low, high, mid });
        log.textContent = `Step ${steps}: low=${low}, high=${high}, mid=${mid} → arr[mid]=${arr[mid]}. Comparing to ${target}…`;
        await sleep(650);
        if (arr[mid] === target) {
          refresh({ found: mid });
          log.textContent = `✅ Found at index ${mid} in ${steps} step(s) — versus up to ${arr.length} for linear search!`;
          setButtonsDisabled(controls, false);
          return;
        } else if (arr[mid] < target) {
          log.textContent = `${arr[mid]} < ${target} → go RIGHT. Discarding the left half.`;
          low = mid + 1;
        } else {
          log.textContent = `${arr[mid]} > ${target} → go LEFT. Discarding the right half.`;
          high = mid - 1;
        }
        await sleep(450);
      }
      refresh();
      log.textContent = `❌ Not found — search space shrank to nothing after ${steps} step(s).`;
      setButtonsDisabled(controls, false);
    }

    // ---------- Reverse ----------
    async function doReverse() {
      setButtonsDisabled(controls, true);
      let left = 0, right = arr.length - 1;
      while (left < right) {
        refresh({ compare: [left, right] });
        log.textContent = `Swapping index ${left} (${arr[left]}) and index ${right} (${arr[right]})…`;
        await sleep(450);
        [arr[left], arr[right]] = [arr[right], arr[left]];
        refresh({ compare: [left, right] });
        await sleep(350);
        left++; right--;
      }
      refresh();
      log.textContent = '✅ Done. Two pointers walked inward, swapping as they went — O(n) time, O(1) extra space.';
      setButtonsDisabled(controls, false);
    }

    // ---------- Rotate ----------
    async function reverseRange(lo, hi) {
      while (lo < hi) {
        refresh({ compare: [lo, hi] });
        await sleep(320);
        [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
        refresh({ compare: [lo, hi] });
        await sleep(280);
        lo++; hi--;
      }
    }
    async function doRotate(kStr) {
      let k = parseInt(kStr, 10);
      if (isNaN(k)) { log.textContent = '⚠️ Enter how many positions to rotate by.'; return; }
      k = ((k % arr.length) + arr.length) % arr.length;
      setButtonsDisabled(controls, true);
      log.textContent = `Step 1/3: reverse the first ${k} element(s)…`;
      await reverseRange(0, k - 1);
      refresh();
      await sleep(300);
      log.textContent = `Step 2/3: reverse the remaining ${arr.length - k} element(s)…`;
      await reverseRange(k, arr.length - 1);
      refresh();
      await sleep(300);
      log.textContent = `Step 3/3: reverse the WHOLE array — this completes the rotation…`;
      await reverseRange(0, arr.length - 1);
      refresh();
      log.textContent = `✅ Done. Rotated left by ${k} using three O(n) reversals — no second array needed.`;
      setButtonsDisabled(controls, false);
    }

    // ---------- Kadane's ----------
    const kadaneDemo = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    async function doKadane() {
      arr = [...kadaneDemo];
      setButtonsDisabled(controls, true);
      let currentSum = arr[0], maxSum = arr[0], start = 0, bestStart = 0, bestEnd = 0;
      refresh({ compare: [0] });
      log.textContent = `Start: currentSum = maxSum = arr[0] = ${arr[0]}`;
      await sleep(500);
      for (let i = 1; i < arr.length; i++) {
        const extended = currentSum + arr[i];
        if (arr[i] > extended) { currentSum = arr[i]; start = i; }
        else { currentSum = extended; }
        refresh({ compare: Array.from({ length: i - start + 1 }, (_, x) => start + x) });
        log.textContent = `i=${i}: extend (${extended}) vs restart (${arr[i]}) → currentSum = ${currentSum}`;
        await sleep(550);
        if (currentSum > maxSum) {
          maxSum = currentSum; bestStart = start; bestEnd = i;
          log.textContent = `New best! maxSum = ${maxSum} (subarray from index ${bestStart} to ${bestEnd})`;
          await sleep(400);
        }
      }
      refresh({ foundRange: Array.from({ length: bestEnd - bestStart + 1 }, (_, x) => bestStart + x) });
      log.textContent = `✅ Done. Max subarray sum = ${maxSum}, from index ${bestStart} to ${bestEnd} → [${arr.slice(bestStart, bestEnd + 1).join(', ')}]`;
      setButtonsDisabled(controls, false);
    }

    function renderControls() {
      const common = [
        { type: 'select', ref: 'mode', label: 'Mode', options: Object.entries(MODES).map(([value, m]) => ({ value, text: m.label })) },
      ];
      let specific = [];
      if (mode === 'basic') {
        specific = [
          { type: 'input', ref: 'idx', label: 'Index', inputType: 'number', placeholder: '0' },
          { type: 'button', label: 'Access', onClick: () => doAccess(refs.idx.value) },
          { type: 'input', ref: 'insVal', label: 'Insert value', inputType: 'number', placeholder: '42' },
          { type: 'button', label: 'Insert at index', variant: 'good', onClick: () => doInsert(refs.idx.value, refs.insVal.value) },
          { type: 'button', label: 'Delete at index', variant: 'warn', onClick: () => doDelete(refs.idx.value) },
          { type: 'button', label: '🔀 Randomize', onClick: () => { arr = randomArray(7, 10, 99); refresh(); log.textContent = 'New random array generated.'; } },
        ];
      } else if (mode === 'linear') {
        specific = [
          { type: 'input', ref: 'val', label: 'Target', inputType: 'number', placeholder: '46' },
          { type: 'button', label: '▶ Linear Search', variant: 'primary', onClick: () => doLinearSearch(refs.val.value) },
          { type: 'button', label: '🔀 Randomize', onClick: () => { arr = randomArray(7, 10, 99); refresh(); } },
        ];
      } else if (mode === 'binary') {
        specific = [
          { type: 'input', ref: 'val', label: 'Target', inputType: 'number', placeholder: '46' },
          { type: 'button', label: '▶ Binary Search', variant: 'primary', onClick: () => doBinarySearch(refs.val.value) },
          { type: 'button', label: '🔀 Randomize', onClick: () => { arr = randomArray(7, 10, 99); refresh(); log.textContent = 'New array — not yet sorted (binary search will sort it first).'; } },
        ];
      } else if (mode === 'reverse') {
        specific = [
          { type: 'button', label: '▶ Reverse', variant: 'primary', onClick: doReverse },
          { type: 'button', label: '🔀 Randomize', onClick: () => { arr = randomArray(7, 10, 99); refresh(); } },
        ];
      } else if (mode === 'rotate') {
        specific = [
          { type: 'input', ref: 'k', label: 'Rotate left by', inputType: 'number', placeholder: '2', value: 2 },
          { type: 'button', label: '▶ Rotate', variant: 'primary', onClick: () => doRotate(refs.k.value) },
          { type: 'button', label: '🔀 Randomize', onClick: () => { arr = randomArray(7, 10, 99); refresh(); } },
        ];
      } else if (mode === 'kadane') {
        specific = [
          { type: 'button', label: '▶ Run Kadane’s Algorithm', variant: 'primary', onClick: doKadane },
        ];
      }
      const refs = buildControls(controls, [...common, ...specific]);
      refs.mode.value = mode;
      refs.mode.addEventListener('change', () => {
        mode = refs.mode.value;
        if (mode === 'kadane') { arr = [...kadaneDemo]; }
        refresh();
        log.textContent = mode === 'kadane'
          ? `Classic demo array (has negatives, needed for Kadane's to matter): [${kadaneDemo.join(', ')}]`
          : `Switched to ${MODES[mode].label}.`;
        renderControls();
      });
      return refs;
    }

    renderControls();
    refresh();
    log.textContent = 'Pick a mode above — each one demonstrates a different classic array operation.';
  },
};
