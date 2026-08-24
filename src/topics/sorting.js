import { el, clear, buildControls, sleep, randomArray, setButtonsDisabled } from '../viz.js';

function draw(stage, arr, states = {}) {
  clear(stage);
  const max = Math.max(...arr, 1);
  const bs = el('div', 'bar-stage');
  arr.forEach((val, i) => {
    const cls = ['bar'];
    if (states.compare && states.compare.includes(i)) cls.push('compare');
    if (states.swap && states.swap.includes(i)) cls.push('swap');
    if (states.sorted && states.sorted.includes(i)) cls.push('sorted');
    if (states.pivot === i) cls.push('pivot');
    const bar = el('div', cls.join(' '));
    bar.style.height = `${(val / max) * 100}%`;
    bar.innerHTML = `${val}<span>${i}</span>`;
    bs.appendChild(bar);
  });
  stage.appendChild(bs);
}

async function bubbleSort(arr, redraw, log, speedGetter) {
  const n = arr.length;
  const sorted = [];
  for (let i = 0; i < n - 1; i++) {
    let swappedAny = false;
    for (let j = 0; j < n - 1 - i; j++) {
      redraw({ compare: [j, j + 1], sorted });
      log(`Comparing index ${j} (${arr[j]}) and ${j + 1} (${arr[j + 1]})`);
      await sleep(500 / speedGetter());
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swappedAny = true;
        redraw({ swap: [j, j + 1], sorted });
        log(`${arr[j + 1]} > ${arr[j]} is false after swap — ${arr[j]} and ${arr[j + 1]} swapped because left was bigger than right.`);
        await sleep(500 / speedGetter());
      }
    }
    sorted.unshift(n - 1 - i);
    if (!swappedAny) break;
  }
  for (let k = 0; k < n; k++) if (!sorted.includes(k)) sorted.push(k);
  redraw({ sorted });
  log('✅ Done. Bubble sort "bubbles" the largest unsorted value to the end on every pass.');
}

async function selectionSort(arr, redraw, log, speedGetter) {
  const n = arr.length;
  const sorted = [];
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    redraw({ compare: [minIdx], sorted });
    for (let j = i + 1; j < n; j++) {
      redraw({ compare: [minIdx, j], sorted });
      log(`Looking for the smallest in the unsorted part — is ${arr[j]} < current min ${arr[minIdx]}?`);
      await sleep(400 / speedGetter());
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      redraw({ swap: [i, minIdx], sorted });
      log(`Smallest found (${arr[i]}) — swapped into position ${i}.`);
      await sleep(400 / speedGetter());
    }
    sorted.push(i);
  }
  redraw({ sorted });
  log('✅ Done. Selection sort picks the minimum of the unsorted part and places it at the front, one slot at a time.');
}

async function insertionSort(arr, redraw, log, speedGetter) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    redraw({ compare: [i], sorted: Array.from({ length: i }, (_, k) => k) });
    log(`Picking up value ${key} to insert into the sorted part on its left…`);
    await sleep(450 / speedGetter());
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      redraw({ swap: [j, j + 1] });
      log(`${arr[j]} > ${key} → shift it one slot right to make room.`);
      await sleep(400 / speedGetter());
      j--;
    }
    arr[j + 1] = key;
    redraw({ compare: [j + 1] });
    await sleep(250 / speedGetter());
  }
  redraw({ sorted: arr.map((_, i2) => i2) });
  log('✅ Done. Insertion sort grows a sorted region on the left, inserting each new value into its correct spot — like sorting playing cards in your hand.');
}

