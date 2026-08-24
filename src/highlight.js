// Minimal Java syntax highlighter — good enough for teaching snippets,
// not a full tokenizer. Operates line-by-line so it's safe to call per <div>.

const KEYWORDS = new Set([
  'public','private','protected','class','static','void','new','return','if','else',
  'for','while','do','break','continue','this','super','extends','implements','import',
  'package','try','catch','finally','throw','throws','null','true','false','final',
  'abstract','interface','enum','switch','case','default','instanceof'
]);
const TYPES = new Set([
  'int','long','double','float','boolean','char','byte','short','String','Object',
  'Integer','Node','Stack','Queue','ArrayList','LinkedList','HashMap','List','Map',
  'TreeNode','GraphNode','Scanner','System','Arrays','T'
]);

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightLine(line) {
  const escaped = escapeHtml(line);
  // tokenize on word boundaries while preserving strings/comments/numbers
  let out = '';
  let i = 0;
  const n = escaped.length;
  while (i < n) {
    const ch = escaped[i];

    // line comment
    if (ch === '/' && escaped[i + 1] === '/') {
      out += `<span class="tok-com">${escaped.slice(i)}</span>`;
      break;
    }
    // string literal
    if (ch === '"') {
      let j = i + 1;
      while (j < n && escaped[j] !== '"') j++;
      out += `<span class="tok-str">${escaped.slice(i, j + 1)}</span>`;
      i = j + 1;
      continue;
    }
    // annotation
    if (ch === '@') {
      let j = i + 1;
      while (j < n && /[A-Za-z]/.test(escaped[j])) j++;
      out += `<span class="tok-ann">${escaped.slice(i, j)}</span>`;
      i = j;
      continue;
    }
    // number
    if (/[0-9]/.test(ch) && !/[A-Za-z_]/.test(escaped[i - 1] || '')) {
      let j = i;
      while (j < n && /[0-9.]/.test(escaped[j])) j++;
      out += `<span class="tok-num">${escaped.slice(i, j)}</span>`;
      i = j;
      continue;
    }
    // identifier / keyword / type
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(escaped[j])) j++;
      const word = escaped.slice(i, j);
      const nextNonSpace = escaped.slice(j).match(/^\s*(\()/);
      if (KEYWORDS.has(word)) out += `<span class="tok-kw">${word}</span>`;
      else if (TYPES.has(word)) out += `<span class="tok-type">${word}</span>`;
      else if (nextNonSpace) out += `<span class="tok-fn">${word}</span>`;
      else out += word;
      i = j;
      continue;
    }
    out += ch;
    i++;
  }
  return out || '&nbsp;';
}
