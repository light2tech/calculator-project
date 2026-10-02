 
const calculator = document.querySelector("[data-calculator]");
const previousOperand = calculator.querySelector("[data-previous-operand]");
const currentOperand = calculator.querySelector("[data-current-operand]");
let current = "0", saved = "", op = "", reset = false;

const render = () => {
  currentOperand.textContent = current;
  previousOperand.textContent = op ? `${saved} ${op}` : "";
};

const calc = () => {
  if (!op) return;
  const x = Number(saved), y = Number(current);
  current = ({ "+": x + y, "-": x - y, "×": x * y, "÷": y === 0 ? "Error" : x / y })[op];
  saved = ""; op = ""; reset = true;
};

const act = (value) => {
  if (value === "clear") return (current = "0", saved = "", op = "", reset = false, render());
  if (value === "delete") return (current = current.length > 1 ? current.slice(0, -1) : "0", render());
  if (value === "decimal") return (!current.includes(".") && (current = current === "0" ? "0." : current + "."), render());
  if (value === "equals") return (calc(), render());
  if (/\d/.test(value)) return (current = reset || current === "Error" || current === "0" ? value : current + value, reset = false, render());
  if (["+", "-", "×", "÷"].includes(value)) return (op && !reset ? calc() : null, saved = current, op = value, current = "0", reset = false, render());
};

calculator.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.number !== undefined) act(btn.dataset.number);
  else act(btn.dataset.action === "operator" ? btn.dataset.operator : btn.dataset.action);
});

document.addEventListener("keydown", e => {
  if (/\d/.test(e.key)) act(e.key);
  else if (e.key === "." || e.key === ",") act("decimal");
  else if (["+", "-"].includes(e.key)) act(e.key);
  else if (e.key === "*" || e.key.toLowerCase() === "x") act("×");
  else if (e.key === "/") act("÷");
  else if (e.key === "Enter" || e.key === "=") act("equals");
  else if (e.key === "Backspace") act("delete");
  else if (e.key === "Escape" || e.key === "Delete") act("clear");
});

render();
