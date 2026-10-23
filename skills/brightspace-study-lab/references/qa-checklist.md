# QA checklist (run before every publish)

Open the page in a browser (the published artifact, or a local preview) and check each line. Fix, republish, re-check.

## Content
- [ ] Exam facts on the brief match Brightspace exactly (date, time, zone, room per campus, length, format, weight, aids). Missing facts say "not posted yet".
- [ ] Every module/chapter in scope has a notes section; nothing out of scope sneaked in; instructor "omit" lines are shown.
- [ ] Practice weighting matches the posted breakdown (count per chapter).
- [ ] Spot-check 10 random questions: one correct answer, explanation correct, numbers recomputed by running them.
- [ ] Course rules (e.g. base-2 logs, no hashing, midpoint method) are applied in every worked example and answer.
- [ ] Footer states sources and that practice questions are original.

## Formatting
- [ ] Search the rendered text (not the source) for `^`, `_{`, `log_`, `\frac`, `\(`, `$`, `sqrt(`, `>=`, `<=`, `!=`, ` -- `, `—`. None should appear outside code.
- [ ] Code blocks keep indentation, scroll sideways, and weren't touched by math typesetting.
- [ ] Every figure loads (no broken images), has a caption and alt text, opens in the lightbox, zoom and prev/next work.

## Interaction
- [ ] Every tab opens; deep link `#tab` works; reload returns to the last tab.
- [ ] Tab bar: arrows/fades show only when overflowing; drag and wheel scroll work; active tab visible.
- [ ] Notes TOC: highlight follows scrolling; active link stays visible inside the TOC; links land below the sticky header.
- [ ] Answer one question in every quiz, quiz break, T/F set and flashcard deck; score and "reread" links work.
- [ ] Each lab: move every control once; readouts and verdicts update; redraws correctly after toggling dark mode.
- [ ] Study plan: today highlighted; ticks survive reload; "Open" links land on the right section.
- [ ] Countdown shows the right value for the exam's time zone.
- [ ] Pomodoro (if on): start, pause, reload mid-session, finish.

## Layout
- [ ] 375px wide: no horizontal page scroll, 16px gutters, hero and grids stack, tables scroll in their wrapper.
- [ ] 1280px wide: notes two-column with sticky TOC, labs side by side.
- [ ] Dark mode: text contrast fine, figures on white plates, charts readable.
- [ ] Console has no errors.
