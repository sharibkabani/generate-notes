# Brightspace Study Lab — a Claude skill

Paste a Brightspace (D2L / MyLearningSpace) course link into Claude, say what you're studying for, and get an interactive study website built from **all** of the course's content:

- **Exam brief** — date, time, room, format, weight, allowed aids, live countdown, question breakdown, pre-exam checklist
- **Study plan** — day by day from today to the exam, built around your other commitments, ticks saved in your browser
- **Teaching notes** — written for someone starting from zero: big idea, worked examples, "watch out" callouts, check-yourself questions, real figures from the slides, and scored **quiz breaks** (80% to move on, otherwise it tells you what to reread)
- **Interactive labs** for the procedures your course tests (e.g. Master Theorem solver, algorithm visualizers, supply/demand shifter, elasticity calculator)
- **Practice** that mirrors the real exam's format and per-chapter weighting, with every answer explained
- **Flashcards**, **formula sheet**, and a **Pomodoro** timer
- Works on phones, dark mode, figures open in a zoomable lightbox

It was distilled from two real builds (an algorithms test lab and a microeconomics midterm lab) and bakes in every fix that had to be asked for along the way: proper math typesetting (no raw `^2` or `log_b`), code blocks that scroll instead of wrapping, a scrollable tab bar, a sticky notes table of contents that follows your reading, real slide figures instead of redrawn ones, and more. See [`references/formatting-rules.md`](brightspace-study-lab/references/formatting-rules.md).

## Install

**Claude apps (claude.ai / desktop):** download [`dist/brightspace-study-lab.zip`](dist/brightspace-study-lab.zip) and upload it as a custom skill in Claude's settings (skills need to be enabled for your account).

**Claude Code:**

```bash
git clone https://github.com/sharibkabani/generate-notes
cp -r generate-notes/brightspace-study-lab ~/.claude/skills/
```

## Use

1. Make sure Claude can use a browser where you're signed in to Brightspace (Claude in Chrome, or the desktop app's built-in browser).
2. Paste your course link, e.g. `https://mylearningspace.wlu.ca/d2l/home/123456`, and say something like *"make me a study site for the midterm"*.
3. Answer the short intake questions (what it's for, what it covers, which tools you want, anything the plan should work around).
4. Claude reads the whole course (modules, slides, announcements, past quizzes, assignments, outline), tells you what it found, builds the site, checks it on phone and desktop, and publishes it as an artifact you can open anywhere.

Claude never types your password, never starts a quiz attempt, and only reads.

## What's inside

```
brightspace-study-lab/
├── SKILL.md                     # the workflow Claude follows
├── references/
│   ├── brightspace-crawl.md     # reading a whole course: D2L API endpoints, UI fallback, what to capture
│   ├── site-blueprint.md        # tab menu, notes anatomy, labs by subject, practice + plan rules
│   ├── formatting-rules.md      # writing, math, code, figures, layout fixes
│   └── qa-checklist.md          # checks before publishing
├── assets/starter/              # a working site shell: index.html, app.js, data.js, labs.js
└── scripts/extract_figures.py   # crop figures out of slide PDFs/PPTX into WebP
```

Open `assets/starter/index.html` in a browser to see the shell with example content.

## Notes

- Built for Brightspace by D2L, which many universities brand differently (MyLearningSpace, Learn, eConestoga, etc.). Any D2L instance works.
- Your course content stays in your own Claude conversation and your private artifact. Check your institution's rules before sharing a generated site publicly.

## License

MIT
