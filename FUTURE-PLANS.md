# Future plans

This document records ideas discussed for Fix My Brainrot that are not part of the current activity set. It is intentionally a plan, not a promise that every item will be built.

## Product principles

Future activities should continue to be:

- Calm and distraction-free
- Usable without an account, timer, score, streak, leaderboard, or stored progress
- Mobile-first without compromising desktop use
- Lightweight enough to run in the browser
- Clear enough to explain in a short information dialog
- Generated or selected from transparent, documented datasets
- Free from avoidable ambiguity and low-quality generated content

## Possible next activities

### Anagrams

Recommended as the next activity.

Current direction:

- Use a curated, common-word subset rather than the entire dictionary asset
- Prefer words in the 6–10 letter range
- Use word length internally as a difficulty signal if needed
- Avoid user-facing modes initially
- Generate a Fisher–Yates shuffle in the browser
- Reject scrambles that are unchanged, nearly unchanged, simple adjacent transpositions, or that preserve too many original adjacent sequences
- Provide direct typing with a simple correct/incorrect flow
- No timer, score, hints, streaks, or attempt history

The word source and filtering process still need to be finalized. The current WordNet-derived dictionary is not suitable as-is because it contains too many obscure, technical, inflected, and linguistically unusual entries.

### Futoshiki

Recommended after Anagrams.

Current direction:

- Easy: 4×4
- Medium: 5×5
- Hard: 6×6
- Generate a complete Latin square by backtracking
- Add inequality signs that agree with the generated solution
- Remove number clues while retaining exactly one solution
- Use a constraint solver with propagation and capped solution counting
- Prefer puzzles solvable by deduction rather than puzzles requiring speculative guessing
- Use the same immediate feedback philosophy as Sudoku

Difficulty should depend on more than grid size. Inequality density, starting givens, chain length, and the depth of deductions should also be considered.

Useful conceptual references include PuzzIt's documented Latin-square, inequality, and uniqueness-removal approach, and open-source Futoshiki solvers. Any implementation should be written independently and checked for license compatibility.

### Word crossword

Recommended as a later activity, after a quality prototype.

Current direction:

- Start with a fixed 7×7 or 9×9 grid template rather than fully arbitrary grid generation
- Allow entry lengths to vary naturally
- Use a filtered word-definition dataset
- Generate fills with constraint-based backtracking and candidate indexes by length and known letters
- Treat the generated answer set as unique within the bundled candidate pool
- Test a substantial batch of generated puzzles before exposing the activity to users

The main risk is content quality rather than the grid algorithm. A normal crossword needs clues as well as answers, and automatically extracted dictionary definitions can be obscure or ambiguous. A small, curated definition crossword may be preferable to a large, low-quality generator.

### Nonograms

Deferred for later consideration.

Nonograms fit the project's reasoning-oriented design and have clear rules, but they are not part of the immediate implementation plan. They should be considered after the next activities have been tested for performance, clarity, and mobile usability.

## Ideas intentionally not prioritized

### Number sequences

Not prioritized because many sequences can have multiple plausible rules and therefore multiple valid answers.

### Odd one out

Not prioritized because producing thousands of consistently fair, high-quality examples without manual curation would be difficult.

### Simple ciphers

Not prioritized because they combine the ambiguity risk of number sequences with the content-generation and rule-explanation burden of odd-one-out puzzles.

### Logic grids

Not prioritized because they risk becoming text-heavy and interrupting the site's calm, minimal interface.

## Dataset work

The Dictionary activity needs a better candidate dataset or a better filtering pipeline. Options under consideration include:

- A carefully filtered WordNet subset
- Structured English Wiktionary data extracted through Kaikki/Wiktextract
- A Wiktionary-derived open dictionary such as `open-dictionary`
- A frequency-ranked filtering stage, subject to documenting the source and license correctly

The final choice should balance common vocabulary, definition quality, licensing, bundle size, and the project's preference for no runtime dictionary API.

## Current activities

The current activity order on the landing page is:

1. Dictionary
2. Mental Math
3. Sudoku
4. Wikipedia
5. Remember the Pattern
6. Five Letters (Wordle-style)

The existing product principles remain unchanged: no login, no ads, no fancy interface, no music, no streaks or achievements, no leaderboards or comparisons, no unnecessary gamification, and no data stored.
