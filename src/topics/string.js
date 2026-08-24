import { el, clear, buildControls, sleep, setButtonsDisabled } from '../viz.js';

function charBox(ch, i, cls) {
  const display = ch === ' ' ? '␣' : ch;
  return el('div', cls.join(' '), `<span class="vidx">${i}</span>${display}`);
}

function drawChars(stage, str, highlights = {}) {
  clear(stage);
  const row = el('div', 'vrow');
  [...str].forEach((ch, i) => {
    const cls = ['vbox'];
    if (highlights.left === i || highlights.right === i || highlights.active === i) cls.push('active');
    if (highlights.compare && highlights.compare.includes(i)) cls.push('compare');
    if (highlights.mismatch && highlights.mismatch.includes(i)) cls.push('swap');
    if (highlights.matched && highlights.matched.includes(i)) cls.push('found');
    if (highlights.dead && highlights.dead.includes(i)) cls.push('dead');
    row.appendChild(charBox(ch, i, cls));
  });
  stage.appendChild(row);
}

function drawTwoRows(stage, str1, str2, hl1 = {}, hl2 = {}, label1 = 'Word 1', label2 = 'Word 2') {
  clear(stage);
  const wrap = el('div', '');
  wrap.style.cssText = 'display:flex; flex-direction:column; gap:18px; width:100%; align-items:center;';

  function buildRow(str, hl, label) {
    const group = el('div', '');
    group.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:6px;';
    group.appendChild(el('div', 'muted', label)).style.cssText = 'font-size:.75rem; font-family:var(--font-code);';
    const row = el('div', 'vrow');
    [...str].forEach((ch, i) => {
      const cls = ['vbox'];
      if (hl.active === i) cls.push('active');
      if (hl.matched && hl.matched.includes(i)) cls.push('found');
      if (hl.mismatch && hl.mismatch.includes(i)) cls.push('swap');
      row.appendChild(charBox(ch, i, cls));
    });
    group.appendChild(row);
    return group;
  }

  wrap.appendChild(buildRow(str1, hl1, label1));
  wrap.appendChild(buildRow(str2, hl2, label2));
  stage.appendChild(wrap);
}

const basicCode = [
  { code: 'String word = "hello";', explain: { what: 'Creates a String — internally backed by a char array in Java.', why: 'Strings are IMMUTABLE in Java: once created, "hello" can never be changed in place.', symbols: [] } },
  { code: 'char first = word.charAt(0);', explain: { what: 'Reads the character at index 0 — \'h\'.', why: 'charAt() is O(1), same direct-address trick as array access.', symbols: [['.charAt(i)', 'returns the char at position i.']] } },
  { code: 'int len = word.length();', explain: { what: 'Returns the number of characters — 5.', why: 'Note: length() is a METHOD (with parentheses) on String, unlike array\'s .length FIELD — a very common beginner mix-up.', symbols: [] } },
  { code: 'for (char c : word.toCharArray()) { }', explain: { what: 'Converts the String into a real char[] so you can loop over each character.', why: 'toCharArray() makes a COPY — mutating it never changes the original String.', symbols: [] } },
];

