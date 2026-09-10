import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const buildDir = path.join(root, '.asset-build');
const wordFile = path.join(buildDir, 'words_alpha.txt');
const wordNetDir = path.join(buildDir, 'WordNet-3.0', 'dict');
const outputDir = path.join(root, 'assets', 'words');
fs.mkdirSync(outputDir, { recursive: true });

const partOfSpeech = { noun: 'noun', verb: 'verb', adj: 'adjective', adv: 'adverb' };
const definitions = new Map();

for (const [filePart, label] of Object.entries(partOfSpeech)) {
  const file = path.join(wordNetDir, `data.${filePart}`);
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('  ')) continue;
    const [raw, rawGloss = ''] = line.split(' | ');
    const fields = raw.trim().split(/\s+/);
    const count = parseInt(fields[3], 16);
    if (!count) continue;
    const gloss = rawGloss.split(';')[0].replace(/\s+/g, ' ').trim();
    if (!gloss) continue;
    for (let i = 0; i < count; i++) {
      const word = fields[4 + i * 2].replaceAll('_', ' ').toLowerCase();
      if (!/^[a-z]+$/.test(word) || word.length < 3) continue;
      const existing = definitions.get(word);
      if (!existing || gloss.length < existing.definition.length) definitions.set(word, { word, partOfSpeech: label, definition: gloss.slice(0, 220) });
    }
  }
}

const allFiveLetterWords = fs.readFileSync(wordFile, 'utf8').split(/\r?\n/).map(word => word.trim().toLowerCase()).filter(word => /^[a-z]{5}$/.test(word));
const guesses = [...new Set(allFiveLetterWords)].sort();
const wordNetWords = new Set(definitions.keys());
const answers = guesses.filter(word => wordNetWords.has(word));

if (guesses.length < 10000 || answers.length < 1000 || definitions.size < 10000) throw new Error(`Unexpected asset size: ${guesses.length} guesses, ${answers.length} answers, ${definitions.size} definitions`);

const dictionary = [...definitions.values()].sort((a, b) => a.word.localeCompare(b.word));
fs.writeFileSync(path.join(outputDir, 'wordle.js'), `const answers = ${JSON.stringify(answers)};\nconst guesses = new Set(${JSON.stringify(guesses)});\nexport { answers, guesses };\n`);
fs.writeFileSync(path.join(outputDir, 'dictionary.js'), `const words = ${JSON.stringify(dictionary)};\nexport default words;\n`);
console.log(JSON.stringify({ dictionary: dictionary.length, guesses: guesses.length, answers: answers.length }));
