// Each example provides the Java source (for both the Code tab and the
// live execution view) plus a `run(param, ctx)` that re-implements the
// same algorithm in JS, calling into `ctx` at each meaningful step so the
// UI can highlight the active line and grow/shrink the call stack live.

const factorialCode = [
  { code: 'static long factorial(int n) {', explain: { what: 'Computes n! recursively.', why: '', symbols: [] } },
  { code: '    if (n == 0) return 1;', explain: { what: 'BASE CASE: 0! is defined as 1. Stop recursing.', why: 'Without this, the function would call itself forever and crash with a StackOverflowError.', symbols: [] } },
  { code: '    return n * factorial(n - 1);', explain: { what: 'RECURSIVE CASE: compute (n-1)! first, then multiply by n.', why: 'Mirrors the math definition n! = n × (n-1)! exactly.', symbols: [['factorial(n - 1)', 'the recursive call — same function, smaller input.']] } },
  { code: '}', explain: { what: 'Closes factorial.', why: '', symbols: [] } },
];

async function runFactorial(n, ctx) {
  async function call(k) {
    ctx.pushFrame(`factorial(${k})`);
    ctx.setLine(0);
    await ctx.sleep();
    ctx.setLine(1);
    ctx.log(`Checking base case: is ${k} == 0?`);
    await ctx.sleep();
    if (k === 0) {
      ctx.log(`Base case! factorial(0) = 1 — return directly, no more recursion.`);
      ctx.updateTopFrame({ result: 1 });
      await ctx.sleep();
      ctx.popFrame();
      return 1;
    }
    ctx.setLine(2);
    ctx.log(`Not the base case — need factorial(${k - 1}) first. Calling factorial(${k - 1})…`);
    await ctx.sleep();
    const sub = await call(k - 1);
    ctx.setLine(2);
    const result = k * sub;
    ctx.log(`Back in factorial(${k}): got factorial(${k - 1}) = ${sub}, so ${k} × ${sub} = ${result}`);
    ctx.updateTopFrame({ result });
    await ctx.sleep();
    ctx.popFrame();
    return result;
  }
  return call(n);
}

const fibCode = [
  { code: 'static int fib(int n) {', explain: { what: 'Computes the nth Fibonacci number recursively.', why: '', symbols: [] } },
  { code: '    if (n <= 1) return n;', explain: { what: 'BASE CASE: fib(0) = 0, fib(1) = 1 — both return themselves directly.', why: '', symbols: [] } },
  { code: '    return fib(n - 1) + fib(n - 2);', explain: { what: 'RECURSIVE CASE: TWO recursive calls, not one — branches into a tree of calls.', why: 'This is why naive Fibonacci is O(2ⁿ): every call spawns two more, recomputing the same smaller values many times over.', symbols: [] } },
  { code: '}', explain: { what: 'Closes fib.', why: '', symbols: [] } },
];

async function runFib(n, ctx) {
  async function call(k) {
    ctx.pushFrame(`fib(${k})`);
    ctx.setLine(0);
    await ctx.sleep();
    ctx.setLine(1);
    ctx.log(`Is ${k} <= 1?`);
    await ctx.sleep();
    if (k <= 1) {
      ctx.log(`Base case! fib(${k}) = ${k}`);
      ctx.updateTopFrame({ result: k });
      await ctx.sleep();
      ctx.popFrame();
      return k;
    }
    ctx.setLine(2);
    ctx.log(`Need fib(${k - 1}) AND fib(${k - 2}) — calling fib(${k - 1}) first…`);
    await ctx.sleep();
    const a = await call(k - 1);
    ctx.setLine(2);
    ctx.log(`Got fib(${k - 1}) = ${a}. Now calling fib(${k - 2})…`);
    await ctx.sleep();
    const b = await call(k - 2);
    ctx.setLine(2);
    const result = a + b;
    ctx.log(`Back in fib(${k}): ${a} + ${b} = ${result}`);
    ctx.updateTopFrame({ result });
    await ctx.sleep();
    ctx.popFrame();
    return result;
  }
  return call(n);
}

