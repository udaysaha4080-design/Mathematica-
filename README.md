# MATHEMATICA — The Mathematical Mind Laboratory

## Run locally

Open `index.html` in a current browser. No build step, account, backend, or package installation is needed. Keep `data/` and `src/` beside the HTML file. The app runs offline; optional fonts and linked reference sites need internet access.

## Current implementation

The multi-course catalog contains eight courses. Linear Algebra is the only course with learning content and remains **in development**. Calculus, Probability Theory, Mathematical Statistics, Differential Equations, Discrete Mathematics, Optimization, and Mathematical Biology are selectable placeholders.

Linear Algebra includes a 16-module pathway, 512 deterministic practice questions, daily vector challenge, timer, simulated biology prompts, 2×2 transformation playground, research source library, PCA capstone tracker, research journal, exams, and progress records. Coverage and numerical methods remain incomplete; see `AUDIT.md` and `MATHEMATICAL-VALIDATION.md`.

## Data and privacy

All records are stored locally in the browser. Schema v3 is saved as a versioned platform envelope under `mathematica-v3` through `MathStorage.save(platformState)`. It includes the active course, enrolled courses, global preferences, and independent course progress. The v3 record takes precedence over legacy keys. Flat `mathematica-v1` and `mathematica-v2` records migrate into Linear Algebra when no v3 record exists; successful migration is immediately saved as v3. Backup export and restore use the complete platform envelope. Browser storage is not encrypted and does not sync across devices.

The default learning-calendar timezone is `Asia/Dhaka`, configurable through the platform preference field. Date records use calendar keys rather than UTC date slicing.

## Architecture and verification

`data/courses.js` defines catalog metadata and prerequisites. `src/course-engine.js` manages activation; `src/course-ui.js` renders catalog and graph views. `src/storage.js` validates, migrates, saves, and imports/exports schema v3. `src/date-utils.js` provides timezone-aware local calendar keys. Math, exam, and biology helpers live in `src/`.

See [ARCHITECTURE.md](ARCHITECTURE.md), [COURSE-CONFIGURATION.md](COURSE-CONFIGURATION.md), [DATA-SCHEMA.md](DATA-SCHEMA.md), [FUTURE-COURSE-INTEGRATION.md](FUTURE-COURSE-INTEGRATION.md), and [AUDIT.md](AUDIT.md).

Run `node verify.js` and every `node tests/*.js` script from this folder. Coverage includes migration, persistence after simulated reload, course isolation, backups, date boundaries, exams, journal, daily completion, and math helpers. A real browser visual pass was unavailable for this verification.
