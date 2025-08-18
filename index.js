(function () {
  const display = document.getElementById('display');
  const buttons = document.querySelectorAll('button');
  let currentInput = '0';
  let resetNext = false;

  function updateDisplay() {
    display.textContent = currentInput;
  }

  function isOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
  }

  function appendToInput(value) {
    if (resetNext && !isOperator(value) && !value.match(/^[\)\d\.πe]/)) {
      currentInput = value;
      resetNext = false;
      updateDisplay();
      return;
    }
    if (value === '.') {
      const lastNumber = currentInput.split(/[\+\-\*\/\(\)]/).pop();
      if (lastNumber.includes('.')) return;
    }
    if (currentInput === '0' && value !== '.') {
      currentInput = value;
    } else {
      currentInput += value;
    }
    updateDisplay();
  }

  function wrapFunction(funcName) {
    currentInput += `${funcName}(`;
    updateDisplay();
  }

  function validateExpression(expr) {
    // 1. Check for balanced parentheses
    let stack = [];
    for (let char of expr) {
      if (char === '(') stack.push(char);
      else if (char === ')') {
        if (stack.length === 0) return false;
        stack.pop();
      }
    }
    if (stack.length !== 0) return false;

    // 2. Disallow multiple operators in a row (except unary minus)
    if (/[\+\*\/]{2,}/.test(expr)) return false;
    if (/[\+\-\*\/]$/.test(expr)) return false;
    if (/^[\*\/]/.test(expr)) return false;

    // 3. Prevent multiple dots in numbers
    const tokens = expr.split(/[\+\-\*\/\(\)]/);
    for (let token of tokens) {
      if ((token.match(/\./g) || []).length > 1) return false;
    }

    return true;
  }

  function compute() {
    try {
      const expr = currentInput
        .replace(/π/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(');

      if (!validateExpression(expr)) {
        currentInput = 'Error';
        resetNext = true;
        updateDisplay();
        return;
      }

      const result = Function(`return ${expr}`)();
      currentInput = String(result);
    } catch {
      currentInput = 'Error';
    }
    resetNext = true;
    updateDisplay();
  }

  function backspace() {
    if (resetNext) {
      currentInput = '0';
      resetNext = false;
    } else {
      currentInput = currentInput.slice(0, -1);
      if (currentInput === '' || currentInput === '-') {
        currentInput = '0';
      }
    }
    updateDisplay();
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const num = button.getAttribute('data-num');
      const op = button.getAttribute('data-op');
      const paren = button.getAttribute('data-paren');
      const func = button.getAttribute('data-func');
      const constant = button.getAttribute('data-const');
      const id = button.id;

      if (id === 'clear') {
        currentInput = '0';
        resetNext = false;
        updateDisplay();
      } else if (id === 'backspace') {
        backspace();
      } else if (id === 'equals') {
        compute();
      } else if (num !== null) {
        appendToInput(num);
      } else if (op !== null) {
        appendToInput(op);
      } else if (paren !== null) {
        appendToInput(paren);
      } else if (func !== null) {
        wrapFunction(func);
      } else if (constant !== null) {
        appendToInput(constant === 'pi' ? 'π' : 'e');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (!isNaN(key) || key === '.') {
      appendToInput(key);
    } else if (['+', '-', '*', '/', '(', ')'].includes(key)) {
      appendToInput(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      compute();
    } else if (key === 'Backspace') {
      e.preventDefault();
      backspace();
    } else if (key.toLowerCase() === 'c' || key === 'Escape') {
      currentInput = '0';
      resetNext = false;
      updateDisplay();
    }
  });
})();