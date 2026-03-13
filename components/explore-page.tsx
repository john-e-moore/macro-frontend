"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { MetricCatalogEntry, MetricCatalogSummary } from "@/lib/catalog/types";
import type {
  QueryRecoveryPatch,
  QueryRequest,
  QueryResponse,
} from "@/lib/contracts/query";
import {
  defaultExplorerState,
  type ExplorerState,
} from "@/lib/explore-config";
import {
  applyExplorerRecoveryPatch,
  buildQueryRequestFromState,
  getAvailableViews,
  getExplorerChartSupport,
  getMetricCategoryOptions,
  getMetricScopedDefaults,
  listExplorerPresets,
  normalizeExplorerState,
  serializeExplorerState,
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
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const lastSerializedRef = useRef("");

  const metricById = useMemo(
    () => new Map(metricEntries.map((metric) => [metric.id, metric])),
    [metricEntries],
  );
  const selectedMetric =
    metricById.get(state.metricId) ?? metricEntries[0] ?? null;
  const categoryOptions = getMetricCategoryOptions(state.metricId);
  const chartSupport = getExplorerChartSupport(state);
  const viewOptions = getAvailableViews(state);
  const request = useMemo(() => buildQueryRequestFromState(state), [state]);
  const queryState = useQuery(request);
  const serializedState = useMemo(() => serializeExplorerState(state).toString(), [state]);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}${pathname}?${serializedState}`;
  }, [pathname, serializedState]);
  const presets = useMemo(() => listExplorerPresets(), []);

  useEffect(() => {
    if (serializedState === lastSerializedRef.current) {
      return;
    }

    lastSerializedRef.current = serializedState;
    router.replace(`${pathname}?${serializedState}`, { scroll: false });
  }, [pathname, router, serializedState]);

  function updateState(patch: Partial<ExplorerState>) {
    setState((current) => {
      const nextMetricId = patch.metricId ?? current.metricId;

      if (patch.metricId && patch.metricId !== current.metricId) {
        return normalizeExplorerState({
          ...current,
          ...getMetricScopedDefaults(nextMetricId),
          ...patch,
          metricId: nextMetricId,
        });
      }

      return normalizeExplorerState({
        ...current,
        ...patch,
      });
    });
  }

  function applyRecoveryPatch(patch: QueryRecoveryPatch) {
    setState((current) => applyExplorerRecoveryPatch(current, patch));
  }

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Share link copied.");
    } catch {
      setShareStatus("Could not copy the link automatically.");
    }
  }

  function handleReset() {
    setState(normalizeExplorerState(defaultExplorerState));
    setShareStatus("Explorer reset to defaults.");
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
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950"
              onClick={handleCopyShareLink}
            >
              Copy share link
            </button>
            <button
              type="button"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-100"
              onClick={handleReset}
            >
              Reset explorer
            </button>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Shared links preserve the normalized metric, time, comparison, and view
            state. Repeated identical reads may reuse a short-lived server cache, but
            metric freshness still reflects the source cadence shown in metadata.
          </p>
          {shareStatus ? (
            <p className="mt-2 text-sm text-cyan-200">{shareStatus}</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-6 text-cyan-50">
          <p className="font-semibold">Starter presets</p>
          <div className="mt-3 grid gap-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="rounded-2xl border border-cyan-300/20 bg-slate-950/40 p-3 text-left"
                onClick={() =>
                  setState(() =>
                    normalizeExplorerState({
                      ...defaultExplorerState,
                      ...preset.state,
                    }),
                  )
                }
              >
                <p className="font-medium">{preset.label}</p>
                <p className="mt-1 text-cyan-100/80">{preset.description}</p>
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
            recommendedView={chartSupport.recommendedView}
            recommendationReason={chartSupport.reason}
            onChange={updateState}
          />
          <ResultSurface
            metric={selectedMetric}
            data={queryState.data}
            loading={queryState.loading}
            error={queryState.error}
            selectedView={
              state.view === "auto"
                ? (queryState.data?.display.recommendedChart ??
                  chartSupport.recommendedView)
                : state.view
            }
            viewOptions={viewOptions}
            selectedStates={state.states}
            exportingFormat={exportingFormat}
            exportError={exportError}
            shareUrl={shareUrl}
            onViewChange={(view) => updateState({ view })}
            onExport={handleExport}
            onApplyRecoveryPatch={applyRecoveryPatch}
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
