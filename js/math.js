import { $, randomInt } from './shared.js';

let answer = 0;
const touchDevice = window.matchMedia('(pointer: coarse)').matches;
const difficulty = { easy: 1, medium: 2, hard: 3 };
function makeProblem(level) {
  const mode = difficulty[level]; let a = randomInt(2, mode === 1 ? 20 : mode === 2 ? 80 : 200); let b = randomInt(2, mode === 1 ? 12 : mode === 2 ? 30 : 80);
  const op = (mode === 1 ? ['+', '-'] : ['+', '-', '*', '/'])[randomInt(0, mode === 1 ? 1 : 3)];
  if (op === '-') { if (b > a) [a, b] = [b, a]; answer = a - b; return `${a} − ${b}`; }
  if (op === '/') { answer = a; return `${a * b} ÷ ${b}`; }
  answer = op === '+' ? a + b : a * b; return `${a} ${op === '*' ? '×' : op} ${b}`;
}
function nextProblem() { $('#math-problem').textContent = makeProblem($('#math-difficulty').value); $('#math-answer').value = ''; if (!touchDevice) $('#math-answer').focus(); }
function checkAnswer() { if ($('#math-answer').value !== '' && Number($('#math-answer').value) === answer) nextProblem(); }
function appendKey(key) { const input = $('#math-answer'); if (key === 'clear') input.value = ''; else if (key === 'backspace') input.value = input.value.slice(0, -1); else input.value += key; input.dispatchEvent(new Event('input', { bubbles: true })); if (!touchDevice) input.focus(); }
$('#math-difficulty').addEventListener('change', nextProblem);
$('#new-math').addEventListener('click', nextProblem);
$('#math-answer').addEventListener('input', checkAnswer);
if (touchDevice) { $('#math-answer').readOnly = true; $('#math-answer').inputMode = 'none'; }
document.querySelectorAll('[data-math-key]').forEach(button => button.addEventListener('click', () => { appendKey(button.dataset.mathKey); button.blur(); }));
nextProblem();
