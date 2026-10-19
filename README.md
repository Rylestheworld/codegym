# CodeGym

**Testing prototype:** lessons and quiz answers have not received a complete independent content audit. Automated checks verify application behavior and authored expectations; scores do not certify proficiency.

Learn the concepts, practice the skills, and strengthen your ability to understand, debug, and write code. The navigation follows **Learning Library → Quick Reps → Training Grounds**, with **Learn → Practice → Training Grounds** tabs.

## Start Locally

Serve the folder over HTTP so browser workers and the bundled Python runtime can load:

```sh
cd codegym
python3 -m http.server 8765 --bind 127.0.0.1
```

Open [CodeGym](http://127.0.0.1:8765). No account or API key is needed. App assets and the Python runtime are bundled locally; external reference links need internet access. Directly opening index.html supports the reading/quiz interface in compatible browsers, but written execution requires HTTP.

## Learn

23 introductions explain purpose, key concepts, worked examples, common mistakes, and an exercise. Each topic also has five tier lessons: Beginner, Intermediate, Proficient, Advanced, and Expert. These 115 lessons explain the five tested concepts, include a separate worked transfer example, and offer a practice task with saved notes. JavaScript and Python tiers link to executable written exercises. Reading is tracked separately and awards no practice or retention credit.

Topics: JavaScript, Python, C, C++, Rust, Java, VHDL, Bash, SQL, Assembly, Git, Docker, Terraform, Kubernetes, Ansible, Podman, Node.js, HTML, KQL, Swift, Kotlin, Go, and R.

## Practice

- **Quick Reps:** 575 questions, 25 per topic, five per tier. Fill blanks, predict behavior, or diagnose bugs. Two correct unaided answers complete practice for a question; completing a tier unlocks the next. Earned unlocks stay open after later misses. Hints reduce XP; incorrect or revealed answers enter review.
- **Write It Yourself:** 14 JavaScript/Python function and repair exercises across all five tiers. Write code, run authored tests, inspect failures, and explain why it works. Proficient and higher tasks require a saved explanation before completion; its correctness is self-reviewed. Revealing a solution marks the exercise assisted and earns no completion XP. Completion XP is awarded once.
- **Placement:** up to ten questions per topic suggest a starting tier, stopping when a tier exposes a gap. Missed concepts enter review. Placement earns no practice or retention credit; skipped tiers receive delayed checks.
- **Due Reviews:** tier practice schedules a first retention check in three days. Each check includes an independent transfer example and two rotating tier questions. All three must be correct and confident without help. The next intervals are seven, 21, then 30 days. Two successful scheduled checks earn **Retained**. An incorrect, uncertain, or assisted check schedules a retry tomorrow and resets retention while preserving practice and unlocks. This schedule is a starting design choice, not a universal optimum.

Written JavaScript and Python run in disposable browser workers, never on the HTTP server. Each submission receives a fresh worker; execution has a three-second deadline after initialization, with up to 45 seconds to load the Python runtime. Python uses bundled Pyodide 314.0.7 / CPython 3.14.2. A sandboxed opaque-origin frame creates each worker; its CSP blocks HTTP/WebSocket access and the worker cannot access app storage. Execution deadlines do not impose a hard memory quota, and local test results are not trusted competitive credentials. See SECURITY.md for controls and limitations. Authored tests accept equivalent implementations that satisfy the tested requirements, rather than comparing submitted source with a reference string.

## Training Grounds

Seven paths group related topics. Paths share topic progress and restrict focused rounds to their topics. Three connected fictional missions add evidence, guided steps, and a saved debrief:

- **The Unreachable Audit Service:** follow a Bash health check, Docker port mapping, and Kubernetes Service YAML.
- **The Suspicious Login Trail:** investigate supplied login rows with a small local KQL evaluator and a tested Python function.
- **Recover the Hidden Function:** trace an x86-64 assembly listing and reconstruct its behavior in JavaScript.

Mission completion requires every step plus an explanation compared with the debrief guide. Explanations are self-reviewed, not automatically judged. The KQL runner supports the documented Logins/where/and/count subset, including equivalent filter order, rather than a full Kusto engine. Mission completion XP is awarded once.

## Progress and Grading

Progress, drafts, lesson notes, missions, review dates, and daily streaks stay in browser storage. Export/import JSON for backups or moving browsers; importing replaces history. Version-1 progress migrates to version 2 as practice history and preserves XP/unlocks, without granting retention. Keep the same browser origin to retain local storage. Export before clearing browser data or moving the site.

Blank grading preserves token boundaries, meaningful quoted whitespace, and language-specific casing. It rejects `le t` for `let` and accepts explicitly reviewed aliases. It is not a general proof of equivalent code. Use **Report an Ambiguous Question** after feedback to save a concern locally; reports are included in progress exports and are not sent anywhere. See CONTENT_REVIEW.md for corrections, dialect assumptions, and the limits of content verification.

## Structure and Verification

Question banks live in questions.js, curriculum.js, and extra-topics.js; content-quality.js applies reviewed corrections while preserving question IDs. Introductions use lessons.js, lesson-tools.js, and lesson-modern.js. Tier lessons use tier-lessons.js and transfer-data.js. Written exercises use writing-data.js, code-runner.js, and code-worker.js. Missions use missions-data.js. learning-engine.js contains grading/retention rules; features.js renders the added flows. Keep IDs stable when editing content.

```sh
node verify-bank.cjs
node tests/learning-engine.cjs
```

The browser suite runs all written reference solutions, incorrect implementations and infinite loops, all 115 tier lessons, placement, simulated delayed reviews, all missions, saved-progress migration/import, and mobile layouts. With Playwright and Chrome available and the server running:

```sh
node tests/browser-learning.cjs
node tests/browser-curriculum.cjs
```

Set CODEGYM_TEST_URL or CODEGYM_CHROME to override the server/browser paths. These checks verify behavior and authored expectations; they do not independently certify every educational answer. Brand assets and the three logo variants are under assets/brand/, with a preview in brand.html. Runtime provenance and licenses are under assets/pyodide/.

## Public Testing and Feedback

This repository is prepared for public GitHub Pages hosting. Visitors need only a browser. Progress and code drafts remain in their browser; in-app ambiguity reports are saved locally and can be shared through a progress export. File a repository issue with the topic, tier, question title, expected behavior, and reproduction steps. Review any progress export before posting it publicly because it contains your notes and drafts.

The Pages workflow checks the curriculum metadata and learning rules, builds an explicit application-only directory with `python3 scripts/build_site.py`, and publishes that directory. Local distribution files, Cloudflare account details, credentials, and screenshots are excluded from version control and deployment. Select GitHub Actions as the Pages source in repository settings.

Source visibility does not imply a blanket open-source license. Third-party runtime licenses are retained under assets/pyodide/.

## Proving Grounds and Personal Achievements

Training Grounds now includes six personal milestone badges and three original advanced missions: Repair the Event Ledger (JavaScript), Diagnose the Quiet Outage (a JavaScript deployment simulation), and Investigate the Retry Window (Python with a self-reviewed KQL investigation plan). Missions are available immediately; readiness recommendations use unlocked topic tiers, including provisional placement.

Tests cover duplicates, boundary conditions, correlation, and input preservation. Each mission requires passing tests on the current draft, an 80-character debrief, and self-review. Debrief correctness is not automatically graded. Estimated durations are uncalibrated planning estimates. The deployment mission does not execute Bash, Docker, or Kubernetes; the cyber mission does not execute KQL. These are initial Proving Grounds challenges, not certifications or a complete expert curriculum.

Hints, reference solutions, and declared outside assistance mark the attempt assisted across reloads. First completion records are preserved; replaying earns no extra XP or achievements. Independent completion is self-reported. Drafts and completion records are included in existing progress exports; imported drafts must be tested again before a new completion can be recorded. Stored achievements are personal records and can be edited locally.

Shared accounts, weekly/topic rankings, and private group leaderboards remain future work. Trusted competitive scoring requires server-side validation and persistent identity; this static site does not provide those services.

Run `node tests/browser-proving.cjs` with Playwright available in NODE_PATH and Chrome installed to verify the browser flows. Set CODEGYM_TEST_URL to the local or deployed site. The test uses an isolated browser profile and does not modify other visitors' progress.

Security checks, contributor rules, and the security review are documented in SECURITY.md, AGENTS.md, and SECURITY_REVIEW.md. The Pages pipeline blocks publication on failed security gates.
