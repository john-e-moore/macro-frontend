"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { MetricCatalogEntry, MetricCatalogSummary } from "@/lib/catalog/types";
import type { QueryRequest, QueryResponse } from "@/lib/contracts/query";
import {
  buildQueryRequestFromState,
  defaultExplorerState,
  getAvailableViews,
  getMetricCategoryOptions,
  normalizeExplorerState,
  serializeExplorerState,
  type ExplorerState,
} from "@/lib/explore-state";

import { MetadataPanel } from "@/components/metadata-panel";
import { QueryBuilder } from "@/components/query-builder";
import { ResultSurface } from "@/components/result-surface";

async function postQuery(request: QueryRequest): Promise<QueryResponse> {
  const response = await fetch("/api/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Query request failed.");
  }

  return payload;
}

async function downloadExport(
  request: QueryRequest,
  format: "csv" | "xlsx",
): Promise<void> {
  const response = await fetch("/api/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...request,
      format,
    }),
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error ?? "Export failed.");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="(.+)"/);
  const fileName = match?.[1] ?? `export.${format}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function useQuery(request: QueryRequest) {
  const requestKey = JSON.stringify(request);
  const [state, setState] = useState<{
    data: QueryResponse | null;
    error: string | null;
    requestKey: string;
  }>({
    data: null,
    error: null,
    requestKey: "",
  });

  useEffect(() => {
    let cancelled = false;

    postQuery(request)
      .then((data) => {
        if (!cancelled) {
          setState({
            data,
            error: null,
            requestKey,
          });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({
            data: null,
            error: error.message,
            requestKey,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [request, requestKey]);

  return state.requestKey === requestKey
    ? { data: state.data, loading: false, error: state.error }
    : { data: state.data, loading: true, error: null };
}

const presets: Array<{ label: string; state: Partial<ExplorerState> }> = [
  {
    label: "PCE map",
    state: {
      metricId: "pce-total",
      view: "map",
      category: "all",
      startYear: 2024,
      endYear: 2024,
      states: ["CA", "TX", "NY"],
      excludedStates: [],
    },
  },
  {
    label: "PCE trend",
    state: {
      metricId: "pce-growth-yoy",
      view: "multi_line",
      category: "food",
      startYear: 2021,
      endYear: 2024,
      states: ["CA", "TX", "NY"],
      excludedStates: ["CA"],
      includeSelectedAggregate: false,
    },
  },
  {
    label: "Federal comparison",
    state: {
      metricId: "federal-total-inflows",
      view: "bar",
      category: "all",
      startYear: 2023,
      endYear: 2023,
      states: ["CA"],
      excludedStates: [],
      includeUsAggregate: false,
      includeSelectedAggregate: false,
    },
  },
];

export function ExplorePage({
  initialState,
  metricOptions,
  metricEntries,
}: {
  initialState: ExplorerState;
  metricOptions: MetricCatalogSummary[];
  metricEntries: MetricCatalogEntry[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ExplorerState>(() =>
    normalizeExplorerState(initialState),
  );
  const [exportingFormat, setExportingFormat] = useState<"csv" | "xlsx" | null>(
    null,
  );
  const [exportError, setExportError] = useState<string | null>(null);
  const lastSerializedRef = useRef("");

  const metricById = useMemo(
    () => new Map(metricEntries.map((metric) => [metric.id, metric])),
    [metricEntries],
  );
  const selectedMetric =
    metricById.get(state.metricId) ?? metricEntries[0] ?? null;
  const categoryOptions = getMetricCategoryOptions(state.metricId);
  const viewOptions = getAvailableViews(state);
  const request = useMemo(() => buildQueryRequestFromState(state), [state]);
  const queryState = useQuery(request);

  useEffect(() => {
    const serialized = serializeExplorerState(state).toString();

    if (serialized === lastSerializedRef.current) {
      return;
    }

    lastSerializedRef.current = serialized;
    router.replace(`${pathname}?${serialized}`, { scroll: false });
  }, [pathname, router, state]);

  function updateState(patch: Partial<ExplorerState>) {
    setState((current) => {
      const nextMetricId = patch.metricId ?? current.metricId;
      const nextMetric = metricById.get(nextMetricId);
      const defaultCategory =
        nextMetric?.dimensions?.find((dimension) => dimension.key === "category")
          ?.defaultOptionId ?? "all";

      return normalizeExplorerState({
        ...current,
        ...patch,
        metricId: nextMetricId,
        category:
          patch.metricId && patch.metricId !== current.metricId
            ? (defaultCategory as ExplorerState["category"])
            : (patch.category ?? current.category),
      });
    });
  }

  async function handleExport(format: "csv" | "xlsx") {
    try {
      setExportError(null);
      setExportingFormat(format);
      await downloadExport(request, format);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Export failed.",
      );
    } finally {
      setExportingFormat(null);
    }
  }

  if (!selectedMetric) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10">
      <section className="grid gap-5 rounded-3xl border border-white/10 bg-slate-950 p-8 text-slate-50 shadow-2xl shadow-slate-950/15 lg:grid-cols-[1.8fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Explorer
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Configure a view, keep it in the URL, and export the exact result.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            The explorer reuses the validated query layer and semantic catalog so the
            same metric definitions power filters, chart choices, metadata, and export
            files.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-6 text-cyan-50">
          <p className="font-semibold">Starter presets</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="rounded-full bg-slate-950/40 px-3 py-1.5 font-medium"
                onClick={() =>
                  setState((current) =>
                    normalizeExplorerState({
                      ...current,
                      ...defaultExplorerState,
                      ...preset.state,
                    }),
                  )
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6">
          <QueryBuilder
            state={state}
            metricOptions={metricOptions}
            categoryOptions={categoryOptions}
            viewOptions={viewOptions}
            yearRange={selectedMetric.timeCoverage}
            onChange={updateState}
          />
          <ResultSurface
            metric={selectedMetric}
            data={queryState.data}
            loading={queryState.loading}
            error={queryState.error}
            selectedView={
              state.view === "auto" ? viewOptions[0] ?? "table" : state.view
            }
            viewOptions={viewOptions}
            selectedStates={state.states}
            exportingFormat={exportingFormat}
            exportError={exportError}
            onViewChange={(view) => updateState({ view })}
            onExport={handleExport}
            onToggleState={(stateAbbrev) =>
              updateState({
                states: state.states.includes(stateAbbrev)
                  ? state.states.filter((value) => value !== stateAbbrev)
                  : [...state.states, stateAbbrev],
              })
            }
          />
        </div>
        <div className="grid gap-6">
          <MetadataPanel metric={selectedMetric} compact />
        </div>
      </section>
    </main>
  );
}
