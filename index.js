(function () {
  const display = document.getElementById('display');
  const buttons = document.querySelectorAll('button');
  const historyContainer = document.getElementById('history');
  const clearHistoryBtn = document.getElementById('clear-history');
  const langSelect = document.getElementById('language');

  const translations = {
    en: {
      clear: "AC",
      backspace: "⌫",
      equals: "=",
      historyTitle: "History",
      clearHistory: "Clear History",
      errorSyntax: "Invalid syntax",
      errorMath: "Math error"
    },
    es: {
      clear: "AC",
      backspace: "⌫",
      equals: "=",
      historyTitle: "Historial",
      clearHistory: "Borrar Historial",
      errorSyntax: "Sintaxis inválida",
      errorMath: "Error matemático"
    },
    fr: {
      clear: "AC",
      backspace: "⌫",
      equals: "=",
      historyTitle: "Historique",
      clearHistory: "Effacer l'historique",
      errorSyntax: "Syntaxe invalide",
      errorMath: "Erreur mathématique"
    }
  };

  let currentLang = 'en';
  let currentInput = '0';
  let resetNext = false;
  let history = [];

  function updateLocalizedText() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang][key]) {
        el.textContent = translations[currentLang][key];
      }
    });
  }

  function updateDisplay() {
    display.textContent = currentInput;
    display.classList.toggle('error', currentInput.startsWith('Error'));
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
    // Basic checks: parentheses balanced & only allowed chars
    const allowedChars = /^[0-9+\-*/().πe\sA-Za-z]*$/;
    if (!allowedChars.test(expr)) return false;

    // Check balanced parentheses
    let stack = [];
    for (let char of expr) {
      if (char === '(') stack.push(char);
      else if (char === ')') {
        if (stack.length === 0) return false;
        stack.pop();
      }
    }
    if (stack.length !== 0) return false;

    // Could add more validation here if needed

    return true;
  }

  function compute() {
    try {
      let expr = currentInput
        .replace(/π/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(');

      if (!validateExpression(expr)) {
        throw new Error(translations[currentLang].errorSyntax);
      }

      const result = Function(`return ${expr}`)();

      if (!isFinite(result)) {
        throw new Error(translations[currentLang].errorMath);
      }

      // Save to history
      history.unshift({ expression: currentInput, result: String(result) });
      if (history.length > 20) history.pop(); // limit history length
      renderHistory();

      currentInput = String(result);
    } catch (err) {
      currentInput = 'Error: ' + (err.message || 'Unknown error');
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
    history.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.textContent = `${item.expression} = ${item.result}`;
      div.title = "Click to reuse";
      div.addEventListener('click', () => {
        currentInput = item.result;
        resetNext = true;
        updateDisplay();
      });
      historyContainer.appendChild(div);
    });
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
      } else if (id === 'clear-history') {
        history = [];
        renderHistory();
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

  langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateLocalizedText();
  });

  // Auto detect browser language (optional)
  const browserLang = navigator.language.slice(0, 2);
  if (translations[browserLang]) {
    currentLang = browserLang;
    langSelect.value = browserLang;
  }

  updateLocalizedText();
  updateDisplay();
  renderHistory();
})(); 