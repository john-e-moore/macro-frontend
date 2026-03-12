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

Phase 1 builds on the completed foundation and now connects the semantic catalog to live serving-layer queries and user-facing product routes:

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

## Current Phase 1 Surface

The app now ships the MVP route structure described in the roadmap:

- `/` is a landing page with guided entry points and starter journeys.
- `/catalog` supports metric search, category browsing, and reusable metadata inspection.
- `/explore` provides a URL-backed query builder, result surface, chart switching, and CSV/XLSX export actions.

The live metric workflows currently cover:

- state PCE maps and multi-year PCE level comparisons,
- selected-state aggregate recomputation alongside derived US overall values,
- PCE trend storytelling with all-items implicit inflation and category-level nominal growth,
- federal direct-transfer and program-funding comparisons against state GDP.

## Data Notes

- State PCE levels currently use annual BEA SAPCE1 state data.
- Per-capita PCE is derived in the app from raw PCE plus resident population because the current serving convenience view duplicates Census rows.
- True state-category PCE price indexes are not available in the current serving layer, so category trend stories use nominal PCE growth. All-items implicit PCE inflation is still available via nominal versus real PCE.

## MVP Workflow

1. Start on `/` and choose either a curated starter journey or a direct path into the catalog or explorer.
2. Use `/catalog` to search metrics in plain English and inspect the reusable metadata panel.
3. Open `/explore` with a prefilled metric or start from defaults, then adjust metric, category, state selection, time range, comparison mode, and view.
4. Share or refresh the configured explorer URL without losing the current query state.
5. Export the exact filtered result as CSV or XLSX from the result surface.

## Planning And PRs

- The active implementation plans for this repo live in `.cursor/plans/metrics_phase_one_a0753413.plan.md` and `.cursor/plans/phase_1_mvp_07bff4ef.plan.md`.
- Cross-cutting work should also be tracked in `.agent/PLANS.md`.
- Substantial pull requests should follow `.agent/PR_TEMPLATE.md`, including a `.cursor/` plan reference when one exists.
