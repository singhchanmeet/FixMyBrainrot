# Futoshiki implementation plan

This document describes the proposed implementation for a new Futoshiki activity in Fix My Brainrot. It is a plan only; it does not change the current site.

## Product direction

Futoshiki, also called More or Less, is a Latin-square puzzle. The player fills an `N × N` grid with the numbers `1` through `N`; each number must appear once in every row and column, and inequality signs between neighboring cells must also be obeyed.

The activity should follow the existing site conventions:

- Separate page: `futoshiki.html`
- Mobile-first, with the same layout behavior as Sudoku
- No timer, score, streak, achievement, leaderboard, saved progress, or account
- No header/footer or activity number on the game page
- Activity description and “Back to activities” in the same responsive row
- Small information icon with a concise rules modal
- On-screen numeric keypad plus physical keyboard input
- Reset puzzle state on refresh
- Generate the puzzle entirely in the browser
- No external runtime API or puzzle download

## Recommended modes and grid sizes

The initial user-facing control should be one difficulty dropdown, matching the current site’s simple activity design:

| Mode | Grid | Intended character |
|---|---:|---|
| Easy | 4×4 | More given numbers, denser inequalities, shallow deductions |
| Medium | 5×5 | Balanced number of givens and inequalities |
| Hard | 6×6 | Fewer givens, sparser inequalities, longer deduction chains |

This is preferable to exposing separate size and difficulty controls initially. Grid size is itself a strong difficulty signal, and 4×4, 5×5, and 6×6 are widely used practical sizes. The implementation should still keep size and difficulty as separate internal parameters so additional combinations can be added later if testing supports them.

I do not recommend 7×7 or larger for the first version. The grid becomes less comfortable on mobile, the solver’s search space grows quickly, and the larger size would not add enough value to justify the extra visual and computational cost.

## Algorithm choice

We should write a small independent JavaScript implementation rather than bundle a Prolog runtime or copy code from an existing project.

The solver should use:

1. Candidate domains for every cell, initially `{1, ..., N}`.
2. Row and column elimination after every assignment.
3. Inequality propagation, removing values that cannot be smaller or larger than any value remaining in the neighboring cell.
4. MRV (minimum remaining values) to choose the next cell.
5. A degree tie-breaker that prefers the cell participating in more unresolved row, column, and inequality constraints.
6. Backtracking with forward checking.
7. A solution counter capped at two. The generator only needs to distinguish zero, one, and multiple solutions.

