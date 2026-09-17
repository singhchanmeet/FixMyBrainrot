# Fix My Brainrot

Fix My Brainrot is a calm, distraction-free place to actively use your brain.

It is a small static website built with plain HTML, CSS, and JavaScript. It has no login, ads, accounts, stored progress, streaks, leaderboards, background music, or unnecessary gamification.

## Activities

- Dictionary — learn a random word and its meaning
- Mental Math — solve untimed arithmetic problems
- Sudoku — play browser-generated puzzles with unique solutions
- Wikipedia — read a short introduction to a random Wikipedia article
- Remember the Pattern — observe and reconstruct a visual pattern
- Five Letters — solve a five-letter Wordle-style word in six guesses

## Run locally

The site does not require a build tool or package installation for normal development. From the project directory, run a local static server:

```text
python -m http.server 4173
```

Then open `http://localhost:4173/` in a browser.

The Wikipedia activity uses Wikipedia's public API at runtime. The other activities run in the browser using bundled assets or generated puzzles.

## Word assets

Dictionary and Five Letters word data are bundled locally. To rebuild them, follow the instructions in [DATA-SOURCES.md](DATA-SOURCES.md) and run:

```text
node scripts/build-word-assets.mjs
```

The bundled word data has its own source and licensing information; it is documented separately from the project license in [DATA-SOURCES.md](DATA-SOURCES.md) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. The project values small, focused changes that preserve the calm interface, fast loading, accessibility, and no-data-storage principles.

## License

The project code and original project content are released under the [MIT License](LICENSE). Third-party data and assets remain subject to their respective licenses; see [DATA-SOURCES.md](DATA-SOURCES.md).
