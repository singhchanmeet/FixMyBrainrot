import { $, shuffle } from './shared.js';

const SIZE = 9;
const difficultyClues = { easy: 40, medium: 32, hard: 26 };
let solution = [], puzzle = [], currentDifficulty = 'easy', selectedCell = null;
const touchDevice = window.matchMedia('(pointer: coarse)').matches;

function emptyBoard() { return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); }
function isValid(board, row, col, value) {
  for (let i = 0; i < SIZE; i++) if (board[row][i] === value || board[i][col] === value) return false;
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++) if (board[r][c] === value) return false;
  return true;
}
function fillBoard(board) {
  const empty = board.flatMap((row, r) => row.map((value, c) => value ? null : [r, c])).filter(Boolean)[0];
  if (!empty) return true;
  const [row, col] = empty;
  for (const value of shuffle([1,2,3,4,5,6,7,8,9])) if (isValid(board, row, col, value)) { board[row][col] = value; if (fillBoard(board)) return true; board[row][col] = 0; }
  return false;
}
function countSolutions(board, limit = 2) {
  const empty = board.flatMap((row, r) => row.map((value, c) => value ? null : [r, c])).filter(Boolean)[0];
  if (!empty) return 1;
  const [row, col] = empty; let count = 0;
  for (let value = 1; value <= 9 && count < limit; value++) if (isValid(board, row, col, value)) { board[row][col] = value; count += countSolutions(board, limit - count); board[row][col] = 0; }
  return count;
}
function generatePuzzle(clues) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const solved = emptyBoard(); fillBoard(solved); const candidate = solved.map(row => [...row]); let filled = 81;
    for (const index of shuffle(Array.from({ length: 81 }, (_, i) => i))) {
      if (filled <= clues) break;
      const row = Math.floor(index / 9), col = index % 9, old = candidate[row][col]; candidate[row][col] = 0;
      if (countSolutions(candidate.map(values => [...values])) === 1) filled--; else candidate[row][col] = old;
    }
    if (filled === clues) return { puzzle: candidate, solution: solved };
  }
  throw new Error('Unable to generate a unique Sudoku puzzle.');
}
function render() {
  const grid = $('.sudoku-grid'); grid.innerHTML = '';
  puzzle.forEach((row, r) => row.forEach((value, c) => {
    const cell = document.createElement('input'); cell.className = 'sudoku-cell'; cell.type = 'text'; cell.inputMode = 'numeric'; cell.maxLength = 1; cell.dataset.row = r; cell.dataset.col = c; cell.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}`);
    if (value) { cell.value = value; cell.classList.add('given'); cell.disabled = true; }
    else { if (touchDevice) { cell.readOnly = true; cell.inputMode = 'none'; } cell.addEventListener('focus', () => selectCell(cell)); cell.addEventListener('click', () => selectCell(cell)); cell.addEventListener('input', () => validateCell(cell)); cell.addEventListener('keydown', event => { if (!/[1-9]|Backspace|Delete|Arrow/.test(event.key)) event.preventDefault(); }); }
    grid.appendChild(cell);
  }));
}
function selectCell(cell) { if (selectedCell) selectedCell.classList.remove('selected'); selectedCell = cell; selectedCell.classList.add('selected'); }
function readValue(cell) { return Number(cell.value) || 0; }
function clearConflictMarks() { document.querySelectorAll('.sudoku-cell.conflict').forEach(cell => cell.classList.remove('conflict')); }
function validateCell(cell) {
  const value = readValue(cell); cell.value = value ? String(value) : ''; cell.classList.remove('wrong'); clearConflictMarks(); $('#sudoku-status').textContent = ''; if (!value) return;
  const row = Number(cell.dataset.row), col = Number(cell.dataset.col);
  if (value !== solution[row][col]) { cell.classList.add('wrong'); highlightConflicts(row, col, value); }
  else if ([...document.querySelectorAll('.sudoku-cell')].every((boardCell, index) => readValue(boardCell) === solution[Math.floor(index / 9)][index % 9])) $('#sudoku-status').textContent = 'Sudoku complete.';
}
function highlightConflicts(row, col, value) {
  for (const cell of [...document.querySelectorAll('.sudoku-cell')]) {
    const r = Number(cell.dataset.row), c = Number(cell.dataset.col);
    const sameUnit = r === row || c === col || (Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3));
    if (sameUnit && !(r === row && c === col) && readValue(cell) === value) cell.classList.add('conflict');
  }
}
function enterValue(value) { if (!selectedCell) return; selectedCell.value = value ? String(value) : ''; validateCell(selectedCell); if (!touchDevice) selectedCell.focus(); }
function newPuzzle() { selectedCell = null; try { ({ puzzle, solution } = generatePuzzle(difficultyClues[currentDifficulty])); render(); } catch (error) { console.error(error); } }

$('#sudoku-difficulty').addEventListener('change', event => { currentDifficulty = event.target.value; newPuzzle(); });
$('#new-sudoku').addEventListener('click', newPuzzle);
document.querySelectorAll('[data-number]').forEach(button => button.addEventListener('click', () => { enterValue(Number(button.dataset.number)); button.blur(); }));
newPuzzle();
