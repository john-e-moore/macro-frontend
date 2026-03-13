---
name: phase-2-v1-plan
overview: "Implement roadmap Phase 2 as a focused V1 improvement pass on the explorer: strengthen shareable state first, improve first-success defaults and recovery guidance, refine chart recommendations, add explicit read-path caching, and harden validation coverage. Keep true persisted saved views as a follow-on sub-phase built on the same explorer state contract rather than bundling deployment or production-ops work into this milestone."
todos:
  - id: state-and-presets
    content: Define canonical explorer state and reusable preset/default configuration for shareable views and first-success defaults.
    status: completed
  - id: recommendation-refinement
    content: Refine chart recommendation contracts and auto-view behavior around result shape and supported chart grammar.
    status: completed
  - id: empty-state-recovery
    content: Add actionable empty-state reasons and recovery paths across query responses and the result surface.
    status: completed
  - id: share-ux
    content: Implement share-focused `/explore` UX using canonical URL state, including copy/reset affordances.
    status: completed
  - id: explicit-caching
    content: Add explicit caching and freshness rules for common read flows without obscuring data recency.
    status: completed
  - id: tests-and-docs
    content: Expand explorer-focused unit/integration coverage and update README/plan documentation.
    status: completed
isProject: false
---

# Phase 2: V1 Improvements

## Goal

Make the Phase 1 explorer faster, easier to use, and more shareable without expanding beyond the roadmap’s V1 scope.

## Scope Decisions

- Treat `saved or shareable views` as a two-step track:
  - Phase 2 ships stronger URL/shareable views first.
  - True persisted saved views are planned as a follow-on sub-phase once the explorer state shape and ownership model are stable.
- Keep this plan aligned to the roadmap only; do not fold in deployment, production DB setup, or unrelated TODO items.

## Current Baseline

- `/explore` already preserves state in the URL via `[/home/john/tlg/macro-frontend/lib/explore-state.ts](/home/john/tlg/macro-frontend/lib/explore-state.ts)` and `[/home/john/tlg/macro-frontend/components/explore-page.tsx](/home/john/tlg/macro-frontend/components/explore-page.tsx)`.
- Starter presets already exist inline in `[/home/john/tlg/macro-frontend/components/explore-page.tsx](/home/john/tlg/macro-frontend/components/explore-page.tsx)`, but defaults and recommendations are still largely hard-coded.
- Empty states are present in `[/home/john/tlg/macro-frontend/components/result-surface.tsx](/home/john/tlg/macro-frontend/components/result-surface.tsx)`, but recovery actions are minimal.
- Chart recommendation logic is heuristic and metric-family driven in `[/home/john/tlg/macro-frontend/lib/services/chart-recommendation.ts](/home/john/tlg/macro-frontend/lib/services/chart-recommendation.ts)`.
- Query reads currently fetch directly from the client without explicit reuse/caching semantics in the explorer flow.

## Target Outcome

Users can open `/explore`, land on a sensible preset/default, reach a valid chart quickly, recover from sparse or unsupported queries without dead ends, share the configured view cleanly, and experience faster common read paths with transparent freshness behavior.

## Workstreams

### 1. Shareable Views First

- Extend the explorer state contract in `[/home/john/tlg/macro-frontend/lib/explore-state.ts](/home/john/tlg/macro-frontend/lib/explore-state.ts)` so URL state is canonical, normalized, and resilient to future additions.
- Add explicit share UX in `[/home/john/tlg/macro-frontend/components/explore-page.tsx](/home/john/tlg/macro-frontend/components/explore-page.tsx)` and/or `[/home/john/tlg/macro-frontend/components/result-surface.tsx](/home/john/tlg/macro-frontend/components/result-surface.tsx)`: copy link, reset-to-default, and share-state messaging.
- Keep URL and export parity intact so shared links reproduce the exact filtered view.
- Leave persisted named saved views out of the initial implementation, but shape state and route contracts so a later saved-views API can reuse them cleanly.

### 2. Better Defaults And Presets

- Move presets out of inline component state into a reusable catalog/config module, likely adjacent to `[/home/john/tlg/macro-frontend/lib/explore-state.ts](/home/john/tlg/macro-frontend/lib/explore-state.ts)` or under `lib/catalog/`.
- Revisit `defaultExplorerState` and metric-specific normalization so first load prefers a likely-successful chart and valid year/category/state combinations.
- Update `[/home/john/tlg/macro-frontend/components/query-builder.tsx](/home/john/tlg/macro-frontend/components/query-builder.tsx)` to surface clearer guided defaults and reduce invalid or low-signal combinations.

### 3. Empty-State Guidance And Recovery

