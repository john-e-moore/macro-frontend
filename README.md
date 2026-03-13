# Macro Frontend

`macro-frontend` is a Next.js App Router application for a guided, self-serve macro dashboard. The repository contains both the user-facing UI and the server-side query/export layer. It follows the product and delivery constraints in `.agent/SPEC.md`, `.agent/ROADMAP.md`, and `.agent/AGENTS.md`.

## Product Goals

The app should help non-technical users:

- discover curated macro metrics,
- understand definitions, units, sources, and caveats,
- build simple geography and time comparisons,
- view results as trusted tables or a limited chart set,
- export the exact filtered result they are looking at.

## Architecture

Phase 2 builds on the completed MVP and keeps the same semantic-query architecture while improving explorer defaults, recovery guidance, and shareability:

- `app/`: App Router pages and route handlers.
- `app/api/`: validated server-side endpoints for search, metadata lookup, queries, chart recommendation, and export.
- `components/`: reusable UI building blocks for the dashboard, charts, and state map.
- `lib/catalog/`: semantic metric catalog types, seed data, and helpers.
- `lib/contracts/`: stable request and response contracts shared by route handlers and callers.
- `lib/db/`: server-only database access utilities using a read-only Postgres user.
- `lib/services/`: thin domain services backing the API routes.
- `lib/validation/`: request parsing helpers.
- `tests/`: baseline catalog, contract, and environment tests.

## Environment Setup

Copy `.env.template` to `.env` and fill in the Postgres credentials for a dedicated read-only user.

Required server-only variables:

- `PG_HOST`
- `PG_PORT`
- `PG_DATABASE`
- `PG_USER`
- `PG_PASSWORD`
- `PG_URL`

Optional variables:

- `MACRO_DB_SCHEMA` defaults to `serving`
- `NEXT_PUBLIC_APP_URL` defaults to `http://localhost:3000`

The browser must never connect directly to Postgres. Database access belongs in `lib/db/` and should always flow through validated server-side contracts.

## Local Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

Use these checks before considering a milestone complete:

```bash
npm run lint
npm run typecheck
npm run test
```

If real database credentials are unavailable, catalog and contract tests still run. Live query behavior depends on the read-only Postgres connection described above.

## Current Product Surface

The app now ships the roadmap MVP plus the first Phase 2 explorer improvements:

- `/` is a landing page with guided entry points and starter journeys.
- `/catalog` supports metric search, category browsing, and reusable metadata inspection.
- `/explore` provides a URL-backed query builder, smarter defaults and preset cards, share/reset controls, chart switching, actionable empty-state recovery, and CSV/XLSX export actions.

The live metric workflows currently cover:

- state PCE maps and multi-year PCE level comparisons,
- selected-state aggregate recomputation alongside derived US overall values,
- PCE trend storytelling with all-items implicit inflation and category-level nominal growth,
- federal direct-transfer and program-funding comparisons against state GDP.

The Phase 2 explorer improvements specifically add:

- reusable preset definitions and metric-scoped defaults for quicker first-success charts,
- copyable share links and reset controls built on canonical URL state,
- recommendation reasons for auto chart selection,
- structured recovery actions for empty or unsupported query states,
- short-lived explicit API caching for repeated metric search, metadata, chart recommendation, and identical query reads.

## Data Notes

- State PCE levels currently use annual BEA SAPCE1 state data.
- Per-capita PCE is derived in the app from raw PCE plus resident population because the current serving convenience view duplicates Census rows.
- True state-category PCE price indexes are not available in the current serving layer, so category trend stories use nominal PCE growth. All-items implicit PCE inflation is still available via nominal versus real PCE.

## Explorer Workflow

1. Start on `/` and choose either a curated starter journey or a direct path into the catalog or explorer.
2. Use `/catalog` to search metrics in plain English and inspect the reusable metadata panel.
3. Open `/explore` with a prefilled metric or use one of the starter presets to reach a valid result quickly.
4. Adjust metric, category, state selection, time range, comparison mode, and view while following the suggested starting-view guidance.
5. Copy the share link or refresh the page without losing the normalized explorer state.
6. Use the empty-state recovery actions if a query returns no rows or falls outside the current live scope.
7. Export the exact filtered result as CSV or XLSX from the result surface.

## Planning And PRs

- The active implementation plans for this repo live in `.cursor/plans/metrics_phase_one_a0753413.plan.md`, `.cursor/plans/phase_1_mvp_07bff4ef.plan.md`, and `.cursor/plans/phase-2-v1-plan_89590e4c.plan.md`.
- Cross-cutting work should also be tracked in `.agent/PLANS.md`.
- Substantial pull requests should follow `.agent/PR_TEMPLATE.md`, including a `.cursor/` plan reference when one exists.
