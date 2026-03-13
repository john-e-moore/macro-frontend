import { getMetricById } from "@/lib/catalog";
import type { ChartType, MetricCatalogEntry } from "@/lib/catalog/types";
import { getChartSupport } from "@/lib/chart-support";
import {
  defaultExplorerState,
  explorerPresets,
  type ExplorerPreset,
  type ExplorerState,
  type ExplorerView,
} from "@/lib/explore-config";
import type {
  QueryRecoveryPatch,
  QueryRequest,
} from "@/lib/contracts/query";
import { isStateCode } from "@/lib/geography";

export const federalComparisonMetricIds = [
  "federal-direct-transfers",
  "federal-program-funding",
  "federal-total-inflows",
  "state-gdp",
] as const;

const validCategories: QueryRequest["options"]["category"][] = [
  "all",
  "food",
  "gas",
  "housing",
  "health",
  "food_services",
];

const validAggregations: QueryRequest["options"]["aggregation"][] = [
  "selected_only",
  "selected_plus_us",
  "us_only",
];

const validViews: ExplorerView[] = [
  "auto",
  "table",
  "bar",
  "line",
  "multi_line",
  "map",
] as const;

function getSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseStateList(value: string | string[] | undefined): string[] {
  const source = Array.isArray(value) ? value.join(",") : value ?? "";

  return Array.from(
    new Set(
      source
        .split(",")
        .map((part) => part.trim().toUpperCase())
        .filter((part) => part.length > 0 && isStateCode(part)),
    ),
  );
}

function parseNumber(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const parsed = Number(getSingleValue(value));

  return Number.isInteger(parsed) ? parsed : fallback;
}

function isFederalMetric(metricId: string): boolean {
  const metric = getMetricById(metricId);

  return metric?.family === "federal-inflows" || metric?.family === "gdp";
}

function isTrendMetric(metricId: string): boolean {
  return metricId === "pce-growth-yoy" || metricId === "pce-inflation-yoy";
}

function getMetricDefaultCategory(metric: MetricCatalogEntry | null): ExplorerState["category"] {
  return (
    (metric?.dimensions?.find((dimension) => dimension.key === "category")
      ?.defaultOptionId as ExplorerState["category"] | undefined) ?? "all"
  );
}

function getMetricDefaultStates(metricId: string): string[] {
  return isFederalMetric(metricId) ? ["CA"] : defaultExplorerState.states;
}

export function getMetricScopedDefaults(metricId: string): Partial<ExplorerState> {
  const metric = getMetricById(metricId);
  const endYear = metric?.timeCoverage.endYear ?? defaultExplorerState.endYear;
  const startYear = isTrendMetric(metricId)
    ? Math.max((metric?.timeCoverage.startYear ?? endYear) as number, endYear - 3)
    : endYear;

  return {
    metricId,
    category: getMetricDefaultCategory(metric),
    aggregation: isFederalMetric(metricId) ? "selected_only" : "selected_plus_us",
    includeUsAggregate: !isFederalMetric(metricId),
    includeSelectedAggregate: !isFederalMetric(metricId) && !isTrendMetric(metricId),
    startYear,
    endYear,
    states: getMetricDefaultStates(metricId),
    excludedStates: [],
    view: "auto",
  };
}

export function listExplorerPresets(): ExplorerPreset[] {
  return explorerPresets;
}

export function getExplorerChartSupport(state: ExplorerState) {
  const metric = getMetricById(state.metricId);
  const hasMultipleYears = state.startYear !== state.endYear;
  const selectedGeographyCount =
    !hasMultipleYears && metric?.family === "pce-levels"
      ? Math.max(state.states.length, 2)
      : Math.max(state.states.length, 1);

  return getChartSupport({
    metricEntries: metric ? [metric] : [],
    selectedGeographyCount,
    geographyLevel: "state",
    startYear: state.startYear,
    endYear: state.endYear,
    requestedView: state.view,
  });
}

export function getMetricCategoryOptions(metricId: string) {
  const metric = getMetricById(metricId);

  return (
    metric?.dimensions?.find((dimension) => dimension.key === "category")
      ?.options ?? [{ id: "all", label: "All data" }]
  );
}

export function getAvailableViews(state: ExplorerState): ChartType[] {
  return getExplorerChartSupport(state).supportedViews;
}

export function getRecommendedExplorerView(state: ExplorerState) {
  return getExplorerChartSupport(state);
}

