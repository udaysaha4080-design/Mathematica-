# Course Configuration

Course metadata is maintained in `data/courses.js`; app behavior reads the registry through `src/course-engine.js` rather than branching on course names throughout the interface.

Each catalog record has an `id` (stable lowercase slug), `name`, `status`, optional `contentAdapter`, `sharedSystems`, and a user-facing `description`. Status values are `in-development`, `fully-implemented`, `coming-soon`, or `completed`. A null adapter means the course has no learning content and the UI presents its placeholder. The prerequisite graph is metadata in the same file, with `from`, `to`, and `label` fields.

To register a course, add its metadata and graph edges. Keep it `coming-soon` with a null adapter until its content has been authored and reviewed. Adding a content adapter requires implementing that course’s curriculum and problem interface, then updating `contentAdapter` and its enabled shared systems. Do not add placeholder lessons or generated problems that imply content exists.

Linear Algebra is the only course with content integration. It remains `in-development` while lesson and laboratory coverage is incomplete. Other courses are selectable catalog placeholders.
