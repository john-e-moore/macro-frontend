# PLANS.md

This file defines the execution-plan standard for this repository.
An execution plan in this repo is called an **ExecPlan**.

ExecPlans are used to design and drive multi-step work with clear acceptance criteria, validation, and follow-through.
They are living documents and must stay current as implementation evolves.

## When To Use An ExecPlan

Create or update an ExecPlan before implementation when work is complex, cross-cutting, or high-risk, especially when it:

- spans both UI and API layers,
- introduces or changes a user workflow,
- changes the semantic query contract,
- changes chart behavior or supported chart types,
- adds exports or shareable state,
- changes auth, deployment, caching, or performance behavior.

For small, isolated fixes, an ExecPlan is optional.

## Relationship To Feature Briefs

`.agent/SPEC.md` remains the repository-wide source of truth for baseline requirements.

For substantial feature work, create a feature brief at:

- `.agent/features/<YYYY-MM-DD>-<feature-name>/SPEC.md`

Then create or update an ExecPlan in this file and reference that brief near the top.

Feature briefs should stay focused on feature-local scope, acceptance criteria, constraints, non-goals, and rollout notes.

## Core Principles

Every ExecPlan must be:

- **Self-contained**: a new contributor can execute it using only the plan and repo state.
- **Outcome-focused**: it defines what the user can now do, not just what code changed.
- **Executable**: it includes concrete files, endpoints, commands, and evidence.
- **Living**: progress, discoveries, and decisions are updated during the work.
- **Safe**: it notes risks, backward-compatibility concerns, and recovery steps.

Define product or technical terms in plain language when they matter to execution.

## Required Sections

Each ExecPlan must include all sections below:

1. Purpose / Big Picture
2. Links
3. Progress
4. Surprises & Discoveries
5. Decision Log
6. Outcomes & Retrospective
7. Context and Orientation
8. Plan of Work
9. Concrete Steps
10. Validation and Acceptance
11. Risks and Recovery
12. Artifacts and Notes
13. Interfaces and Dependencies

`Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` are mandatory living sections and must be kept current.

## Formatting Rules

- Write in clear prose with short lists where useful.
- Use repository-relative paths.
- Include exact commands with working directory context.
- Include concise evidence snippets when useful.
- Keep plans easy to diff and update.

## Repository-Specific Acceptance Bar

For this project, an ExecPlan is only complete when the defined scope demonstrates:

- the user workflow works end-to-end,
- the API contract and UI behavior agree,
- loading, empty, and error states are handled,
- validation covers the riskiest paths,
- docs are updated where behavior changed.

When production dependencies are unavailable, provide local or mocked validation plus explicit production verification steps.

## ExecPlan Template

Copy this template for each substantial project task.

---

# <ExecPlan title>

This ExecPlan is a living document and follows `.agent/PLANS.md`.

## Purpose / Big Picture

Describe the user-visible outcome. Explain what becomes possible after this change and how someone can observe it.

## Links

- Branch: `<feature-branch-name>`
- Feature brief: `.agent/features/<YYYY-MM-DD>-<feature-name>/SPEC.md` or `N/A`
- PR: `<url or pending>`

## Progress

- [ ] (YYYY-MM-DD HH:MMZ) Initial planning completed.
- [ ] Implementation milestone 1 completed.
- [ ] Validation and documentation updates completed.

## Surprises & Discoveries

- Observation: <unexpected behavior, risk, or insight>
  Evidence: <short command output, UI behavior, or test signal>

## Decision Log

- Decision: <what was decided>
  Rationale: <why this choice>
  Date/Author: <YYYY-MM-DD, name/agent>

## Outcomes & Retrospective

Summarize achieved outcomes, remaining gaps, and lessons learned. Compare results against the original purpose.

## Context and Orientation

Explain the current relevant repository state for a newcomer. Name key files and how they connect, for example:

- `app/*` for routes and server components,
- `app/api/*` or `src/app/api/*` for route handlers,
- `components/*` for shared UI,
- `lib/*` for query, formatting, and data-access utilities,
- `tests/*` for validation coverage.

## Plan of Work

Describe the sequence of edits and why. Be explicit about paths, modules, components, and intended behavior.

## Concrete Steps

List exact commands with working directory. Example:

    cd /path/to/repo
    npm run lint
    npm run typecheck
    npm test

