import { $, shuffle } from './shared.js';
import words from '../assets/words/dictionary.js';
let remaining = [];
function nextWord() {
  if (!remaining.length) remaining = shuffle(words);
  const entry = remaining.pop();
  $('#dictionary-word').textContent = entry.word;
  $('#dictionary-type').textContent = entry.partOfSpeech;
  $('#dictionary-definition').textContent = entry.definition;
  $('#dictionary-example').textContent = entry.example ? `“${entry.example}”` : '';
}
$('#next-word').addEventListener('click', nextWord);
nextWord();
