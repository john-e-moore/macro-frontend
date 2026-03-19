"use client";

import type { MetricCatalogSummary } from "@/lib/catalog/types";
import type { QueryRequest } from "@/lib/contracts/query";
import type { ExplorerState, ExplorerView } from "@/lib/explore-config";
import { stateOptions } from "@/lib/geography";
import {
  isFederalMetric,
  supportsExcludedStates,
  supportsSelectedAggregate,
} from "@/lib/metric-capabilities";

function MultiSelect({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <select
        multiple
        disabled={disabled}
        value={value}
        className="min-h-36 rounded-xl border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-100"
        onChange={(event) =>
          onChange(
            Array.from(event.currentTarget.selectedOptions).map(
              (option) => option.value,
            ),
          )
        }
      >
        {stateOptions.map((state) => (
          <option key={state.code} value={state.code}>
            {state.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function QueryBuilder({
  state,
  metricOptions,
  categoryOptions,
  viewOptions,
  yearRange,
  recommendedView,
  recommendationReason,
  onChange,
}: {
  state: ExplorerState;
  metricOptions: MetricCatalogSummary[];
  categoryOptions: Array<{ id: string; label: string }>;
  viewOptions: ExplorerView[];
  yearRange: { startYear: number; endYear: number };
  recommendedView: ExplorerView;
  recommendationReason: string;
  onChange: (patch: Partial<ExplorerState>) => void;
}) {
  const selectedMetric = metricOptions.find((metric) => metric.id === state.metricId);
  const federalMetric = isFederalMetric(state.metricId);
  const excludedStatesSupported = supportsExcludedStates(state.metricId);
  const selectedAggregateSupported = supportsSelectedAggregate(state.metricId);

  return (
    <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Build a view</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Choose a metric, tune the geography and time range, then switch between
            the supported result views.
          </p>
          <p className="mt-2 text-sm leading-6 text-cyan-700">
            Suggested starting view: <span className="font-medium">{recommendedView}</span>.{" "}
            {recommendationReason}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          URL-backed
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <label className="grid gap-2 text-sm text-slate-700 lg:col-span-2">
          <span className="font-medium">Metric</span>
          <select
            value={state.metricId}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
            onChange={(event) => onChange({ metricId: event.currentTarget.value })}
          >
            {metricOptions.map((metric) => (
              <option key={metric.id} value={metric.id}>
                {metric.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          <span className="font-medium">View</span>
          <select
            value={state.view}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
            onChange={(event) =>
              onChange({ view: event.currentTarget.value as ExplorerView })
            }
          >
            <option value="auto">Auto</option>
            {viewOptions.map((view) => (
              <option key={view} value={view}>
                {view}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          <span className="font-medium">Category</span>
          <select
            value={state.category}
            disabled={categoryOptions.length <= 1}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-100"
            onChange={(event) =>
              onChange({
                category: event.currentTarget.value as QueryRequest["options"]["category"],
              })
            }
          >
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <label className="grid gap-2 text-sm text-slate-700">
          <span className="font-medium">Start year</span>
          <select
            value={state.startYear}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
            onChange={(event) =>
              onChange({ startYear: Number(event.currentTarget.value) })
            }
          >
            {Array.from(
              { length: yearRange.endYear - yearRange.startYear + 1 },
              (_, index) => yearRange.startYear + index,
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          <span className="font-medium">End year</span>
          <select
            value={state.endYear}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
            onChange={(event) =>
              onChange({ endYear: Number(event.currentTarget.value) })
            }
          >
            {Array.from(
              { length: yearRange.endYear - yearRange.startYear + 1 },
              (_, index) => yearRange.startYear + index,
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-700 lg:col-span-2">
          <span className="font-medium">Comparison mode</span>
          <select
            value={state.aggregation}
            disabled={federalMetric}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-100"
            onChange={(event) =>
              onChange({
                aggregation: event.currentTarget.value as QueryRequest["options"]["aggregation"],
              })
            }
          >
            <option value="selected_plus_us">Selected states + US overall</option>
            <option value="selected_only">Selected states only</option>
            <option value="us_only">US overall only</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MultiSelect
          label={selectedMetric?.family === "rpp-price-levels"
            ? "States to plot or exclude"
            : federalMetric
              ? "State focus"
              : "States to compare"}
          value={state.states}
          onChange={(states) => onChange({ states })}
        />
        <MultiSelect
          label="States excluded from US comparison"
          value={state.excludedStates}
          disabled={!excludedStatesSupported}
          onChange={(excludedStates) => onChange({ excludedStates })}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={state.includeUsAggregate}
            disabled={federalMetric}
            onChange={(event) =>
              onChange({ includeUsAggregate: event.currentTarget.checked })
            }
          />
          Show US aggregate
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={state.includeSelectedAggregate}
            disabled={!selectedAggregateSupported}
            onChange={(event) =>
              onChange({ includeSelectedAggregate: event.currentTarget.checked })
            }
          />
          Show selected-states aggregate
        </label>
      </div>
    </section>
  );
}
