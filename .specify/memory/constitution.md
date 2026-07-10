<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Principle 1 placeholder -> I. Code Quality Is Non-Negotiable
- Principle 2 placeholder -> II. Tests Prove Behavior
- Principle 3 placeholder -> III. Chinese Technical Documentation
- Principle 4 placeholder -> IV. Maintainability Over Cleverness
- Principle 5 placeholder -> V. Performance Budgets Are Explicit
- Added: VI. Consistent User Experience
Added sections:
- Engineering Constraints
- Development Workflow
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .specify/templates/commands/*.md (not present)
- ✅ README.md / docs/ (not present)
Follow-up TODOs:
- None
-->

# Venus Constitution

## Core Principles

### I. Code Quality Is Non-Negotiable
Production code MUST be simple, typed or otherwise validated at boundaries, consistently formatted,
and aligned with the repository's established patterns. Every change MUST address the root cause of
the requested behavior instead of layering ad hoc workarounds. Dead code, unrelated rewrites, and
unexplained abstractions are not allowed.

Rationale: durable quality keeps AI-assisted changes reviewable, testable, and safe to evolve.

### II. Tests Prove Behavior
Every feature or bug fix MUST include the narrowest practical executable validation. Behavior changes
MUST add or update tests at the appropriate level: unit tests for pure logic, integration tests for
cross-boundary behavior, and end-to-end or workflow checks for user-facing journeys. Test gaps MUST
be documented in the plan with a reason and a manual validation path.

Rationale: tests are the project's evidence that the implementation matches the specification.

### III. Chinese Technical Documentation
Project-facing technical documentation, architecture notes, process docs, quickstarts, and internal
handoff material MUST be written in Chinese unless an external integration requires English. Diagrams
for architecture or process flows SHOULD use Mermaid. Missing or changed behavior MUST be reflected
in the relevant spec, plan, quickstart, or docs before a feature is considered complete.

Rationale: Chinese documentation keeps internal sharing efficient and reduces ambiguity for the team.

### IV. Maintainability Over Cleverness
Implementations MUST prefer clear module boundaries, small functions, explicit data contracts, and
local reasoning over clever compression. Shared abstractions MUST be introduced only when they remove
real duplication or protect a stable boundary. Complex decisions MUST be captured in the plan or code
review notes with the simpler alternative that was rejected.

Rationale: maintainable code lets future changes stay focused instead of becoming archaeology.

### V. Performance Budgets Are Explicit
Every feature plan MUST define performance expectations relevant to its scope, such as latency,
render responsiveness, memory use, payload size, startup time, or batch throughput. Implementations
MUST avoid preventable regressions and MUST validate performance-sensitive paths with measurement,
profiling, or a documented manual check.

Rationale: performance is a product requirement, not a cleanup task after release.

### VI. Consistent User Experience
User-facing work MUST follow the existing visual language, interaction patterns, accessibility
expectations, and terminology of the product. New UI states MUST cover loading, empty, error,
success, disabled, and responsive layouts where applicable. User-visible text MUST be concise,
consistent, and appropriate for the audience.

Rationale: a consistent experience builds trust and prevents each feature from feeling isolated.

## Engineering Constraints

- Dependencies MUST be justified by clear value, maintenance health, and fit with the existing stack.
- Public or cross-module contracts MUST be explicit and versioned or migrated carefully when changed.
- Security-sensitive code MUST validate inputs, protect secrets, and avoid logging sensitive data.
- Configuration MUST be environment-aware and documented when a feature depends on runtime settings.
- Generated artifacts MUST be reproducible from checked-in source, templates, or documented commands.

## Development Workflow

1. Specifications MUST define user value, independent testable scenarios, requirements, edge cases,
	success criteria, documentation impact, performance expectations, and UX constraints.
2. Plans MUST pass the Constitution Check before research/design and again after design.
3. Tasks MUST be grouped by independently deliverable user story and include validation, documentation,
	performance, and UX consistency work where applicable.
4. Implementation MUST proceed in small, reviewable increments with executable validation after each
	meaningful change.
5. Completion requires updated docs, passing checks, and an explicit note for any accepted test or
	performance validation gap.

## Governance

This constitution supersedes conflicting project conventions, templates, and ad hoc instructions.
Every spec, plan, task list, implementation, and review MUST check compliance with the Core
Principles. Amendments require a documented rationale, an impact review of affected templates and
runtime guidance, and an updated Sync Impact Report in this file.

Versioning follows semantic versioning:
- MAJOR for principle removals, redefinitions, or incompatible governance changes.
- MINOR for new principles, new required sections, or materially expanded guidance.
- PATCH for clarifications, wording improvements, and non-semantic corrections.

Compliance review is required before implementation begins and before work is considered complete.
Violations MUST be recorded in the plan's Complexity Tracking section with justification and the
simpler compliant alternative that was rejected.

**Version**: 1.0.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-10
