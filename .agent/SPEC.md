# Self-Serve Macro Dashboard — Repository Spec

You are building a new repository for a self-serve macro data dashboard using **Next.js** and **Vercel**.
This repo contains both the user-facing frontend and the server-side API/query layer.

The goal is not merely to display charts. The goal is to make it easy for non-technical users to:

- discover what data exists,
- understand what each metric means,
- build simple views and charts,
- compare states and time periods,
- export clean tables for downstream work.

This repository should stay lightweight, practical, and easy to extend.

---

## Goal

Build a dashboard application that lets users:

1. Browse and search a metric catalog backed by the curated macro database.
2. Select metrics, geographies, and time ranges without needing SQL knowledge.
3. View results as:
   - tables
   - bar charts
   - line charts
   - multi-line charts
   - state choropleth maps
4. Export the exact filtered result set as:
   - `.csv`
   - `.xlsx`
5. Inspect definitions, source metadata, units, and caveats for the displayed data.

The default mental model should be: users choose a **metric** and a **view**, not a raw dataset/table/line code.

---

## Non-Goals

Explicitly out of scope for the initial version:

- LLM or chatbot features
- arbitrary text-to-SQL
- free-form chart authoring beyond the supported chart grammar
- complex multi-user collaboration
- writeback workflows beyond lightweight product metadata or feedback, if added later

---

## Product Principles

- **Discoverability first**: users should be able to find useful data even if they do not know exact dataset names.
- **Guided over open-ended**: prefer guided builders, presets, and suggestions over blank canvases.
- **Trust over novelty**: show source, units, definitions, and caveats alongside results.
- **Simple defaults**: default chart choices and filter values should usually "just work."
- **Consistent semantics**: all UI surfaces should use the same metric catalog and query contracts.

---

## High-Level Architecture

### 1. App Framework

- Next.js
- App Router
- TypeScript
- Deployed on Vercel

### 2. Repository Scope

One repository contains:

- frontend routes and components,
- server-rendered pages where helpful,
- route handlers/server utilities for read-only data access,
- export generation,
- shared query and formatting logic.

### 3. Data Access

The browser must not connect directly to the database.

Instead:

- UI controls call validated server-side query endpoints or server-side utilities.
- The server maps user-friendly metric selections to safe query logic.
- Query parameters are validated before execution.
- Application database access should be read-only by default.

### 4. Semantic Layer

The application should treat the existing database `serving` layer as the primary read surface where practical, but the app may add its own application-level semantic catalog, including:

- display names,
- definitions,
- aliases,
- units and formatting rules,
- chart suitability,
- caveats,
- grouping/taxonomy metadata.

This catalog may live in code, a database table, or both. The main requirement is that it remains explicit and reviewable.

---

## Core User Workflows

### 1. Explore Metrics

Users can:

- search metrics by name or keyword,
- browse by category,
- inspect available years and geographies,
- see plain-English definitions and source notes.

### 2. Build a View

Users can choose:

- one or more metrics where supported,
- geography scope,
- time range,
- comparison mode,
- chart or table view.

The application should suggest a sensible default visualization based on the result shape.

### 3. Inspect Results

Users can:

- switch between table and chart where allowed,
- inspect data values via tooltips or row views,
- see metadata such as units, source, and last updated information.

### 4. Export Results

Users can export the currently filtered result set to `.csv` and `.xlsx`.

Exports must reflect the visible filters and should include enough metadata to remain understandable outside the app when practical.

---

## Supported Visualization Grammar

The initial supported chart types are intentionally limited to:

- `table`
- `bar`
- `line`
- `multi_line`
- `map`

The system should choose among these based on data shape and the user's selected view.
Do not introduce an unconstrained visualization grammar in the first version.

### Suggested defaults

- Single metric, many states, one year: `bar` or `map`
- Single metric, one state, many years: `line`
- Single metric, several states, many years: `multi_line`
- Any result where precise values matter most: `table`

---

## Required Application Surfaces

Create a repository that is prepared to support at least these surfaces:

