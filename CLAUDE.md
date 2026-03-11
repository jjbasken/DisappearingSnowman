# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

No build step or server required. Open `index.html` directly in any modern browser.

## Architecture

Three files, no dependencies or frameworks:

- **`index.html`** — Static markup + inline SVG snowman. All snowman parts are `<circle>`, `<polygon>`, `<g>`, etc. with unique IDs and the `meltable` CSS class. The puddle `<ellipse id="puddle">` starts at `rx/ry=0` and grows inline.
- **`style.css`** — `.meltable.melted` drives the disappear animation (`opacity:0; transform:scale(0.05)`) with `transform-box:fill-box` so SVG transforms are relative to each element's own bounding box. The puddle's `rx`/`ry` CSS transition is declared inline on the element in HTML.
- **`game.js`** — All game logic. No modules; functions are global. Key globals: `currentWord`, `guessedLetters` (Set), `wrongGuesses`, `gameOver`, `wordQueue` (shuffled array that refills when empty).

## Snowman Melt Order (9 stages)

`MELT_STAGES` in `game.js` defines which SVG element IDs are hidden at each wrong guess:
hat → scarf → right-arm → left-arm → buttons → nose → eyes → smile → head+middle+base

Adding `.melted` to an element triggers the CSS transition. The puddle `rx` grows with each stage.

## Word List

`WORD_LIST` in `game.js` — Scout Oath, Motto, and Law words. Each entry: `{ word: 'UPPERCASE', hint: '...' }`. Words are Fisher-Yates shuffled into `wordQueue`; all words play before any repeats.

**Known typo:** `'HELFPUL'` on line 13 should be `'HELPFUL'`.
