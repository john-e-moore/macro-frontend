---
name: phase-0 foundations
overview: "Implement Roadmap Phase 0 by replacing the starter app with a server-first Next.js foundation: clear module boundaries, environment and database safety rails, an explicit semantic metric catalog model, stable query/export contracts, and baseline validation/documentation."
todos:
  - id: execplan-and-architecture
    content: Create the Phase 0 ExecPlan and replace starter docs with product-specific architecture/setup guidance.
    status: completed
  - id: env-and-db-foundation
    content: Add typed environment loading and a server-only read-only Postgres access layer for the serving schema.
    status: completed
  - id: catalog-and-contracts
    content: Define the semantic metric catalog model plus validated request/response contracts for search, metadata, query, chart recommendation, and export.
    status: completed
  - id: api-shell-and-ui-shell
    content: Add thin API route handlers and replace the starter page/layout with a product-aware App Router foundation shell.
    status: completed
  - id: quality-gates
    content: Add typecheck/test tooling, baseline tests, and documented validation steps for the new foundation.
    status: completed
isProject: false
---

# Roadmap Phase 0 Foundations

## Goal

Replace the current starter-state repository with a durable foundation for the macro dashboard described in [.agent/ROADMAP.md](/home/john/tlg/macro-frontend/.agent/ROADMAP.md) and [.agent/SPEC.md](/home/john/tlg/macro-frontend/.agent/SPEC.md): Next.js App Router, server-only database access, explicit semantic catalog types, stable API contracts, and baseline validation/docs.

## Current State

- The app exists but is still mostly the generated starter in `[app/page.tsx](/home/john/tlg/macro-frontend/app/page.tsx)`, `[app/layout.tsx](/home/john/tlg/macro-frontend/app/layout.tsx)`, and `[README.md](/home/john/tlg/macro-frontend/README.md)`.
- Environment conventions already exist in `[.env.template](/home/john/tlg/macro-frontend/.env.template)`, but there is no database utility, validation layer, semantic catalog, API layer, or tests yet.
- `package.json` only provides `dev`, `build`, `start`, and `lint`, so Phase 0 still needs typecheck and test workflows.

## Implementation Plan

### 1. Establish the working architecture and plan record

- Create an ExecPlan entry in `[.agent/PLANS.md](/home/john/tlg/macro-frontend/.agent/PLANS.md)` before code changes, because this work is cross-cutting and sets contracts for later phases.
- Replace the starter README with repository-specific setup and architecture notes in `[README.md](/home/john/tlg/macro-frontend/README.md)`.
- Normalize the top-level structure around App Router plus reusable server/domain modules, likely introducing paths such as:
  - `[app/](/home/john/tlg/macro-frontend/app)`
  - `[app/api/](/home/john/tlg/macro-frontend/app/api)`
  - `[components/](/home/john/tlg/macro-frontend/components)`
  - `[lib/catalog/](/home/john/tlg/macro-frontend/lib/catalog)`
  - `[lib/contracts/](/home/john/tlg/macro-frontend/lib/contracts)`
  - `[lib/db/](/home/john/tlg/macro-frontend/lib/db)`
  - `[lib/validation/](/home/john/tlg/macro-frontend/lib/validation)`
  - `[lib/export/](/home/john/tlg/macro-frontend/lib/export)`
  - `[tests/](/home/john/tlg/macro-frontend/tests)`

### 2. Lock in server-only environment and database access

- Add a typed env loader such as `[lib/env.ts](/home/john/tlg/macro-frontend/lib/env.ts)` that validates required server variables from `[.env.template](/home/john/tlg/macro-frontend/.env.template)`, keeps `PG_*` values server-only, and centralizes defaults like `MACRO_DB_SCHEMA`.
- Add a server-only database module such as `[lib/db/server.ts](/home/john/tlg/macro-frontend/lib/db/server.ts)` for read-only Postgres access to the `serving` schema.
- Document local setup, required vars, and the read-only `serving` expectation in `[README.md](/home/john/tlg/macro-frontend/README.md)` and `[.env.template](/home/john/tlg/macro-frontend/.env.template)` if any naming cleanup is needed.
- Add a small health/check utility or smoke-tested query boundary so later data work can reuse the connection layer without coupling UI to SQL.

### 3. Define the semantic catalog domain model

- Create catalog types and starter seed data in files such as `[lib/catalog/types.ts](/home/john/tlg/macro-frontend/lib/catalog/types.ts)` and `[lib/catalog/seed.ts](/home/john/tlg/macro-frontend/lib/catalog/seed.ts)`.
- Ensure the catalog shape covers the Phase 0 fields required by the spec: stable id, display name, short description, long definition, source, unit, aliases, allowed chart types, geography coverage, time coverage, and caveats.
- Add catalog helpers such as normalization/search metadata builders in `[lib/catalog/index.ts](/home/john/tlg/macro-frontend/lib/catalog/index.ts)` so Phase 1 discovery UI can consume a stable interface rather than raw objects.
- Keep the chart grammar constrained to `table`, `bar`, `line`, `multi_line`, and `map` at the type level.

