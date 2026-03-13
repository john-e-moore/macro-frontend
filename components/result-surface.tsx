"use client";

import type { ChartType, MetricCatalogEntry } from "@/lib/catalog/types";
import type { QueryRecoveryPatch, QueryResponse } from "@/lib/contracts/query";
import { getStateName } from "@/lib/geography";

import { SimpleBarChart } from "@/components/simple-bar-chart";
import { SimpleLineChart } from "@/components/simple-line-chart";
import { StateTileMap } from "@/components/state-tile-map";

function AggregateCards({
  aggregates,
}: {
  aggregates: QueryResponse["aggregates"];
}) {
  if (aggregates.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {aggregates.map((aggregate) => (
        <article
          key={aggregate.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-600">{aggregate.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {aggregate.formattedValue}
          </p>
          {aggregate.context ? (
            <p className="mt-1 text-xs text-slate-500">{aggregate.context}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function NotesBlock({
  warnings,
  notes,
}: {
  warnings: string[];
  notes: string[];
}) {
  const items = [...warnings, ...notes];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function formatCellValue(
  value: string | number | null,
  columnKey: string,
): string {
  if (value === null) {
    return "N/A";
  }

  if (typeof value === "string") {
    return value;
  }

  if (columnKey.toLowerCase().includes("ratio")) {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (columnKey.toLowerCase().includes("year")) {
    return value.toString();
  }

  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  if (Math.abs(value) >= 100) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function ResultsTable({ data }: { data: QueryResponse }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              {data.columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${Object.values(row).join("-")}`} className="border-t border-slate-200">
                {data.columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-slate-700">
                    {formatCellValue(row[column.key] ?? null, column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getBarSeries(data: QueryResponse) {
  if (data.series.some((series) => series.points.length > 1)) {
    return data.series.flatMap((series) =>
      series.points.map((point) => ({
        key: `${series.key}-${String(point.x)}`,
        label: `${series.label} ${String(point.x)}`,
        points: [{ x: point.x, y: point.y }],
      })),
    );
  }

  return data.series.map((series) => ({
    key: series.key,
    label: series.label,
    points: series.points,
  }));
}

function getMapRows(
  data: QueryResponse,
  metric: MetricCatalogEntry,
) {
  if (metric.family === "federal-inflows" || metric.family === "gdp") {
    const keyByMetricId: Record<string, string> = {
      "federal-direct-transfers": "federalDirectTransfers",
      "federal-program-funding": "federalProgramFunding",
      "federal-total-inflows": "federalTotalInflows",
      "state-gdp": "gdp",
    };
    const valueKey = keyByMetricId[metric.id] ?? "federalTotalInflows";

    return data.rows
      .filter((row) => typeof row.stateAbbrev === "string")
      .map((row) => ({
        stateAbbrev: String(row.stateAbbrev),
        stateName: typeof row.stateName === "string" ? row.stateName : getStateName(String(row.stateAbbrev)),
        value: typeof row[valueKey] === "number" ? row[valueKey] : null,
      }));
  }

  return data.rows
    .filter((row) => typeof row.stateAbbrev === "string")
    .map((row) => ({
      stateAbbrev: String(row.stateAbbrev),
      stateName: typeof row.stateName === "string" ? row.stateName : getStateName(String(row.stateAbbrev)),
      value: typeof row.value === "number" ? row.value : null,
    }));
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      {message}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
      {message}
    </div>
  );
}

function EmptyStateCard({
  emptyState,
  onApplyRecoveryPatch,
}: {
  emptyState: NonNullable<QueryResponse["emptyState"]>;
  onApplyRecoveryPatch: (patch: QueryRecoveryPatch) => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
        {emptyState.kind}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-slate-950">{emptyState.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{emptyState.description}</p>
      {emptyState.suggestedActions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {emptyState.suggestedActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              onClick={() => onApplyRecoveryPatch(action.patch)}
              title={action.description}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ResultSurface({
  metric,
  data,
  loading,
  error,
  selectedView,
  viewOptions,
  selectedStates,
  exportingFormat,
  exportError,
  shareUrl,
  onViewChange,
  onExport,
  onApplyRecoveryPatch,
  onToggleState,
}: {
  metric: MetricCatalogEntry;
  data: QueryResponse | null;
  loading: boolean;
  error: string | null;
  selectedView: ChartType;
  viewOptions: ChartType[];
  selectedStates: string[];
  exportingFormat: "csv" | "xlsx" | null;
  exportError: string | null;
  shareUrl: string;
  onViewChange: (view: ChartType) => void;
  onExport: (format: "csv" | "xlsx") => void;
  onApplyRecoveryPatch: (patch: QueryRecoveryPatch) => void;
  onToggleState: (stateAbbrev: string) => void;
}) {
  const activeView = data?.display.supportedCharts.includes(selectedView)
    ? selectedView
    : (viewOptions[0] ?? "table");

  return (
    <section className="grid gap-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {data?.display.title ?? metric.displayName}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {data?.display.subtitle ??
                "Run a query to see chart-ready rows, notes, and export options."}
            </p>
            {data?.display.recommendedChartReason ? (
              <p className="mt-2 text-sm text-cyan-700">
                Recommended view:{" "}
                <span className="font-medium">{data.display.recommendedChart}</span>.{" "}
                {data.display.recommendedChartReason}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {viewOptions.map((view) => (
              <button
                key={view}
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  activeView === view
                    ? "bg-slate-950 text-white"
                    : "border border-slate-300 bg-white text-slate-700"
                }`}
                onClick={() => onViewChange(view)}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            onClick={() => onExport("csv")}
            disabled={exportingFormat !== null}
          >
            {exportingFormat === "csv" ? "Exporting CSV..." : "Export CSV"}
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            onClick={() => onExport("xlsx")}
            disabled={exportingFormat !== null}
          >
            {exportingFormat === "xlsx" ? "Exporting XLSX..." : "Export XLSX"}
          </button>
        </div>
        {exportError ? (
          <p className="mt-3 text-sm text-rose-700">{exportError}</p>
        ) : null}
        <p className="mt-3 truncate text-xs text-slate-500">
          Shareable URL: {shareUrl}
        </p>
      </div>

      {loading ? <LoadingCard message="Loading results..." /> : null}
      {error ? <ErrorCard message={error} /> : null}

      {data?.emptyState ? (
        <EmptyStateCard
          emptyState={data.emptyState}
          onApplyRecoveryPatch={onApplyRecoveryPatch}
        />
      ) : null}

      {data && !data.emptyState ? (
        <>
          <AggregateCards aggregates={data.aggregates} />

          {activeView === "table" ? <ResultsTable data={data} /> : null}
          {activeView === "bar" ? <SimpleBarChart series={getBarSeries(data)} /> : null}
          {activeView === "line" || activeView === "multi_line" ? (
            <SimpleLineChart series={data.series} />
          ) : null}
          {activeView === "map" ? (
            <StateTileMap
              rows={getMapRows(data, metric)}
              selectedStates={selectedStates}
              onToggleState={onToggleState}
            />
          ) : null}

          <NotesBlock warnings={data.warnings} notes={data.display.notes} />
        </>
      ) : null}
    </section>
  );
}
