# Changelog

## 2026-11-08 — Technical audit and correctness pass

- Extracted reusable math and versioned storage modules.
- Replaced string/keyword checks with structured numeric, vector, matrix, eigenpair, and daily validators.
- Added configurable exam selection, timed submissions, answer navigation/review, submission confirmation, scoring, and post-submit solution review.
- Added active-time pause/resume/stop/reset controls and local-calendar date helpers.
- Added version-2 record validation and v1 migration, plus confirmation-gated restore.
- Persisted the active exam state, answers, and deadline in schema v2 so exams can be reconstructed after reload.
- Added searchable categorized research journal entries with create/edit/delete and JSON export.
- Added a DOM-stub smoke test for exam flow, journal CRUD, timer controls, and daily completion.
- Removed the fixed 6% home progress claim; it now reports solved problem-bank share only.
- Added attempt-based module states with explicit completion and mastery thresholds; the course page labels these as practice evidence.
- Added an interactive, explicitly simulated population-genetics experiment for genotype/allele frequencies, Hardy–Weinberg expectations, seeded genetic drift, and CSV export.
- Added matrix, least-squares, covariance/correlation, 2×2 PCA/SVD, and population-genetics routines with Node tests.
- Added audit, architecture, mathematical-validation, deployment, and scope documentation.

Known incomplete work is listed in `AUDIT.md` and `README.md`, including browser UI verification, higher-dimensional numerical methods, the broader computational biology lab suite, daily rotation, concept-specific mastery, live scholarly discovery, and full decomposition of the monolithic page.

## 2026-11-08 — Persistence and calendar regression fixes

- Fixed the application save path to persist the complete platform envelope with `MathStorage.save(platformState)`; course switching now saves the newly activated course so reload restores it.
- Kept schema v3 authoritative over legacy keys and ensured successful v1/v2 migrations are saved as v3 without deleting the original legacy records.
- Preserved full-platform backup export and validated v1/v2/v3 restore behavior.
- Added a timezone-aware date helper with `Asia/Dhaka` as the default and support for a future IANA timezone preference.
- Added reload, independent progress, daily challenge, exam, journal, backup round-trip, date-boundary, week, and streak regression coverage.
- Browser UI verification could not connect to the local app from the available in-app browser; automated checks ran locally instead.
