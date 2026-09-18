import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const buildDir = path.join(root, '.asset-build');
const wordsetDataDir = process.env.WORDSET_DATA_DIR || path.join(buildDir, 'wordset-dictionary', 'data');
const outputDir = path.join(root, 'assets', 'words');
fs.mkdirSync(outputDir, { recursive: true });

const allowedPartsOfSpeech = new Set(['noun', 'verb', 'adjective', 'adverb']);
const excludedLabels = /archaic|obsolete|rare|dialect|regional|vulgar|offensive|slang|technical|medical|scientific|legal|mathematical|derogatory/i;
const anagramExcludedWords = new Set(['belgian', 'bengali', 'geneva', 'herpes', 'marian', 'marina', 'medina', 'retard', 'siemens']);
const maxDefinitionLength = 220;
const minFrequency = 3.5;
const maxFrequency = 4.2;

if (!fs.existsSync(wordsetDataDir)) throw new Error(`Wordset data not found: ${wordsetDataDir}`);

const rawEntries = [];
for (const fileName of fs.readdirSync(wordsetDataDir).filter((name) => name.endsWith('.json'))) {
  const fileEntries = Object.values(JSON.parse(fs.readFileSync(path.join(wordsetDataDir, fileName), 'utf8')));
  rawEntries.push(...fileEntries);
}

function hasExcludedLabel(labels = []) {
  return labels.some((label) => excludedLabels.test(label.name || ''));
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

const candidates = new Map();
for (const entry of rawEntries) {
  const word = String(entry.word || '').toLowerCase();
  if (!/^[a-z]{5,15}$/.test(word) || hasExcludedLabel(entry.labels)) continue;

  for (const meaning of entry.meanings || []) {
    if (!allowedPartsOfSpeech.has(meaning.speech_part) || hasExcludedLabel(meaning.labels)) continue;
    const definition = cleanText(meaning.def);
    if (definition.length < 8 || definition.length > maxDefinitionLength || /[()[\]]/.test(definition)) continue;
    const example = cleanText(meaning.example);
    const candidate = {
      word,
      partOfSpeech: meaning.speech_part,
      definition,
      ...(example ? { example } : {})
    };
    const score = (example ? 3 : 0) + (definition.length <= 150 ? 1 : 0) - (meaning.labels?.length || 0);
    const existing = candidates.get(word);
    if (!existing || score > existing.score) candidates.set(word, { ...candidate, score });
  }
}

const frequencyScript = "import sys,json; from wordfreq import zipf_frequency; print(json.dumps([zipf_frequency(word, 'en') for word in json.load(sys.stdin)]))";
const frequencyResult = spawnSync(process.env.PYTHON || 'python', ['-c', frequencyScript], {
  input: JSON.stringify([...candidates.keys()]),
  encoding: 'utf8'
});
if (frequencyResult.status !== 0) throw new Error(`wordfreq is required to build dictionary assets. Install it with: python -m pip install wordfreq\n${frequencyResult.stderr}`);
const frequencies = JSON.parse(frequencyResult.stdout);
function frequencyBand(frequency) {
  if (frequency >= 4.1) return 'common';
  if (frequency >= 3.8) return 'medium';
  return 'less-common';
}

const scoredCandidates = [...candidates.values()]
  .map((entry, index) => ({ ...entry, frequency: frequencies[index] }));

const dictionary = scoredCandidates
  .filter((entry) => entry.frequency >= minFrequency && entry.frequency < maxFrequency)
  .sort((a, b) => a.word.localeCompare(b.word))
  .map(({ score, frequency, ...entry }) => ({ ...entry, frequencyBand: frequencyBand(frequency) }));

if (dictionary.length < 4000) throw new Error(`Unexpected dictionary size: ${dictionary.length} entries`);

fs.writeFileSync(path.join(outputDir, 'dictionary.js'), `const words = ${JSON.stringify(dictionary)};\nexport default words;\n`);

const anagramWords = scoredCandidates.filter((entry) => entry.frequency >= 3 && entry.frequency < 5.8 && !anagramExcludedWords.has(entry.word));
const anagramGroups = [...anagramWords.reduce((groups, entry) => {
  if (entry.word.length < 5 || entry.word.length > 12) return groups;
  const signature = [...entry.word].sort().join('');
  if (!groups.has(signature)) groups.set(signature, []);
  groups.get(signature).push(entry);
  return groups;
}, new Map()).values()]
  .filter((group) => group.length >= 2)
  .map((group) => group.map(({ word, definition, example }) => ({ word, definition, ...(example ? { example } : {}) })));

if (anagramGroups.length < 50) throw new Error(`Unexpected anagram group count: ${anagramGroups.length}`);
fs.writeFileSync(path.join(outputDir, 'anagrams.js'), `const anagramGroups = ${JSON.stringify(anagramGroups)};\nexport default anagramGroups;\n`);
const playableSignatures = new Set(anagramGroups.map((group) => [...group[0].word].sort().join('')));
const acceptedAnagramWords = scoredCandidates.filter((entry) => {
  if (entry.frequency < 3 || entry.frequency >= 5.8 || !Number.isFinite(entry.frequency) || anagramExcludedWords.has(entry.word)) return false;
  if (entry.word.length < 5 || entry.word.length > 12) return false;
  return playableSignatures.has([...entry.word].sort().join(''));
});
const acceptedAnagrams = acceptedAnagramWords.reduce((groups, entry) => {
  const signature = [...entry.word].sort().join('');
  if (!groups[signature]) groups[signature] = [];
  groups[signature].push({ word: entry.word, definition: entry.definition, ...(entry.example ? { example: entry.example } : {}) });
  return groups;
}, {});
fs.writeFileSync(path.join(outputDir, 'anagram-answers.js'), `const anagramAnswers = ${JSON.stringify(acceptedAnagrams)};\nexport default anagramAnswers;\n`);
console.log(JSON.stringify({ sourceEntries: rawEntries.length, candidateWords: candidates.size, dictionary: dictionary.length, anagramGroups: anagramGroups.length, anagramWords: anagramGroups.flat().length }));
