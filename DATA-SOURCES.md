# Data sources

## Dictionary

`assets/words/dictionary.js` is generated from the WordNet 3.0 database using `scripts/build-word-assets.mjs`.

- 77,034 unique word-definition entries
- Definitions are derived from WordNet noun, verb, adjective, and adverb glosses
- One concise definition is retained for each word
- WordNet source: https://wordnetcode.princeton.edu/3.0/WordNet-3.0.tar.gz
- License and attribution: https://wordnet.princeton.edu/license-and-commercial-use

## Five Letters

`assets/words/wordle.js` is generated from the alphabetic English word corpus at:

https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt

The generated asset contains:

- 15,921 accepted five-letter guesses
- 4,635 five-letter answers that also appear as WordNet headwords
- Only lowercase alphabetic five-letter words
- No original Wordle answer list or daily sequence

The source corpus is distributed by the `dwyl/english-words` project under its published Unlicense terms. The generated files are bundled locally so the activities do not need a word-list API at runtime.

## Rebuilding the assets

Download the two source files described above, place them under `.asset-build/`, extract WordNet 3.0 to `.asset-build/WordNet-3.0/`, then run:

```text
node scripts/build-word-assets.mjs
```
