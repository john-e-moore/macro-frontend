import type { MetricCatalogEntry } from "@/lib/catalog/types";
import type { QueryRequest, QueryResponse } from "@/lib/contracts/query";
import { formatNumber } from "@/lib/services/formatting";
import { RequestValidationError } from "@/lib/validation/request";

export type RppWeightedRow = {
  year: number;
  state_abbrev: string;
  geo_name: string;
  category: string;
  rpp_function_name: string;
  pce_function_name: string;
  mapping_method: string;
  rpp: number;
  pce_share: number;
  weighted_rpp: number;
};

type RppSeries = {
  key: string;
  label: string;
  geography: string;
  unit: string;
  points: Array<{ x: number; y: number | null }>;
};

export function getCategoryConfig(metric: MetricCatalogEntry, categoryId: string) {
  const option = metric.dimensions
    ?.find((dimension) => dimension.key === "category")
    ?.options.find((dimensionOption) => dimensionOption.id === categoryId);

  if (!option) {
    throw new RequestValidationError("The requested price-level category is unavailable.", {
      metricId: metric.id,
      categoryId,
    });
  }

  return option;
}

function average(values: Array<number | null>): number | null {
  const present = values.filter((value): value is number => value !== null);

  if (present.length === 0) {
    return null;
  }

  return present.reduce((total, value) => total + value, 0) / present.length;
}

function getOrderedYears(rows: RppWeightedRow[]) {
  return Array.from(new Set(rows.map((row) => row.year))).sort((left, right) => left - right);
}

function computeNationalPriceLevel(rows: RppWeightedRow[]): number | null {
  if (rows.length === 0) {
    return null;
  }

  const totalShare = rows.reduce((total, row) => total + row.pce_share, 0);

  if (totalShare === 0) {
    return null;
  }

  const totalWeightedRpp = rows.reduce((total, row) => total + row.weighted_rpp, 0);

  return totalWeightedRpp / totalShare;
}

function buildNationalSeries(
  key: string,
  label: string,
  years: number[],
  rows: RppWeightedRow[],
): RppSeries {
  return {
    key,
    label,
    geography: key,
    unit: "Index (US=100)",
    points: years.map((year) => ({
      x: year,
      y: computeNationalPriceLevel(rows.filter((row) => row.year === year)),
    })),
  };
}

function buildStateSeries(
  selectedStates: string[],
  rows: RppWeightedRow[],
): RppSeries[] {
  const grouped = new Map<string, RppWeightedRow[]>();

  for (const row of rows) {
    if (!selectedStates.includes(row.state_abbrev)) {
      continue;
    }

    const existing = grouped.get(row.state_abbrev) ?? [];
    existing.push(row);
    grouped.set(row.state_abbrev, existing);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => selectedStates.indexOf(left) - selectedStates.indexOf(right))
    .map(([stateAbbrev, stateRows]) => ({
      key: stateAbbrev,
      label: stateRows[0]?.geo_name ?? stateAbbrev,
      geography: stateAbbrev,
      unit: "Index (US=100)",
      points: stateRows.map((row) => ({
        x: row.year,
        y: row.rpp,
      })),
    }));
}

function buildNoResultsEmptyState(metric: MetricCatalogEntry) {
  return {
    kind: "no_results" as const,
    title: "No rows matched these filters",
    description:
      "Try the latest year, broaden the annual window, or switch back to the all-items category.",
    suggestedActions: [
      {
        id: "latest-year",
        label: "Jump to the latest year",
        description: `Use ${metric.timeCoverage.endYear}, the latest covered year for this metric.`,
        patch: {
          startYear: metric.timeCoverage.endYear,
          endYear: metric.timeCoverage.endYear,
          view: "auto" as const,
        },
      },
      {
        id: "recent-window",
        label: "Use a recent four-year window",
        description: "Look at a short recent annual window to compare changes over time.",
        patch: {
          startYear: Math.max(metric.timeCoverage.startYear, metric.timeCoverage.endYear - 3),
          endYear: metric.timeCoverage.endYear,
          view: "auto" as const,
        },
      },
      {
        id: "all-items",
        label: "Switch to all items",
        description: "Reset the category to the broadest national price-level measure.",
        patch: {
          category: "all_items",
          view: "auto" as const,
        },
      },
    ],
  };
}

