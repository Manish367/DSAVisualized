import { el, clear, buildControls, sleep, setButtonsDisabled } from '../viz.js';

const NUM_BUCKETS = 7;

function hashOf(key) {
  let sum = 0;
  for (const ch of String(key)) sum += ch.charCodeAt(0);
  return sum % NUM_BUCKETS;
}

function render(stage, buckets, highlightBucket = -1) {
  clear(stage);
  const col = el('div', 'hash-stage');
  for (let i = 0; i < NUM_BUCKETS; i++) {
    const row = el('div', 'hash-row');
    row.appendChild(el('div', 'hash-idx' + (highlightBucket === i ? ' hit' : ''), i));
    const chain = el('div', 'hash-chain');
    buckets[i].forEach(([k, v]) => {
      chain.appendChild(el('div', 'vbox', `${k}:${v}`));
    });
    if (!buckets[i].length) chain.appendChild(el('span', '', 'empty')).style.cssText = 'color:var(--text-mute);font-size:.78rem;align-self:center;';
    row.appendChild(chain);
    col.appendChild(row);
  }
  stage.appendChild(col);
}

export default {
  id: 'hashing',
  category: 'hashing',
  icon: '🗃️',
  title: 'Hashing (Hash Table)',
  tagline: 'A math trick that turns "where is this key?" into O(1) — no searching required.',
  definition: 'A hash table stores key-value pairs by running the key through a "hash function" that converts it into a number — a bucket index. To find a key later, you don\'t search anything: you hash the key again, jump straight to that bucket, and look there. When two different keys hash to the same bucket ("collision"), that bucket keeps a small list (chain) of all the pairs that landed there.',
  why: 'Arrays give O(1) access, but only by NUMERIC index. Real-world lookups use keys like "username" or "product-SKU" — hashing is the bridge that turns an arbitrary key into an array index, giving array-speed lookups for non-numeric data. This is why hash tables (HashMap in Java) are usually the very first tool reached for when you need fast lookups by a custom key.',
  complexity: [
    ['Insert (put)', 'O(1) average, O(n) worst', 'O(1)'],
    ['Lookup (get)', 'O(1) average, O(n) worst', 'O(1)'],
    ['Delete (remove)', 'O(1) average, O(n) worst', 'O(1)'],
  ],
  glossary: [
    ['Hash function', 'Converts a key into a bucket index — must be deterministic (same key always → same index) and should spread keys evenly.'],
    ['Bucket', 'One slot in the underlying array; may hold zero, one, or several entries.'],
    ['Collision', 'When two different keys hash to the same bucket — unavoidable in general, handled by chaining or probing.'],
    ['Chaining', 'Each bucket holds a small list; colliding entries are simply appended to that bucket\'s list (what this demo uses).'],
    ['Load factor', 'entries ÷ buckets — when it gets too high, the table "resizes" (grows and rehashes everything) to keep operations close to O(1).'],
  ],
  examples: [
    { icon: '🔑', title: 'Login systems', text: 'Checking "does this username exist?" against millions of users is a single hash lookup, not a scan of every account.' },
    { icon: '🌐', title: 'DNS caching', text: 'Your computer caches "domain name → IP address" using a hash table, so revisiting a site skips a slow network lookup.' },
    { icon: '📇', title: 'Spell-checkers', text: 'A dictionary of valid words is often stored in a hash set for instant "is this a word?" checks while you type.' },
  ],
  caseStudies: [
    { tag: 'Language internals', title: 'How Java\'s HashMap actually works', text: 'Java\'s HashMap calls .hashCode() on your key, spreads those bits further to reduce clustering, then indexes into an internal array of buckets — each bucket a linked list (or, since Java 8, a balanced tree if a bucket gets too crowded, to protect against worst-case O(n) attacks).' },
    { tag: 'Security', title: 'Password storage (a DIFFERENT kind of hashing)', text: 'This topic\'s hashing (for fast lookup) is a cousin of cryptographic hashing (bcrypt, SHA-256) used to store passwords — both convert input into a fixed output, but cryptographic hashes are deliberately SLOW and irreversible, the opposite goal of a fast lookup hash.' },
    { tag: 'Interview classic', title: 'Two Sum, revisited', text: 'The array topic showed Two Sum as O(n²) with nested loops. With a hash map: for each number, check "have I already seen (target - number)?" in O(1) — turning the whole problem into one O(n) pass. This is the single most common "use a hash map to speed this up" interview pattern.' },
  ],
  code: [
    { code: 'import java.util.HashMap;', explain: { what: 'Imports Java\'s built-in hash table implementation.', why: 'No need to hand-roll hashing/collision logic for everyday use — HashMap is a battle-tested standard library class.', symbols: [] } },
    { code: 'public class HashDemo {', explain: { what: 'Class wrapper.', why: '', symbols: [] } },
    { code: '    public static void main(String[] args) {', explain: { what: 'Entry point.', why: '', symbols: [] } },
    { code: '        HashMap<String, Integer> ages = new HashMap<>();', explain: { what: 'Creates a hash table mapping String keys to Integer values.', why: 'The two generic type parameters <String, Integer> lock in the key type and value type at compile time.', symbols: [['HashMap<String, Integer>', 'a hash table: keys are Strings, values are Integers.']] } },
    { code: '        ages.put("Alice", 30);', explain: { what: 'Internally: hash("Alice") is computed → gives a bucket index → the pair ("Alice", 30) is stored in that bucket.', why: 'put() is O(1) on average because it goes DIRECTLY to a bucket instead of scanning existing entries.', symbols: [['.put(key, value)', 'inserts or updates a key-value pair.']] } },
    { code: '        ages.put("Bob", 25);', explain: { what: 'Same process: hash("Bob") likely lands in a different bucket than "Alice".', why: '', symbols: [] } },
    { code: '        ages.put("Chen", 35);', explain: { what: 'A third pair stored. If hash("Chen") happens to equal hash("Alice")\'s bucket, that\'s a collision — both live in the same bucket\'s chain, and Java tells them apart using .equals() on the key.', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '        int bobAge = ages.get("Bob");', explain: { what: 'Looks up "Bob": hash("Bob") is recomputed → jumps to that bucket → scans the (usually tiny) chain there for a key that equals "Bob" → returns 25.', why: 'This is why lookup is O(1) on average — you never touch the other buckets at all.', symbols: [['.get(key)', 'retrieves the value stored for a key, or null if absent.']] } },
    { code: '        System.out.println("Bob is " + bobAge);', explain: { what: 'Prints the retrieved value.', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '        ages.remove("Alice");', explain: { what: 'Hashes "Alice" to find her bucket, then removes her entry from that bucket\'s chain.', why: '', symbols: [['.remove(key)', 'deletes the entry for a key, if present.']] } },
    { code: '        System.out.println("Contains Alice? " + ages.containsKey("Alice"));', explain: { what: 'Prints false — Alice was removed. containsKey is also an O(1) average hash lookup, just discarding the value.', why: '', symbols: [] } },
    { code: '    }', explain: { what: 'Closes main.', why: '', symbols: [] } },
    { code: '}', explain: { what: 'Closes the class.', why: '', symbols: [] } },
  ],
  initViz({ stage, controls, log }) {
    let buckets = Array.from({ length: NUM_BUCKETS }, () => []);
    ['Alice', 'Bob'].forEach((k, i) => buckets[hashOf(k)].push([k, [30, 25][i]]));

    function redraw(hl) { render(stage, buckets, hl); }

    async function doPut(keyStr, valStr) {
      const key = (keyStr || '').trim();
      if (!key) { log.textContent = '⚠️ Enter a key.'; return; }
      const val = valStr === '' ? '' : parseInt(valStr, 10);
      setButtonsDisabled(controls, true);
      const idx = hashOf(key);
      log.textContent = `hash("${key}") = sum of char codes % ${NUM_BUCKETS} = ${idx}`;
      redraw(idx);
      await sleep(700);
      const bucket = buckets[idx];
      const existing = bucket.find(([k]) => k === key);
      if (existing) existing[1] = val;
      else bucket.push([key, val]);
      redraw(idx);
      log.textContent = `put("${key}", ${val}) → stored directly in bucket ${idx}${bucket.length > 1 ? ` (collision! ${bucket.length} entries chained here)` : ''}.`;
      setButtonsDisabled(controls, false);
    }

    async function doGet(keyStr) {
      const key = (keyStr || '').trim();
      if (!key) { log.textContent = '⚠️ Enter a key to look up.'; return; }
      setButtonsDisabled(controls, true);
      const idx = hashOf(key);
      log.textContent = `hash("${key}") = ${idx} → jumping straight to bucket ${idx}, no scanning of other buckets.`;
      redraw(idx);
      await sleep(700);
      const found = buckets[idx].find(([k]) => k === key);
      if (found) log.textContent = `✅ get("${key}") = ${found[1]} — found in bucket ${idx} (checked ${buckets[idx].length} entr${buckets[idx].length === 1 ? 'y' : 'ies'} in that bucket's chain).`;
      else log.textContent = `❌ "${key}" not found — bucket ${idx} doesn't contain that key.`;
      setButtonsDisabled(controls, false);
    }

    async function doRemove(keyStr) {
      const key = (keyStr || '').trim();
      if (!key) { log.textContent = '⚠️ Enter a key to remove.'; return; }
      const idx = hashOf(key);
      const before = buckets[idx].length;
      buckets[idx] = buckets[idx].filter(([k]) => k !== key);
      redraw(idx);
      log.textContent = buckets[idx].length < before ? `Removed "${key}" from bucket ${idx}.` : `"${key}" wasn't in bucket ${idx} — nothing removed.`;
    }

    const refs = buildControls(controls, [
      { type: 'input', ref: 'key', label: 'Key', placeholder: 'Dave' },
      { type: 'input', ref: 'val', label: 'Value', inputType: 'number', placeholder: '28' },
      { type: 'button', label: 'Put', variant: 'good', onClick: () => doPut(refs.key.value, refs.val.value) },
      { type: 'button', label: 'Get', onClick: () => doGet(refs.key.value) },
      { type: 'button', label: 'Remove', variant: 'warn', onClick: () => doRemove(refs.key.value) },
    ]);

    redraw();
    log.textContent = `Try keys that collide, e.g. "Bob" and "Cbo" often hash to the same bucket (same letters!) — watch chaining kick in.`;
  },
};