async function mergeSort(arr, redraw, log, speedGetter) {
  async function merge(lo, mid, hi) {
    const left = arr.slice(lo, mid + 1);
    const right = arr.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      redraw({ compare: [lo + i, mid + 1 + j] });
      log(`Merging [${lo}..${hi}]: comparing ${left[i]} and ${right[j]}`);
      await sleep(450 / speedGetter());
      if (left[i] <= right[j]) { arr[k] = left[i]; i++; }
      else { arr[k] = right[j]; j++; }
      redraw({ swap: [k] });
      await sleep(320 / speedGetter());
      k++;
    }
    while (i < left.length) { arr[k] = left[i]; i++; k++; redraw({ swap: [k - 1] }); await sleep(280 / speedGetter()); }
    while (j < right.length) { arr[k] = right[j]; j++; k++; redraw({ swap: [k - 1] }); await sleep(280 / speedGetter()); }
  }
  async function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    log(`Splitting [${lo}..${hi}] into [${lo}..${mid}] and [${mid + 1}..${hi}]`);
    redraw({ compare: Array.from({ length: hi - lo + 1 }, (_, x) => lo + x) });
    await sleep(300 / speedGetter());
    await sort(lo, mid);
    await sort(mid + 1, hi);
    await merge(lo, mid, hi);
  }
  await sort(0, arr.length - 1);
  redraw({ sorted: arr.map((_, i) => i) });
  log('✅ Done. Merge sort splits the array in half recursively, then merges two already-sorted halves back together in order.');
}

async function quickSort(arr, redraw, log, speedGetter) {
  async function partition(lo, hi) {
    const pivot = arr[hi];
    let i = lo - 1;
    redraw({ pivot: hi, compare: [lo, hi] });
    log(`Partitioning [${lo}..${hi}] using pivot = ${pivot} (last element)`);
    await sleep(400 / speedGetter());
    for (let j = lo; j < hi; j++) {
      redraw({ compare: [j, hi], pivot: hi });
      log(`Is ${arr[j]} < pivot (${pivot})?`);
      await sleep(380 / speedGetter());
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        redraw({ swap: [i, j], pivot: hi });
        await sleep(320 / speedGetter());
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    redraw({ swap: [i + 1, hi] });
    log(`Pivot ${pivot} placed at its final sorted position, index ${i + 1}.`);
    await sleep(400 / speedGetter());
    return i + 1;
  }
  async function sort(lo, hi) {
    if (lo < hi) {
      const p = await partition(lo, hi);
      await sort(lo, p - 1);
      await sort(p + 1, hi);
    }
  }
  await sort(0, arr.length - 1);
  redraw({ sorted: arr.map((_, i) => i) });
  log('✅ Done. Quick sort picks a pivot, partitions smaller values left / bigger values right of it, then recursively sorts each side.');
}

async function heapSort(arr, redraw, log, speedGetter) {
  const n = arr.length;
  async function heapify(size, root) {
    let largest = root;
    const l = 2 * root + 1, r = 2 * root + 2;
    redraw({ compare: [root] });
    await sleep(300 / speedGetter());
    if (l < size && arr[l] > arr[largest]) largest = l;
    if (r < size && arr[r] > arr[largest]) largest = r;
    if (largest !== root) {
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      redraw({ swap: [root, largest] });
      log(`Heapify: swapped ${arr[root]} and ${arr[largest]} to restore the max-heap property.`);
      await sleep(400 / speedGetter());
      await heapify(size, largest);
    }
  }
  log('Phase 1: build a max-heap from the raw array (largest value bubbles to the root).');
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(n, i);
  log('Phase 2: repeatedly swap the root (max) to the end, shrink the heap, and re-heapify.');
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    redraw({ swap: [0, end], sorted: Array.from({ length: n - end }, (_, k) => end + k) });
    log(`Moved max (${arr[end]}) to its final sorted position, index ${end}.`);
    await sleep(420 / speedGetter());
    await heapify(end, 0);
  }
  redraw({ sorted: arr.map((_, i) => i) });
  log('✅ Done. Heap sort builds a max-heap, then repeatedly extracts the max to the end.');
}

const ALGORITHMS = {
  bubble: { name: 'Bubble Sort', run: bubbleSort },
  selection: { name: 'Selection Sort', run: selectionSort },
  insertion: { name: 'Insertion Sort', run: insertionSort },
  merge: { name: 'Merge Sort', run: mergeSort },
  quick: { name: 'Quick Sort', run: quickSort },
  heap: { name: 'Heap Sort', run: heapSort },
};