const reverseCode = [
  { code: 'static String reverse(String s) {', explain: { what: 'Returns a new String with the characters in reverse order.', why: 'Because Strings are immutable, we can\'t reverse "in place" like an array — we build a new one.', symbols: [] } },
  { code: '    char[] chars = s.toCharArray();', explain: { what: 'Copies the String into a mutable char array.', why: 'We need something mutable to swap characters in.', symbols: [] } },
  { code: '    int left = 0, right = chars.length - 1;', explain: { what: 'Two pointers at opposite ends — identical to the Array topic\'s Reverse.', why: '', symbols: [] } },
  { code: '    while (left < right) {', explain: { what: 'Swap inward until the pointers meet.', why: '', symbols: [] } },
  { code: '        char temp = chars[left];', explain: { what: 'Saves the left character.', why: '', symbols: [] } },
  { code: '        chars[left] = chars[right];', explain: { what: 'Copies the right character into the left slot.', why: '', symbols: [] } },
  { code: '        chars[right] = temp;', explain: { what: 'Completes the swap.', why: '', symbols: [] } },
  { code: '        left++; right--;', explain: { what: 'Move both pointers inward.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
  { code: '    return new String(chars);', explain: { what: 'Wraps the mutated char array back into a brand-new String object.', why: 'This is the standard Java idiom: mutate a char[], then construct a fresh String from it.', symbols: [] } },
  { code: '}', explain: { what: 'Closes reverse.', why: '', symbols: [] } },
];

const palindromeCode = [
  { code: 'static boolean isPalindrome(String s) {', explain: { what: 'Returns true if s reads the same forwards and backwards.', why: '', symbols: [] } },
  { code: '    int left = 0, right = s.length() - 1;', explain: { what: 'Two pointers at opposite ends.', why: '', symbols: [] } },
  { code: '    while (left < right) {', explain: { what: 'Compare inward, pair by pair.', why: '', symbols: [] } },
  { code: '        if (s.charAt(left) != s.charAt(right)) return false;', explain: { what: 'The moment ANY pair mismatches, it can\'t be a palindrome — bail out immediately.', why: 'No need to keep checking once we know the answer is false.', symbols: [] } },
  { code: '        left++; right--;', explain: { what: 'Move both pointers inward.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
  { code: '    return true;', explain: { what: 'Every pair matched all the way to the middle — it IS a palindrome.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes isPalindrome.', why: 'O(n) time, O(1) space — no reversed copy needed, unlike a naive s.equals(reverse(s)) approach.', symbols: [] } },
];

const anagramCode = [
  { code: 'static boolean isAnagram(String a, String b) {', explain: { what: 'Returns true if a and b use exactly the same letters, same counts, any order.', why: '', symbols: [] } },
  { code: '    if (a.length() != b.length()) return false;', explain: { what: 'Different lengths can never be anagrams — quick early exit.', why: '', symbols: [] } },
  { code: '    int[] freq = new int[26];', explain: { what: 'One counter per lowercase letter a-z, all starting at 0.', why: 'This is a tiny, fixed-size hash table — see the Hashing topic for the general idea.', symbols: [] } },
  { code: '    for (char c : a.toCharArray()) freq[c - \'a\']++;', explain: { what: 'For every letter in a, increment its counter.', why: '', symbols: [['c - \'a\'', 'char arithmetic — subtracting the char \'a\' converts a letter into a 0-25 index (\'a\'→0, \'b\'→1, …).']] } },
  { code: '    for (char c : b.toCharArray()) freq[c - \'a\']--;', explain: { what: 'For every letter in b, decrement its counter.', why: 'If a and b are true anagrams, every increment from a should be perfectly cancelled by a decrement from b.', symbols: [] } },
  { code: '    for (int count : freq) if (count != 0) return false;', explain: { what: 'If ANY letter\'s count didn\'t return to exactly 0, the letter counts didn\'t match.', why: '', symbols: [] } },
  { code: '    return true;', explain: { what: 'Every counter cancelled out perfectly — a and b are anagrams.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes isAnagram.', why: 'O(n) time — one pass per string, versus O(n log n) if you sorted both strings and compared.', symbols: [] } },
];

const substringCode = [
  { code: 'static int indexOfNaive(String text, String pattern) {', explain: { what: 'Returns the starting index of the first occurrence of pattern in text, or -1.', why: 'This is what String.indexOf() conceptually does under the hood (naive version — no KMP optimization).', symbols: [] } },
  { code: '    int n = text.length(), m = pattern.length();', explain: { what: 'Caches both lengths.', why: '', symbols: [] } },
  { code: '    for (int i = 0; i <= n - m; i++) {', explain: { what: 'Tries every possible starting position where pattern COULD fit.', why: 'Stops at n - m so the pattern never runs past the end of text.', symbols: [] } },
  { code: '        int j = 0;', explain: { what: 'j tracks how many characters of pattern have matched so far at this starting position.', why: '', symbols: [] } },
  { code: '        while (j < m && text.charAt(i + j) == pattern.charAt(j)) j++;', explain: { what: 'Extends the match as long as characters keep lining up.', why: '', symbols: [] } },
  { code: '        if (j == m) return i;', explain: { what: 'Matched the ENTIRE pattern — found it starting at index i.', why: '', symbols: [] } },
  { code: '    }', explain: { what: 'Closes the outer loop — slides the starting position one step right and tries again after a mismatch.', why: '', symbols: [] } },
  { code: '    return -1;', explain: { what: 'Tried every position without a full match.', why: '', symbols: [] } },
  { code: '}', explain: { what: 'Closes indexOfNaive.', why: 'Worst case O(n·m) — real-world String.indexOf() and search engines use smarter algorithms like KMP or Boyer-Moore to avoid re-checking characters.', symbols: [] } },
];

const MODES = {
  basic: { label: 'Traverse & Access (charAt)' },
  reverse: { label: 'Reverse String' },
  palindrome: { label: 'Palindrome Check' },
  anagram: { label: 'Anagram Check' },
  substring: { label: 'Substring Search (naive)' },
};

export default {
  id: 'string',
  category: 'basics',
  icon: '🔤',
  title: 'Strings',
  tagline: 'Text as data — a sequence of characters with its own rules, quirks, and classic algorithms.',
  definition: 'A String is a sequence of characters. In Java, Strings are objects, not primitives, and — critically — they are IMMUTABLE: once created, a String\'s contents can never change. Every "modification" (concatenation, replace, substring) actually builds and returns a brand-new String, leaving the original untouched. Under the hood, a String is backed by a character array, so many string algorithms are really array algorithms wearing a text costume.',
  why: 'Text is everywhere — usernames, search queries, file paths, DNA sequences, source code itself. Immutability exists on purpose: it makes Strings safe to share freely between parts of a program (nobody can secretly change one out from under you), lets Java cache and reuse identical string literals (the "String pool"), and makes a String\'s hashCode() safe to compute once and cache forever — which is exactly why Strings make such good HashMap keys. The tradeoff is performance: naively concatenating strings in a loop silently creates a new object every single time.',
  complexity: [
    ['charAt(i) / access', 'O(1)', 'O(1)'],
    ['length()', 'O(1)', 'O(1)'],
    ['Concatenation (a + b)', 'O(n)', 'O(n) — new String created'],
    ['Reverse', 'O(n)', 'O(n) — new String'],
    ['Palindrome check', 'O(n)', 'O(1)'],
    ['Anagram check', 'O(n)', 'O(1) — fixed 26-slot table'],
    ['Substring search (naive)', 'O(n·m)', 'O(1)'],
  ],
  glossary: [
    ['Immutability', 'Once created, a String\'s characters can never change — every "edit" produces a new String object.'],
    ['String pool', 'A cache of string literals Java reuses automatically, safe only because Strings are immutable.'],
    ['StringBuilder', 'Java\'s MUTABLE text buffer — use it (not +) when building a string across many steps, e.g. inside a loop, to avoid creating thousands of throwaway String objects.'],
    ['Two-pointer technique', 'Two indices moving toward or away from each other — powers reverse, palindrome checks, and more.'],
    ['Anagram', 'Two strings made of exactly the same letters, in any order (e.g. "listen" and "silent").'],
    ['Substring search', 'Finding whether (and where) a shorter pattern string occurs inside a longer text string.'],
  ],
  examples: [
    { icon: '🔎', title: 'Search-as-you-type', text: 'Autocomplete and search bars run substring/prefix matching on every keystroke against a list of candidates.' },
    { icon: '✅', title: 'Form validation', text: 'Checking an email or password format is string pattern matching — often via regular expressions built on these same core ideas.' },
    { icon: '🧬', title: 'DNA sequence matching', text: 'Bioinformatics tools search for a short DNA pattern inside a massive genome string — the same "sliding window" idea as naive substring search, at a much larger scale.' },
  ],
  caseStudies: [
    { tag: 'Performance', title: 'Why string concatenation in a loop is a classic bug', text: 'Because Strings are immutable, code like `for (...) result = result + item;` creates a brand NEW String every iteration, copying everything so far — O(n²) total for n items. StringBuilder.append() mutates one buffer in place instead, turning it back into O(n). This exact case study shows up constantly in code review.' },
    { tag: 'Security', title: 'Why passwords shouldn\'t be stored in a String', text: 'A String literal may sit in memory (and the String pool) for an unpredictable amount of time before garbage collection — with no way to force-clear it. Sensitive data like passwords is instead stored in a char[], which CAN be explicitly overwritten with zeros the moment it\'s no longer needed. A direct, security-relevant consequence of immutability.' },
    { tag: 'Language internals', title: 'Why String is the ultimate HashMap key', text: 'Because a String can never change after creation, Java caches its hashCode() the first time it\'s computed — every future HashMap lookup with that key reuses the cached value instead of rescanning every character. Mutable objects can\'t safely do this (their hash could go stale), which is why using a mutable object as a HashMap key is a well-known bug source.' },
  ],
  practice: [
    { title: 'Valid Palindrome', prompt: 'Given a string, determine if it reads the same forwards and backwards (ignoring case and non-alphanumeric characters).', approach: 'Lowercase the string and strip non-letters first, then run the same two-pointer scan shown in "Palindrome Check" mode above.', answer: '"A man, a plan, a canal: Panama" → true, once punctuation and case are ignored.' },
    { title: 'Valid Anagram', prompt: 'Given two strings, determine if one is an anagram of the other.', approach: 'Switch to "Anagram Check" mode above — build a 26-slot frequency count from the first word, subtract using the second, and check every slot lands back on zero.', answer: '"listen" and "silent" → true. "rat" and "car" → false (different letters).' },
    { title: 'Implement strStr() (substring search)', prompt: 'Given a text and a pattern, return the index of the pattern\'s first occurrence in text, or -1.', approach: 'This is exactly "Substring Search" mode above: slide the pattern across every possible starting position, comparing character by character, and stop at the first full match.', answer: 'This is literally what Java\'s built-in String.indexOf(pattern) does (with extra optimizations under the hood).' },
  ],
  codeVariants: {
    basic: { label: 'Traverse & Access', code: basicCode },
    reverse: { label: 'Reverse', code: reverseCode },
    palindrome: { label: 'Palindrome Check', code: palindromeCode },
    anagram: { label: 'Anagram Check', code: anagramCode },
    substring: { label: 'Substring Search', code: substringCode },
  },
  initViz({ stage, controls, log }) {
    let word = 'algorithm';
    let mode = 'basic';

    function refresh(hl) { drawChars(stage, word, hl || {}); }

    // ---------- Traverse / Access ----------
    async function doTraverse() {
      setButtonsDisabled(controls, true);
      for (let i = 0; i < word.length; i++) {
        refresh({ active: i });
        log.textContent = `word.charAt(${i}) → '${word[i]}'`;
        await sleep(280);
      }
      refresh();
      log.textContent = `Traversed all ${word.length} characters — each charAt() call is O(1).`;
      setButtonsDisabled(controls, false);
    }
    function doAccess(idxStr) {
      const i = parseInt(idxStr, 10);
      if (isNaN(i) || i < 0 || i >= word.length) { log.textContent = `⚠️ Index must be between 0 and ${word.length - 1}.`; return; }
      refresh({ active: i });
      log.textContent = `word.charAt(${i}) → '${word[i]}'`;
    }

    // ---------- Reverse ----------
    async function doReverse() {
      setButtonsDisabled(controls, true);
      const chars = [...word];
      let left = 0, right = chars.length - 1;
      while (left < right) {
        drawChars(stage, chars.join(''), { left, right });
        log.textContent = `Swapping index ${left} ('${chars[left]}') and index ${right} ('${chars[right]}')…`;
        await sleep(450);
        [chars[left], chars[right]] = [chars[right], chars[left]];
        drawChars(stage, chars.join(''), { left, right });
        await sleep(350);
        left++; right--;
      }
      word = chars.join('');
      refresh();
      log.textContent = `✅ Reversed → "${word}". A new String was built — the original characters were never mutated in place.`;
      setButtonsDisabled(controls, false);
    }

    // ---------- Palindrome ----------
    async function doPalindrome() {
      setButtonsDisabled(controls, true);
      let left = 0, right = word.length - 1;
      while (left < right) {
        drawChars(stage, word, { left, right });
        log.textContent = `Comparing '${word[left]}' (index ${left}) and '${word[right]}' (index ${right})…`;
        await sleep(500);
        if (word[left] !== word[right]) {
          drawChars(stage, word, { mismatch: [left, right] });
          log.textContent = `❌ Mismatch at ${left}/${right} — not a palindrome.`;
          setButtonsDisabled(controls, false);
          return;
        }
        left++; right--;
      }
      drawChars(stage, word, { matched: Array.from({ length: word.length }, (_, i) => i) });
      log.textContent = `✅ Every pair matched — "${word}" IS a palindrome.`;
      setButtonsDisabled(controls, false);
    }

    // ---------- Anagram ----------
    let word2 = 'logarithm';
    async function doAnagram() {
      setButtonsDisabled(controls, true);
      if (word.length !== word2.length) {
        drawTwoRows(stage, word, word2, {}, {});
        log.textContent = `❌ Different lengths (${word.length} vs ${word2.length}) — can't be anagrams.`;
        setButtonsDisabled(controls, false);
        return;
      }
      const freq = {};
      const w1Matched = [], w2Matched = [], w1Chars = [...word];
      for (let i = 0; i < word.length; i++) {
        const c = word[i];
        freq[c] = (freq[c] || 0) + 1;
        drawTwoRows(stage, word, word2, { matched: [...w1Matched, i] }, {});
        log.textContent = `Counting word 1: '${c}' → freq['${c}'] = ${freq[c]}`;
        w1Matched.push(i);
        await sleep(220);
      }
      for (let i = 0; i < word2.length; i++) {
        const c = word2[i];
        if (!freq[c]) {
          drawTwoRows(stage, word, word2, { matched: w1Matched }, { mismatch: [i] });
          log.textContent = `❌ '${c}' in word 2 has no remaining match in word 1 — not an anagram.`;
          setButtonsDisabled(controls, false);
          return;
        }
        freq[c]--;
        w2Matched.push(i);
        drawTwoRows(stage, word, word2, { matched: w1Matched }, { matched: [...w2Matched] });
        log.textContent = `Cancelling word 2: '${c}' → freq['${c}'] = ${freq[c]}`;
        await sleep(300);
      }
      log.textContent = `✅ Every letter cancelled out — "${word}" and "${word2}" ARE anagrams.`;
      setButtonsDisabled(controls, false);
    }

    // ---------- Substring search ----------
    let pattern = 'rit';
    async function doSubstring() {
      setButtonsDisabled(controls, true);
      const text = word, pat = pattern;
      for (let i = 0; i <= text.length - pat.length; i++) {
        let j = 0;
        while (j < pat.length && text[i + j] === pat[j]) j++;
        const compareRange = Array.from({ length: j + (j < pat.length ? 1 : 0) }, (_, x) => i + x);
        if (j < pat.length) {
          drawChars(stage, text, { compare: Array.from({ length: j }, (_, x) => i + x), mismatch: [i + j] });
          log.textContent = `Trying position ${i}: matched ${j} char(s), then mismatch at index ${i + j} ('${text[i + j]}' ≠ '${pat[j]}') — slide right.`;
        } else {
          drawChars(stage, text, { matched: Array.from({ length: pat.length }, (_, x) => i + x) });
          log.textContent = `✅ Full match! "${pat}" found starting at index ${i}.`;
          setButtonsDisabled(controls, false);
          return;
        }
        await sleep(550);
      }
      drawChars(stage, text, {});
      log.textContent = `❌ "${pat}" not found anywhere in "${text}".`;
      setButtonsDisabled(controls, false);
    }

    function renderControls() {
      const common = [
        { type: 'select', ref: 'mode', label: 'Mode', options: Object.entries(MODES).map(([value, m]) => ({ value, text: m.label })) },
      ];
      let specific = [];
      if (mode === 'basic') {
        specific = [
          { type: 'button', label: '▶ Traverse all', variant: 'primary', onClick: doTraverse },
          { type: 'input', ref: 'idx', label: 'Index', inputType: 'number', placeholder: '0' },
          { type: 'button', label: 'charAt(index)', onClick: () => doAccess(refs.idx.value) },
        ];
      } else if (mode === 'reverse') {
        specific = [{ type: 'button', label: '▶ Reverse', variant: 'primary', onClick: doReverse }];
      } else if (mode === 'palindrome') {
        specific = [
          { type: 'input', ref: 'word', label: 'Word', value: word },
          { type: 'button', label: 'Set word', onClick: () => { word = (refs.word.value || word).toLowerCase(); refresh(); } },
          { type: 'button', label: '▶ Check Palindrome', variant: 'primary', onClick: doPalindrome },
        ];
      } else if (mode === 'anagram') {
        specific = [
          { type: 'input', ref: 'w1', label: 'Word 1', value: word },
          { type: 'input', ref: 'w2', label: 'Word 2', value: word2 },
          { type: 'button', label: 'Set words', onClick: () => { word = (refs.w1.value || word).toLowerCase(); word2 = (refs.w2.value || word2).toLowerCase(); drawTwoRows(stage, word, word2, {}, {}); } },
          { type: 'button', label: '▶ Check Anagram', variant: 'primary', onClick: doAnagram },
        ];
      } else if (mode === 'substring') {
        specific = [
          { type: 'input', ref: 'text', label: 'Text', value: word },
          { type: 'input', ref: 'pattern', label: 'Pattern', value: pattern },
          { type: 'button', label: 'Set text/pattern', onClick: () => { word = (refs.text.value || word).toLowerCase(); pattern = (refs.pattern.value || pattern).toLowerCase(); refresh(); } },
          { type: 'button', label: '▶ Search', variant: 'primary', onClick: doSubstring },
        ];
      }
      const refs = buildControls(controls, [...common, ...specific]);
      refs.mode.value = mode;
      refs.mode.addEventListener('change', () => {
        mode = refs.mode.value;
        if (mode === 'anagram') drawTwoRows(stage, word, word2, {}, {});
        else refresh();
        log.textContent = `Switched to ${MODES[mode].label}.`;
        renderControls();
      });
      return refs;
    }

    renderControls();
    refresh();
    log.textContent = 'Pick a mode above — each demonstrates a classic string algorithm, built on the same array ideas.';
  },
};
