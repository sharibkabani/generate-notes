/* All course content lives here. Replace every example value with real content from the course.
   Strings are HTML. Write real math (<sup>, <sub>, .fr fractions); x^2 and log_2 n in strings are converted
   automatically outside code, but proper HTML is preferred. Escape < and & inside code. */
window.SITE = {
  code: 'CP312',                 // brand tag + storage namespace
  title: 'Test 1 Lab',
  storeKey: 'cp312t1',           // optional: change per site so two sites don't share ticks
  tabs: ['brief','plan','notes','labs','practice','cards','formulas'],   // order; tabs with no data are dropped
  tabLabels: { labs: 'Visualizers' },                                    // optional renames
  footer: 'Everything here comes from the course slides, handouts, quizzes and the instructor\'s test announcement. Practice questions are original, written to mirror the test format.',

  exam: {
    name: 'Test 1',
    at: '2026-10-26T11:30:00-04:00',          // ALWAYS with the UTC offset of the exam's location
    eyebrow: 'Algorithm Design &amp; Analysis I · Section A',
    headline: 'Test 1 is <em>Monday, Oct&nbsp;26</em>',
    blurb: 'Covers Modules 1–4. Everything on this page comes from the course slides, handouts and quizzes.',
    facts: [
      ['Time', '11:30 AM – 12:20 PM ET, in class'],
      ['Length', '50 minutes'],
      ['Weight', 'Tests are 24% together'],
      ['Room', 'not posted yet']
    ],
    bring: ['Student ID', 'Pencil'],
    notAllowed: ['Notes', 'Phones'],
    scope: [
      { k: 'Part · T/F', title: 'True / False with justification', text: 'A one-line reason is needed for full marks.', go: 'practice', goLabel: 'Drill T/F' },
      { k: 'Part · Recurrences', title: 'Solve with the Master Theorem', text: 'Read pseudocode → a, b, f(n) → compare y with log_b a.', go: 'labs', goLabel: 'Open the solver' }
    ],
    breakdown: [['Module 2', 6], ['Module 3', 8], ['Module 4', 6]],     // optional: questions per chapter
    breakdownLabel: 'Where the marks come from',
    marking: ['<b>Main idea</b> in plain words.', '<b>Pseudocode</b> at the level of the lectures.', '<b>Correctness</b> argument.', '<b>Running time</b> analysis.'],
    rules: 'Course rules: arrays only, no hashing. <b>log means log base 2.</b>',
    checklist: ['Install LockDown Browser and do a test launch', 'Drill all T/F to 85%+', 'Write one full design answer from scratch']
  },

  /* Study plan: one entry per day. tasks: {t, min, note:'section-id' | go:'tab', tag:'TD'} */
  planRange: 'Oct 19 → Oct 26',
  planIntro: 'A day-by-day route from zero to test-ready. Each task links to what it refers to. Your ticks stay in this browser.',
  plan: [
    { d: '2026-10-22', title: 'Module 2: order notation', focus: 'The language of every T/F question.', tasks: [
      { t: 'Read: order notation', min: 30, note: 'n-order' },
      { t: 'Quiz break 1', min: 10, note: 'qb-1' } ] },
    { d: '2026-10-23', title: 'Recurrences', focus: 'Practise until the Master Theorem is automatic.', tasks: [
      { t: 'Master Theorem solver: 10 recurrences', min: 25, go: 'labs' },
      { t: 'Mock interview', min: 30, tag: 'TD' } ] }
  ],

  /* Notes, in teaching order. {group, id, title, short?, html} or {qb: n} for a quiz break */
  notes: [
    { group: 'Start here', id: 'n-start', title: 'How to use these notes', html: `
      <p>Each section has the same pieces:</p>
      <ul><li><b>The big idea</b> in plain words.</li><li><b>Worked examples</b> in the boxes.</li><li><b>Watch out</b> callouts for mistakes that cost marks.</li><li><b>Check yourself</b> questions you can open.</li><li><b>Quiz breaks</b>: get 80% to move on.</li></ul>
      <p>The <a href="#" data-go="plan">Study plan</a> says which sections to read each day.</p>` },
    { group: 'Module 2', id: 'n-order', title: 'Order notation: O, Ω, Θ', short: 'Order notation', html: `
      <p class="big-idea">We describe running time by its growth rate, ignoring constants. 3n^2 + 5n + 2 "grows like n^2".</p>
      <div class="tw"><table class="t"><tr><th>Notation</th><th>Like</th><th>Meaning</th></tr>
        <tr><td><b>f ∈ O(g)</b></td><td>f ≤ g</td><td>no faster than g</td></tr>
        <tr><td><b>f ∈ Θ(g)</b></td><td>f = g</td><td>same growth</td></tr></table></div>
      <div class="ex"><span class="ex-h">Worked example · triangular loop</span>
<pre class="code"><span class="kw">for</span> i := 1 <span class="kw">to</span> n <span class="kw">do</span>
  <span class="kw">for</span> j := 1 <span class="kw">to</span> i <span class="kw">do</span>
    x := x + A[j]^2   <span class="cm">// code is never typeset</span></pre>
        The inner loop runs i times: <span class="sm"><span class="u">n</span><span class="s">Σ</span><span class="l">i=1</span></span> i = <span class="fr"><span>n(n+1)</span><span>2</span></span> ∈ <b>Θ(n<sup>2</sup>)</b>.</div>
      <div class="callout warn"><b>Watch out:</b> Ω is only a lower bound.</div>
      <figure><div class="plate"><img src="img/example.webp" alt="Growth-rate curves" loading="lazy"></div><figcaption>Growth rates compared. Source: Module 2 slides, p.7</figcaption></figure>
      <details class="cy"><summary>Check yourself: is 2^(n+1) ∈ Θ(2^n)?</summary><p>Yes: 2^(n+1) = 2 · 2^n, a constant factor.</p></details>
      <p class="src">Source: Module 2 slides; Quiz 1.</p>` },
    { qb: 1 }
  ],

  quizBreaks: {
    1: { title: 'Order notation', like: 'Quiz 1 style', covers: 'definitions and growth order', pass: 80,
      reread: [['n-order', 'Order notation']],
      qs: [
        { q: 'If lim f(n)/g(n) = 5, then f(n) ∈ Θ(g(n)).', o: ['True', 'False'], a: 0, keepOrder: true, e: 'Limit test: 0 &lt; L &lt; ∞ gives Θ.' },
        { q: 'Which grows fastest?', o: ['n log n', 'n^2', 'n^2.5', '2^√n'], a: 3, e: 'Compare logs: √n beats 2.5 log n eventually.' }
      ] }
  },

  /* Practice. chapters drive filters, score breakdown and "reread" links (note = section id). */
  chapters: [
    { k: 'm2', name: 'Module 2 · Analysis', note: 'n-order' },
    { k: 'm3', name: 'Module 3 · Recurrences' }
  ],
  drillSize: 15,
  mock: [ { c: 'm2', n: 1 }, { c: 'm3', n: 1 } ],    // mirrors the posted breakdown exactly
  questions: [
    { c: 'm2', q: 'Which of these is NOT in Θ(n^2)?', o: ['3n^2 + 5n', 'n^2 + n log n', 'n^2 log n', '(n + 1)^2'], a: 2,
      e: 'n^2 log n / n^2 = log n → ∞, so it grows faster. The others simplify to n^2 by the max rule.', src: 'Original, Quiz 1 style' },
    { c: 'm3', q: 'T(n) = 2T(n/2) + n solves to:', o: ['Θ(n)', 'Θ(n log n)', 'Θ(n^2)', 'Θ(log n)'], a: 1,
      e: 'a = 2, b = 2, so log_2 2 = 1 = y: the balanced case gives Θ(n log n).', src: 'Quiz 2, Q3' }
  ],

  cards: [
    { c: 'm2', term: 'Θ(g)', def: 'Grows at the same rate as g: both O(g) and Ω(g).' },
    { c: 'm3', term: 'Master Theorem', def: 'For T(n) = aT(n/b) + Θ(n^y): compare y with log_b a.' }
  ],

  formulaNote: 'The real test gives no formula sheet. Learn these.',
  formulas: [
    { group: 'Sums', name: 'Arithmetic series', html: '<span class="sm"><span class="u">n</span><span class="s">Σ</span><span class="l">i=1</span></span> i = <span class="fr"><span>n(n+1)</span><span>2</span></span>', use: 'Nested loops where the inner bound depends on i.' }
  ],

  labsIntro: 'Interactive versions of the procedures the test asks for.',
  pomodoro: true,                 // set false to hide the timer
  pomoTasks: null                 // optional list; defaults to chapter names
};
