---
name: brightspace-study-lab
description: Turn a Brightspace (D2L / MyLearningSpace) course link into an interactive study website for an exam, test or quiz. Use when someone pastes a Brightspace or d2l link, or asks for a study site, study guide, exam lab or review page built from their course content.
---

# Brightspace Study Lab

Paste a Brightspace course link, answer a few questions, get a full study website: an exam brief, teaching notes written for someone starting from zero, real figures from the slides, practice that mirrors the real assessment, interactive tools for the course's core skills, and a day-by-day plan. Every claim on the page comes from the course itself.

Two reference builds shaped every rule here: an algorithms test lab (CP312) and a microeconomics midterm lab (EC120). The rules below are the fixes and preferences collected while building them. Follow them by default; the user's answers override them.

## Workflow

Work through these in order. Keep a task list; the last task is always the QA pass.

### 1. Intake (ask before crawling)

Ask with one AskUserQuestion call (up to 4 questions), then a short follow-up in plain text only if something is still missing. Ask:

1. **What is the site for?** The assessment (midterm, Test 1, final, weekly quiz, "just keep up with the course") and its date/time if known.
2. **What should it cover?** Modules, weeks, chapters or lessons. Offer "work it out from the course page" as the first option: announcements and the outline usually say.
3. **Which tools do they want?** Multi-select from the menu in `references/site-blueprint.md` (notes, course-notes mirror, practice, quiz breaks, flashcards, formula sheet, interactive labs, study plan, Pomodoro). Default: all that fit the course.
4. **Starting point and schedule.** "Starting from zero" vs "review only", and anything the study plan must work around (other exams, interviews, shifts, assignment due dates).

If the user already answered any of these in their message, don't ask again. If nobody is there to answer, take the most reasonable reading, say which one at the top of your work, and continue.

### 2. Crawl the whole course

Read `references/brightspace-crawl.md` and follow it. Short version:

- Use a browser where the user is already signed in (their preferred browser; load its skill first). Never type their password; if signed out, ask them to sign in and say "done".
- Prefer the Brightspace REST API through `fetch` in the signed-in tab (content table of contents, announcements, quizzes, dropbox, calendar). Fall back to clicking through Content when the API is blocked.
- Read **everything** in scope, not a sample: every module and sub-module, every topic page, slide deck, PDF, handout, announcement, quiz (including past quizzes and prequizzes the user can see), assignment and solution, plus the outline / syllabus for weights and course rules.
- Save extracted text and files into the workspace (`course/` folder, one file per topic) so the build works from files, not memory.
- Record a **source map**: which file each fact came from. You'll cite these on the page ("Quiz 2, Q5", "Lesson 3 notes p.12").

Then tell the user in 3 to 5 lines what you found (exam facts, scope, how much material, anything missing) before building. Flag gaps instead of guessing (e.g. "room isn't posted yet").

### 3. Plan the site

Read `references/site-blueprint.md`. Decide:

- The tab list (5 to 8 tabs). Brief first, then plan, notes, the course-specific tools, practice.
- The **interactive labs** this specific course needs. Pick the 3 to 6 procedures students are tested on and make each one something they can poke at (e.g. a Master Theorem calculator with a recursion-tree bar chart, step-through algorithm visualizers, supply/demand shifter, elasticity calculator, tax-wedge diagram, subnet calculator, truth-table builder). These are the parts that made the reference builds worth using.
- The practice bank size and weighting. If the exam has a per-chapter breakdown, mirror it exactly.
- A visual identity that fits the subject (see blueprint). Don't reuse the reference palettes verbatim.

### 4. Build

- Load the `artifact-design` skill (and `artifact-capabilities` only if you need runtime capabilities) before writing the page.
- Start from `assets/starter/` (index.html, app.js, data.js, styles in index.html). It already contains the fixes listed in `references/formatting-rules.md`: scrollable tab bar with arrows and drag, sticky TOC with scroll-spy, quiz engine with explanations, quiz breaks with an 80% gate, flashcards, figure lightbox, Pomodoro, countdown, study plan with saved ticks, math typesetting, dark mode, safe-area handling, wrapped storage. Copy it into the working directory and fill it; restyle it to the course's identity.
- Write the content into `data.js` (notes, questions, cards, plan, figures) and course-specific labs into `labs.js`. Keep `index.html` as the shell.
- Extract real figures from the slides with `scripts/extract_figures.py` (crops embedded images and vector diagrams to `img/*.webp`). Use them in notes with captions; don't redraw a figure that exists.
- Build long content in stages: outline the notes TOC first, then write each section.
- Read `references/formatting-rules.md` before writing any content. It is the list of everything the user had to ask to fix last time.

### 5. Publish

Publish as a multi-file artifact: `index.html` as the page, everything else through `files` (`app.js`, `data.js`, `labs.js`, `img/*.webp`, and `tex-svg.js` if MathJax is used). Give it a short title like "CP312 Test 1 Lab" and a fitting icon. If the user is revising an earlier site, update the same artifact URL rather than making a new one.

### 6. QA (always)

Run `references/qa-checklist.md`. At minimum: open every tab at phone width and desktop width, answer one question in every quiz, check figures load, check no raw `^`, `_`, `\frac` or `$` leaked into rendered text, check dark mode, check the countdown's time zone. Fix what fails, republish, then reply.

### 7. Reply

One or two sentences on what the site has, one line on anything missing from Brightspace, and the natural next step (e.g. "after Quiz 3 is posted, ask me to add it"). Don't recap the steps.

## Files in this skill

- `references/brightspace-crawl.md` — how to read a whole Brightspace course (API endpoints, fallbacks, what to capture).
- `references/site-blueprint.md` — tab menu, page anatomy, labs ideas by subject, practice rules, study-plan rules.
- `references/formatting-rules.md` — writing style, math, code, figures, layout and interaction fixes. Read before writing content.
- `references/qa-checklist.md` — the pre-publish checks.
- `assets/starter/` — working shell (index.html, app.js, data.js) to copy and fill.
- `scripts/extract_figures.py` — pull slide figures out of PDFs/PPTX as cropped WebP.