Include expected outcomes for each command.

## Validation and Acceptance

Define observable acceptance criteria. Prefer user-facing behavior checks, for example:

- a user can find a metric through search,
- query filters produce the expected result shape,
- the selected chart renders with the expected data,
- exports match the visible table,
- invalid query states fail cleanly.

## Risks and Recovery

Describe known risks, safe re-run behavior, rollback paths, and recovery steps for partial failures or bad deploys.

## Artifacts and Notes

Include concise evidence snippets, screenshots, test notes, or follow-up observations that prove success.

## Interfaces and Dependencies

Name endpoints, libraries, modules, third-party services, and any required interfaces or contracts that must exist at completion.

---

## Optional: Active ExecPlan Index

Use this section to track in-flight plans:

- `2026-03-12 - Phase 0 Foundations - status: in_progress - owner: Cursor agent`
- `2026-03-12 - Phase 1 MVP - status: completed - owner: Cursor agent`
- `2026-03-13 - Phase 2 V1 Improvements - status: completed - owner: Cursor agent`

---

# Phase 0 Foundations

This ExecPlan is a living document and follows `.agent/PLANS.md`.

## Purpose / Big Picture

Replace the starter app with a repository foundation that clearly encodes the macro dashboard product: App Router structure, server-only Postgres access, semantic metric catalog types, validated query contracts, thin route handlers, and baseline docs and tests.

## Links

- Branch: `phase-0-foundations`
- Feature brief: `N/A`
- PR: `pending`
- `.cursor` plan: `.cursor/plans/phase-0_foundations_658d864f.plan.md`

## Progress

- [x] (2026-03-12 00:00Z) Initial planning completed in `.cursor/plans/phase-0_foundations_658d864f.plan.md`.
- [x] Foundation modules and route handlers completed.
- [x] Validation and documentation updates completed.

## Surprises & Discoveries

- Observation: The repo already had a saved `.cursor` plan, but the codebase itself was still almost entirely the default starter app.
  Evidence: `app/page.tsx`, `app/layout.tsx`, and `README.md` were still generated starter files.
- Observation: Adding the `xlsx` package introduces an upstream audit warning that should be tracked separately from Phase 0 behavior.
  Evidence: `npm install xlsx` reported `1 high severity vulnerability`.

## Decision Log

- Decision: Keep Phase 0 API routes real and validated, but back them with lightweight catalog-backed services instead of production SQL queries.
  Rationale: This establishes stable contracts without overbuilding Phase 1 workflows before the semantic model is settled.
  Date/Author: 2026-03-12, Cursor agent
- Decision: Commit the `.cursor` plan file alongside the implementation.
  Rationale: The user explicitly requested that the PR include the saved plan, and the plan is part of the execution record for this cross-cutting change.
  Date/Author: 2026-03-12, Cursor agent

## Outcomes & Retrospective

Phase 0 now replaces the starter app with a documented repository foundation:

- product-aware landing page and metadata,
- typed semantic catalog and contract modules,
- thin validated API handlers,
- server-only Postgres pool factory,
- CSV/XLSX export generation,
- lint, typecheck, test, and runtime smoke-check evidence.

Remaining follow-up is operational rather than structural: track the `xlsx` audit warning and swap the sample query service for live `serving`-layer reads in Phase 1.

## Context and Orientation

- `app/*` contains the landing page shell and API handlers.
- `components/*` contains reusable presentation modules for the foundation shell.
- `lib/catalog/*` contains semantic metric catalog definitions and seed data.
- `lib/contracts/*` contains shared request and response schemas.
- `lib/db/*` contains server-only Postgres access helpers.
- `lib/services/*` contains thin business logic behind the route handlers.
- `tests/*` contains baseline unit coverage for the new foundation.

## Plan of Work

1. Replace starter docs and metadata with product-aware repository documentation.
2. Add typed env and database foundation modules.
3. Add semantic catalog types, contracts, validation helpers, and service modules.
4. Add App Router route handlers and a lightweight landing page shell.
5. Add test tooling, baseline tests, and run lint, typecheck, and test.
6. Commit, push, and open a PR that references the `.cursor` plan.

## Concrete Steps

    cd /home/john/tlg/macro-frontend
    npm install
    npm run lint
    npm run typecheck
    npm run test

