# Formatting rules

These are the fixes that had to be asked for on earlier builds. Treat each one as a requirement. The starter in `assets/starter/` already implements the interaction and layout ones; the writing and math ones are on you.

## Writing

- Plain words, short sentences, explained from zero. Define a term the first time it appears, in bold.
- No em dashes (—). Use a colon, a comma, parentheses, or a new sentence. En dashes only for ranges (11:30 AM – 12:20 PM, Ch 4–6).
- Middle dot `·` to join short labels ("Worked example · geometric sums", "Ch 2 · Thinking Like an Economist").
- Course-specific conventions stated once, early, in bold (e.g. "**log means log base 2** unless another base is written").
- Quote the course's own wording for rules and definitions when it matters for marks; paraphrase everything else.
- Every fact about the exam (date, time, room, weight, aids) comes from Brightspace. If it isn't posted, write "not posted yet" rather than guessing.
- Times always include the time zone in the data (`2026-10-26T11:30:00-04:00`), and are displayed in the course's local time with "ET"/"PT" etc.
- Footer: say what the content came from and that practice questions are original.

## Math

Never let raw syntax reach the reader: no `^2`, `log_b`, `\frac`, `$...$`, `sqrt(`, `>=`, `!=`, `*` for multiplication.

- Light math (most courses): write real HTML. `n<sup>2</sup>`, `log<sub>b</sub> a`, `×`, `·`, `≤`, `≥`, `≠`, `≈`, `→`, `∈`, `Θ`, `√n`, `−` (U+2212 minus, not hyphen). Unicode superscripts (², ³, ⁿ) are fine for single characters.
- Fractions: `<span class="fr"><span>n(n+1)</span><span>2</span></span>` (stacked, in the starter CSS). Sums: the `.sm` stacked sigma. Don't write `n(n+1)/2` in teaching text.
- Equation chains: one step per line in an `.eqs` grid with a short reason under each step.
- Strings in JS data (questions, explanations) often contain `x^2` and `log_2 n`; the starter's `mathify()` converts `^` and `log_` in rendered text nodes (skips `pre`, `code`, inputs). Still prefer writing proper HTML in content.
- Heavy math (calculus, stats, matrices, long derivations): use MathJax `tex-svg` **published as a local file** (`tex-svg.js` copied into the artifact's files from the npm package `mathjax@3`), inline `\( \)` and display `\[ \]`. After rendering any dynamic content (question, card, lab readout), call `typeset(el)`; the starter's helper does `MathJax.typesetClear([el])` then `typesetPromise([el])`. Escape backslashes in JS strings (`'\\(\\dfrac{20}{80}\\)'`).
- Numbers: tabular figures (`font-variant-numeric: tabular-nums`) in tables, readouts and scores. Money as `$1,234.50`. Percentages with a space-free `%`.

## Code and pseudocode

- `pre.code` blocks with monospaced font, horizontal scroll (never wrap), `white-space: pre`, keywords in `<span class="kw">`, comments in `<span class="cm">`.
- Use the course's pseudocode style exactly (`:=` assignment, `for i := 1 to n do`, 1-indexed arrays) if that's what the slides use. Don't silently switch to Python.
- Inline code in `<code>` with `white-space: nowrap`. Escape `<` and `&` inside code in data strings.
- Math typesetting must skip code. Never turn `A[i]^2` in a code block into a superscript.

## Figures

- Use the course's real figures (slide diagrams, graphs, tables-as-images) extracted to WebP, not redrawn approximations, whenever a figure exists. Crop to the figure; drop slide chrome, logos and page numbers.
- Every figure has alt text and a caption that says what to notice, plus the source ("Lesson 2, slide 14").
- Figures sit on a white "plate" even in dark mode (slide art assumes a white background).
- Clicking a figure opens the lightbox: enlarged, 2× zoom toggle, previous/next across the figures in the current tab, Esc to close, arrow keys to move. Body scroll locks while open.
- Interactive diagrams (labs) are SVG drawn from theme tokens and redraw when the theme changes.

## Layout and interaction

- Works at phone width: 16px side gutters, no horizontal page scroll, grids collapse to one column (`minmax(0,1fr)` and `min-width:0` on grid children), tables and wide equations scroll inside their own wrapper.
- Safe areas: `viewport-fit=cover`, header sticks below `env(safe-area-inset-top)`, a fixed strip fills the inset.
- **Tab bar**: one row that scrolls horizontally; scrollbar hidden; edge fades and ‹ › arrow buttons appear only when there's more in that direction; mouse-wheel scrolls it sideways; drag-to-scroll with a mouse without triggering clicks; the active tab scrolls into view. Selected tab is obvious (filled pill or highlighter underline).
- Tab state: remembered in storage and in the URL hash (`#notes`), so reload and deep links land on the right tab. Switching tabs scrolls to top.
- Cross-links: any element with `data-go="tab"` switches tab; `data-note="section-id"` opens the notes at that section. Use them from the brief, plan and score screens.
- **Notes TOC**: sticky on wide screens, with its own scroll area (`max-height` + `overflow-y:auto`, `overscroll-behavior:contain`) so long TOCs don't run off-screen; group headers; scroll-spy highlights the section being read and keeps the active link scrolled into view inside the TOC; on narrow screens the TOC becomes static at the top. Clicking a TOC link scrolls with an offset that clears the sticky header (`scroll-margin-top`).
- Reveal patterns: `<details>` for check-yourself and answers. Never show the answer before the user commits.
- Quiz feedback: right answer green, chosen wrong answer red, others dimmed, explanation appears below, Next button. Keyboard: 1–4 or A–D to answer, Enter for next.
- Storage: wrap every `localStorage` call in try/catch, namespace keys with the course code (`cp312.tab`), and make the page work with storage unavailable.
- Dark mode: all colours from tokens; dark values under `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`. `body` has an explicit background.
- Respect `prefers-reduced-motion`.
- Focus rings visible (`:focus-visible`), buttons are `<button>`, tabs use `role="tab"` + `aria-selected`.

## Pomodoro (when included)

Header pill shows mode and time remaining; panel with Focus / Short / Long modes, progress ring, Start/Pause, Reset, Skip, "working on" select listing the course's sections, today's tally per task, settings (lengths, chime, auto-start). Survives reload (stores end time, not a ticking counter). Tab title shows the time while running.
