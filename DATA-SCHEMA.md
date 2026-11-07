# Data Schema

MATHEMATICA stores schema version 3 under localStorage key `mathematica-v3`. The app persists through `MathStorage.save(platformState)`, after synchronizing the active course record.

The envelope contains `schemaVersion`, `activeCourseId`, `enrolledCourseIds`, platform `preferences` (`dark` and optional IANA `timeZone`, default `Asia/Dhaka`), and `courses`, a map of independent course progress records. Each record holds solved/missed IDs, attempts, activity dates, daily challenge state, notes, papers, milestones, journal entries, completion status, sessions, and course-local exam state.

A valid v3 record is authoritative and is loaded before legacy keys; stale v1/v2 records cannot override it. If v3 is absent, the old flat `mathematica-v2` wrapper or `mathematica-v1` record is migrated into `courses.linear-algebra`. On successful migration the app writes v3. Migration reads do not delete legacy keys. If a v3 record exists but is malformed, the app reports the load error instead of silently replacing it with stale legacy data.

Backup export serializes the complete v3 envelope. Import accepts v3 and migrates supported v1/v2 backups, validates the result, and only then replaces the current data. Restore remains confirmation-gated. Data stays in local browser storage, is not encrypted, and is not synced.
