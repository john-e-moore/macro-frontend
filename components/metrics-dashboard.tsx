"use client";

import { useEffect, useMemo, useState } from "react";

import type { QueryRequest, QueryResponse } from "@/lib/contracts/query";
import { SimpleBarChart } from "@/components/simple-bar-chart";
import { SimpleLineChart } from "@/components/simple-line-chart";
import { StateTileMap } from "@/components/state-tile-map";

const stateOptions = [
  ["AK", "Alaska"], ["AL", "Alabama"], ["AR", "Arkansas"], ["AZ", "Arizona"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DC", "District of Columbia"],
  ["DE", "Delaware"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["IA", "Iowa"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["MA", "Massachusetts"],
  ["MD", "Maryland"], ["ME", "Maine"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MO", "Missouri"], ["MS", "Mississippi"], ["MT", "Montana"], ["NC", "North Carolina"],
  ["ND", "North Dakota"], ["NE", "Nebraska"], ["NH", "New Hampshire"], ["NJ", "New Jersey"],
  ["NM", "New Mexico"], ["NV", "Nevada"], ["NY", "New York"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VA", "Virginia"], ["VT", "Vermont"], ["WA", "Washington"],
  ["WI", "Wisconsin"], ["WV", "West Virginia"], ["WY", "Wyoming"],
] as const;

const pceCategoryOptions = [
  ["all", "All PCE"],
  ["food", "Food"],
  ["gas", "Gas"],
  ["housing", "Housing"],
  ["health", "Health"],
  ["food_services", "Food services"],
] as const;

type QueryState = {
  data: QueryResponse | null;
  loading: boolean;
  error: string | null;
};

type QuerySnapshot = {
  data: QueryResponse | null;
  error: string | null;
  requestKey: string;
};

type PceCategory = QueryRequest["options"]["category"];

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

async function downloadExport(request: QueryRequest, format: "csv" | "xlsx") {
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

function useQuery(request: QueryRequest): QueryState {
  const requestKey = JSON.stringify(request);
  const [state, setState] = useState<QuerySnapshot>({
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
    ? {
        data: state.data,
        loading: false,
        error: state.error,
      }
    : {
        data: state.data,
        loading: true,
        error: null,
      };
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

function AggregateCards({ aggregates }: { aggregates: QueryResponse["aggregates"] }) {
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

function MultiSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <select
        className="min-h-36 rounded-xl border border-slate-300 bg-white px-3 py-2"
        multiple
        value={value}
        onChange={(event) =>
          onChange(Array.from(event.currentTarget.selectedOptions).map((option) => option.value))
        }
      >
        {stateOptions.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

function NotesList({
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

export function MetricsDashboard() {
  const [mapMetricId, setMapMetricId] = useState<"pce-total" | "pce-per-capita">(
    "pce-total",
  );
  const [mapCategory, setMapCategory] = useState<PceCategory>("all");
  const [mapYear, setMapYear] = useState(2024);
  const [selectedMapStates, setSelectedMapStates] = useState<string[]>([
    "CA",
    "TX",
    "NY",
  ]);

  const [trendMetricId, setTrendMetricId] = useState<
    "pce-growth-yoy" | "pce-inflation-yoy"
  >("pce-growth-yoy");
  const [trendCategory, setTrendCategory] = useState<PceCategory>("food");
  const [trendStates, setTrendStates] = useState<string[]>(["CA", "TX", "NY"]);
  const [excludedStates, setExcludedStates] = useState<string[]>(["CA"]);
  const [trendStartYear, setTrendStartYear] = useState(2021);
  const [trendEndYear, setTrendEndYear] = useState(2024);

  const [federalYear, setFederalYear] = useState(2023);
  const [federalState, setFederalState] = useState("CA");

  const mapRequest = useMemo<QueryRequest>(
    () => ({
      metricIds: [mapMetricId],
      geography: {
        level: "state",
        values: selectedMapStates,
      },
      timeRange: {
        startYear: mapYear,
        endYear: mapYear,
      },
      view: "map",
      options: {
        category: mapCategory,
        includeUsAggregate: true,
        includeSelectedAggregate: true,
        aggregation: "selected_plus_us",
        excludedGeographies: [],
      },
    }),
    [mapCategory, mapMetricId, mapYear, selectedMapStates],
  );

  const trendRequest = useMemo<QueryRequest>(
    () => ({
      metricIds: [trendMetricId],
      geography: {
        level: "state",
        values: trendStates,
      },
      timeRange: {
        startYear: trendStartYear,
        endYear: trendEndYear,
      },
      view: "multi_line",
      options: {
        category: trendMetricId === "pce-inflation-yoy" ? "all" : trendCategory,
        includeUsAggregate: true,
        includeSelectedAggregate: false,
        aggregation: "selected_plus_us",
        excludedGeographies: excludedStates,
      },
    }),
    [excludedStates, trendCategory, trendEndYear, trendMetricId, trendStartYear, trendStates],
  );

  const federalRequest = useMemo<QueryRequest>(
    () => ({
      metricIds: [
        "federal-direct-transfers",
        "federal-program-funding",
        "federal-total-inflows",
        "state-gdp",
      ],
      geography: {
        level: "state",
        values: [federalState],
      },
      timeRange: {
        startYear: federalYear,
        endYear: federalYear,
      },
      view: "bar",
      options: {
        category: "all",
        includeUsAggregate: false,
        includeSelectedAggregate: false,
        aggregation: "selected_only",
        excludedGeographies: [],
      },
    }),
    [federalState, federalYear],
  );

  const mapState = useQuery(mapRequest);
  const trendState = useQuery(trendRequest);
  const federalStateQuery = useQuery(federalRequest);

  const mapRows =
    mapState.data?.rows.map((row) => ({
      stateAbbrev: String(row.stateAbbrev),
      stateName: String(row.stateName),
      value: typeof row.value === "number" ? row.value : null,
    })) ?? [];

  const selectedMapRows = mapState.data?.rows.filter((row) =>
    selectedMapStates.includes(String(row.stateAbbrev)),
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-10 sm:px-10">
      <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-950 p-8 text-slate-50 shadow-2xl shadow-slate-950/20">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Metrics Phase 1
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Live state PCE, PCE trend, and federal-flow dashboards backed by the serving layer.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              This phase connects the semantic metric catalog to BEA and Census data for
              state PCE levels, selected-state aggregates, PCE trend storytelling, and
              federal-money-versus-GDP comparisons.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm text-cyan-50">
            <p className="font-semibold">Data caveat</p>
            <p className="mt-2 leading-6">
              The current serving layer supports live annual state PCE levels and all-items
              implicit PCE inflation. Category-level trend storytelling uses nominal PCE
              growth until a true state-category price index is available.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">1. PCE map</h2>
            <p className="mt-1 text-sm text-slate-600">
              Compare state PCE levels, toggle per-capita mode, and update selected-state
              aggregates by clicking the map.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            onClick={() => void downloadExport(mapRequest, "csv")}
          >
            Export CSV
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">Measure</span>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={mapMetricId}
              onChange={(event) =>
                setMapMetricId(event.currentTarget.value as "pce-total" | "pce-per-capita")
              }
            >
              <option value="pce-total">Total PCE</option>
              <option value="pce-per-capita">Per-capita PCE</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">Category</span>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={mapCategory}
              onChange={(event) => setMapCategory(event.currentTarget.value as PceCategory)}
            >
              {pceCategoryOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">Year</span>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={mapYear}
              onChange={(event) => setMapYear(Number(event.currentTarget.value))}
            >
              {Array.from({ length: 25 }, (_, index) => 2024 - index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            {selectedMapStates.length} selected states
          </div>
        </div>

        {mapState.loading ? <LoadingCard message="Loading PCE map..." /> : null}
        {mapState.error ? <ErrorCard message={mapState.error} /> : null}
        {mapState.data ? (
          <>
            <AggregateCards aggregates={mapState.data.aggregates} />
            <StateTileMap
              rows={mapRows}
              selectedStates={selectedMapStates}
              onToggleState={(stateAbbrev) =>
                setSelectedMapStates((current) =>
                  current.includes(stateAbbrev)
                    ? current.filter((value) => value !== stateAbbrev)
                    : [...current, stateAbbrev],
                )
              }
            />
            <NotesList warnings={mapState.data.warnings} notes={mapState.data.display.notes} />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedMapRows ?? []).map((row) => (
                    <tr key={`${row.stateAbbrev}-${row.year}`} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {String(row.stateName)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{String(row.year)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof row.value === "number"
                          ? row.value.toLocaleString(undefined, {
                              maximumFractionDigits: mapMetricId === "pce-per-capita" ? 0 : 0,
                            })
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>

      <section className="grid gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">2. PCE trend story</h2>
            <p className="mt-1 text-sm text-slate-600">
              Tell a state-versus-US story with either all-items PCE inflation or category-level
              PCE growth.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            onClick={() => void downloadExport(trendRequest, "csv")}
          >
            Export CSV
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">Trend metric</span>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={trendMetricId}
              onChange={(event) =>
                setTrendMetricId(
                  event.currentTarget.value as "pce-growth-yoy" | "pce-inflation-yoy",
                )
              }
            >
              <option value="pce-growth-yoy">Category PCE growth</option>
              <option value="pce-inflation-yoy">All-items PCE inflation</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">Category</span>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-100"
              value={trendMetricId === "pce-inflation-yoy" ? "all" : trendCategory}
              disabled={trendMetricId === "pce-inflation-yoy"}
              onChange={(event) =>
                setTrendCategory(event.currentTarget.value as PceCategory)
              }
            >
              {pceCategoryOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">Start year</span>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={trendStartYear}
              onChange={(event) => setTrendStartYear(Number(event.currentTarget.value))}
            >
              {Array.from({ length: 10 }, (_, index) => 2015 + index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">End year</span>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={trendEndYear}
              onChange={(event) => setTrendEndYear(Number(event.currentTarget.value))}
            >
              {Array.from({ length: 10 }, (_, index) => 2015 + index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <MultiSelect label="States to plot" value={trendStates} onChange={setTrendStates} />
          <MultiSelect
            label="States to exclude from the US aggregate comparison"
            value={excludedStates}
            onChange={setExcludedStates}
          />
        </div>

        {trendState.loading ? <LoadingCard message="Loading trend data..." /> : null}
        {trendState.error ? <ErrorCard message={trendState.error} /> : null}
        {trendState.data ? (
          <>
            <AggregateCards aggregates={trendState.data.aggregates} />
            <SimpleLineChart series={trendState.data.series} />
            <NotesList warnings={trendState.data.warnings} notes={trendState.data.display.notes} />
          </>
        ) : null}
      </section>

      <section className="grid gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">3. Federal money vs GDP</h2>
            <p className="mt-1 text-sm text-slate-600">
              Compare direct federal transfers, program funding, combined inflows, and GDP for a
              selected state and year.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            onClick={() => void downloadExport(federalRequest, "csv")}
          >
            Export CSV
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">State</span>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={federalState}
              onChange={(event) => setFederalState(event.currentTarget.value)}
            >
              {stateOptions.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">Year</span>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={federalYear}
              onChange={(event) => setFederalYear(Number(event.currentTarget.value))}
            >
              {Array.from({ length: 12 }, (_, index) => 2023 - index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>

        {federalStateQuery.loading ? <LoadingCard message="Loading federal comparison..." /> : null}
        {federalStateQuery.error ? <ErrorCard message={federalStateQuery.error} /> : null}
        {federalStateQuery.data ? (
          <>
            <AggregateCards aggregates={federalStateQuery.data.aggregates} />
            <SimpleBarChart series={federalStateQuery.data.series} />
            <NotesList
              warnings={federalStateQuery.data.warnings}
              notes={federalStateQuery.data.display.notes}
            />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3">Direct transfers</th>
                    <th className="px-4 py-3">Program funding</th>
                    <th className="px-4 py-3">Total inflows</th>
                    <th className="px-4 py-3">GDP</th>
                    <th className="px-4 py-3">Inflows / GDP</th>
                  </tr>
                </thead>
                <tbody>
                  {federalStateQuery.data.rows.map((row) => (
                    <tr
                      key={String(row.stateAbbrev)}
                      className={`border-t border-slate-200 ${
                        String(row.stateAbbrev) === federalState ? "bg-cyan-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {String(row.stateName)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof row.federalDirectTransfers === "number"
                          ? `$${(row.federalDirectTransfers / 1_000_000_000).toFixed(1)}B`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof row.federalProgramFunding === "number"
                          ? `$${(row.federalProgramFunding / 1_000_000_000).toFixed(1)}B`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof row.federalTotalInflows === "number"
                          ? `$${(row.federalTotalInflows / 1_000_000_000).toFixed(1)}B`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof row.gdp === "number" ? `$${(row.gdp / 1_000_000_000).toFixed(1)}B` : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof row.inflowsToGdpRatio === "number"
                          ? `${(row.inflowsToGdpRatio * 100).toFixed(1)}%`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
