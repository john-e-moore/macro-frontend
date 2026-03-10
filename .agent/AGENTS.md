# AGENTS.md

This file defines how coding agents should work in this Next.js repository.
It complements `README.md`, product docs, and `.agent/SPEC.md` by focusing on execution behavior.

## Project Context

- Repository purpose: build a self-serve macro data dashboard in Next.js for exploring curated database data.
- Deployment target: Vercel.
- Repository shape: one repo containing both the frontend UI and the server-side API/query layer.
- Product priority: make data discovery, charting, and export easy for non-technical users.
- Source of truth for product and engineering requirements: `.agent/SPEC.md`.

## Instruction Priority

When instructions conflict, use this precedence:

1. Direct user request in the active session.
2. This file (`.agent/AGENTS.md`).
3. Project docs and `.agent/SPEC.md`.
4. Default framework and tool conventions.

If required information is missing, make a safe, explicit assumption and record it in the active plan or worklog.

## Working Agreement

- Prefer simple, maintainable solutions over clever abstractions.
- Optimize for clarity, discoverability, and trustworthiness for end users.
- Treat the semantic query layer as a product surface, not an implementation detail.
- Keep the client thin when possible; enforce data access and validation on the server.
- Do not expose secrets, raw credentials, or unrestricted database access to the browser.

## Non-Negotiable Product Constraints

- Users should interact with human-readable metrics, not raw database table names or line codes.
- Every user-visible query must resolve through a validated server-side contract.
- The initial chart grammar should remain intentionally small:
  - `table`
  - `bar`
  - `line`
  - `multi_line`
  - `map`
- Exported data must match the filtered result the user is looking at.
- The UI should explain what a metric means, where it comes from, and any important caveats.

## Required Delivery Behavior

For any non-trivial feature or refactor, the agent should:

1. Read `.agent/SPEC.md` before coding.
2. Create or update an ExecPlan in `.agent/PLANS.md` when the work is cross-cutting or ambiguous.
3. Introduce behavior in small, reviewable increments.
4. Validate server and client behavior with relevant checks.
5. Update product or developer docs when behavior changes.

Do not stop at a partial implementation unless blocked by missing credentials, missing backend access, or explicit user direction.

## When To Use Feature Briefs

Create a feature brief under `.agent/features/<YYYY-MM-DD>-<feature-name>/SPEC.md` for substantial new work, especially when it:

- introduces a new end-user workflow,
- adds a new query or export capability,
- changes the semantic catalog or chart grammar,
- changes authentication, authorization, or deployment behavior,
- introduces new third-party vendors or data services.

Feature briefs should stay feature-local and should not duplicate repository-wide requirements from `.agent/SPEC.md`.

## ExecPlans

Use an ExecPlan by default when work:

- touches both UI and API layers,
- changes query contracts or result shapes,
- affects caching, performance, or data freshness,
- changes routing, layout, or navigation patterns,
- impacts exports, share links, or user-facing state persistence.

The ExecPlan standard is defined in `.agent/PLANS.md`.

## Preferred Architecture

Agents should treat this as the default architecture unless the user requests otherwise:

- Next.js App Router.
- TypeScript.
- Server-first data access:
  - route handlers, server components, or server utilities for database-backed reads,
  - client components only where interactivity requires them.
- A thin semantic API layer between UI controls and the database.
- Reusable UI primitives for filters, metric selection, chart display, tables, and export actions.

## Data Access Rules

- Never let the browser talk directly to the database.
- Never build unrestricted text-to-SQL as a default interface.
- Prefer parameterized, validated server-side query builders over ad hoc query strings.
- Keep database access read-only for the application runtime unless a feature explicitly requires writes.
- Treat metric definitions, labels, and caveats as first-class data that may live outside the fact tables.

## UX and Product Conventions

- Default to sensible presets and progressive disclosure.
- Make query state shareable by URL when practical.
- Show loading, empty, and error states clearly.
- Prefer a guided query builder over a blank screen.
- Explain metrics in plain language near the point of use.
- Avoid chart choices that exceed the data shape or user intent.

## Validation Expectations

Before claiming completion, validate with the most relevant checks available:

- lint and typecheck,
- unit tests for query helpers, formatters, and state logic,
- component or integration tests for key user workflows,
- manual verification for chart rendering and export behavior when automated coverage is insufficient.

If full validation cannot run, report exactly what was run, what was not run, and why.

## Documentation Expectations

Update docs whenever behavior changes for:

- query contracts and metric catalog behavior,
- chart support and visualization rules,
- export behavior,
- routing/navigation structure,
- environment variables and deployment setup,
- caching and freshness expectations.

## Security and Reliability Guardrails

- Do not expose database credentials or privileged service tokens to the client.
- Validate all user-provided query parameters on the server.
- Rate-limit or otherwise protect expensive endpoints if usage patterns justify it.
- Prefer predictable and explainable caching behavior over opaque magic.
- Log enough request context for debugging without logging sensitive user data unnecessarily.

## Completion Checklist

- Requirements traced back to `.agent/SPEC.md`.
- Plan updated in `.agent/PLANS.md` if scope is substantial.
- UI, API, and docs remain aligned.
- Validation results are clear.
- No secrets or unsafe data access patterns were introduced.
