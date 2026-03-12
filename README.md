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

Phase 0 establishes the repository shape and contract boundaries for later roadmap phases:

- `app/`: App Router pages and route handlers.
- `app/api/`: validated server-side endpoints for search, metadata lookup, queries, chart recommendation, and export.
- `components/`: reusable UI building blocks and foundation shell components.
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

If real database credentials are unavailable, Phase 0 tests still run because the current API surface is backed by typed contracts and lightweight seed data.

## Current Phase 0 Surface

Phase 0 intentionally provides a real foundation without completing the full Phase 1 user workflow:

- product-aware landing page shell,
- semantic metric catalog model and helpers,
- server-only database configuration and pool factory,
- validated API contracts for search, metadata, query, chart recommendation, and export,
- CSV and XLSX export generation from the shared query result shape.

## Planning And PRs

- The active implementation plan for this phase lives in `.cursor/plans/phase-0_foundations_658d864f.plan.md`.
- Cross-cutting work should also be tracked in `.agent/PLANS.md`.
- Substantial pull requests should follow `.agent/PR_TEMPLATE.md`, including a `.cursor/` plan reference when one exists.