const sumDigitsCode = [
  { code: 'static int sumDigits(int n) {', explain: { what: 'Sums the decimal digits of n recursively (e.g. 431 → 4+3+1 = 8).', why: '', symbols: [] } },
  { code: '    if (n == 0) return 0;', explain: { what: 'BASE CASE: no digits left to add.', why: '', symbols: [] } },
  { code: '    return (n % 10) + sumDigits(n / 10);', explain: { what: 'RECURSIVE CASE: peel off the last digit (n % 10), and recurse on the rest of the number (n / 10, integer division drops the last digit).', why: 'Each call strips one digit, so the recursion depth equals the number of digits.', symbols: [['n % 10', 'modulo — the remainder when dividing by 10, i.e. the last digit.'], ['n / 10', 'integer division — drops the last digit.']] } },
  { code: '}', explain: { what: 'Closes sumDigits.', why: '', symbols: [] } },
];

async function runSumDigits(n, ctx) {
  async function call(k) {
    ctx.pushFrame(`sumDigits(${k})`);
    ctx.setLine(0);
    await ctx.sleep();
    ctx.setLine(1);
    ctx.log(`Is ${k} == 0?`);
    await ctx.sleep();
    if (k === 0) {
      ctx.log(`Base case! sumDigits(0) = 0`);
      ctx.updateTopFrame({ result: 0 });
      await ctx.sleep();
      ctx.popFrame();
      return 0;
    }
    ctx.setLine(2);
    const lastDigit = k % 10;
    const rest = Math.floor(k / 10);
    ctx.log(`Peel off the last digit (${lastDigit}), recurse on the rest (${rest})…`);
    await ctx.sleep();
    const sub = await call(rest);
    ctx.setLine(2);
    const result = lastDigit + sub;
    ctx.log(`Back in sumDigits(${k}): ${lastDigit} + ${sub} = ${result}`);
    ctx.updateTopFrame({ result });
    await ctx.sleep();
    ctx.popFrame();
    return result;
  }
  return call(n);
}

const powerCode = [
  { code: 'static long power(int base, int exp) {', explain: { what: 'Computes base^exp recursively (base is fixed at 2 in this demo).', why: '', symbols: [] } },
  { code: '    if (exp == 0) return 1;', explain: { what: 'BASE CASE: anything to the power 0 is 1.', why: '', symbols: [] } },
  { code: '    return base * power(base, exp - 1);', explain: { what: 'RECURSIVE CASE: base^exp = base × base^(exp-1).', why: 'Mirrors the mathematical definition of exponentiation directly.', symbols: [] } },
  { code: '}', explain: { what: 'Closes power.', why: '', symbols: [] } },
];

async function runPower(n, ctx) {
  const base = 2;
  async function call(exp) {
    ctx.pushFrame(`power(${base}, ${exp})`);
    ctx.setLine(0);
    await ctx.sleep();
    ctx.setLine(1);
    ctx.log(`Is exponent ${exp} == 0?`);
    await ctx.sleep();
    if (exp === 0) {
      ctx.log(`Base case! Anything^0 = 1`);
      ctx.updateTopFrame({ result: 1 });
      await ctx.sleep();
      ctx.popFrame();
      return 1;
    }
    ctx.setLine(2);
    ctx.log(`power(${base}, ${exp}) = ${base} × power(${base}, ${exp - 1})`);
    await ctx.sleep();
    const sub = await call(exp - 1);
    ctx.setLine(2);
    const result = base * sub;
    ctx.log(`Back in power(${base}, ${exp}): ${base} × ${sub} = ${result}`);
    ctx.updateTopFrame({ result });
    await ctx.sleep();
    ctx.popFrame();
    return result;
  }
  return call(n);
}

export const RECURSION_EXAMPLES = {
  factorial: { label: 'Factorial', paramLabel: 'n', defaultParam: 5, maxParam: 8, code: factorialCode, run: runFactorial },
  fibonacci: { label: 'Fibonacci', paramLabel: 'n', defaultParam: 4, maxParam: 6, code: fibCode, run: runFib },
  sumDigits: { label: 'Sum of Digits', paramLabel: 'n', defaultParam: 431, maxParam: 99999, code: sumDigitsCode, run: runSumDigits },
  power: { label: 'Power (2ⁿ)', paramLabel: 'exponent', defaultParam: 5, maxParam: 8, code: powerCode, run: runPower },
};
