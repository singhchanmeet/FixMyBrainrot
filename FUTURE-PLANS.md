# Future plans

This document records activities and ideas discussed for Fix My Brainrot. Completed activities are listed separately from ideas that remain future possibilities; inclusion is not a promise that every item will be built.

## Product principles

Future activities should continue to be:

- Calm and distraction-free
- Usable without an account, timer, score, streak, leaderboard, or stored progress
- Mobile-first without compromising desktop use
- Lightweight enough to run in the browser
- Clear enough to explain in a short information dialog
- Generated or selected from transparent, documented datasets
- Free from avoidable ambiguity and low-quality generated content

## Implemented activities

### Anagrams

Implemented as **Unscramble**.

The activity uses a curated subset from the bundled dictionary data, including definitions and examples. It accepts five-letter words and longer words, uses difficulty modes, and filters for unique, unambiguous anagram groups. Scrambles are generated in the browser and avoid unchanged or overly similar letter arrangements. No timer, score, hints, streak, or attempt history is used.

### Futoshiki

Implemented with browser-generated puzzles and unique-solution validation. Difficulty uses 4×4, 5×5, and 6×6 grids. Inequality symbols are oriented to match the direction of comparison, and entries receive immediate feedback.

## Possible future activities

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

The Dictionary activity now uses bundled Wordset data, with filtering and attribution documented in [DATA-SOURCES.md](DATA-SOURCES.md) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Future dataset changes should preserve useful definitions and examples, maintain acceptable bundle and load times, and respect the source license.

## Current activities

The current activity order on the landing page is:

1. Dictionary
2. Mental Math
3. Sudoku
4. Unscramble
5. Wikipedia
6. Remember the Pattern
7. Five Letters (Wordle-style)
8. Futoshiki

The existing product principles remain unchanged: no login, no ads, no fancy interface, no music, no streaks or achievements, no leaderboards or comparisons, no unnecessary gamification, and no data stored.
