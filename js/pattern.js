import { $, randomInt } from './shared.js';
let size = 4, active = new Set(), phase = 'show';
const counts = { easy: 4, medium: 7, hard: 11 };
function makePattern() {
  const total = size * size; active = new Set();
  while (active.size < counts[$('#pattern-difficulty').value]) active.add(randomInt(0, total - 1));
}
function render() {
  const grid = $('#pattern-grid'); grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`; grid.innerHTML = '';
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('button'); cell.type = 'button'; cell.className = 'pattern-cell'; cell.dataset.index = i; cell.setAttribute('aria-label', `Cell ${i + 1}`);
    if (phase === 'show' && active.has(i)) cell.classList.add('active');
    if (phase === 'select') cell.addEventListener('click', () => { cell.classList.toggle('selected'); });
    grid.appendChild(cell);
  }
}
function newPattern() { size = Number($('#pattern-difficulty').value === 'easy' ? 4 : $('#pattern-difficulty').value === 'medium' ? 5 : 6); phase = 'show'; makePattern(); render(); $('#pattern-status').textContent = 'Study the pattern, then continue when ready.'; $('#pattern-status').className = 'status'; $('#pattern-continue').hidden = false; $('#pattern-check').hidden = true; $('#pattern-new').hidden = true; }
$('#pattern-difficulty').addEventListener('change', newPattern);
$('#pattern-continue').addEventListener('click', () => { phase = 'select'; render(); $('#pattern-status').textContent = 'Select the cells you remember.'; $('#pattern-continue').hidden = true; $('#pattern-check').hidden = false; });
$('#pattern-check').addEventListener('click', () => { const selected = new Set([...document.querySelectorAll('.pattern-cell.selected')].map(cell => Number(cell.dataset.index))); const correct = selected.size === active.size && [...selected].every(index => active.has(index)); if (correct) { $('#pattern-status').textContent = 'Correct.'; $('#pattern-status').className = 'status success'; } else { $('#pattern-status').textContent = 'Not quite. The original pattern is shown.'; $('#pattern-status').className = 'status error'; phase = 'show'; render(); } $('#pattern-check').hidden = true; $('#pattern-new').hidden = false; });
$('#pattern-new').addEventListener('click', newPattern);
newPattern();