### 4. Define stable request/response contracts and validation

- Introduce a runtime validation library and use it for all user-controlled inputs.
- Create shared contract modules for the Phase 0 server surface, likely:
  - `[lib/contracts/metric-search.ts](/home/john/tlg/macro-frontend/lib/contracts/metric-search.ts)`
  - `[lib/contracts/metric-metadata.ts](/home/john/tlg/macro-frontend/lib/contracts/metric-metadata.ts)`
  - `[lib/contracts/query.ts](/home/john/tlg/macro-frontend/lib/contracts/query.ts)`
  - `[lib/contracts/chart-recommendation.ts](/home/john/tlg/macro-frontend/lib/contracts/chart-recommendation.ts)`
  - `[lib/contracts/export.ts](/home/john/tlg/macro-frontend/lib/contracts/export.ts)`
- Separate request validation from service logic with schema files under `[lib/validation/](/home/john/tlg/macro-frontend/lib/validation)`.
- Design response shapes to always make room for rows, column metadata, display metadata, warnings/caveats, and empty-state reasons so later UI work does not invent hidden assumptions.

### 5. Add minimal route handlers and service boundaries

- Create placeholder-but-real server endpoints under `[app/api/](/home/john/tlg/macro-frontend/app/api)` for the five required capabilities: metric search, metadata lookup, filtered query, chart recommendation, and export.
- Back these handlers with service modules under `[lib/](/home/john/tlg/macro-frontend/lib)` so route handlers stay thin and the contracts are testable independently.
- For Phase 0, prefer small stubbed or catalog-backed implementations where full query behavior is not yet needed, but keep signatures and validation production-oriented.
- Ensure no client component or browser code imports database utilities directly.

### 6. Replace the starter UI with a foundation shell

- Replace the default starter page in `[app/page.tsx](/home/john/tlg/macro-frontend/app/page.tsx)` with a lightweight product-aware landing shell that reflects the macro dashboard purpose.
- Update `[app/layout.tsx](/home/john/tlg/macro-frontend/app/layout.tsx)` metadata to repository/product values instead of create-next-app defaults.
- Add shared placeholders for future query-builder, results, metadata, and chart surfaces in `[components/](/home/john/tlg/macro-frontend/components)`, but avoid overbuilding interactive Phase 1 workflows.
- Favor server components by default and mark client components only where interactivity is actually required.

### 7. Add baseline quality gates and docs

- Update `[package.json](/home/john/tlg/macro-frontend/package.json)` with `typecheck` and `test` scripts, plus any required dependencies for DB access, runtime validation, and the chosen test runner.
- Add baseline tests covering env validation, catalog typing/helpers, and contract schemas under `[tests/](/home/john/tlg/macro-frontend/tests)` or colocated test files.
- Keep lint, typecheck, and tests runnable in a clean local setup even if real DB credentials are absent.
- Document architecture, contracts, env vars, and validation expectations in `[README.md](/home/john/tlg/macro-frontend/README.md)`, keeping it aligned with `[.agent/AGENTS.md](/home/john/tlg/macro-frontend/.agent/AGENTS.md)` and `[.agent/PR_TEMPLATE.md](/home/john/tlg/macro-frontend/.agent/PR_TEMPLATE.md)`.

## Acceptance Criteria

- The repository no longer presents as a generic starter app and clearly encodes the macro-dashboard product purpose.
- A newcomer can identify where routes, contracts, database access, validation, catalog logic, exports, and tests belong.
- All database access is server-only and routed through a typed, read-only utility using validated environment configuration.
- Shared contract modules exist for metric search, metadata lookup, filtered queries, chart recommendation, and export.
- The initial semantic metric catalog shape is explicit, typed, and constrained to the allowed chart grammar.
- Baseline `lint`, `typecheck`, and `test` workflows exist and are documented.
- Docs explain setup, env vars, architecture boundaries, and the intended Phase 0 contract surface.

## Validation

- Run `npm run lint`.
- Run `npm run typecheck`.
- Run the test suite for contract/env/catalog coverage.
- Manually verify that the home route renders the new product shell and that the API handlers reject invalid input cleanly.

## Risks To Watch

- Over-implementing Phase 1 workflows during foundational work.
- Letting route handlers own business logic instead of keeping reusable service modules.
- Hard-coding database assumptions that make later query work brittle.
- Introducing client-visible env access or DB coupling that violates the server-only rule.