const bubbleCode = [
  { code: 'static void bubbleSort(int[] arr) {', explain: { what: 'A static method that sorts the given array in place.', why: 'Arrays in Java are passed by reference, so changes here are visible to the caller.', symbols: [] } },
  { code: '    int n = arr.length;', explain: { what: 'Caches the array length.', why: '', symbols: [] } },
  { code: '    for (int i = 0; i < n - 1; i++) {', explain: { what: 'Outer loop: controls how many passes we make over the array.', why: 'After i passes, the i largest elements are already bubbled to the end.', symbols: [] } },
  { code: '        boolean swapped = false;', explain: { what: 'Tracks whether ANY swap happened during this pass.', why: 'If a full pass makes zero swaps, the array is already sorted — stop early.', symbols: [] } },
  { code: '        for (int j = 0; j < n - 1 - i; j++) {', explain: { what: 'Inner loop: compares each neighboring pair in the unsorted portion.', why: '', symbols: [] } },
  { code: '            if (arr[j] > arr[j + 1]) {', explain: { what: 'Checks if the pair is in the wrong order.', why: '', symbols: [] } },
  { code: '                int temp = arr[j];', explain: { what: 'Saves arr[j] before overwriting it.', why: 'A 3-variable swap needs a temporary holding spot.', symbols: [] } },
  { code: '                arr[j] = arr[j + 1];', explain: { what: 'Overwrites arr[j] with its right neighbor.', why: '', symbols: [] } },
  { code: '                arr[j + 1] = temp;', explain: { what: 'Completes the swap.', why: '', symbols: [] } },
  { code: '                swapped = true;', explain: { what: 'Records that a swap happened.', why: '', symbols: [] } },
  { code: '            }', explain: { what: 'Closes the if.', why: '', symbols: [] } },
  { code: '        }', explain: { what: 'Closes the inner loop.', why: '', symbols: [] } },
  { code: '        if (!swapped) break;', explain: { what: 'Already sorted — exit early instead of doing all n passes.', why: 'Turns the best case into O(n).', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the outer loop.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes the method.', why: '', symbols: [] } },
];

const selectionCode = [
  { code: 'static void selectionSort(int[] arr) {', explain: { what: 'Sorts arr in place by repeatedly selecting the minimum of the unsorted part.', why: '', symbols: [] } },
  { code: '    int n = arr.length;', explain: { what: 'Caches the length.', why: '', symbols: [] } },
  { code: '    for (int i = 0; i < n - 1; i++) {', explain: { what: 'i marks the boundary: everything before i is already sorted.', why: '', symbols: [] } },
  { code: '        int minIdx = i;', explain: { what: 'Assumes the current position holds the minimum of the unsorted part, until proven otherwise.', why: '', symbols: [] } },
  { code: '        for (int j = i + 1; j < n; j++) {', explain: { what: 'Scans the REST of the unsorted part looking for something smaller.', why: '', symbols: [] } },
  { code: '            if (arr[j] < arr[minIdx]) minIdx = j;', explain: { what: 'Found a new smallest value — remember its index.', why: 'We only track the INDEX, not swap yet — swapping every comparison would be wasteful.', symbols: [] } },
  { code: '        }', explain: { what: 'Closes the inner loop — minIdx now holds the true minimum\'s index.', why: '', symbols: [] } },
  { code: '        int temp = arr[i];', explain: { what: 'Begins a 3-step swap between position i and minIdx.', why: '', symbols: [] } },
  { code: '        arr[i] = arr[minIdx];', explain: { what: 'Places the found minimum into its correct sorted position i.', why: '', symbols: [] } },
  { code: '        arr[minIdx] = temp;', explain: { what: 'Completes the swap.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the outer loop.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes the method.', why: 'Unlike bubble sort, selection sort always does exactly one swap per outer iteration — fewer writes, same O(n²) comparisons.', symbols: [] } },
];

const insertionCode = [
  { code: 'static void insertionSort(int[] arr) {', explain: { what: 'Sorts arr in place, growing a sorted region from the left.', why: '', symbols: [] } },
  { code: '    for (int i = 1; i < arr.length; i++) {', explain: { what: 'Starts at index 1 — a single element (index 0) is trivially "sorted" already.', why: '', symbols: [] } },
  { code: '        int key = arr[i];', explain: { what: 'Picks up the next unsorted value to insert.', why: 'Like picking up the next playing card from the table.', symbols: [] } },
  { code: '        int j = i - 1;', explain: { what: 'j walks backward through the already-sorted part, comparing against key.', why: '', symbols: [] } },
  { code: '        while (j >= 0 && arr[j] > key) {', explain: { what: 'Keep shifting while there\'s a bigger element to key\'s left.', why: '', symbols: [] } },
  { code: '            arr[j + 1] = arr[j];', explain: { what: 'Shifts that bigger element one slot right, opening a gap.', why: '', symbols: [] } },
  { code: '            j--;', explain: { what: 'Moves one step further left to keep checking.', why: '', symbols: [] } },
  { code: '        }', explain: { what: 'Stops once we find an element ≤ key, or run off the start.', why: '', symbols: [] } },
  { code: '        arr[j + 1] = key;', explain: { what: 'Drops key into the gap that shifting created — its correct sorted position.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the outer loop.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes the method.', why: 'Best case (already sorted input): the while loop never runs — O(n). Worst case (reverse sorted): O(n²).', symbols: [] } },
];

const mergeCode = [
  { code: 'static void mergeSort(int[] arr, int lo, int hi) {', explain: { what: 'Recursively sorts the sub-range arr[lo..hi] using divide and conquer.', why: '', symbols: [] } },
  { code: '    if (lo >= hi) return;', explain: { what: 'BASE CASE: a range of 0 or 1 elements is already sorted — nothing to do.', why: 'Without this, the recursion would never stop.', symbols: [] } },
  { code: '    int mid = lo + (hi - lo) / 2;', explain: { what: 'Finds the midpoint, splitting the range in two.', why: 'Written this way (not (lo+hi)/2) to avoid integer overflow, same trick as binary search.', symbols: [] } },
  { code: '    mergeSort(arr, lo, mid);', explain: { what: 'Recursively sorts the LEFT half.', why: '', symbols: [] } },
  { code: '    mergeSort(arr, mid + 1, hi);', explain: { what: 'Recursively sorts the RIGHT half.', why: '', symbols: [] } },
  { code: '    merge(arr, lo, mid, hi);', explain: { what: 'Merges the two now-sorted halves back into one sorted range.', why: 'This is where the actual "sorting work" happens — the recursion just splits.', symbols: [] } },
  { code: '}', explain: { what: 'Closes mergeSort.', why: '', symbols: [] } },
  { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
  { code: 'static void merge(int[] arr, int lo, int mid, int hi) {', explain: { what: 'Merges two adjacent sorted ranges arr[lo..mid] and arr[mid+1..hi] into one sorted range.', why: '', symbols: [] } },
  { code: '    int[] left = Arrays.copyOfRange(arr, lo, mid + 1);', explain: { what: 'Copies the left half into a temporary array.', why: 'We need a separate copy because we\'re about to overwrite arr[lo..hi] while reading from both halves.', symbols: [] } },
  { code: '    int[] right = Arrays.copyOfRange(arr, mid + 1, hi + 1);', explain: { what: 'Copies the right half into another temporary array.', why: '', symbols: [] } },
  { code: '    int i = 0, j = 0, k = lo;', explain: { what: 'Three pointers: i walks left[], j walks right[], k writes back into arr[].', why: '', symbols: [] } },
  { code: '    while (i < left.length && j < right.length) {', explain: { what: 'While both halves still have unmerged elements…', why: '', symbols: [] } },
  { code: '        arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];', explain: { what: 'Takes the smaller of the two "front" values and writes it into arr, advancing that side\'s pointer (and k).', why: 'Because both left[] and right[] are already individually sorted, the smaller front value is guaranteed to be the next-smallest overall.', symbols: [['(left[i] <= right[j]) ? ... : ...', 'ternary: pick from left if it\'s smaller-or-equal, otherwise from right.']] } },
  { code: '    }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
  { code: '    while (i < left.length) arr[k++] = left[i++];', explain: { what: 'Copies any leftover elements from left[] (right[] ran out first).', why: '', symbols: [] } },
  { code: '    while (j < right.length) arr[k++] = right[j++];', explain: { what: 'Copies any leftover elements from right[] (left[] ran out first).', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes merge.', why: 'The O(n) extra space comes from these temporary left[]/right[] arrays.', symbols: [] } },
];

const quickCode = [
  { code: 'static void quickSort(int[] arr, int lo, int hi) {', explain: { what: 'Recursively sorts arr[lo..hi] in place.', why: '', symbols: [] } },
  { code: '    if (lo < hi) {', explain: { what: 'BASE CASE (implicit): a range with lo >= hi has 0 or 1 elements — already sorted, do nothing.', why: '', symbols: [] } },
  { code: '        int p = partition(arr, lo, hi);', explain: { what: 'Rearranges arr[lo..hi] so everything smaller than the pivot ends up left of it, everything bigger ends up right — and returns the pivot\'s final index p.', why: 'This is the ONLY step that does real comparison/swapping work — recursion just narrows the range.', symbols: [] } },
  { code: '        quickSort(arr, lo, p - 1);', explain: { what: 'Recursively sorts everything left of the pivot.', why: '', symbols: [] } },
  { code: '        quickSort(arr, p + 1, hi);', explain: { what: 'Recursively sorts everything right of the pivot.', why: 'The pivot itself (index p) never needs to move again — it\'s already in its final sorted position.', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the if.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes quickSort.', why: '', symbols: [] } },
  { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
  { code: 'static int partition(int[] arr, int lo, int hi) {', explain: { what: 'Picks arr[hi] as the pivot, and reorders arr[lo..hi] around it.', why: '', symbols: [] } },
  { code: '    int pivot = arr[hi];', explain: { what: 'Choosing the LAST element as the pivot — simple, though not always the fastest choice.', why: 'A poor pivot choice (e.g. already-sorted input with last-element pivoting) is what causes quicksort\'s O(n²) worst case.', symbols: [] } },
  { code: '    int i = lo - 1;', explain: { what: 'i tracks the boundary of "elements confirmed smaller than pivot so far".', why: '', symbols: [] } },
  { code: '    for (int j = lo; j < hi; j++) {', explain: { what: 'Scans every element except the pivot itself.', why: '', symbols: [] } },
  { code: '        if (arr[j] < pivot) {', explain: { what: 'Found something that belongs on the "small" side.', why: '', symbols: [] } },
  { code: '            i++;', explain: { what: 'Expands the "small" boundary by one.', why: '', symbols: [] } },
  { code: '            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;', explain: { what: 'Swaps it into the small side, right after the current boundary.', why: '', symbols: [] } },
  { code: '        }', explain: { what: 'Closes the if.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the for loop — everything ≤ index i is now smaller than the pivot.', why: '', symbols: [] } },
  { code: '    int temp = arr[i + 1]; arr[i + 1] = arr[hi]; arr[hi] = temp;', explain: { what: 'Swaps the pivot from the end into its correct final spot, right after the "small" side.', why: '', symbols: [] } },
  { code: '    return i + 1;', explain: { what: 'Returns the pivot\'s final resting index, so the caller knows where to split for recursion.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes partition.', why: '', symbols: [] } },
];

const heapCode = [
  { code: 'static void heapSort(int[] arr) {', explain: { what: 'Sorts arr in place using a binary max-heap.', why: '', symbols: [] } },
  { code: '    int n = arr.length;', explain: { what: 'Caches the length.', why: '', symbols: [] } },
  { code: '    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);', explain: { what: 'PHASE 1 — build the initial max-heap: heapify every non-leaf node, starting from the last one, bottom-up.', why: 'Leaves (indices n/2..n-1) are already valid 1-element heaps, so we skip them and start from the last parent.', symbols: [] } },
  { code: '    for (int end = n - 1; end > 0; end--) {', explain: { what: 'PHASE 2 — repeatedly pull the max out to the end of the array.', why: '', symbols: [] } },
  { code: '        int temp = arr[0]; arr[0] = arr[end]; arr[end] = temp;', explain: { what: 'Swaps the root (always the maximum in a max-heap) with the last unsorted element.', why: 'This puts the current max into its correct final sorted position.', symbols: [] } },
  { code: '        heapify(arr, end, 0);', explain: { what: 'The swap likely broke the heap property at the root — re-heapify, but only over the SHRUNK range (end, not n) since the tail is now sorted and excluded.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the phase 2 loop.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes heapSort.', why: '', symbols: [] } },
  { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
  { code: 'static void heapify(int[] arr, int size, int root) {', explain: { what: 'Ensures the subtree rooted at "root" satisfies the max-heap property (parent ≥ both children), pushing violations downward.', why: '', symbols: [] } },
  { code: '    int largest = root, l = 2 * root + 1, r = 2 * root + 2;', explain: { what: 'In an array-based binary heap, a node at index i has children at 2i+1 and 2i+2 — no pointers needed.', why: 'This formula is why heaps are usually stored as plain arrays, not linked node structures.', symbols: [] } },
  { code: '    if (l < size && arr[l] > arr[largest]) largest = l;', explain: { what: 'If the left child exists and is bigger than the current largest, it becomes the new candidate.', why: '', symbols: [] } },
  { code: '    if (r < size && arr[r] > arr[largest]) largest = r;', explain: { what: 'Same check for the right child.', why: '', symbols: [] } },
  { code: '    if (largest != root) {', explain: { what: 'If a child was actually bigger than the parent, the heap property is violated here.', why: '', symbols: [] } },
  { code: '        int temp = arr[root]; arr[root] = arr[largest]; arr[largest] = temp;', explain: { what: 'Swaps the bigger child up into the parent\'s place.', why: '', symbols: [] } },
  { code: '        heapify(arr, size, largest);', explain: { what: 'The swap may have violated the property one level further down — recurse into that subtree to fix it too.', why: 'This is why heapify is O(log n): it only ever travels down one path of the tree.', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the if.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes heapify.', why: '', symbols: [] } },
];

export default {
  id: 'sorting',
  category: 'sorting-searching',
  icon: '📶',
  title: 'Sorting Algorithms',
  tagline: 'Putting values in order — the "hello world" of algorithm design, with big performance stakes.',
  definition: 'Sorting rearranges a collection into a defined order (ascending or descending). It sounds simple, but HOW you sort matters enormously at scale — some approaches compare neighboring pairs repeatedly (bubble), some repeatedly pick the minimum (selection), some build up a sorted section like arranging cards in your hand (insertion), and faster ones divide the problem in half recursively (merge, quick) or use a specialized tree shape (heap).',
  why: 'Almost every other algorithm — binary search, deduplication, finding medians, scheduling — assumes the data is already sorted, because sorted data unlocks much faster operations. Sorting badly on a large dataset (O(n²)) versus well (O(n log n)) is the difference between a report that takes seconds versus hours once your data gets big.',
  complexity: [
    ['Bubble Sort', 'O(n²)', 'O(1)'],
    ['Selection Sort', 'O(n²)', 'O(1)'],
    ['Insertion Sort', 'O(n²) worst, O(n) best', 'O(1)'],
    ['Merge Sort', 'O(n log n)', 'O(n)'],
    ['Quick Sort', 'O(n log n) avg, O(n²) worst', 'O(log n)'],
    ['Heap Sort', 'O(n log n)', 'O(1)'],
  ],
  glossary: [
    ['In-place', 'Sorts using O(1) extra memory, rearranging the original array (bubble, selection, insertion, quick, heap).'],
    ['Stable sort', 'Equal elements keep their original relative order (insertion & merge sort are stable; selection, quick and heap sort are not, by default).'],
    ['Comparison sort', 'Any sort that decides order purely by comparing pairs of elements — proven to need at least O(n log n) in the worst case.'],
    ['Divide and conquer', 'Split the problem into smaller pieces, solve each recursively, then combine the results — the strategy behind merge sort and quick sort.'],
    ['Pivot', 'The reference value quick sort partitions everything else around.'],
    ['Max-heap', 'A binary tree (stored as an array) where every parent is ≥ its children — heap sort\'s core building block, also used to implement priority queues.'],
  ],
  examples: [
    { icon: '📱', title: 'Contact lists', text: 'Your phone keeps contacts alphabetically sorted so it can binary-search to "J" instantly instead of scanning everyone.' },
    { icon: '🛒', title: 'E-commerce "sort by price"', text: 'Clicking "Price: Low to High" on Amazon runs a sort over the current result set (usually a fast O(n log n) algorithm under the hood).' },
    { icon: '🏆', title: 'Leaderboards', text: 'Game leaderboards re-sort scores after every match — often using a partially-sorted-friendly algorithm since only a few scores change.' },
  ],
  caseStudies: [
    { tag: 'Language internals', title: 'Why Java\'s Arrays.sort() is a hybrid', text: 'Java actually uses Dual-Pivot Quicksort for primitives and a variant of Merge Sort (Timsort) for objects — because objects need a STABLE sort (to not scramble equal elements\' order), while primitives don\'t care and can use the faster in-place Quicksort.' },
    { tag: 'Systems at scale', title: 'External sorting for big data', text: 'When data is too large to fit in RAM (e.g. sorting a 500GB log file), systems use external merge sort: sort small chunks in memory, write them to disk, then merge the sorted chunks — the same "merge" idea from merge sort, applied at a different scale.' },
    { tag: 'Data structures', title: 'Heap sort\'s cousin: the Priority Queue', text: 'Java\'s PriorityQueue is literally the same max/min-heap array structure heap sort uses — instead of sorting once, it keeps "give me the current best item" available in O(log n) at any time, which is how task schedulers and Dijkstra\'s shortest-path algorithm pick "what to process next".' },
  ],
  practice: [
    { title: 'Sort an array of 0s, 1s and 2s (Dutch National Flag)', prompt: 'Given an array containing only the values 0, 1 and 2, sort it in one pass without using a general-purpose sort.', approach: 'Borrow Quick Sort\'s partition idea, but with three regions instead of two: maintain low/mid/high pointers, swapping 0s to the front, 2s to the back, and leaving 1s in the middle — one linear scan, O(n) time, O(1) space.', answer: 'This is exactly the "3-way partition" variant of quicksort\'s partition step.' },
    { title: 'Find the Kth largest element', prompt: 'Given an unsorted array, find the Kth largest value without fully sorting it.', approach: 'Run Quick Sort\'s partition step repeatedly (Quickselect): after one partition, the pivot is in its final sorted position — if that position is K from the end, you\'re done; otherwise recurse into only the half that must contain the answer.', answer: 'Average O(n) — much faster than fully sorting (O(n log n)) when you only need one element\'s rank.' },
    { title: 'Merge K sorted lists/arrays', prompt: 'You have K already-sorted arrays; combine them into one sorted array.', approach: 'Repeatedly apply merge sort\'s 2-list merge step pairwise (merge list 1+2, then that result +3, …), or use a min-heap of size K holding each list\'s current front element for a faster O(N log K) approach.', answer: 'Shows how merge sort\'s "merge" building block generalizes beyond just 2 halves.' },
  ],
  codeVariants: {
    bubble: { label: 'Bubble Sort', code: bubbleCode },
    selection: { label: 'Selection Sort', code: selectionCode },
    insertion: { label: 'Insertion Sort', code: insertionCode },
    merge: { label: 'Merge Sort', code: mergeCode },
    quick: { label: 'Quick Sort', code: quickCode },
    heap: { label: 'Heap Sort', code: heapCode },
  },
  initViz({ stage, controls, log }) {
    let arr = randomArray(9, 15, 95);
    let running = false;

    function redraw(states) { draw(stage, arr, states); }

    async function run() {
      if (running) return;
      running = true;
      setButtonsDisabled(controls, true);
      const algo = refs.algo.value;
      const speedGetter = () => parseFloat(refs.speed.value);
      await ALGORITHMS[algo].run(arr, redraw, (m) => (log.textContent = m), speedGetter);
      running = false;
      setButtonsDisabled(controls, false);
    }

    const refs = buildControls(controls, [
      { type: 'select', ref: 'algo', label: 'Algorithm', options: Object.entries(ALGORITHMS).map(([value, a]) => ({ value, text: a.name })) },
      { type: 'button', label: '▶ Run', variant: 'primary', onClick: run },
      { type: 'range', ref: 'speed', label: 'Speed', min: 0.5, max: 4, step: 0.5, value: 1 },
      { type: 'button', label: '🔀 New random array', onClick: () => { if (running) return; arr = randomArray(9, 15, 95); redraw({}); log.textContent = 'New array generated.'; } },
    ]);

    redraw({});
    log.textContent = 'Pick an algorithm and hit Run. Yellow = comparing, pink = swapping, green = locked into final position.';
  },
};
