import { $ } from './shared.js';
import { answers, guesses } from '../assets/words/wordle.js';

let target = '', row = 0, finished = false, current = 0;
const touchDevice = window.matchMedia('(pointer: coarse)').matches;
function draw() {
  const grid = $('#word-grid'); grid.innerHTML = '';
  for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) {
    const tile = document.createElement('input'); tile.className = 'word-tile'; tile.type = 'text'; tile.maxLength = 1; tile.autocomplete = 'off'; tile.spellcheck = false; tile.dataset.row = r; tile.dataset.col = c; tile.setAttribute('aria-label', `Guess ${r + 1}, letter ${c + 1}`); if (touchDevice) { tile.readOnly = true; tile.inputMode = 'none'; }
    tile.addEventListener('input', () => typeLetter(tile)); tile.addEventListener('keydown', event => handleKey(event, tile)); grid.appendChild(tile);
  }
  document.querySelectorAll('.keyboard-key').forEach(key => { key.className = key.classList.contains('wide') ? 'keyboard-key wide' : 'keyboard-key'; });
}
function start() { target = answers[Math.floor(Math.random() * answers.length)]; row = 0; current = 0; finished = false; draw(); $('#word-status').textContent = 'Six guesses.'; if (!touchDevice) focusTile(0, 0); }
function rowTiles() { return [...document.querySelectorAll(`.word-tile[data-row="${row}"]`)]; }
function focusTile(r, c) { const tile = document.querySelector(`.word-tile[data-row="${r}"][data-col="${c}"]`); if (tile) tile.focus(); current = c; }
function typeLetter(tile) { tile.value = tile.value.replace(/[^a-z]/gi, '').slice(-1).toUpperCase(); if (tile.value && Number(tile.dataset.col) < 4) focusTile(row, Number(tile.dataset.col) + 1); }
function handleKey(event, tile) { const col = Number(tile.dataset.col); if (event.key === 'Backspace' && !tile.value && col > 0) { focusTile(row, col - 1); document.activeElement.value = ''; } if (event.key === 'Enter') { event.preventDefault(); submit(); } }
function submit() {
  if (finished) return;
  const guess = rowTiles().map(tile => tile.value.toLowerCase()).join('');
  if (guess.length !== 5) { $('#word-status').textContent = 'Complete the row first.'; return; }
  if (!guesses.has(guess)) { $('#word-status').textContent = 'That word is not in the list.'; return; }
  const counts = {}; [...target].forEach(letter => counts[letter] = (counts[letter] || 0) + 1); const states = Array(5).fill('absent');
  [...guess].forEach((letter, i) => { if (letter === target[i]) { states[i] = 'correct'; counts[letter]--; } });
  [...guess].forEach((letter, i) => { if (states[i] === 'absent' && counts[letter] > 0) { states[i] = 'present'; counts[letter]--; } });
  rowTiles().forEach((tile, i) => { tile.classList.add('filled', states[i]); tile.readOnly = true; updateKeyboard(tile.value.toLowerCase(), states[i]); });
  if (guess === target) { finished = true; $('#word-status').textContent = 'Correct. Start a new word when ready.'; }
  else if (++row === 6) { finished = true; $('#word-status').textContent = `The word was ${target}. Start a new word when ready.`; }
  else { $('#word-status').textContent = `${6 - row} guesses remaining.`; focusTile(row, 0); }
}
function updateKeyboard(letter, state) { const key = document.querySelector(`[data-key="${letter}"]`); if (!key) return; if (state === 'correct' || (state === 'present' && !key.classList.contains('correct'))) key.classList.remove('present', 'absent'), key.classList.add(state); else if (!key.classList.contains('present') && !key.classList.contains('correct')) key.classList.add(state); }
function pressKeyboard(key) {
  if (key === 'enter') return submit();
  if (key === 'backspace') { const tile = document.activeElement?.classList.contains('word-tile') ? document.activeElement : document.querySelector(`.word-tile[data-row="${row}"][data-col="${current}"]`); if (tile?.value) tile.value = ''; else if (current > 0) { focusTile(row, current - 1); document.activeElement.value = ''; } return; }
  if (!finished) { const tile = document.querySelector(`.word-tile[data-row="${row}"][data-col="${current}"]`); if (tile) { tile.value = key.toUpperCase(); if (current < 4) focusTile(row, current + 1); } }
}
document.querySelectorAll('[data-key]').forEach(button => button.addEventListener('click', () => pressKeyboard(button.dataset.key)));
$('#word-new').addEventListener('click', start);
start();
