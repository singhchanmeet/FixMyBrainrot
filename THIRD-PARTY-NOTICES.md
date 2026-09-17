# Third-party data notices

The Fix My Brainrot code and original content are released under the MIT License. The bundled word data is third-party material and is subject to the notices below.

## Wordset Dictionary

The Dictionary activity uses a filtered derivative of the [Wordset Dictionary](https://github.com/wordset/wordset-dictionary).

Wordset is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/). The source project was a collaborative dictionary and reports that its data began with WordNet and was subsequently modified by contributors.

The bundled file is not the complete Wordset release. It is a generated subset with filtering, normalization, one selected meaning per word, and example sentences retained where available. Source and transformation details are documented in [DATA-SOURCES.md](DATA-SOURCES.md).

## Princeton WordNet

The Wordset release includes material from [WordNet 3.0](https://wordnet.princeton.edu/). Princeton University's notice is reproduced in the [Wordset licence file](https://raw.githubusercontent.com/wordset/wordset-dictionary/master/LICENSE) and applies to the incorporated WordNet material. The relevant copyright and permission notice must remain with copies and modifications of that material.

## Wordle word corpus

The existing Five Letters activity uses a generated asset based on [dwyl/english-words](https://github.com/dwyl/english-words). Its source and licence information are documented in [DATA-SOURCES.md](DATA-SOURCES.md). This change does not regenerate or otherwise alter that asset.

## Build-time frequency ranking

The build uses the [`wordfreq`](https://github.com/rspeer/wordfreq) Python package to prefer common English words. It is a build-time dependency only; its frequency tables are not shipped to website visitors.
