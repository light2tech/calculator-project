 
const calculator = document.querySelector("[data-calculator]");
const previousOperand = calculator.querySelector("[data-previous-operand]");
const currentOperand = calculator.querySelector("[data-current-operand]");

let current = "0";
let storedValue = "";
let operator = null;
let waitingForNewNumber = false;
let hasError = false;

function formatNumber(value) {
  if (value === "Error" || value === "Cannot divide by zero") {
    return value;
  }

  const [whole, decimal] = value.split(".");
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal === undefined ? formattedWhole : `${formattedWhole}.${decimal}`;
}

function updateDisplay() {
  currentOperand.textContent = formatNumber(current);
  previousOperand.textContent = operator ? `${formatNumber(storedValue)} ${operator}` : "";
}

function clearAll() {
  current = "0";
  storedValue = "";
  operator = null;
  waitingForNewNumber = false;
  hasError = false;
}

function inputNumber(number) {
  if (hasError) {
    clearAll();
  }

  if (waitingForNewNumber) {
    current = number;
    waitingForNewNumber = false;
  } else if (current === "0") {
    current = number;
  } else if (current.length < 15) {
    current += number;
  }
}

function inputDecimal() {
  if (hasError) {
    clearAll();
  }

  if (waitingForNewNumber) {
    current = "0";
    waitingForNewNumber = false;
  }

  if (!current.includes(".")) {
    current += ".";
  }
}

function calculate() {
  if (!operator || waitingForNewNumber) {
    return;
  }

  const left = Number(storedValue);
  const right = Number(current);
  let result;

  switch (operator) {
    case "+":
      result = left + right;
      break;
    case "-":
      result = left - right;
      break;
    case "×":
      result = left * right;
      break;
    case "÷":
      if (right === 0) {
        current = "Cannot divide by zero";
        storedValue = "";
        operator = null;
        waitingForNewNumber = true;
        hasError = true;
        return;
      }
      result = left / right;
      break;
    default:
      return;
  }

  if (!Number.isFinite(result)) {
    current = "Error";
    storedValue = "";
    operator = null;
    waitingForNewNumber = true;
    hasError = true;
    return;
  }

  current = String(Number(result.toPrecision(12)));
  storedValue = "";
  operator = null;
  waitingForNewNumber = true;
}

function chooseOperation(nextOperator) {
  if (hasError) {
    return;
  }

  if (operator && !waitingForNewNumber) {
    calculate();
  }

  storedValue = current;
  operator = nextOperator;
  waitingForNewNumber = true;
}

function deleteDigit() {
  if (hasError) {
    clearAll();
    return;
  }

  if (waitingForNewNumber) {
    waitingForNewNumber = false;
    return;
  }

  current = current.length > 1 ? current.slice(0, -1) : "0";
}

function handleAction(action, value) {
  switch (action) {
    case "number":
      inputNumber(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      chooseOperation(value);
      break;
    case "equals":
      if (operator !== null && !waitingForNewNumber) {
        calculate();
      }
      break;
    case "clear":
      clearAll();
      break;
    case "delete":
      deleteDigit();
      break;
  }

  updateDisplay();
}

calculator.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) {
    handleAction("number", button.dataset.number);
  } else {
    handleAction(button.dataset.action, button.dataset.operator);
  }
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) {
    handleAction("number", event.key);
  } else if (event.key === "." || event.key === ",") {
    handleAction("decimal");
  } else if (["+", "-"].includes(event.key)) {
    handleAction("operator", event.key);
  } else if (event.key === "*" || event.key.toLowerCase() === "x") {
    handleAction("operator", "×");
  } else if (event.key === "/") {
    handleAction("operator", "÷");
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    handleAction("equals");
  } else if (event.key === "Backspace") {
    handleAction("delete");
  } else if (event.key === "Escape" || event.key === "Delete") {
    handleAction("clear");
  }
});

updateDisplay();