export function normalizeExplorerState(
  state: ExplorerState,
): ExplorerState {
  const metric = getMetricById(state.metricId) ?? getMetricById(defaultExplorerState.metricId);
  const metricId = metric?.id ?? defaultExplorerState.metricId;
  const metricDefaults = getMetricScopedDefaults(metricId);
  const categoryOptions = getMetricCategoryOptions(metricId).map((option) => option.id);
  const category = categoryOptions.includes(state.category)
    ? state.category
    : (metricDefaults.category ?? "all");
  const normalizedEndYear = Math.min(
    metric?.timeCoverage.endYear ?? defaultExplorerState.endYear,
    state.endYear,
  );
  const normalizedStartYear = Math.max(
    metric?.timeCoverage.startYear ?? defaultExplorerState.startYear,
    isFederalMetric(metricId) ? normalizedEndYear : state.startYear,
  );
  const normalizedRange =
    normalizedStartYear <= normalizedEndYear
      ? { startYear: normalizedStartYear, endYear: normalizedEndYear }
      : { startYear: normalizedEndYear, endYear: normalizedEndYear };
  const availableViews = getAvailableViews({
    ...state,
    metricId,
    category,
    ...normalizedRange,
  });
  const view =
    state.view === "auto" || availableViews.includes(state.view)
      ? state.view
      : availableViews[0];

  return {
    ...state,
    metricId,
    category,
    aggregation:
      validAggregations.includes(state.aggregation)
        ? state.aggregation
        : (metricDefaults.aggregation ?? defaultExplorerState.aggregation),
    view,
    ...normalizedRange,
    includeUsAggregate: isFederalMetric(metricId)
      ? false
      : state.includeUsAggregate,
    includeSelectedAggregate: isFederalMetric(metricId) || isTrendMetric(metricId)
      ? false
      : state.includeSelectedAggregate,
    states: state.states.length > 0 ? state.states : getMetricDefaultStates(metricId),
    excludedStates: isTrendMetric(metricId) ? state.excludedStates : [],
  };
}

export function parseExplorerState(
  searchParams: Record<string, string | string[] | undefined>,
): ExplorerState {
  const rawMetricId = getSingleValue(searchParams.metric);
  const metricId =
    rawMetricId && getMetricById(rawMetricId) ? rawMetricId : defaultExplorerState.metricId;
  const rawView = getSingleValue(searchParams.view);
  const rawCategory = getSingleValue(searchParams.category);
  const rawAggregation = getSingleValue(searchParams.aggregation);

  return normalizeExplorerState({
    metricId,
    view: validViews.includes(rawView as ExplorerView)
      ? (rawView as ExplorerView)
      : defaultExplorerState.view,
    category: validCategories.includes(rawCategory as QueryRequest["options"]["category"])
      ? (rawCategory as QueryRequest["options"]["category"])
      : defaultExplorerState.category,
    aggregation: validAggregations.includes(rawAggregation as QueryRequest["options"]["aggregation"])
      ? (rawAggregation as QueryRequest["options"]["aggregation"])
      : defaultExplorerState.aggregation,
    includeUsAggregate: getSingleValue(searchParams.includeUsAggregate) !== "false",
    includeSelectedAggregate:
      getSingleValue(searchParams.includeSelectedAggregate) !== "false",
    startYear: parseNumber(searchParams.startYear, defaultExplorerState.startYear),
    endYear: parseNumber(searchParams.endYear, defaultExplorerState.endYear),
    states: parseStateList(searchParams.states),
    excludedStates: parseStateList(searchParams.excludedStates),
  });
}

export function serializeExplorerState(state: ExplorerState): URLSearchParams {
  const params = new URLSearchParams();

  params.set("metric", state.metricId);
  params.set("view", state.view);
  params.set("category", state.category);
  params.set("aggregation", state.aggregation);
  params.set("startYear", String(state.startYear));
  params.set("endYear", String(state.endYear));
  params.set("includeUsAggregate", String(state.includeUsAggregate));
  params.set("includeSelectedAggregate", String(state.includeSelectedAggregate));

  if (state.states.length > 0) {
    params.set("states", state.states.join(","));
  }

  if (state.excludedStates.length > 0) {
    params.set("excludedStates", state.excludedStates.join(","));
  }

  return params;
}

export function applyExplorerRecoveryPatch(
  state: ExplorerState,
  patch: QueryRecoveryPatch,
): ExplorerState {
  return normalizeExplorerState({
    ...state,
    ...patch,
  });
}

export function buildQueryRequestFromState(
  state: ExplorerState,
): QueryRequest {
  const metricIds = isFederalMetric(state.metricId)
    ? [...federalComparisonMetricIds]
    : [state.metricId];

  return {
    metricIds,
    geography: {
      level: "state",
      values: state.states,
    },
    timeRange: {
      startYear: state.startYear,
      endYear: state.endYear,
    },
    view: state.view,
    options: {
      category: state.category,
      aggregation: state.aggregation,
      includeUsAggregate: isFederalMetric(state.metricId)
        ? false
        : state.includeUsAggregate,
      includeSelectedAggregate: isFederalMetric(state.metricId)
        ? false
        : state.includeSelectedAggregate,
      excludedGeographies:
        state.metricId === "pce-growth-yoy" || state.metricId === "pce-inflation-yoy"
          ? state.excludedStates
          : [],
    },
  };
}