Expected outcomes:

- dependencies install cleanly,
- lint and typecheck pass,
- baseline tests pass without requiring live database credentials.

## Validation and Acceptance

- A newcomer can locate where routes, contracts, catalog logic, db access, and tests belong.
- Invalid API inputs fail with clear validation errors.
- The landing page reflects the macro dashboard product instead of create-next-app defaults.
- Export routes can produce CSV and XLSX responses from the shared result shape.
- Docs mention the `.cursor` plan and the server-only Postgres model.

## Risks and Recovery

- Risk: Phase 0 could drift into Phase 1 feature work.
  Recovery: keep API responses intentionally lightweight and avoid adding interactive builder flows.
- Risk: Database env validation could break local validation without credentials.
  Recovery: validate env lazily when the db module is used instead of at app import time.
- Risk: Export dependencies can add vulnerability noise.
  Recovery: document the audit warning and keep follow-up remediation scoped separately.

## Artifacts and Notes

- Plan file: `.cursor/plans/phase-0_foundations_658d864f.plan.md`
- PR template update: `.agent/PR_TEMPLATE.md`
- Validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - runtime smoke checks against `/api/metrics/search`, `/api/metrics/[metricId]`, `/api/query`, and `/api/export`

## Interfaces and Dependencies

- Dependencies: `next`, `react`, `zod`, `pg`, `server-only`, `xlsx`, `vitest`
- Planned endpoints:
  - `GET /api/metrics/search`
  - `GET /api/metrics/[metricId]`
  - `POST /api/query`
  - `POST /api/chart-recommendation`
  - `POST /api/export`

---

# Phase 1 MVP

This ExecPlan is a living document and follows `.agent/PLANS.md`.

## Purpose / Big Picture

Turn the current single-page demo into the Phase 1 MVP product flow from `.agent/ROADMAP.md`: a landing page with guided entry points, a catalog for metric discovery and metadata, and an explorer for URL-backed query building, chart/table inspection, and exact-result export.

## Links

- Branch: `feature/phase-1-mvp`
- Feature brief: `N/A`
- PR: `pending`
- `.cursor` plan: `.cursor/plans/phase_1_mvp_07bff4ef.plan.md`

## Progress

- [x] (2026-03-12 00:00Z) Initial planning completed in `.cursor/plans/phase_1_mvp_07bff4ef.plan.md`.
- [x] Landing, catalog, metadata panel, and explorer UI routes implemented.
- [x] Validation and final documentation updates completed.

## Surprises & Discoveries

- Observation: The repository already had live serving-backed query services, but the user-facing product surface was still a single hard-coded dashboard.
  Evidence: `app/page.tsx` only rendered `components/metrics-dashboard.tsx`.
- Observation: PCE level responses needed a small service upgrade to support meaningful line views for multi-year ranges.
  Evidence: The original `buildPceLevelResponse()` only emitted selected-year rows and map-oriented series.

## Decision Log

- Decision: Split the MVP into `/`, `/catalog`, and `/explore` instead of keeping the current single-route dashboard.
  Rationale: This matches the repository spec's required surfaces and creates a discovery-first workflow without discarding the live query layer.
  Date/Author: 2026-03-12, Cursor agent
- Decision: Keep the current metric services and wrap them in a generic explorer state model rather than redesigning the backend contract first.
  Rationale: The existing validated API surface was already strong enough to support the MVP if the UI state and view logic were normalized around it.
  Date/Author: 2026-03-12, Cursor agent

## Outcomes & Retrospective

Phase 1 MVP now exposes a product-shaped flow:

- a landing page with guided paths,
- a searchable catalog with reusable metadata inspection,
- a URL-backed explorer with chart/table switching,
- CSV and XLSX export actions from the same query payload used for rendering.

Validation is complete for the local repo checks that do not require live browser verification or production credentials.

## Context and Orientation

- `app/page.tsx` is now the landing page entry point.
- `app/catalog/page.tsx` renders metric discovery and metadata inspection.
- `app/explore/page.tsx` parses URL state and hands off to the client explorer.
- `components/landing-page.tsx`, `components/metric-catalog.tsx`, `components/query-builder.tsx`, `components/result-surface.tsx`, and `components/metadata-panel.tsx` make up the new product surface.
- `lib/explore-state.ts` is the shared URL/query-state adapter between the explorer UI and the validated query contract.
- `lib/services/pce-metrics.ts` now supports both single-year map/bar style output and multi-year line output for PCE levels.

