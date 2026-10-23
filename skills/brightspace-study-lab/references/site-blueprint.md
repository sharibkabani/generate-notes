# Site blueprint

The site is one page with a sticky header and tabs. Each tab is one working surface. Content is real course content; tools are built for this course's tested skills.

## Tab menu

Pick 5 to 8. Order: brief → plan → notes → course-specific tools → practice → reference.

| Tab | Use when | What it holds |
|---|---|---|
| **Brief** | Always | Hero with the exam headline ("Test 1 is *Monday, Oct 26*"), live countdown, facts list (time, length, room per campus, format, weight, aids, lockdown browser), "What's on it" cards (each links to the tab that drills it), how answers are marked, bring / not-allowed chips, a pre-exam checklist with saved ticks, question-breakdown bars if posted. |
| **Study plan** | Exam is 2+ days away | Day-by-day route from today to exam day. See "Study plan rules". |
| **Notes** | Always | Teaching notes written for someone starting from zero, grouped by module, sticky TOC with scroll-spy, quiz breaks between chunks. See "Teaching notes". |
| **Course notes** | Course has instructor-written lesson notes | A page-by-page mirror of the instructor's notes (rail of lessons, pages in order), with the activities and reveal-answers. Separate from the teaching notes. |
| **Chapter summaries** | Textbook-chapter courses | One panel per chapter: definitions, tables, real figures, tips, "omit" lines, question count per chapter in the rail. |
| **Labs / Visualizers** | Course has procedures or diagrams | 3 to 6 interactive tools (see "Labs by subject"). |
| **Practice** | Always | Quiz engine: chapter filter, exam-weighted mock, every answer explained, score screen with per-topic breakdown and "reread" links. |
| **True / False** | Exam has T/F with justification | Card drill with filters by module, one-line justification after each answer, progress bar, score. |
| **Design / written practice** | Exam has written or design questions | Expandable problems with steps revealed one at a time (idea → pseudocode/working → correctness → running time), hint, a textarea to draft an answer before revealing. |
| **Flashcards** | Lots of definitions | Flip cards (term front, definition back), shuffle, filter by chapter, keyboard (space flips, arrows move). |
| **Formula sheet** | Quantitative courses | Every formula once, typeset, with when-to-use and a tiny example. Note whether the real exam provides a sheet. |

The header also holds: brand tag (course code), the tab bar, a mini countdown, and the Pomodoro pill if Pomodoro is on.

## Teaching notes

Assume the reader is starting from zero unless the user said "review only". Each section is an `<article>` with:

- **Eyebrow** (module) and **h2** title.
- **The big idea**: one or two plain sentences in a left-ruled block.
- Explanation in short paragraphs and lists, in the order the course teaches it.
- **Worked examples** in shaded `.ex` boxes, titled "Worked example · <what>", showing every step.
- **Watch out** callouts (red) for mistakes that cost marks, especially ones the instructor or past feedback flagged.
- **Check yourself** `<details>` questions with the answer inside. Two or three per section.
- Real slide figures with captions, clickable to enlarge.
- A source line in muted small text when a fact is course-specific ("Quiz 2, Q5", "A1 feedback").

Open with a "Start here" group: "How to use these notes" (explains the pieces above and links to the plan) and, when the course needs it, a prerequisites toolkit (e.g. logs/exponents/sums for algorithms; percentages and slopes for economics). End with a "Test skills" group: how answers are marked, how to write a full answer, how to justify T/F.

### Quiz breaks

After every 2 to 4 sections, insert a quiz break: 5 to 8 questions in the style of the course's real quizzes ("Quiz 1 style"), covering only what came before. Show score; at 80%+ say "move on"; below 80% list the specific sections to reread as links. Save best score per break. Mark breaks in the TOC with a distinct style.

## Labs by subject (ideas)

Pick the procedures students are tested on, and make the tool show the *mechanism*, not just an answer.

- **Algorithms**: Master Theorem solver (inputs a, b, f(n) = n^y log^k n; shows log_b a vs y, the case, the answer, and per-level work bars of the recursion tree); pseudocode → recurrence drill; step-through visualizers for binary search (with the predicate row T/F), two-pointer 2SUM, merge-and-count inversions, max-subarray; loop-counting drill.
- **Economics**: supply/demand shifter (drag shifts, see new equilibrium and surplus areas), elasticity calculator with the midpoint method and total-revenue verdict, price ceiling/floor with shortage/surplus, tax wedge with incidence and deadweight loss, PPF explorer with opportunity cost, comparative advantage table solver.
- **Networks**: subnet/CIDR calculator, TCP congestion window step-through, Dijkstra / distance-vector table builder, delay calculator (prop/trans/queue), checksum and CRC worked step by step, sliding-window animation.
- **Math / stats**: function plotter with sliders, distribution explorer with shaded probability, matrix row-reduction stepper, proof-step ordering drill.
- **Sciences**: unit-conversion drill, equation balancer, labelled diagram quizzes using the course's own figures.
- **Humanities / memory-heavy**: timeline, term ↔ definition matching, quote-to-source matching, essay outline builder from the course's themes.

Each lab: a short "what this shows" line, controls on one side, the visual on the other (stacked on phones), a readout grid, and a verdict chip. Redraw on theme change so colours stay right in dark mode.

## Practice rules

- Mirror the real format: same question types, same option count, same style of stem. Label original questions as original (footer) and cite real ones ("Quiz 2, Q5").
- If a per-chapter breakdown is posted, the mock exam uses those counts exactly and the brief shows the bars.
- Every option set has one defensible answer. Every question has an explanation that says why the right answer is right *and* why the tempting wrong one is wrong.
- Shuffle option order per attempt, but keep "All of the above" style options last.
- Score screen: total, per-topic bars, and links back to the notes section for weak topics. Save attempts per browser.
- Sizes that worked: 80 to 150 practice questions, 30 to 60 T/F, 6 to 12 design problems, 40 to 120 flashcards. Quality beats count.

## Study plan rules

- One card per day from today to exam day, each with a title, a one-line focus, and 3 to 6 tasks with minutes and a link ("Open") into the exact notes section or tool.
- Respect what the user said they must work around (interviews, shifts, other exams, assignment due dates); tag those tasks and give them their own colour. Light days around them.
- Front-load the material with the most exam weight. Put a full mock exam two days out and a light review the day before.
- Highlight today. Ticks persist in the browser; show overall progress.
- Exam day card: logistics only (what to bring, arrive time, lockdown browser test).

## Visual identity

Give each site an identity that fits the subject: e.g. "lab notebook" (graph-paper panels, highlighter marks) for algorithms; "graph-paper study desk" with demand/supply colours for economics. Choose a display font, a body font and a mono font from Google Fonts; define every colour as a token on `:root`, with dark-mode values. Use the subject's own colour semantics (demand blue, supply green, shifts red). Write a one-line `/* Layout: ... */` comment at the top of the CSS stating the concept, and follow it.
