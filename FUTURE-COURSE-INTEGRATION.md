# Future Course Integration

1. Add a course record to `data/courses.js` with a stable ID, name, status, description, shared-system list, and initially a null adapter.
2. Add prerequisite edges to the catalog graph where they help learners understand dependencies. Graph entries describe relationships; they do not create lesson content.
3. Author the course curriculum, lessons, problem bank, assessments, and applied lab in a course-specific module. Keep its state inside the matching `platformState.courses[courseId]` record.
4. Implement and register a content adapter exposing the course’s actual capabilities. Set the metadata adapter only when those capabilities are ready to use.
5. Reuse shared Academy, Arena, Daily, Biology Lab, Research, Studio, and Playground infrastructure where suitable; avoid copying shared systems into course-specific modules.
6. Add migration-safe defaults and tests for activation, independent progress, switching, backup round-trip, and placeholder gating. Update course configuration and data schema docs.
7. Change status from `coming-soon` to `in-development` or `fully-implemented` based on actual coverage. Do not claim completion until its curriculum and assessments are complete.

The current implementation contains content only for Linear Algebra. No future course content should be inferred from its catalog entry or prerequisite graph.
