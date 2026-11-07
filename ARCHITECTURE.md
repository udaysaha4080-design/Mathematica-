# Architecture and extension points

## Runtime

MATHEMATICA is a static, local-first browser application. `index.html` owns the shell and current Linear Algebra integration; shared functionality is loaded from synchronous scripts so local launch needs no bundler.

```text
index.html
  ├── data/courses.js              metadata and prerequisite graph
  ├── src/storage.js               schema v3, migration, save/import/export
  ├── src/course-engine.js         course registry and activation
  ├── src/course-ui.js             catalog and graph views
  ├── src/date-utils.js            timezone-aware calendar dates
  ├── src/mathematical-engine.js   validation and numerical routines
  ├── src/exam-engine.js           exam selection and scoring
  └── src/biology-lab.js           simulated genotype/HWE and drift experiment
```

## Persistence

`save()` synchronizes the active record into `platformState`, updates the active course and global theme preference, then calls `MathStorage.save(platformState)`. Schema v3 stores the complete platform envelope in `mathematica-v3`. Course switching saves the departing record, activates the selected course, and saves again so reload restores the latest active course. A valid v3 record takes precedence over legacy keys. When v3 is absent, v2 and v1 flat records migrate into Linear Algebra and are written to v3. Backups export and restore the whole envelope.

See `DATA-SCHEMA.md` for the exact fields and migration rules. Storage is browser-local, unencrypted, and has no account or cross-device sync.

## Course support and limits

`data/courses.js` holds eight catalog entries. Only Linear Algebra has content integration, with status `in-development`; the other seven entries are placeholders. Shared systems use the active course’s data where appropriate. A null content adapter gates course-specific learning views.

The app remains a single-page application with inline templates and substantial Linear Algebra orchestration. The architecture supports isolated course progress and future adapters but does not provide future course content, server backup, or a general plugin runtime.
