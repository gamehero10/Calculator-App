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

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const num = button.getAttribute('data-num');
      const op = button.getAttribute('data-op');
      const id = button.id;

      if(id === 'clear') {
        currentInput = '0';
        resetNext = false;
        updateDisplay();
        return;
      }

      if(id === 'equals') {
        try {
          let result = Function(`return ${currentInput}`)();
          currentInput = String(result);
        } catch {
          currentInput = 'Error';
        }
        resetNext = true;
        updateDisplay();
        return;
      }

      if(num !== null) {
        if(resetNext) {
          currentInput = num;
          resetNext = false;
        } else if(currentInput === '0') {
          currentInput = num;
        } else {
          currentInput += num;
        }
        updateDisplay();
        return;
      }

      if(op !== null) {
        if(resetNext) resetNext = false;
        if(currentInput.length === 0) return;
        if(isOperator(currentInput.slice(-1))) {
          currentInput = currentInput.slice(0, -1) + op;
        } else {
          currentInput += op;
        }
        updateDisplay();
        return;
      }
    });
  });
})();