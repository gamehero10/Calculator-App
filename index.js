(function(){
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
    if (resetNext) {
      currentInput = isOperator(value) || value === ')' ? currentInput + value : value;
      resetNext = false;
    } else {
      if (value === '.') {
        const lastNumber = currentInput.split(/[\+\-\*\/\(\)]/).pop();
        if (lastNumber.includes('.')) return;
      }
      if (currentInput === '0' && value !== '.') {
        currentInput = value;
      } else {
        currentInput += value;
      }
    }
    updateDisplay();
  }

  function calculate() {
    try {
      let result = Function(`return ${currentInput}`)();
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
      const id = button.id;

      if(id === 'clear') {
        currentInput = '0';
        resetNext = false;
        updateDisplay();
        return;
      }

      if(id === 'backspace') {
        backspace();
        return;
      }

      if(id === 'equals') {
        calculate();
        return;
      }

      if(num !== null) {
        appendToInput(num);
        return;
      }

      if(op !== null) {
        appendToInput(op);
        return;
      }

      if(paren !== null) {
        appendToInput(paren);
        return;
      }
    });
  });

  // 🔑 Keyboard Support
  document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (!isNaN(key) || key === '.') {
      appendToInput(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
      appendToInput(key);
    } else if (key === '(' || key === ')') {
      appendToInput(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      calculate();
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