export function buildRppResponseFromRows(
  metric: MetricCatalogEntry,
  request: QueryRequest,
  rows: RppWeightedRow[],
): QueryResponse {
  const categoryOption = getCategoryConfig(metric, request.options.category);
  const years = getOrderedYears(rows);
  const excludedStates = new Set(request.options.excludedGeographies);
  const selectedStates = Array.from(
    new Set(request.options.aggregation === "us_only" ? [] : request.geography.values),
  );
  const usSeries = buildNationalSeries("US", "US overall", years, rows);
  const excludedSeries =
    excludedStates.size > 0 && request.options.aggregation !== "selected_only"
      ? buildNationalSeries(
          "US_EXCLUDING",
          `US excluding ${Array.from(excludedStates).join(", ")}`,
          years,
          rows.filter((row) => !excludedStates.has(row.state_abbrev)),
        )
      : null;
  const stateSeries =
    request.options.aggregation === "us_only" ? [] : buildStateSeries(selectedStates, rows);
  const allSeries = [
    ...(request.options.includeUsAggregate ? [usSeries] : []),
    ...(excludedSeries ? [excludedSeries] : []),
    ...stateSeries,
  ];
  const latestUsValue = request.options.includeUsAggregate ? usSeries.points.at(-1)?.y ?? null : null;
  const latestExcludedValue = excludedSeries?.points.at(-1)?.y ?? null;
  const latestGap = latestUsValue !== null && latestExcludedValue !== null
    ? latestExcludedValue - latestUsValue
    : null;
  const latestRow = rows.at(-1);
  const mappingSummary = latestRow
    ? `${latestRow.rpp_function_name} RPP is mapped to ${latestRow.pce_function_name} PCE via ${latestRow.mapping_method}.`
    : null;
  const emptyState = rows.length === 0 ? buildNoResultsEmptyState(metric) : null;

  return {
    requestEcho: request,
    columns: [
      { key: "geography", label: "Geography", type: "string" },
      { key: "year", label: "Year", type: "number" },
      { key: "value", label: metric.displayName, type: "number" },
    ],
    rows: allSeries.flatMap((series) =>
      series.points.map((point) => ({
        geography: series.label,
        year: Number(point.x),
        value: point.y,
      })),
    ),
    series: allSeries,
    aggregates: [
      {
        id: "latest-us-overall",
        label: "Latest US overall",
        value: latestUsValue,
        formattedValue: formatNumber(latestUsValue, 1),
        unit: metric.unit,
        context: request.options.includeUsAggregate ? String(request.timeRange.endYear) : "Hidden in chart",
      },
      {
        id: "latest-us-excluding",
        label: excludedSeries?.label ?? "Latest US excluding selected states",
        value: latestExcludedValue,
        formattedValue: formatNumber(latestExcludedValue, 1),
        unit: metric.unit,
        context: excludedSeries ? String(request.timeRange.endYear) : "Select states to exclude.",
      },
      {
        id: "excluded-gap",
        label: "Exclusion gap",
        value: latestGap,
        formattedValue: formatNumber(latestGap, 1),
        unit: metric.unit,
        context:
          latestGap !== null
            ? `${request.timeRange.endYear}: excluded scenario minus US overall`
            : "Available once an exclusion scenario is active.",
      },
      {
        id: "period-us-average",
        label: "US average over selected years",
        value: average(usSeries.points.map((point) => point.y)),
        formattedValue: formatNumber(average(usSeries.points.map((point) => point.y)), 1),
        unit: metric.unit,
        context: `${request.timeRange.startYear}-${request.timeRange.endYear}`,
      },
    ].filter((aggregate) => {
      if (request.options.includeUsAggregate) {
        return true;
      }

      return aggregate.id !== "latest-us-overall" && aggregate.id !== "period-us-average";
    }),
    display: {
      title: `${categoryOption.label} national price level`,
      subtitle:
        "Annual national price level recomputed from state RPP values weighted by category PCE shares. Excluding states recalculates the national index from the remaining state rows.",
      recommendedChart: request.view === "auto" ? "table" : request.view,
      recommendedChartReason: "The query router will replace this with chart support metadata.",
      supportedCharts: ["table", "bar", "line", "multi_line"],
      unitLabel: metric.unit,
      metricFamily: metric.family,
      notes: metric.caveats,
    },
    warnings: mappingSummary ? [mappingSummary] : [],
    emptyStateReason: emptyState?.description ?? null,
    emptyState,
  };
}
