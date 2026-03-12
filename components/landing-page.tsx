import Link from "next/link";

import type { MetricCatalogSummary } from "@/lib/catalog/types";

const starterJourneys = [
  {
    title: "Browse metrics",
    body: "Start with plain-English descriptions, categories, and metadata before you choose a chart.",
    href: "/catalog",
    cta: "Open catalog",
  },
  {
    title: "Explore PCE maps",
    body: "Compare state spending levels or per-capita spending and export the filtered result.",
    href: "/explore?metric=pce-total&view=map&category=all&startYear=2024&endYear=2024&states=CA,TX,NY",
    cta: "Launch map preset",
  },
  {
    title: "Tell a trend story",
    body: "Compare selected states with the US using all-items inflation or category-level PCE growth.",
    href: "/explore?metric=pce-growth-yoy&view=multi_line&category=food&startYear=2021&endYear=2024&states=CA,TX,NY&excludedStates=CA",
    cta: "Launch trend preset",
  },
];

export function LandingPage({
  metrics,
}: {
  metrics: MetricCatalogSummary[];
}) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10">
      <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-950 p-8 text-slate-50 shadow-2xl shadow-slate-950/15 lg:grid-cols-[1.8fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Phase 1 MVP
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            A guided macro dashboard for discovering, comparing, and exporting trusted data.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Browse a curated metric catalog, inspect definitions and caveats, build a
            simple geography or time comparison, and export the exact result you are
            viewing without touching SQL.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
            >
              Browse metrics
            </Link>
            <Link
              href="/explore"
              className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-slate-500"
            >
              Start exploring
            </Link>
          </div>
        </div>
        <div className="grid gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-6 text-cyan-50">
          <div>
            <p className="font-semibold">What this MVP supports</p>
            <p className="mt-2">
              Searchable catalog, validated query contracts, table and chart views,
              metadata panels, URL-backed state, and CSV/XLSX exports.
            </p>
          </div>
          <div>
            <p className="font-semibold">Current metric coverage</p>
            <p className="mt-2">{metrics.length} live or partial semantic metrics.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {starterJourneys.map((journey) => (
          <article
            key={journey.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-950">{journey.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{journey.body}</p>
            <Link
              href={journey.href}
              className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              {journey.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">
            Product guardrails
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Users work with human-readable metrics, not raw warehouse tables.</li>
            <li>Every result flows through validated server-side query contracts.</li>
            <li>The browser never talks directly to the database.</li>
            <li>Definitions, units, sources, freshness, and caveats stay visible.</li>
            <li>Exports match the filtered result set shown in the UI.</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">
            Starter metrics
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {metrics.slice(0, 6).map((metric) => (
              <Link
                key={metric.id}
                href={`/explore?metric=${metric.id}`}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                {metric.displayName}
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
