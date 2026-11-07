# MATHEMATICA technical audit

Audit date: 2026-11-08. Scope: all files in the delivered `outputs/` application.

## Existing architecture

The initial implementation was a single 56 KB HTML file with inline CSS, content data, rendering, localStorage state, and interaction handlers. This update extracts `src/mathematical-engine.js`, `src/storage.js`, `src/exam-engine.js`, and `src/biology-lab.js`; the application shell and page templates remain inline. There is no backend, build system, framework, or third-party runtime dependency.

## Existing features preserved

- Dark/light appearance, responsive sidebar, and laboratory visual language.
- Linear Algebra course sequence, generated exercise families, daily practice, case-study prompts, research links, capstone tracker, playground, progress views, and local export.
- All content remains local-first. Biological examples are described as simulated.

## Confirmed bugs fixed

1. **Eigen answer under-validation:** the question requested two eigenvectors but compared only a comma-separated eigenvalue string. The new checker requires both eigenpairs, verifies the eigenvalues, checks vector dimensions and unit length, and evaluates each residual `Av - Î»v`.
2. **Daily keyword false positives:** the prior check accepted a string containing `2` plus `acute`/`positive`, regardless of numeric correctness. It now parses the leading numeric result and evaluates the sign interpretation as separate components.
3. **Vector dimension and entry ambiguity:** normalized string comparison could accept equivalent-looking text without reliable structure. Vectors and matrices now parse into numeric entries and compare shape and values with absolute/relative tolerances.
4. **Exam leakage and missing exam flow:** an exam label reused one-question practice and exposed hint/solution affordances. A separate configurable exam flow now hides those, selects without replacement, navigates questions, offers answer review, confirms submission, auto-submits at expiry, and reports scored results with post-submit solutions.
5. **Hardcoded dashboard completion:** the home card displayed a fixed 6% and a fixed Week 01 label. It now reports the actual solved share of the generated problem bank; this is explicitly not represented as course mastery.
6. **Planned-time inflation:** the timer previously added the entire selected duration when it expired. The current session timer has pause, resume, stop, and reset; only stopped active seconds accrue.
7. **UTC/local-day mismatch:** streak and weekly activity used `toISOString()` date keys. Activity now uses `Asia/Dhaka` calendar dates by default, with an IANA timezone preference extension point and timezone-aware week boundaries.
8. **Unsafe backup replacement:** malformed JSON could be accepted as an arbitrary object and restore replaced state without confirmation. Versioned storage validates a whitelist of fields, reports parse errors, validates imports, and confirms before restore.
9. **Journal counter and missing entries:** the old counter read a nonexistent `journalCount`; the Studio now reflects stored journal entries and has a searchable create/edit/delete journal page with categories and references.
10. **Problem-bank duplicates:** an earlier parameter cycle produced duplicate statements despite claiming 512 unique problems. The generator and test suite now check uniqueness and expected answers across all 512 instances.

## Mathematical correctness findings

- Numeric parsing rejects NaN and Infinity, supports fractions, decimals, and a restricted arithmetic-expression grammar, and uses configurable absolute/relative tolerance.
- Structured vector/matrix checks reject missing or extra dimensions and compare entries individually.
- Eigen checks use computed residuals; a requested unit vector must have norm 1 within tolerance.
- The current 512 generated questions remain short deterministic families, not a diverse hand-authored proof bank. The PCA/SVD routines added here are 2Ã—2 only. General eigendecomposition, higher-dimensional SVD, numerical conditioning analysis, and proof evaluation are not implemented.
- Daily conceptual assessment is a transparent minimal criterion (correct number plus â€œacuteâ€ or â€œpositiveâ€), not natural-language understanding.

## Potential bugs and unverified behavior

- Local browser preview was blocked by the computer-use URL policy (`file:` is disallowed); exam and journal flows were exercised with a DOM stub, but not visually inspected in a browser.
- Active and submitted exam state is included in the v2 record. The wall-clock deadline continues across reloads; manual system-clock changes can affect remaining time.
- Floating-point expressions near singular or ill-conditioned matrices need more robust conditioning diagnostics.
- The single-file view/event code remains hard to maintain, and test coverage does not execute DOM interactions.
- `MathStorage.clean` migrates known fields and case notes; unknown v1 custom keys are deliberately discarded. Take a JSON export before updating if a prior version has nonstandard custom keys.

## UX issues

- Exam question navigation and timer are added, but keyboard-only and screen-reader review are not verified.
- The daily problem still repeats; an archive, scheduled rotation, and no-repeat guarantee remain incomplete.
- The biology case studies are prompts; most do not yet include adjustable data, calculations, plots, or downloadable CSVs.
- One interactive simulated-data experiment now calculates genotype and allele frequencies, compares Hardyâ€“Weinberg expectations, models seeded drift, plots one trajectory, and downloads CSV. This is still far short of the requested lab suite.
- The research observatory still has no live research feed, DOI verification, or citation import API.

## Security and data integrity

- State remains in browser localStorage and is not encrypted. Do not place sensitive research participant data in it.
- Restore is validated and confirmation-gated. Text rendered from user-entered paper and journal fields is escaped; case notes are inserted as form values.
- The app has no authentication, server, cross-device sync, or access control.
- External course links open new tabs with `noopener`; font loading is optional.

## Priority order

1. Complete browser interaction tests for answer submission, exam, journal, restore, and timers.
2. Split page templates, course data, problem generation, and state orchestration into modules.
3. Replace topic-family proxy progress with concept-specific lesson completion and checkpoint-backed mastery.
4. Build computational biology experiments around real, reproducible matrix operations and explicit simulated/public data provenance.
5. Extend tested numerical algorithms beyond 2Ã—2 and add conditioning/error analysis.
6. Add daily challenge rotation, spaced repetition, and retention tracking.
7. Add verified scholarly API discovery only after source/date/DOI checks and clear fallback behavior.

## Multi-course architecture update (2026-11-08)

The application now has a structured catalog of eight courses, a prerequisite graph, course switching, and separate progress records per course. Only Linear Algebra has content and its catalog status remains in-development. The other seven course entries are selectable placeholders. Storage schema v3 migrates older flat v1/v2 records into the Linear Algebra record. Automated checks cover migration, course isolation, switching, catalog rendering, and graph rendering. Browser visual QA was unavailable in this environment.

## Persistence and date regression audit (2026-11-08)

The initial course-switch persistence path could save the previously active course but leave the newly selected course ID unsaved until another action. The app now writes the full platform state through `MathStorage.save(platformState)` and saves after activation. Thus the selected course, enrollment, theme preference, and each course record are retained together. Startup reads v3 first; stale v1/v2 keys cannot supersede a valid v3 record. When no v3 exists, a valid v1/v2 state migrates into Linear Algebra and is written as v3. Legacy keys are left intact. Full backup export and validated restore operate on the platform envelope.

Date keys and weekly activity now use `MathDates` with `Asia/Dhaka` as the default timezone. An IANA timezone can be stored in platform preferences for future user settings. Calendar arithmetic is tested across Dhaka/New York boundaries, month transitions, week boundaries, and streak grace behavior.

Regression coverage now simulates actual storage writes and reload reads, including independent Linear Algebra and Calculus progress, active course restoration, daily completion, exam answers/state, journal entries, and full backup round trips. Existing browser tests are DOM-stubbed. The in-app browser could not connect to a local server in this environment, so visual and interactive browser verification remains outstanding.
