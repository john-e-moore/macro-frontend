import type { MetricCatalogEntry } from "@/lib/catalog/types";

export function MetadataPanel({
  metric,
  compact = false,
}: {
  metric: MetricCatalogEntry;
  compact?: boolean;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Metric metadata
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            {metric.displayName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {metric.shortDescription}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {metric.status}
        </span>
      </div>

      <dl className="mt-5 grid gap-4 text-sm text-slate-700">
        <div>
          <dt className="font-medium text-slate-900">Definition</dt>
          <dd className="mt-1 leading-6 text-slate-600">{metric.definition}</dd>
        </div>
        <div className={compact ? "grid gap-4 sm:grid-cols-2" : "grid gap-4 md:grid-cols-2"}>
          <div>
            <dt className="font-medium text-slate-900">Unit</dt>
            <dd className="mt-1 text-slate-600">{metric.unit}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Freshness</dt>
            <dd className="mt-1 text-slate-600">{metric.freshness}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Source</dt>
            <dd className="mt-1 text-slate-600">
              {metric.source.url ? (
                <a
                  className="text-cyan-700 underline decoration-cyan-300 underline-offset-2"
                  href={metric.source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {metric.source.name}
                </a>
              ) : (
                metric.source.name
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Chart support</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {metric.allowedChartTypes.map((chartType) => (
                <span
                  key={chartType}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {chartType}
                </span>
              ))}
            </dd>
          </div>
        </div>
      </dl>

      {metric.caveats.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">Caveats</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-900">
            {metric.caveats.map((caveat) => (
              <li key={caveat}>{caveat}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
