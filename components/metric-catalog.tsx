import Link from "next/link";

import type { MetricCatalogEntry, MetricCatalogSummary } from "@/lib/catalog/types";

import { MetadataPanel } from "@/components/metadata-panel";

export function MetricCatalog({
  metrics,
  categories,
  selectedCategory,
  query,
  featuredMetric,
}: {
  metrics: MetricCatalogSummary[];
  categories: string[];
  selectedCategory: string;
  query: string;
  featuredMetric: MetricCatalogEntry | null;
}) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10">
      <section className="grid gap-5 rounded-3xl border border-white/10 bg-slate-950 p-8 text-slate-50 shadow-2xl shadow-slate-950/15 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Metric catalog
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Discover curated macro metrics before you build a view.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Search by plain-English terms, browse by category, and inspect units,
            freshness, caveats, and chart support before jumping into the explorer.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-6 text-cyan-50">
          <p className="font-semibold">Catalog summary</p>
          <p className="mt-2">
            {metrics.length} metric{metrics.length === 1 ? "" : "s"} currently match
            your filters.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="grid gap-6">
          <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1.3fr_0.7fr_auto]">
            <label className="grid gap-2 text-sm text-slate-700">
              <span className="font-medium">Search metrics</span>
              <input
                name="q"
                defaultValue={query}
                placeholder="inflation, GDP, food spending..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              <span className="font-medium">Category</span>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white"
              >
                Apply
              </button>
              <Link
                href="/catalog"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Reset
              </Link>
            </div>
          </form>

          <div className="grid gap-4">
            {metrics.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No metrics matched the current search. Try a broader term or clear the
                category filter.
              </div>
            ) : null}

            {metrics.map((metric) => (
              <article
                key={metric.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-950">
                        {metric.displayName}
                      </h2>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {metric.category}
                      </span>
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                        {metric.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {metric.shortDescription}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/explore?metric=${metric.id}`}
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                      style={{ color: "#fff" }}
                    >
                      Explore
                    </Link>
                    <Link
                      href={`/catalog?metric=${metric.id}${query ? `&q=${encodeURIComponent(query)}` : ""}${selectedCategory !== "all" ? `&category=${encodeURIComponent(selectedCategory)}` : ""}`}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Inspect metadata
                    </Link>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                    {metric.unit}
                  </span>
                  {metric.allowedChartTypes.map((chartType) => (
                    <span
                      key={chartType}
                      className="rounded-full bg-slate-100 px-3 py-1 font-medium"
                    >
                      {chartType}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {featuredMetric ? (
            <MetadataPanel metric={featuredMetric} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
              Choose a metric from the list to inspect its definition, source, unit,
              freshness, and caveats.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