## Plan of Work

1. Replace the home page with a true landing surface and add shared navigation.
2. Add catalog and explorer routes that reuse the existing semantic catalog and metric metadata.
3. Introduce reusable metadata, builder, and result-surface components instead of keeping one monolithic dashboard component.
4. Add URL-state parsing and serialization utilities so explorer filters survive refresh and direct linking.
5. Upgrade the PCE level service where needed so supported views align with the explorer UI.
6. Update docs and tests to match the new MVP workflow.

## Concrete Steps

    cd /home/john/tlg/macro-frontend
    npm run lint
    npm run typecheck
    npm run test

Expected outcomes:

- lint passes for the new routes, components, and utilities,
- typecheck passes across the new explorer state and route props,
- tests cover catalog helpers, explorer URL state, and export generation.

## Validation and Acceptance

- A user can land on `/` and choose to browse metrics or open the explorer.
- A user can search `/catalog`, browse by category, and inspect metric metadata.
- A user can open `/explore`, change filters, refresh the page, and retain the same state from the URL.
- The explorer can render supported results as table, bar, line, multi-line, or map depending on the selected metric and time span.
- CSV and XLSX exports are both available from the result surface and use the current query payload.
- Empty, loading, and error states render clearly when no result or a request failure occurs.

## Risks and Recovery

- Risk: The generic explorer can expose metric/view combinations that the current live services only partially support.
  Recovery: Clamp available views in `lib/explore-state.ts` and keep service-level responses aligned with those view options.
- Risk: URL-state churn can create noisy router updates.
  Recovery: Keep the serialized parameter set small and normalize state before writing it back to the URL.
- Risk: The old `components/metrics-dashboard.tsx` remains in the repo and can drift stale.
  Recovery: Either remove it in a later cleanup or treat it as deprecated and avoid routing to it.

## Artifacts and Notes

