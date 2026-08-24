import { el, clear, buildControls, sleep, setButtonsDisabled } from '../viz.js';

function draw(stage, arr, highlight) {
  clear(stage);
  const col = el('div', 'stack-stage');
  arr.forEach((val, i) => {
    const cls = ['vbox'];
    if (highlight === i) cls.push('active', 'pop-anim');
    const box = el('div', cls.join(' '), val);
    col.appendChild(box);
  });
  stage.appendChild(col);
  const topLabel = el('div', '', arr.length ? `⬆ TOP is index ${arr.length - 1} (value ${arr[arr.length - 1]})` : 'Stack is empty');
  topLabel.style.cssText = 'margin-top:12px;font-family:var(--font-code);font-size:.78rem;color:var(--text-mute);text-align:center;width:100%;';
  stage.appendChild(topLabel);
}

export default {
  id: 'stack',
  category: 'linear',
  icon: '🥞',
  title: 'Stack',
  tagline: 'Last In, First Out — like a stack of plates, you only touch the top one.',
  definition: 'A stack is a collection where you can only add ("push") or remove ("pop") from one end, called the top. The last item you pushed is always the first one you pop — LIFO, Last In First Out. You cannot reach into the middle without removing everything above it first.',
  why: 'Some problems are naturally "undo the most recent thing first" — going back a browser page, undoing a text edit, or unwinding function calls when a program returns. A stack enforces that discipline in O(1) time per operation, and its restriction (only touch the top) is exactly what makes it fast and predictable — the same restriction is the whole point.',
  complexity: [
    ['Push (add to top)', 'O(1)', 'O(1)'],
    ['Pop (remove top)', 'O(1)', 'O(1)'],
    ['Peek (look at top)', 'O(1)', 'O(1)'],
    ['Search for a value', 'O(n)', 'O(1)'],
  ],
  glossary: [
    ['LIFO', 'Last In, First Out — the defining rule of a stack.'],
    ['Push', 'Add a new element on top.'],
    ['Pop', 'Remove and return the top element.'],
    ['Peek / Top', 'Look at the top element without removing it.'],
    ['Stack overflow', 'What happens when you push onto a stack that has no more room — the literal origin of the website\'s name, and of deep recursion crashing your program.'],
  ],
  examples: [
    { icon: '↩️', title: 'Undo (Ctrl+Z)', text: 'Every editor pushes an action onto a stack when you do something, and pops it off when you undo — most recent change reverses first.' },
    { icon: '🌐', title: 'Browser back button', text: 'Visited pages are pushed onto a "back stack". Hitting Back pops the most recently visited page.' },
    { icon: '🧮', title: 'Expression evaluation', text: 'Calculators and compilers use a stack to evaluate math expressions and match brackets like (, [, { correctly.' },
  ],
  caseStudies: [
    { tag: 'Compilers', title: 'Balanced parentheses / syntax checking', text: 'A compiler pushes every opening bracket it sees; on a closing bracket it pops and checks the types match. If the stack isn\'t empty at the end, you get a syntax error — this exact algorithm runs every time you compile code.' },
    { tag: 'Runtime internals', title: 'The call stack', text: 'Every function call your program makes is literally pushed onto a real stack (with its local variables); returning pops it off. Deep, unterminated recursion pushes forever until you hit a StackOverflowError — a stack topic explaining a real crash you\'ll eventually see.' },
    { tag: 'Interview classic', title: 'Valid Parentheses / Min Stack', text: 'A staple interview question: check if brackets are balanced, or design a stack that also returns the minimum element in O(1) — solved by pushing (value, currentMin) pairs.' },
  ],
  code: [
    { code: 'import java.util.Stack;', explain: { what: 'Imports Java\'s built-in Stack class so we can use it without writing the code ourselves.', why: 'Java\'s standard library already ships a tested, efficient stack — no need to reinvent it for everyday use.', symbols: [['import', 'brings a class from another package into this file.'], ['java.util.Stack', 'the fully-qualified name of the built-in stack class.']] } },
    { code: 'public class StackDemo {', explain: { what: 'Class wrapper required by Java.', why: '', symbols: [] } },
    { code: '    public static void main(String[] args) {', explain: { what: 'Program entry point.', why: '', symbols: [] } },
    { code: '        Stack<Integer> plates = new Stack<>();', explain: { what: 'Creates an empty stack that will hold Integer values, referenced by the variable "plates".', why: 'Generics (<Integer>) tell Java at compile time exactly what type this stack holds, preventing type-mismatch bugs.', symbols: [['Stack<Integer>', 'a Stack specialized to hold Integer objects.'], ['<>', 'the "diamond operator" — lets Java infer the type on the right side automatically.']] } },
    { code: '        plates.push(1);', explain: { what: 'Adds the value 1 to the top of the stack. Stack is now [1].', why: 'push() is O(1) because it only ever touches the top — no shifting like a middle-array insert.', symbols: [['.push(1)', 'method call that adds 1 as the new top element.']] } },
    { code: '        plates.push(2);', explain: { what: 'Adds 2 on top. Stack is now [1, 2], with 2 on top.', why: '', symbols: [] } },
    { code: '        plates.push(3);', explain: { what: 'Adds 3 on top. Stack is now [1, 2, 3], with 3 on top.', why: '', symbols: [] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '        System.out.println("Top element: " + plates.peek());', explain: { what: 'Prints the top value WITHOUT removing it — prints 3.', why: 'peek() lets you inspect the top safely before deciding whether to pop it.', symbols: [['.peek()', 'returns the top element but leaves the stack unchanged.']] } },
    { code: '', explain: { what: 'Blank line.', why: '', symbols: [] } },
    { code: '        while (!plates.isEmpty()) {', explain: { what: 'Loops as long as the stack still has elements.', why: 'isEmpty() is the safe way to know when to stop popping — popping an empty stack throws EmptyStackException.', symbols: [['!', 'logical NOT — flips true/false.'], ['.isEmpty()', 'returns true if the stack has zero elements.']] } },
    { code: '            System.out.println("Popped: " + plates.pop());', explain: { what: 'Removes AND returns the current top element, then prints it. Order printed: 3, then 2, then 1.', why: 'This demonstrates LIFO directly — the last one pushed (3) is the first one popped.', symbols: [['.pop()', 'removes the top element and returns its value.']] } },
    { code: '        }', explain: { what: 'Closes the while loop.', why: '', symbols: [] } },
    { code: '    }', explain: { what: 'Closes main.', why: '', symbols: [] } },
    { code: '}', explain: { what: 'Closes the class.', why: '', symbols: [] } },
  ],
  initViz({ stage, controls, log }) {
    let arr = [12, 45, 7];

    function refresh(hl) { draw(stage, arr, hl); }

    async function doPush(valStr) {
      const val = parseInt(valStr, 10);
      if (isNaN(val)) { log.textContent = '⚠️ Enter a value to push.'; return; }
      if (arr.length >= 8) { log.textContent = '⚠️ Stack full for this demo (max 8) — pop something first.'; return; }
      arr.push(val);
      refresh(arr.length - 1);
      log.textContent = `push(${val}) → placed on TOP in O(1). Stack size: ${arr.length}.`;
    }

    async function doPop() {
      if (!arr.length) { log.textContent = '❌ pop() on empty stack throws EmptyStackException — nothing to remove.'; return; }
      const val = arr[arr.length - 1];
      refresh(arr.length - 1);
      await sleep(300);
      arr.pop();
      refresh();
      log.textContent = `pop() → removed ${val} from the top in O(1). It was the most recently pushed value.`;
    }

    function doPeek() {
      if (!arr.length) { log.textContent = 'Stack is empty — nothing to peek.'; return; }
      refresh(arr.length - 1);
      log.textContent = `peek() → ${arr[arr.length - 1]} (top element, NOT removed).`;
    }

    const refs = buildControls(controls, [
      { type: 'input', ref: 'val', label: 'Value', inputType: 'number', placeholder: '99' },
      { type: 'button', label: 'Push', variant: 'good', onClick: () => doPush(refs.val.value) },
      { type: 'button', label: 'Pop', variant: 'warn', onClick: () => doPop() },
      { type: 'button', label: 'Peek', onClick: () => doPeek() },
      { type: 'button', label: 'Clear', onClick: () => { arr = []; refresh(); log.textContent = 'Stack cleared.'; } },
    ]);

    refresh();
    log.textContent = 'Push a few values, then Pop — notice the LAST one you pushed is the FIRST one you get back.';
  },
};
