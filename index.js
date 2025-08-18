(function () {
  const display = document.getElementById('display');
  const buttons = document.querySelectorAll('button');
  const historyContainer = document.getElementById('history');
  const clearHistoryBtn = document.getElementById('clear-history');

  let currentInput = '0';
  let resetNext = false;
  let history = [];

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
    const len = expr.length;
    let balance = 0;
    let prevChar = '';
    let dotCount = 0;

    for (let i = 0; i < len; i++) {
      const char = expr[i];

      // Parentheses balance
      if (char === '(') balance++;
      else if (char === ')') {
        if (balance === 0) return false;
        balance--;
      }

      // Invalid operator sequences
      if (['+', '*', '/'].includes(char) && ['+', '*', '/'].includes(prevChar)) {
        return false;
      }

      // Decimal validation
      if (char === '.') {
        dotCount++;
        if (dotCount > 1) return false;
      } else if (!/\d/.test(char)) {
        dotCount = 0;
      }

      prevChar = char;
    }

    // Expression must not start or end with * or /
    if (/^[*/]/.test(expr) || /[+\-*/]$/.test(expr)) return false;

    return balance === 0;
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
      const finalResult = String(result);

      // Save to history
      history.push({ expr: currentInput, result: finalResult });
      renderHistory();

      currentInput = finalResult;
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

  function renderHistory() {
    historyContainer.innerHTML = '';
    history.slice().reverse().forEach(item => {
      const div = document.createElement('div');
      div.classList.add('history-item');
      div.textContent = `${item.expr} = ${item.result}`;
      div.addEventListener('click', () => {
        currentInput = item.result;
        resetNext = true;
        updateDisplay();
      });
      historyContainer.appendChild(div);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    renderHistory();
  });

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