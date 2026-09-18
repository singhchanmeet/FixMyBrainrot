import { $, shuffle } from './shared.js';
import anagramGroups from '../assets/words/anagrams.js';
import anagramAnswers from '../assets/words/anagram-answers.js';

const bank = $('#letter-bank');
const answer = $('#answer-slots');
const clearButton = $('#clear-answer');
const backspaceButton = $('#backspace-answer');
const newWordButton = $('#new-anagram');
const difficultySelect = $('#anagram-difficulty');
const status = $('#anagram-status');

const allWords = new Set(Object.values(anagramAnswers).flat());
const difficultyRanges = {
  easy: [5, 6],
  medium: [7, 7],
  hard: [8, 10]
};
let remainingGroups = [];
let currentPuzzle;
let selectedLetters = [];
let solved = false;

function fixedPositionCount(original, shuffled) {
  return [...original].reduce((count, letter, index) => count + (letter === shuffled[index] ? 1 : 0), 0);
}

function scrambleWord(word) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const shuffled = shuffle([...word]).join('');
    const maximumFixed = Math.max(1, Math.floor(word.length * .4));
    if (shuffled !== word && !allWords.has(shuffled) && fixedPositionCount(word, shuffled) <= maximumFixed) return shuffled;
  }
  return [...word].reverse().join('');
}

function setStatus(message = '', type = '') {
  status.textContent = message;
  status.className = `status${type ? ` ${type}` : ''}`;
}

function render() {
  bank.replaceChildren();
  currentPuzzle.letters.forEach((letter, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'anagram-letter';
    tile.textContent = letter;
    tile.setAttribute('aria-label', `Letter ${letter}`);
    tile.disabled = solved || selectedLetters.includes(index);
    tile.addEventListener('click', () => selectLetter(index));
    bank.append(tile);
  });

  answer.replaceChildren();
  selectedLetters.forEach((letterIndex, answerIndex) => {
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'anagram-answer-letter';
    slot.textContent = currentPuzzle.letters[letterIndex];
    slot.setAttribute('aria-label', `Remove letter ${currentPuzzle.letters[letterIndex]}`);
    slot.disabled = solved;
    slot.addEventListener('click', () => removeLetter(answerIndex));
    answer.append(slot);
  });
}

function selectLetter(index) {
  if (solved || selectedLetters.includes(index)) return;
  selectedLetters.push(index);
  render();
  if (selectedLetters.length === currentPuzzle.word.length) checkAnswer();
}

function removeLetter(answerIndex) {
  if (solved) return;
  selectedLetters.splice(answerIndex, 1);
  setStatus();
  render();
}

function checkAnswer() {
  const guess = selectedLetters.map((index) => currentPuzzle.letters[index]).join('');
  if (anagramAnswers[currentPuzzle.signature]?.includes(guess)) {
    solved = true;
    setStatus('Correct.', 'success');
    render();
    newWordButton.focus();
  } else {
    setStatus('Not quite. Try again.', 'error');
  }
}

function clearAnswer() {
  if (solved) return;
  selectedLetters = [];
  setStatus();
  render();
}

function nextPuzzle() {
  const [minimumLength, maximumLength] = difficultyRanges[difficultySelect.value];
  const availableGroups = anagramGroups.filter(group => group[0].word.length >= minimumLength && group[0].word.length <= maximumLength);
  if (!remainingGroups.length || remainingGroups.some(group => !availableGroups.includes(group))) remainingGroups = shuffle(availableGroups);
  const group = remainingGroups.pop();
  const entry = group[Math.floor(Math.random() * group.length)];
  currentPuzzle = { word: entry.word, signature: [...entry.word].sort().join(''), letters: [...scrambleWord(entry.word)] };
  selectedLetters = [];
  solved = false;
  setStatus();
  render();
}

document.addEventListener('keydown', event => {
  if (solved) return;
  if (event.key === 'Backspace') {
    event.preventDefault();
    selectedLetters.pop();
    setStatus();
    render();
    return;
  }
  if (event.key === 'Escape') {
    clearAnswer();
    return;
  }
  if (event.key === 'Enter') {
    if (selectedLetters.length === currentPuzzle.word.length) checkAnswer();
    return;
  }
  const letter = event.key.toLowerCase();
  if (!/^[a-z]$/.test(letter)) return;
  const index = currentPuzzle.letters.findIndex((candidate, candidateIndex) => candidate === letter && !selectedLetters.includes(candidateIndex));
  if (index !== -1) selectLetter(index);
});

clearButton.addEventListener('click', clearAnswer);
backspaceButton.addEventListener('click', () => {
  if (solved) return;
  selectedLetters.pop();
  setStatus();
  render();
});
newWordButton.addEventListener('click', nextPuzzle);
difficultySelect.addEventListener('change', () => {
  remainingGroups = [];
  nextPuzzle();
});
nextPuzzle();
