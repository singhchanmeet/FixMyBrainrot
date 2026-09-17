# Data sources

## Dictionary

`assets/words/dictionary.js` is a filtered derivative of the Wordset Dictionary, generated using `scripts/build-word-assets.mjs`.

The full Wordset snapshot is downloaded from:

https://github.com/wordset/wordset-dictionary

The build currently produces:

- 10,531 unique word-definition entries
- lowercase alphabetic single words from 3 to 15 letters
- noun, verb, adjective, and adverb entries only
- one concise meaning per word, preferring meanings with an example sentence
- entries with obsolete, archaic, rare, dialectal, regional, vulgar, offensive, slang, technical, medical, scientific, legal, mathematical, or derogatory labels excluded
- a build-time English frequency threshold using `wordfreq` (Zipf frequency >= 3.4) to reduce obscure entries
- runtime selection weighted toward less-common and medium-frequency words, with a smaller share of very common words

The dictionary page shows the selected definition and example sentence. Entries are internally grouped into less-common (Zipf 3.4–3.99), medium-frequency (4.0–4.69), and common (4.7+) bands. The activity samples those bands at approximately 50%, 35%, and 15%, respectively. The generated asset is bundled locally, so the activity does not need a dictionary API at runtime.

Wordset is licensed under CC BY-SA 4.0. The Wordset repository also incorporates WordNet 3.0 material and includes Princeton University's separate WordNet notice. Both notices are preserved in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). The generated dictionary is a derivative database and remains subject to the applicable attribution and ShareAlike requirements.

The `wordfreq` package is used only during asset generation to rank common vocabulary; its scoring data is not bundled. See its project and data licensing information at https://github.com/rspeer/wordfreq.

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

Install the build-time frequency dependency:

```text
python -m pip install wordfreq
```

Clone or download the Wordset repository so its `data/` directory is available at `.asset-build/wordset-dictionary/data/`, then run:

```text
node scripts/build-word-assets.mjs
```

The build intentionally leaves `assets/words/wordle.js` unchanged. Wordle uses its existing separately documented word corpus and should only be regenerated as an explicit, separate change.
