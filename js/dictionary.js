import { $, shuffle } from './shared.js';
import words from '../assets/words/dictionary.js';

const bandWeights = [
  ['less-common', 0.5],
  ['medium', 0.35],
  ['common', 0.15]
];
const remainingByBand = new Map();

function refill() {
  for (const [band] of bandWeights) {
    remainingByBand.set(band, shuffle(words.filter((entry) => entry.frequencyBand === band)));
  }
}

function nextEntry() {
  if (![...remainingByBand.values()].some((entries) => entries?.length)) refill();

  const available = bandWeights.filter(([band]) => remainingByBand.get(band)?.length);
  const totalWeight = available.reduce((total, [, weight]) => total + weight, 0);
  let target = Math.random() * totalWeight;
  const selected = available.find(([, weight]) => {
    target -= weight;
    return target <= 0;
  })?.[0] || available[0][0];
  return remainingByBand.get(selected).pop();
}

function nextWord() {
  const entry = nextEntry();
  $('#dictionary-word').textContent = entry.word;
  $('#dictionary-type').textContent = entry.partOfSpeech;
  $('#dictionary-definition').textContent = entry.definition;
  $('#dictionary-example').textContent = entry.example ? `“${entry.example}”` : '';
}
$('#next-word').addEventListener('click', nextWord);
nextWord();
