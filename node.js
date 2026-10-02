const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });

const ops = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => a / b };

readline.question('Enter calculation (e.g., 8 * 2 or 10 / 5): ', input => {
  const [a, op, b] = input.trim().split(/\s+/);
  const res = ops[op]?.(+a, +b);
  console.log(isNaN(res) || !ops[op] ? 'Invalid expression' : `Result: ${res}`);
  readline.close();
});