- Home or landing page with guided entry points
- Metric discovery/catalog page
- Query builder or explorer page
- Result display area with chart/table switching
- Export action(s)
- Reusable metadata panel or module
- API/query layer inside the same repo

The exact routes and file structure are up to the implementer.

---

## Data and Query Requirements

### Query Model

The application should expose a small number of stable server-side query contracts rather than leaking raw SQL concerns into the UI.

Typical capabilities should include:

- metric search
- metric metadata lookup
- filtered data queries
- chart recommendation
- export generation

### Validation

All user-controlled query input must be validated server-side, including:

- metric identifiers
- geography parameters
- year or date ranges
- chart type requests
- export format requests

### Response Shape

Response contracts should be explicit and stable enough that the UI can render them without hidden assumptions.

Where useful, return:

- result rows,
- column metadata,
- chart recommendation or chart-ready series,
- display metadata,
- warnings or caveats,
- empty-state reasons.

---

## Metric Catalog Requirements

The metric catalog is a first-class product feature.

For each metric or semantic measure, support as much of the following as is practical:

- stable identifier
- display name
- short description
- longer definition
- source
- unit
- allowed geographies
- available time coverage
- allowed chart types
- known caveats
- search aliases or keywords

The user should not need to know internal table names to find a metric.

---

## UX Requirements

### Ease of Use

- Prefer guided choices and presets over raw filter forms.
- Make the "first successful chart" easy to achieve.
- Keep empty states actionable.
- Keep filter controls understandable to non-technical users.

### Transparency

- Show metric definitions and caveats near the result.
- Label units clearly.
- Show data source and freshness information when available.

### State and Navigation

- Preserve useful state in the URL when practical.
- Support direct linking to a configured view.
- Avoid making users rebuild their filters after refresh or simple navigation.

### Accessibility and Responsiveness

- Keyboard-accessible controls
- Adequate contrast
- Responsive layouts that still preserve usability on smaller screens

---

## Performance and Reliability

- Prefer server-side data fetching for database-backed reads.
- Cache carefully and explicitly where it improves performance without confusing freshness expectations.
- Avoid overly expensive queries for common exploration flows.
- Handle loading, empty, and error states cleanly.
- Log request context needed for debugging without leaking sensitive data.

---

## Security Requirements

- No direct browser access to the database.
- No secrets committed to the repository.
- Validate all user input on the server.
- Keep app database access read-only unless a feature explicitly requires writes.
- If authentication is added later, design it cleanly rather than scattering auth logic across route handlers.

---

## Suggested Code Organization

The final repository structure is up to the implementer, but it should cleanly separate concerns such as:

- routes/pages
- server-side query handlers
- shared UI components
- chart components
- metric catalog and metadata utilities
- database access utilities
- export helpers
- validation schemas
- tests

Prefer clear module boundaries over deeply abstracted generic frameworks.

---

## Validation Expectations

Before claiming a meaningful milestone is complete, validate with the most relevant checks available:

- lint
- typecheck
- unit tests
- integration or component tests for important flows
- manual verification of chart rendering and export behavior if needed

If some checks cannot run, document what was not run and why.

---

## Initial Milestones

### MVP

- Metric catalog and search
- Guided query builder
- Table, bar, line, multi-line, and map support
- CSV/XLSX export
- Plain-English definitions and metadata display

### V1

- Saved or shareable views
- Better defaults and presets
- Better empty-state guidance
- Improved performance and caching

### V2

- Optional AI-assisted query translation on top of the same semantic contracts
- User feedback capture on metric quality or result usefulness
- More advanced chart and comparison workflows

---

## Output Expectation

Create a repository that a new contributor can understand and extend without reverse-engineering product intent.

When finished, the repo should clearly encode that:

- this is a Next.js self-serve dashboard product,
- the semantic metric catalog is a core feature,
- server-side query validation is mandatory,
- simplicity and trustworthiness matter more than feature sprawl,
- the initial experience is optimized for non-technical users exploring macro data.
