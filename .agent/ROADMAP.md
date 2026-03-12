# Roadmap

This roadmap translates the repository requirements in `.agent/SPEC.md` and the delivery standards in `.agent/AGENTS.md`, `.agent/PLANS.md`, and `.agent/PR_TEMPLATE.md` into a practical build sequence.

## Product North Star

Build a lightweight, trustworthy self-serve macro dashboard in Next.js that helps non-technical users:

- discover available metrics,
- understand definitions, units, sources, and caveats,
- build simple filtered views without SQL,
- compare geographies and time periods,
- export the exact result set they are viewing.

The product should remain guided, server-validated, and easy to extend.

## Guardrails

- Users interact with human-readable metrics, not raw database structures.
- All user-visible queries flow through validated server-side contracts.
- The browser never connects directly to the database.
- The initial visualization grammar stays limited to `table`, `bar`, `line`, `multi_line`, and `map`.
- Exported files must match the filtered result shown in the UI.
- Definitions, units, sources, and caveats are first-class product surfaces.

## Delivery Tracks

Work across these tracks in parallel where it helps, but keep behavior shippable in small increments:

1. Semantic catalog: metric metadata, aliases, chart suitability, and display rules.
2. Query layer: validated server-side contracts for search, metadata lookup, data fetches, chart recommendation, and export.
3. User experience: guided entry points, query builder, results display, metadata panels, and shareable state.
4. Visualization and export: tables, supported charts, map rendering, CSV/XLSX generation.
5. Quality and operations: validation, caching, observability, documentation, and safe delivery workflow.

## Phase 0: Foundations

Goal: establish the repository shape and core contracts so later features do not need rework.

- Set up the Next.js App Router and TypeScript project structure.
- Define module boundaries for routes, server utilities, validation schemas, chart components, catalog utilities, export helpers, and tests.
- Establish environment-variable conventions and a secure server-only database access pattern using a read-only user for the `serving` schema.
- Define the initial semantic metric catalog shape.
- Define stable response contracts for metric search, metadata lookup, filtered queries, chart recommendations, and exports.
- Add baseline validation, lint, and typecheck workflows.

## Phase 1: MVP

Goal: deliver the first complete end-to-end workflow for discovering, viewing, and exporting data.

- Build a landing page with guided entry points.
- Build a metric discovery/catalog experience with search, category browsing, and plain-English descriptions.
- Build a guided query builder for metric, geography, time range, comparison mode, and view selection.
- Implement server-side validated data queries.
- Render results as `table`, `bar`, `line`, `multi_line`, and `map` based on supported shapes.
- Add a reusable metadata panel showing definition, source, unit, freshness, and caveats.
- Support CSV and XLSX export for the exact filtered result set.
- Handle loading, empty, and error states clearly across the core workflow.
- Preserve useful query state in the URL for refresh and direct linking.

## Phase 2: V1 Improvements

Goal: make the MVP faster, easier to use, and more shareable.

- Add saved or shareable views.
- Improve defaults and presets so users reach a successful chart faster.
- Improve empty-state guidance and recovery paths for unsupported or sparse queries.
- Refine chart recommendation behavior.
- Add careful, explicit caching where it improves common read flows without hiding freshness expectations.
- Strengthen component and integration coverage for key workflows.

## Phase 3: V2 Expansion

Goal: extend the product without weakening the semantic and validation model.

- Add optional AI-assisted query translation on top of the same validated semantic contracts.
- Add lightweight user feedback capture on metric quality and result usefulness.
- Expand comparison workflows and advanced charting only if they still fit the product's guided model.

## Ongoing Engineering Expectations

- Use an ExecPlan in `.agent/PLANS.md` for cross-cutting or ambiguous work.
- Create feature briefs for substantial new features, especially those affecting workflows, query contracts, chart grammar, exports, auth, or vendors.
- Ship in small, reviewable increments with docs updated alongside behavior changes.
- Validate the most relevant checks before calling work complete: lint, typecheck, tests, and manual verification where needed.
- Keep PRs product-aware and evidence-based using `.agent/PR_TEMPLATE.md`.

## Definition Of Done By Milestone

A milestone should not be considered complete unless:

- the intended user workflow works end to end,
- UI behavior matches the server/API contract,
- loading, empty, and error states are handled,
- docs reflect the new behavior,
- validation results are recorded clearly,
- no unsafe data access or secret exposure was introduced.

## Immediate Next Builds

If the repository is still early, the recommended order is:

1. App skeleton and environment setup.
2. Semantic metric catalog model.
3. Server-side validation and query contracts.
4. Metric catalog/discovery UI.
5. Guided query builder.
6. Result rendering for table and charts.
7. Metadata panel integration.
8. CSV/XLSX export.
9. URL state, polish, and validation hardening.
