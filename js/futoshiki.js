import { $, } from './shared.js';
import { FUTOSHIKI_MODES, generatePuzzle, isComplete } from './futoshiki-engine.js';

const grid = $('.futoshiki-grid');
const difficulty = $('#futoshiki-difficulty');
const newPuzzleButton = $('#new-futoshiki');
const status = $('#futoshiki-status');
const keypad = $('.futoshiki-keypad');

let puzzle;
let board;
let selectedCell = null;

function cellIndex(row, column) {
  return row * puzzle.size + column;
}

function getFeedback() {
  const conflicts = new Set();
  const wrong = new Set();
  const violations = new Set();

  for (let index = 0; index < board.length; index += 1) {
    if (!board[index]) continue;
    if (board[index] !== puzzle.solution[index]) wrong.add(index);
    const row = Math.floor(index / puzzle.size);
    const column = index % puzzle.size;
    for (let offset = 0; offset < puzzle.size; offset += 1) {
      const rowIndex = cellIndex(row, offset);
      const columnIndex = cellIndex(offset, column);
      if (rowIndex !== index && board[rowIndex] === board[index]) conflicts.add(rowIndex);
      if (columnIndex !== index && board[columnIndex] === board[index]) conflicts.add(columnIndex);
    }
  }

  puzzle.inequalities.forEach(({ a, b, operator }, inequalityIndex) => {
    if (board[a] && board[b] && (operator === '<' ? board[a] >= board[b] : board[a] <= board[b])) {
      violations.add(inequalityIndex);
      conflicts.add(a);
      conflicts.add(b);
    }
  });

  return { conflicts, wrong, violations };
}

function inequalityAt(a, b) {
  return puzzle.inequalities.findIndex((inequality) => inequality.a === a && inequality.b === b || inequality.a === b && inequality.b === a);
}

function render() {
  const feedback = getFeedback();
  grid.replaceChildren();
  grid.style.setProperty('--futo-size', puzzle.size);
  grid.style.gridTemplateColumns = `repeat(${puzzle.size * 2 - 1}, minmax(0, 1fr))`;
  grid.style.gridTemplateRows = `repeat(${puzzle.size * 2 - 1}, minmax(0, 1fr))`;

  for (let row = 0; row < puzzle.size * 2 - 1; row += 1) {
    for (let column = 0; column < puzzle.size * 2 - 1; column += 1) {
      const element = document.createElement(row % 2 === 0 && column % 2 === 0 ? 'button' : 'span');
      element.style.gridRow = row + 1;
      element.style.gridColumn = column + 1;
      if (row % 2 === 0 && column % 2 === 0) {
        const index = cellIndex(row / 2, column / 2);
        element.type = 'button';
        element.className = 'futoshiki-cell';
        element.dataset.index = index;
        element.textContent = board[index] || '';
        element.setAttribute('aria-label', `Row ${Math.floor(index / puzzle.size) + 1}, column ${index % puzzle.size + 1}${puzzle.givens[index] ? ', given' : ''}`);
        if (puzzle.givens[index]) element.classList.add('given');
        if (index === selectedCell) element.classList.add('selected');
        if (feedback.conflicts.has(index)) element.classList.add('conflict');
        if (feedback.wrong.has(index)) element.classList.add('wrong');
        element.disabled = Boolean(puzzle.givens[index]);
        element.addEventListener('click', () => { selectedCell = index; render(); });
      } else if (row % 2 === 0 || column % 2 === 0) {
        element.className = 'futoshiki-inequality';
        const a = row % 2 === 0 ? cellIndex(row / 2, (column - 1) / 2) : cellIndex((row - 1) / 2, column / 2);
        const b = row % 2 === 0 ? cellIndex(row / 2, (column + 1) / 2) : cellIndex((row + 1) / 2, column / 2);
        const inequalityIndex = inequalityAt(a, b);
        if (inequalityIndex !== -1) {
          const inequality = puzzle.inequalities[inequalityIndex];
          if (row % 2 === 0) {
            element.textContent = inequality.a === a ? inequality.operator : inequality.operator === '<' ? '>' : '<';
          } else {
            element.textContent = inequality.a === a ? inequality.operator === '<' ? '∧' : '∨' : inequality.operator === '<' ? '∨' : '∧';
          }
          element.setAttribute('aria-label', `Inequality ${element.textContent}`);
          if (feedback.violations.has(inequalityIndex)) element.classList.add('violation');
        }
      } else {
        element.className = 'futoshiki-intersection';
      }
      grid.append(element);
    }
  }
}

function enterValue(value) {
  if (selectedCell === null || puzzle.givens[selectedCell]) return;
  board[selectedCell] = value;
  status.textContent = '';
  status.className = 'status';
  render();
  if (isComplete(puzzle, board)) {
    status.textContent = 'Futoshiki complete.';
    status.className = 'status success';
  }
}

function renderKeypad() {
  keypad.replaceChildren();
  for (let value = 1; value <= puzzle.size; value += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = value;
    button.dataset.number = value;
    button.addEventListener('click', () => { enterValue(value); button.blur(); });
    keypad.append(button);
  }
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'secondary';
  clear.textContent = 'Clear';
  clear.addEventListener('click', () => { enterValue(0); clear.blur(); });
  keypad.append(clear);
}

function newPuzzle() {
  puzzle = generatePuzzle(difficulty.value);
  board = [...puzzle.givens];
  selectedCell = null;
  status.textContent = '';
  status.className = 'status';
  renderKeypad();
  render();
}

document.addEventListener('keydown', (event) => {
  if (selectedCell === null) return;
  if (/^[1-9]$/.test(event.key) && Number(event.key) <= puzzle.size) {
    event.preventDefault();
    enterValue(Number(event.key));
    return;
  }
  if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
    event.preventDefault();
    enterValue(0);
    return;
  }
  if (!event.key.startsWith('Arrow')) return;
  event.preventDefault();
  const row = Math.floor(selectedCell / puzzle.size);
  const column = selectedCell % puzzle.size;
  const nextRow = Math.max(0, Math.min(puzzle.size - 1, row + (event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0)));
  const nextColumn = Math.max(0, Math.min(puzzle.size - 1, column + (event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0)));
  selectedCell = cellIndex(nextRow, nextColumn);
  render();
});

difficulty.addEventListener('change', newPuzzle);
newPuzzleButton.addEventListener('click', newPuzzle);
newPuzzle();

if (!FUTOSHIKI_MODES[difficulty.value]) difficulty.value = 'easy';