- Plan file: `.cursor/plans/phase_1_mvp_07bff4ef.plan.md`
- New MVP routes: `app/page.tsx`, `app/catalog/page.tsx`, `app/explore/page.tsx`
- Shared state adapter: `lib/explore-state.ts`
- Validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`

## Interfaces and Dependencies

- Dependencies: `next`, `react`, `zod`, `pg`, `server-only`, `xlsx`, `vitest`
- Existing API endpoints reused by the MVP:
  - `GET /api/metrics/search`
  - `GET /api/metrics/[metricId]`
  - `POST /api/query`
  - `POST /api/chart-recommendation`
  - `POST /api/export`
- Shared UI-to-data interface: `lib/contracts/query.ts`

---

# Phase 2 V1 Improvements

This ExecPlan is a living document and follows `.agent/PLANS.md`.

## Purpose / Big Picture

Improve the `/explore` workflow so users reach a successful chart faster, recover from empty or unsupported states more easily, and share the exact explorer state with clearer freshness expectations.

## Links

- Branch: `feature/phase-2-v1-improvements`
- Feature brief: `N/A`
- PR: `pending`
- `.cursor` plan: `.cursor/plans/phase-2-v1-plan_89590e4c.plan.md`

## Progress

- [x] (2026-03-13 00:00Z) Initial planning completed in `.cursor/plans/phase-2-v1-plan_89590e4c.plan.md`.
- [x] Shared explorer defaults, presets, recommendation logic, and recovery actions implemented.
- [x] Validation and documentation updates completed.

## Surprises & Discoveries

- Observation: The MVP already preserved explorer state in the URL, so the real Phase 2 gap was clearer affordances and normalization rather than inventing a new persistence mechanism.
  Evidence: `lib/explore-state.ts` already parsed and serialized the full `/explore` query state before Phase 2 edits began.
- Observation: The existing query services already generated enough shape metadata to support smarter chart recommendations without redesigning the API surface from scratch.
  Evidence: `lib/services/pce-metrics.ts` and `lib/services/federal-metrics.ts` already emitted `supportedCharts`, `series`, and display metadata.

## Decision Log

- Decision: Keep Phase 2 shareability URL-first and leave persisted saved views as a follow-on.
  Rationale: The user chose to sequence stronger share links ahead of storage/auth design, and the roadmap allows either saved or shareable views.
  Date/Author: 2026-03-13, Cursor agent
- Decision: Use a small in-process route cache with explicit short TTLs instead of introducing a dedicated cache service.
  Rationale: This keeps caching behavior simple, reviewable, and aligned with the project guidance to prefer predictable freshness over opaque magic.
  Date/Author: 2026-03-13, Cursor agent

## Outcomes & Retrospective

Phase 2 now upgrades the explorer experience without widening product scope:

- shared preset definitions and metric-scoped defaults improve the first successful chart,
- `/explore` exposes share/reset controls and clearer recommendation messaging,
- query responses can return structured empty-state recovery actions instead of a plain string,
- repeated identical read-path requests reuse explicit short-lived route caching,
- test coverage and README documentation now reflect the richer explorer workflow.

Persisted named saved views are still intentionally out of scope until storage and ownership requirements are defined.

## Context and Orientation

- `lib/explore-config.ts` now holds the reusable explorer state shape and preset definitions.
- `lib/explore-state.ts` normalizes URL state, metric-scoped defaults, and recovery patches.
- `lib/chart-support.ts` centralizes supported-view and recommended-view reasoning for both UI and API layers.
- `components/explore-page.tsx`, `components/query-builder.tsx`, and `components/result-surface.tsx` implement the visible Phase 2 UX.
- `app/api/metrics/search/route.ts`, `app/api/metrics/[metricId]/route.ts`, `app/api/chart-recommendation/route.ts`, and `app/api/query/route.ts` now apply explicit route-cache behavior.
- `tests/*` includes new coverage for chart recommendation logic and route-cache behavior.

## Plan of Work

1. Move explorer defaults and preset definitions into a reusable module.
2. Centralize chart recommendation rules so the explorer UI and API agree on supported and suggested views.
3. Extend the query response contract with recommendation reasons and structured empty-state recovery actions.
4. Add share/reset affordances and guided copy to the `/explore` UI.
5. Add explicit short-lived caching for repeated read-path requests and document the freshness trade-offs.
6. Update tests and README to match the new explorer behavior.

## Concrete Steps

    cd /home/john/tlg/macro-frontend
    npm run lint
    npm run typecheck
    npm run test

Expected outcomes:

- lint passes for the shared state, route-cache, and UI changes,
- typecheck passes across the richer query contract and response handling,
- tests cover the new chart-support rules, route-cache behavior, and updated contracts.

## Validation and Acceptance

- A user can copy a share link from `/explore` and keep the normalized explorer state in the URL.
- Starter presets and metric-scoped defaults lead users toward a valid chart without manual correction.
- Empty or unsupported states present actionable recovery buttons rather than a dead-end message.
- The recommended chart and supported chart options stay aligned between UI state and API responses.
- Repeated identical read requests are explicitly cacheable for short windows without hiding source freshness messaging.

## Risks and Recovery

- Risk: In-memory route caching may not survive process restarts or multi-instance deployments consistently.
  Recovery: TTLs are short, the cache is advisory only, and behavior still works correctly on a cache miss.
- Risk: Explorer recovery actions could drift from the normalized URL-state model.
  Recovery: Keep recovery patches funneled through `normalizeExplorerState()` and cover them with unit tests.
- Risk: Single-year map/bar recommendations can drift if backend result shapes change.
  Recovery: Keep `lib/chart-support.ts` as the shared decision point and update service tests when result semantics change.

## Artifacts and Notes

- Plan file: `.cursor/plans/phase-2-v1-plan_89590e4c.plan.md`
- Shared helpers: `lib/explore-config.ts`, `lib/explore-state.ts`, `lib/chart-support.ts`, `lib/route-cache.ts`
- Validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - manual browser verification of `/explore` share/reset controls, presets, and recommendation copy

## Interfaces and Dependencies

- Dependencies: `next`, `react`, `zod`, `pg`, `server-only`, `xlsx`, `vitest`
- Updated endpoints:
  - `GET /api/metrics/search`
  - `GET /api/metrics/[metricId]`
  - `POST /api/query`
  - `POST /api/chart-recommendation`
- Updated shared contracts:
  - `lib/contracts/query.ts`
  - `lib/contracts/chart-recommendation.ts`