- Expand the query/display contract in `[/home/john/tlg/macro-frontend/lib/contracts/query.ts](/home/john/tlg/macro-frontend/lib/contracts/query.ts)` to distinguish empty/sparse/unsupported outcomes from generic failures.
- Update `[/home/john/tlg/macro-frontend/app/api/query/route.ts](/home/john/tlg/macro-frontend/app/api/query/route.ts)` and `[/home/john/tlg/macro-frontend/lib/services/query.ts](/home/john/tlg/macro-frontend/lib/services/query.ts)` to return actionable empty-state reasons and suggested next adjustments.
- Render recovery CTAs in `[/home/john/tlg/macro-frontend/components/result-surface.tsx](/home/john/tlg/macro-frontend/components/result-surface.tsx)`, such as switching view, widening years, or changing aggregation/state selection.

### 4. Refine Chart Recommendation Behavior

- Tighten the recommendation contract in `[/home/john/tlg/macro-frontend/lib/contracts/chart-recommendation.ts](/home/john/tlg/macro-frontend/lib/contracts/chart-recommendation.ts)` so the response explains both supported views and why one is recommended.
- Replace brittle metric-id heuristics in `[/home/john/tlg/macro-frontend/lib/services/chart-recommendation.ts](/home/john/tlg/macro-frontend/lib/services/chart-recommendation.ts)` with rules based on result shape, geography count, year span, and metric capabilities.
- Make explorer auto-view behavior consume the refined recommendation consistently between `[/home/john/tlg/macro-frontend/components/explore-page.tsx](/home/john/tlg/macro-frontend/components/explore-page.tsx)`, `[/home/john/tlg/macro-frontend/components/result-surface.tsx](/home/john/tlg/macro-frontend/components/result-surface.tsx)`, and the chart-recommendation API.

### 5. Explicit Caching And Freshness

- Identify common read flows worth caching first: metric search, metric metadata lookup, chart recommendation, and repeat query requests with identical normalized parameters.
- Add explicit caching rules in the relevant route handlers:
  - `[/home/john/tlg/macro-frontend/app/api/metrics/search/route.ts](/home/john/tlg/macro-frontend/app/api/metrics/search/route.ts)`
  - `[/home/john/tlg/macro-frontend/app/api/metrics/[metricId]/route.ts](/home/john/tlg/macro-frontend/app/api/metrics/[metricId]/route.ts)`
  - `[/home/john/tlg/macro-frontend/app/api/chart-recommendation/route.ts](/home/john/tlg/macro-frontend/app/api/chart-recommendation/route.ts)`
  - `[/home/john/tlg/macro-frontend/app/api/query/route.ts](/home/john/tlg/macro-frontend/app/api/query/route.ts)`
- Document freshness expectations in UI copy and docs rather than hiding behind opaque caching.
- Prefer low-risk, parameter-keyed server caching or Next.js fetch/cache semantics over a custom cache layer unless measurement proves it necessary.

### 6. Coverage And Documentation Hardening

- Add unit coverage for explorer state normalization, presets, and chart recommendation rules.
- Add component/integration coverage for the key `/explore` workflow: preset/default load, URL restoration, empty-state recovery, auto-view recommendation, and export/share parity.
- Update `[/home/john/tlg/macro-frontend/README.md](/home/john/tlg/macro-frontend/README.md)` and the active plan/docs to reflect share behavior, caching semantics, and improved UX expectations.

## Suggested Sequence

1. Stabilize explorer state and preset/config contracts.
2. Refine chart recommendation inputs/outputs and wire auto-view behavior to them.
3. Extend query/response contracts for richer empty-state reasons and recovery suggestions.
4. Add share UX on top of the canonical URL state.
5. Add explicit caching to the common read paths with documented freshness behavior.
6. Finish with tests, docs, and validation evidence.

## Acceptance Criteria

- A copied `/explore` link restores the same normalized metric/filter/view state and reproduces the same visible result intent.
- Default explorer state and starter presets reach a supported, meaningful result without extra corrective steps.
- Sparse or unsupported queries show a clear reason and at least one concrete recovery path.
- Auto view selection is consistent with supported chart types and result shape.
- Common read flows are measurably faster or less redundant, and freshness behavior remains understandable to the user.
- Key explorer workflows are covered by unit and integration/component tests.

## Risks And Follow-ons

- Persisted saved views remain ambiguous until storage, naming, and ownership requirements are defined; keep that as a follow-on scope after shareable URL state is hardened.
- Caching work can cause trust issues if freshness copy is vague; every cache decision should have an explicit UX explanation.
- If recommendation logic starts depending on actual query-result shape, sequencing may require a small contract change between query and recommendation surfaces.

