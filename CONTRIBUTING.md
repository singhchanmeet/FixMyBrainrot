# Contributing to Fix My Brainrot

Thank you for taking the time to contribute.

## Before you start

Please check existing issues and pull requests before starting a larger change. For a new activity or a significant design change, open an issue first so the scope can be discussed.

## Local development

1. Clone the repository.
2. Start a static server from the project directory:

   ```text
   python -m http.server 4173
   ```

3. Open `http://localhost:4173/`.
4. Test the affected page on a narrow mobile viewport and a desktop viewport.

There is no framework or package manager required for normal development.

## Project principles

Contributions should preserve the following:

- No login, ads, accounts, or stored user progress
- No unnecessary tracking or third-party dependencies
- Calm, light, and distraction-free presentation
- Fast loading and mobile-first responsiveness
- Keyboard access and clear accessible labels
- Simple, focused activities without forced competition or retention mechanics

## Pull requests

Keep pull requests focused and describe:

- What changed and why
- Which pages or activities are affected
- How the change was tested
- Any new external data source or license

Before submitting, check that:

- The affected pages load through a local server
- Links and buttons work
- Mobile and desktop layouts remain usable
- `git diff --check` reports no whitespace errors
- New word data or external assets are documented in `DATA-SOURCES.md`

Use a short commit message in the imperative style, such as `fix: improve mobile Sudoku layout` or `feat: add pattern activity guidance`.
