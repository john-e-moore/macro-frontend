import Link from "next/link";

import { listMetrics } from "@/lib/catalog";

const foundationTracks = [
  {
    title: "Semantic catalog",
    body: "Typed metric definitions, aliases, caveats, and chart suitability live in one reviewable domain layer.",
  },
  {
    title: "Validated contracts",
    body: "Search, metadata, query, chart recommendation, and export all flow through shared request and response schemas.",
  },
  {
    title: "Server-only data access",
    body: "The database layer is isolated behind a read-only Postgres utility and never exposed to the browser.",
  },
];

const apiSurface = [
  "GET /api/metrics/search",
  "GET /api/metrics/[metricId]",
  "POST /api/query",
  "POST /api/chart-recommendation",
  "POST /api/export",
];

export function FoundationShell() {
  const metrics = listMetrics();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10">
      <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-950 p-8 text-slate-50 shadow-2xl shadow-slate-950/20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Roadmap Phase 0
        </p>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Foundations for a trustworthy self-serve macro dashboard.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              This repository now encodes the product shape described in
              `.agent/ROADMAP.md`: a guided Next.js dashboard with semantic
              metric definitions, validated server contracts, and export-ready
              result shapes.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm text-cyan-50">
            <p className="font-semibold">Current foundation scope</p>
            <p className="mt-2 leading-6">
              Contract-first API routes, sample catalog-backed services, server
              db utilities, and baseline validation for lint, typecheck, and
              tests.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            className="rounded-full bg-cyan-300 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-200"
            href="/api/metrics/search?q=unemployment"
          >
            Try search endpoint
          </Link>
          <Link
            className="rounded-full border border-slate-700 px-4 py-2 font-medium text-slate-100 transition hover:border-slate-500"
            href="/api/metrics/unemployment-rate"
          >
            View metric metadata
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {foundationTracks.map((track) => (
          <article
            key={track.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-950">
              {track.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{track.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">
              Seed metric catalog
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {metrics.length} starter metrics
            </span>
          </div>
          <div className="mt-5 grid gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {metric.displayName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {metric.shortDescription}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                    {metric.category}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                    {metric.unit}
                  </span>
                  {metric.allowedChartTypes.map((chartType) => (
                    <span
                      key={chartType}
                      className="rounded-full bg-white px-3 py-1 shadow-sm"
                    >
                      {chartType}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">
            Phase 0 API surface
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {apiSurface.map((endpoint) => (
              <li
                key={endpoint}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono"
              >
                {endpoint}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            Query and export behavior are intentionally lightweight for now, but
            they already enforce stable request parsing and response shapes that
            later phases can extend without reworking the UI contract.
          </p>
        </article>
      </section>
    </main>
  );
}
