# Data sources

## Dictionary

The current implementation includes a small curated starter dataset in `assets/words/dictionary.js` so the static site is immediately usable. The planned production dataset is a filtered subset of Princeton WordNet 3.0 containing approximately 10,000–20,000 common headwords and concise definitions.

WordNet licensing and attribution: https://wordnet.princeton.edu/license-and-commercial-use

## Five Letters

The current implementation includes a curated starter list in `assets/words/wordle.js`. The planned production dataset will contain a curated answer list of approximately 2,000–3,000 common five-letter words and a larger accepted-guess list. Candidate source: https://github.com/dwyl/english-words

The activity uses five-letter words and six guesses, but does not use the original Wordle answer list or daily sequence.