This follows the useful ideas documented by the open-source [Galaxeo Futoshiki solver](https://github.com/Galaxeo/futoshiki), which uses backtracking, forward checking, MRV, and degree heuristics. The [clentfort Futoshiki project](https://github.com/clentfort/futoshiki) is also a relevant reference because it provides a solver/generator and demonstrates a browser build using SWI-Prolog WASM. Its runtime is heavier than needed for this site, so it should be treated as a conceptual reference rather than a dependency.

## Puzzle generation

Each puzzle should be generated from a complete valid Latin square and then reduced.

### 1. Generate a complete solution

Use a randomized Latin-square generator with row, column, and symbol permutations. A randomized cyclic base square is fast and guarantees a valid starting square; a backtracking fallback can be used if more varied structures are needed.

The generated solution must be validated independently before clues are created.

### 2. Create candidate inequalities

For every horizontal and vertical pair of neighboring cells:

- Compare the two values in the solution.
- Create `<` or `>` so the sign agrees with the solution.
- Shuffle the candidate signs before selecting them.

Do not place both directions between the same pair. Do not create redundant duplicate constraints.

Inequality chains should be tracked explicitly. Very long chains should be avoided on Easy and used deliberately on Hard, because chains can make a puzzle feel difficult even when the total clue count is high.

### 3. Add optional starting numbers

Starting numbers should be selected from the solution and then tested for uniqueness. They are useful for Easy puzzles and for preventing sparse 4×4 puzzles from feeling arbitrary, but they should not be used as a substitute for valid inequality structure.

### 4. Reduce clues while preserving uniqueness

Start with a generous set of signs and a small set of givens. Repeatedly attempt to remove a sign or given:

- Temporarily remove it.
- Count solutions, stopping as soon as two are found.
- Keep it removed only if exactly one solution remains.

The order of removal should be randomized so repeated puzzles do not converge on one visual pattern.

This is the critical correctness step. Difficulty must never be defined only by clue count; the final puzzle must pass the uniqueness check after every reduction.

## Difficulty scoring

The modes should be generated with target ranges, then validated with a solver-based score. Suggested initial targets:

| Mode | Starting numbers | Inequality density | Additional preference |
|---|---:|---:|---|
| Easy | 20–35% of cells | 65–85% of adjacent pairs | Short chains and low search depth |
| Medium | 10–25% of cells | 45–70% | Balanced propagation |
| Hard | 0–15% of cells | 30–55% | Longer chains and deeper deductions |

These are starting ranges, not guarantees. For each generated candidate, calculate:

- Number of givens
- Number of inequalities
- Longest inequality chain
- Number of propagation rounds before branching
- Backtracking/search nodes required by the solver
- Whether the solution is unique

Reject candidates that are technically unique but trivial, excessively guess-heavy, or too expensive to solve in the browser. A simple first release can use solver metrics rather than a full human-technique simulator, but the generator should be structured so a human-solvability check can be added later.

## User interaction

### Board

- Render the grid with clear outer and region-neutral borders.
- Place horizontal and vertical inequalities in the gaps between cells.
- Keep signs visually distinct from cell borders at mobile sizes.
- Center numbers in cells using layout rules that do not depend on fixed desktop dimensions.
- Keep the board within the panel width; never allow horizontal overflow.

### Entry

- Select a cell, then tap a number on the on-screen keypad.
- Accept physical keyboard digits `1` through `N`.
- Provide a Clear key.
- Prevent editing starting numbers.
- Allow replacing an existing user entry by selecting the cell and entering another number.

### Feedback

Use the same immediate-feedback philosophy as Sudoku:

- A row or column conflict highlights the conflicting cell or cells.
- An inequality violation highlights the involved cells and sign.
- A legal-looking but incorrect value is marked as incorrect using the same restrained visual language as Sudoku.
- Avoid repeated explanatory status messages during normal input.
- When every cell is correct, show a short completion message and offer “New puzzle”.

The “How Futoshiki works” modal should explain only the three essential rules: no repeats in rows, no repeats in columns, and obey every inequality sign.

## File plan

Expected files:

- `futoshiki.html` — page structure, metadata, information dialog, and controls
- `js/futoshiki.js` — generation, solving, interaction, feedback, and reset behavior
- `css/styles.css` — responsive board, inequality placement, keypad, and feedback states
- `js/futoshiki-generator.js` — optional separation for Latin-square generation, clue reduction, and uniqueness checks
- `js/futoshiki-solver.js` — optional separation for CSP propagation, MRV, forward checking, and capped solution counting
- `index.html` — activity card and icon
- `sitemap.xml` — new public page URL
- `robots.txt` and metadata — update only if required by the current project conventions
- `README.md` — document the generator and correctness guarantees if the project currently documents activity internals

The generator and solver can initially live in one module if that keeps the implementation small. Splitting them is preferable once tests exist because the same solver should validate generated puzzles and user input.

## Testing strategy

### Solver tests

- Validate every generated complete Latin square.
- Verify all signs agree with the solution.
- Verify a known valid puzzle returns exactly one solution.
- Verify removing a required clue produces multiple solutions when expected.
- Verify malformed or contradictory puzzles return zero solutions.
- Verify the solution counter stops at two rather than enumerating every solution.

### Generator batch tests

Generate at least 1,000 puzzles per mode in a Node-based test script and check:

- 100% have exactly one solution.
- 100% obey all row, column, and inequality constraints.
- No duplicate puzzle signatures within a test batch unless intentional.
- No unexpected empty or fully prefilled boards.
- Difficulty metrics fall inside the intended ranges.
- Generation time remains acceptable on a normal desktop and a mobile-sized browser viewport.

### Browser tests

Before committing:

- Load the page with no JavaScript errors.
- Confirm Easy defaults to 4×4, Medium to 5×5, and Hard to 6×6.
- Enter values with both the keypad and physical keyboard.
- Verify starting cells cannot be changed.
- Verify row, column, and inequality feedback.
- Complete a puzzle and confirm the completion message and New puzzle action.
- Refresh and confirm a new puzzle is generated without stored progress.
- Test narrow mobile and desktop layouts for overflow, centered numbers, visible inequality signs, and usable keypad spacing.

## Performance and safety limits

- Keep generation entirely synchronous only if measured generation is consistently fast. Otherwise generate after the first paint or use a Web Worker.
- Cap solution counting at two.
- Put a maximum attempt count on clue-removal and candidate-generation loops.
- If a candidate mode repeatedly fails generation, retry with a fresh Latin square rather than freezing the page.
- Add a development-only batch validator so changes to the algorithm cannot silently reduce uniqueness.

## Licensing and attribution

The implementation should be written independently. We may reference algorithms and public explanations, but should not copy source code without checking its license and preserving required notices.

If any external code is eventually reused, record its repository, commit/version, license, and modifications in `DATA-SOURCES.md` and the repository notices. The planned implementation itself needs no puzzle dataset because puzzles are generated in the browser.

## Definition of done

Futoshiki is ready when:

- It is reachable from the landing page and has its own page.
- Easy, Medium, and Hard reliably produce 4×4, 5×5, and 6×6 unique puzzles.
- The solver proves exactly one solution for every displayed puzzle.
- Input works through both keypad and physical keyboard.
- Feedback is immediate, restrained, and consistent with Sudoku.
- The layout is verified on mobile and desktop.
- A repeatable automated batch test covers uniqueness and generation performance.
- The implementation is reviewed for bundle size, accessibility, and license cleanliness.

## Research references

- [Futoshiki — Wikipedia](https://en.wikipedia.org/wiki/Futoshiki)
- [Galaxeo Futoshiki solver](https://github.com/Galaxeo/futoshiki)
- [clentfort Futoshiki solver/generator](https://github.com/clentfort/futoshiki)
- [PuzzIt Futoshiki explanation and generator notes](https://puzzit.app/futoshiki/)
- [ABC Tools Futoshiki generator notes on uniqueness and clue pruning](https://abc.tools/games/futoshiki-generator/guide/)

