// Shared helpers used by every topic's interactive visualization.

export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function makeLogger(logEl) {
  return (msg) => { logEl.textContent = msg; };
}

// A tiny run-controller so every "Play" button behaves the same way:
// disables controls while running, supports a speed slider, and can be
// cancelled if the user clicks another action mid-animation.
export class Runner {
  constructor() {
    this.token = 0;
    this.speed = 1;
  }
  // returns a token; animations should bail out if token changes
  start() {
    this.token += 1;
    return this.token;
  }
  isCurrent(token) {
    return token === this.token;
  }
  async wait(ms) {
    await sleep(ms / this.speed);
  }
}

export function setButtonsDisabled(container, disabled) {
  container.querySelectorAll('button, input').forEach((b) => (b.disabled = disabled));
}

// Builds a labeled control bar quickly.
// spec: array of {type:'button'|'input'|'select'|'range'|'label', ...}
export function buildControls(container, spec) {
  clear(container);
  const refs = {};
  spec.forEach((item) => {
    if (item.type === 'button') {
      const b = el('button', 'btn' + (item.variant ? ' ' + item.variant : ''), item.label);
      b.addEventListener('click', item.onClick);
      container.appendChild(b);
      refs[item.ref || item.label] = b;
    } else if (item.type === 'input') {
      const wrap = el('label', '', item.label ? item.label + ' ' : '');
      const inp = document.createElement('input');
      inp.type = item.inputType || 'text';
      inp.className = 'viz-input';
      if (item.placeholder) inp.placeholder = item.placeholder;
      if (item.value !== undefined) inp.value = item.value;
      wrap.appendChild(inp);
      container.appendChild(wrap);
      refs[item.ref] = inp;
    } else if (item.type === 'select') {
      const wrap = el('label', '', item.label ? item.label + ' ' : '');
      const sel = document.createElement('select');
      sel.className = 'viz-input';
      item.options.forEach((o) => {
        const opt = document.createElement('option');
        opt.value = o.value; opt.textContent = o.text;
        sel.appendChild(opt);
      });
      wrap.appendChild(sel);
      container.appendChild(wrap);
      refs[item.ref] = sel;
    } else if (item.type === 'range') {
      const wrap = el('label', '', item.label ? item.label + ' ' : '');
      const inp = document.createElement('input');
      inp.type = 'range';
      inp.min = item.min; inp.max = item.max; inp.step = item.step || 1;
      inp.value = item.value;
      wrap.appendChild(inp);
      container.appendChild(wrap);
      refs[item.ref] = inp;
    } else if (item.type === 'sep') {
      container.appendChild(el('span', '', '&nbsp;')).style.width = '1px';
    }
  });
  return refs;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomArray(len, min = 5, max = 90) {
  return Array.from({ length: len }, () => randInt(min, max));
}
